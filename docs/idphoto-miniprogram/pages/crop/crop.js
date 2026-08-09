// 裁剪页 —— Canvas 手势交互
const sizes = require('../../utils/sizes.js');
const canvasUtil = require('../../utils/canvas.js');

Page({
  data: {
    template: null,
    loading: true
  },

  // 内部状态（不渲染到 WXML）
  _imgPath: '',
  _imgW: 0, _imgH: 0,
  _canvasW: 0, _canvasH: 0,
  _scale: 1,
  _offsetX: 0, _offsetY: 0,
  _cropBoxRatio: 1,

  // 手势状态
  _touches: null,
  _lastCenter: null,
  _lastScale: 1,

  onLoad(options) {
    const tplId = options.tplId || 'cn1';
    const imgPath = decodeURIComponent(options.imgPath || '');

    const template = sizes.findTemplate(tplId);
    if (!template) {
      wx.showToast({ title: '尺寸模板未找到', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1000);
      return;
    }

    this._imgPath = imgPath;
    this._cropBoxRatio = template.pxW / template.pxH;

    this.setData({ template });
    this._initCanvas();
  },

  async _initCanvas() {
    try {
      const { canvas, ctx } = await canvasUtil.getCanvas2D('#cropCanvas');

      // 获取设备像素比，设置 Canvas 实际尺寸
      const dpr = wx.getSystemInfoSync().pixelRatio || 2;
      const windowW = wx.getSystemInfoSync().windowWidth;
      const canvasW = windowW - 48; // 留边距
      const canvasH = Math.round(canvasW * 1.35); // 足够放下大多数比例

      canvas.width = canvasW * dpr;
      canvas.height = canvasH * dpr;

      this._canvasW = canvasW;
      this._canvasH = canvasH;
      this._canvas = canvas;
      this._ctx = ctx;

      // 加载图片
      const img = await canvasUtil.createCanvasImage(canvas, this._imgPath);
      this._imgW = img.width;
      this._imgH = img.height;

      // 初始缩放：让图片填满 Canvas 宽度
      this._scale = canvasW / img.width;
      this._offsetX = 0;
      this._offsetY = (canvasH - img.height * this._scale) / 2;

      this.setData({ loading: false });

      // 使用 nextTick 确保 Canvas 已挂载
      wx.nextTick(() => {
        this._draw();
      });

    } catch (err) {
      console.error('Canvas初始化失败:', err);
      wx.showToast({ title: '图片加载失败', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  // ── 绘制 Canvas ──
  _draw() {
    const { _ctx: ctx, _canvasW: cw, _canvasH: ch, _scale, _offsetX, _offsetY, _cropBoxRatio, _canvas } = this;
    if (!ctx || !_canvas) return;

    const dpr = wx.getSystemInfoSync().pixelRatio || 2;

    // 清空
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cw, ch);

    // 裁剪框位置和大小
    const cropW = Math.min(cw - 40, cw * 0.9);
    const cropH = Math.round(cropW / _cropBoxRatio);
    const cropX = (cw - cropW) / 2;
    const cropY = (ch - cropH) / 2;

    // 半透明遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, cw, ch);

    // 绘制图片（限制在 canvas 尺寸内）
    ctx.save();
    ctx.beginPath();
    ctx.rect(cropX, cropY, cropW, cropH);
    ctx.clip();

    const img = this._img;
    // 需要重新加载图片来绘制
    // 用离屏方式：记录图片 src，在 _draw 里重新创建
    this._drawImageIntoCanvas(ctx, cropX, cropY, cropW, cropH);

    ctx.restore();

    // 裁剪框边框
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.strokeRect(cropX, cropY, cropW, cropH);

    // 四角标记
    ctx.fillStyle = '#FFFFFF';
    const cornerLen = 16;
    const corners = [
      [cropX, cropY, cornerLen, 3], [cropX, cropY, 3, cornerLen],
      [cropX + cropW - cornerLen, cropY, cornerLen, 3], [cropX + cropW - 3, cropY, 3, cornerLen],
      [cropX, cropY + cropH - 3, cornerLen, 3], [cropX, cropY + cropH - cornerLen, 3, cornerLen],
      [cropX + cropW - cornerLen, cropY + cropH - 3, cornerLen, 3], [cropX + cropW - 3, cropY + cropH - cornerLen, 3, cornerLen],
    ];
    corners.forEach(([x, y, w, h]) => ctx.fillRect(x, y, w, h));

    ctx.restore();
  },

  _drawImageIntoCanvas(ctx, cropX, cropY, cropW, cropH) {
    // 使用 Canvas2D 的 drawImage
    if (!this._cachedImg) return;

    const iw = this._imgW, ih = this._imgH;
    const s = this._scale;
    const ox = this._offsetX, oy = this._offsetY;

    const dx = ox;
    const dy = oy;
    const dw = iw * s;
    const dh = ih * s;

    ctx.drawImage(this._cachedImg, 0, 0, iw, ih, dx, dy, dw, dh);
  },

  // ── 缓存图片对象供 _draw 使用 ──
  async _cacheImage() {
    const img = await canvasUtil.createCanvasImage(this._canvas, this._imgPath);
    this._cachedImg = img;

    // 初始绘制
    wx.nextTick(() => this._draw());
  },

  onReady() {
    // 在 onReady 中重新初始化 Canvas（确保节点已挂载）
    setTimeout(() => {
      if (this._canvas && this._cachedImg) return; // 已初始化
      this._initCanvas();
    }, 200);
  },

  // ── 手势处理 ──
  onTouchStart(e) {
    const touches = e.touches;
    if (touches.length === 1) {
      this._touches = { x: touches[0].x, y: touches[0].y };
    } else if (touches.length === 2) {
      const dx = touches[1].x - touches[0].x;
      const dy = touches[1].y - touches[0].y;
      this._lastCenter = {
        x: (touches[0].x + touches[1].x) / 2,
        y: (touches[0].y + touches[1].y) / 2
      };
      this._lastDist = Math.sqrt(dx * dx + dy * dy);
      this._lastScale = this._scale;
    }
  },

  onTouchMove(e) {
    const touches = e.touches;
    if (touches.length === 1 && this._touches) {
      // 单指拖动
      const dx = touches[0].x - this._touches.x;
      const dy = touches[0].y - this._touches.y;
      this._offsetX += dx;
      this._offsetY += dy;
      this._touches = { x: touches[0].x, y: touches[0].y };
      this._draw();
    } else if (touches.length === 2 && this._lastCenter) {
      // 双指缩放
      const dx = touches[1].x - touches[0].x;
      const dy = touches[1].y - touches[0].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const scaleRatio = dist / this._lastDist;

      const newScale = Math.max(0.3, Math.min(3, this._lastScale * scaleRatio));
      this._scale = newScale;

      this._draw();
    }
  },

  onTouchEnd() {
    this._touches = null;
    this._lastCenter = null;
  },

  // ── 确认裁剪 ──
  onConfirm() {
    wx.showLoading({ title: '处理中…' });

    const { _canvas: canvas, _canvasW: cw, _canvasH: ch, _cropBoxRatio } = this;

    const cropW = Math.min(cw - 40, cw * 0.9);
    const cropH = Math.round(cropW / _cropBoxRatio);
    const cropX = (cw - cropW) / 2;
    const cropY = (ch - cropH) / 2;

    // 创建新的离屏 Canvas 用于导出裁剪区域
    const dpr = wx.getSystemInfoSync().pixelRatio || 2;
    const template = this.data.template;

    // 直接用原 Canvas 的裁剪区域导出
    wx.canvasToTempFilePath({
      canvas,
      x: cropX * dpr,
      y: cropY * dpr,
      width: cropW * dpr,
      height: cropH * dpr,
      destWidth: template.pxW,
      destHeight: template.pxH,
      fileType: 'png',
      quality: 1,
      success: (res) => {
        wx.hideLoading();
        getApp().globalData.cropResult = res.tempFilePath;

        wx.navigateTo({
          url: `/pages/result/result?tplId=${template.id}&imgPath=${encodeURIComponent(res.tempFilePath)}`
        });
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('裁剪导出失败:', err);
        wx.showToast({ title: '裁剪失败，请重试', icon: 'none' });
      }
    });
  },

  // ── 返回 ──
  onBack() {
    wx.navigateBack();
  }
});
