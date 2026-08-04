// 通用工具函数

// 题型标签
function getTypeLabel(type) {
  const labels = { judge: '判断题', single: '单选题', multi: '多选题' };
  return labels[type] || '未知题型';
}

// 题型图标
function getTypeIcon(type) {
  const icons = { judge: '📝', single: '📋', multi: '📑' };
  return icons[type] || '📄';
}

// 模式标签
function getModeLabel(mode) {
  const labels = { all: '全部', judge: '判断题', single: '单选题', multi: '多选题' };
  return labels[mode] || '全部';
}

// 模式图标
function getModeIcon(mode) {
  const icons = { all: '📚', judge: '📝', single: '📋', multi: '📑' };
  return icons[mode] || '📚';
}

// Fisher-Yates 洗牌
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 加载题目（根据模式按需加载）
function loadQuestions(mode) {
  const bank = require('./quanmeiti_bank.js');
  let all = bank.questions;
  if (mode === 'judge') {
    return all.filter(q => q.type === 'judge');
  } else if (mode === 'single') {
    return all.filter(q => q.type === 'single');
  } else if (mode === 'multi') {
    return all.filter(q => q.type === 'multi');
  }
  return all; // 'all' or 'wrongbook'
}

// 获取模式的题目数量
function getModeCount(mode) {
  const counts = { all: 1625, judge: 485, single: 650, multi: 650 };
  return counts[mode] || 1625;
}

// 获取题库标题
function getBankTitle() {
  return require('./quanmeiti_bank.js').title;
}

module.exports = {
  getTypeLabel, getTypeIcon, getModeLabel, getModeIcon,
  shuffle, loadQuestions, getModeCount, getBankTitle
};
