// 结果页 —— 换底色 + 导出
const { BG_COLORS, findTemplate } = require('../../utils/sizes.js');
const cloudUtil = require('../../utils/cloud.js');
const canvasUtil = require('../../utils/canvas.js');

Page({
  data: {
    template: null,
    bgColors: BG_COLORS,
    currentBg: 'white',
    showPreview: true,
    processing: false,
    previewPath: ''
  },

  _imgPath: '',
  _canvas: null,
  _ctx: null,

  onLoad(options) {
    const tplId = options.tplId || 'cn1';
    const imgPath = decodeURIComponent(options.imgPath || '');

    const template = findTemplate(tplId);
    this._imgPath = imgPath;
    this.setData({
      template,
      previewPath: imgPath,
      currentBg: template ? (template.bg === '#FFFFFF' ? 'white' :
                             template.bg === '#438EDB' ? 'blue' : 'white') : 'white'
    });

    this._initResultCanvas();
  },

  async _initResultCanvas() {
    try {
      const { canvas, ctx } = await canvasUtil.getCanvas2D('#resultCanvas');

      const dpr = wx.getSystemInfoSync().pixelRatio || 2;
      const template = this.data.template;

      canvas.width = template.pxW * dpr;
      canvas.height = template.pxH * dpr;

      this._canvas = canvas;
      this._ctx = ctx;

      // 初始绘制：用原图填充
      this._drawWithBg('#FFFFFF');
    } catch (err) {
      console.error('结果Canvas初始化失败:', err);
    }
  },

  // ── 底色合成 ──
  async _drawWithBg(bgColor) {
    const { _ctx: ctx, _canvas: canvas, _imgPath: imgPath } = this;
    if (!ctx || !canvas || !imgPath) return;

    const dpr = wx.getSystemInfoSync().pixelRatio || 2;
    const w = canvas.width;
    const h = canvas.height;

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. 铺底色
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w / dpr, h / dpr);

    // 2. 绘制裁剪后的图片（如需抠图则先处理）
    const img = await canvasUtil.createCanvasImage(canvas, imgPath);
    ctx.drawImage(img, 0, 0, w / dpr, h / dpr);

    ctx.restore();

    // 更新预览
    const tempPath = await canvasUtil.canvasToTempFile(canvas);
    this.setData({ previewPath: tempPath });
  },

  // ── 选择底色 ──
  async onSelectBg(e) {
    const colorId = e.currentTarget.dataset.id;
    const bgItem = BG_COLORS.find(c => c.id === colorId);
    if (!bgItem) return;

    this.setData({ currentBg: colorId });
    await this._drawWithBg(bgItem.color);
  },

  // ── AI 智能抠图换底（调用云函数） ──
  async onAiRemoveBg() {
    if (this.data.processing) return;

    this.setData({ processing: true });
    wx.showLoading({ title: 'AI抠图中…', mask: true });

    try {
      // 1. 上传裁剪图到云存储
      const fileID = await cloudUtil.uploadImage(this._imgPath);

      // 2. 调用云函数做人像分割
      const result = await cloudUtil.removeBackground(fileID);

      if (!result.foreground) {
        throw new Error('未获取到人像前景');
      }

      // 3. 在 Canvas 上合成：底色 + 人像前景
      const { _ctx: ctx, _canvas: canvas } = this;
      const dpr = wx.getSystemInfoSync().pixelRatio || 2;
      const w = canvas.width, h = canvas.height;

      // 加载前景图
      const fgData = 'data:image/png;base64,' + result.foreground;
      const tempFgPath = await this._base64ToTempFile(result.foreground);

      ctx.save();
      ctx.scale(dpr, dpr);

      // 铺底色
      const bgItem = BG_COLORS.find(c => c.id === this.data.currentBg) || BG_COLORS[0];
      ctx.fillStyle = bgItem.color;
      ctx.fillRect(0, 0, w / dpr, h / dpr);

      // 绘制前景
      const fgImg = await canvasUtil.createCanvasImage(canvas, tempFgPath);
      ctx.drawImage(fgImg, 0, 0, w / dpr, h / dpr);

      ctx.restore();

      const tempPath = await canvasUtil.canvasToTempFile(canvas);
      this.setData({ previewPath: tempPath, processing: false });

      wx.hideLoading();
      wx.showToast({ title: '抠图完成！', icon: 'success', duration: 1500 });

    } catch (err) {
      wx.hideLoading();
      this.setData({ processing: false });
      console.error('AI抠图失败:', err);
      wx.showModal({
        title: '抠图失败',
        content: err.message || '请确认云函数已部署且百度AI Key已配置',
        showCancel: false
      });
    }
  },

  // ── base64 转临时文件 ──
  _base64ToTempFile(base64) {
    return new Promise((resolve, reject) => {
      const fs = wx.getFileSystemManager();
      const filePath = `${wx.env.USER_DATA_PATH}/fg_${Date.now()}.png`;
      try {
        const buffer = wx.base64ToArrayBuffer(base64);
        fs.writeFile({
          filePath,
          data: buffer,
          encoding: 'binary',
          success: () => resolve(filePath),
          fail: reject
        });
      } catch (e) {
        // fallback: write as data URL to a file
        fs.writeFile({
          filePath,
          data: base64,
          encoding: 'base64',
          success: () => resolve(filePath),
          fail: reject
        });
      }
    });
  },

  // ── 保存到相册 ──
  async onSave() {
    // 检查授权
    const setting = await wx.getSetting();
    if (!setting.authSetting['scope.writePhotosAlbum']) {
      try {
        await wx.authorize({ scope: 'scope.writePhotosAlbum' });
      } catch {
        wx.showModal({
          title: '需要相册权限',
          content: '请在设置中允许小程序保存图片到相册',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) wx.openSetting();
          }
        });
        return;
      }
    }

    wx.showLoading({ title: '保存中…' });

    try {
      await wx.saveImageToPhotosAlbum({ filePath: this.data.previewPath });
      wx.hideLoading();
      wx.showToast({ title: '已保存到相册 ✅', icon: 'success', duration: 2000 });
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  // ── 重新选择 → 回到首页 ──
  onRestart() {
    wx.navigateBack({ delta: 2 });
  },

  // ── 重新裁剪 → 回到裁剪页 ──
  onReCrop() {
    wx.navigateBack();
  }
});
