// 人工智能训练师（三级）理论知识复习题 —— 微信小程序
App({
  globalData: {
    // 本地存储的 key 前缀
    storageKeys: {
      wrongBook: 'wrongBook',           // 错题本（跨会话持久化）
      typeProgress: 'typeProgress',     // 各题型进度
      shuffleMode: 'shuffleMode',       // 乱序偏好
      quizSession: 'quizSession'        // 当前刷题会话
    }
  },

  onLaunch() {
    // 初始化时检查存储兼容性
    try {
      wx.getStorageSync('_init_check');
    } catch (e) {
      wx.setStorageSync('_init_check', true);
    }
  }
});
