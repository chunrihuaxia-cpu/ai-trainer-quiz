// 首页 —— 拍照/选图 + 尺寸模板选择
const { TEMPLATES } = require('../../utils/sizes.js');

Page({
  data: {
    templates: TEMPLATES,
    selectedId: ''
  },

  // ── 拍照 ──
  onTakePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      sizeType: ['original'],
      success: (res) => {
        const imgPath = res.tempFiles[0].tempFilePath;
        this._goNext(imgPath);
      },
      fail: (err) => {
        if (err.errMsg.includes('cancel')) return;
        wx.showToast({ title: '拍照失败，请重试', icon: 'none' });
      }
    });
  },

  // ── 从相册选择 ──
  onChooseFromAlbum() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      sizeType: ['original'],
      success: (res) => {
        const imgPath = res.tempFiles[0].tempFilePath;
        this._goNext(imgPath);
      },
      fail: (err) => {
        if (err.errMsg.includes('cancel')) return;
        wx.showToast({ title: '选图失败，请重试', icon: 'none' });
      }
    });
  },

  // ── 选择尺寸模板 ──
  onSelectSize(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ selectedId: id });

    // 找模板数据
    let template = null;
    for (const group of TEMPLATES) {
      const found = group.items.find(t => t.id === id);
      if (found) { template = found; break; }
    }
    getApp().globalData.currentTemplate = template;
    getApp().globalData.currentImage = '';
  },

  // ── 未选图直接点模板 → 提示先选图 ──
  onTemplateTap(e) {
    const id = e.currentTarget.dataset.id;
    let template = null;
    for (const group of TEMPLATES) {
      const found = group.items.find(t => t.id === id);
      if (found) { template = found; break; }
    }
    getApp().globalData.currentTemplate = template;
    this.setData({ selectedId: id });
  },

  // ── 下一步 → 裁剪页 ──
  _goNext(imgPath) {
    if (!getApp().globalData.currentTemplate) {
      wx.showToast({ title: '请先选择证件照尺寸', icon: 'none' });
      return;
    }
    getApp().globalData.currentImage = imgPath;

    const template = getApp().globalData.currentTemplate;
    wx.navigateTo({
      url: `/pages/crop/crop?imgPath=${encodeURIComponent(imgPath)}&tplId=${template.id}`
    });
  }
});
