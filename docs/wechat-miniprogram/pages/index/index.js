// 首页 —— 题型选择 + 进度面板
const storage = require('../../utils/storage.js');
const util = require('../../utils/util.js');

Page({
  data: {
    modes: [
      { key: 'all',    icon: '📚', title: '全部',    count: 1625, color: '#007AFF' },
      { key: 'judge',  icon: '📝', title: '判断题',  count: 485,  color: '#34C759' },
      { key: 'single', icon: '📋', title: '单选题',  count: 650,  color: '#FF9500' },
      { key: 'multi',  icon: '📑', title: '多选题',  count: 490,  color: '#AF52DE' }
    ],
    progress: {},       // { all: {i,c,w}, judge: ... }
    wrongBookCount: 0,
    hasSession: false,
    sessionMode: ''
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const prog = storage.getTypeProgress();
    const wrongIds = storage.getWrongBook();
    const session = storage.getQuizSession();

    const hasSession = session && session.order && session.index > 0
      && session.index < session.order.length;

    this.setData({
      progress: prog,
      wrongBookCount: wrongIds.length,
      hasSession: !!hasSession,
      sessionMode: session ? session.mode : ''
    });
  },

  // 获取指定模式的进度信息
  getModeStats(mode) {
    const prog = this.data.progress;
    const p = prog[mode] || { i: 0, c: 0, w: 0 };
    const total = util.getModeCount(mode);
    const done = p.c + p.w;
    const pct = total > 0 ? Math.round(done / total * 100) : 0;
    const rate = done > 0 ? Math.round(p.c / done * 100) : 0;
    return { done, total, pct, rate, correct: p.c, wrong: p.w, index: p.i };
  },

  // 开始刷题（新会话）
  onStart(e) {
    const mode = e.currentTarget.dataset.mode;
    storage.clearQuizSession();
    // 跳转时携带模式参数
    wx.navigateTo({
      url: `/pages/quiz/quiz?mode=${mode}&fresh=1`
    });
  },

  // 继续之前的进度
  onResume(e) {
    const mode = e.currentTarget.dataset.mode;
    // 跳转 quiz 页面，让其从 typeProgress 恢复
    wx.navigateTo({
      url: `/pages/quiz/quiz?mode=${mode}&resume=1`
    });
  },

  // 打开错题本
  onWrongBook() {
    const wrongIds = storage.getWrongBook();
    if (wrongIds.length === 0) {
      wx.showToast({ title: '错题本为空 🎉', icon: 'none', duration: 1500 });
      return;
    }
    wx.navigateTo({ url: '/pages/quiz/quiz?mode=wrongbook' });
  },

  // 重置指定模式
  onReset(e) {
    const mode = e.currentTarget.dataset.mode;
    wx.showModal({
      title: '确认重刷',
      content: `确定要重置「${util.getModeLabel(mode)}」的进度吗？`,
      success: (res) => {
        if (res.confirm) {
          storage.resetTypeProgress(mode);
          storage.clearQuizSession();
          this.refresh();
        }
      }
    });
  },

  // 清空错题本
  onClearWrongBook() {
    wx.showModal({
      title: '清空错题本',
      content: '确定要删除所有错题记录吗？此操作不可撤销。',
      success: (res) => {
        if (res.confirm) {
          storage.clearWrongBook();
          this.refresh();
          wx.showToast({ title: '错题本已清空', icon: 'none', duration: 1500 });
        }
      }
    });
  }
});
