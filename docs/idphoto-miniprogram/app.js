// 证件照工具 — 微信小程序
App({
  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloud1-d7gyamvq1e9c3290c',     // ← 替换为你的云开发环境 ID
        traceUser: true
      });
    }
  },

  globalData: {
    // 当前编辑的图片信息
    currentImage: '',       // 临时文件路径
    currentTemplate: null,  // 选中尺寸模板
    cropResult: ''          // 裁剪后的临时图片
  }
});
