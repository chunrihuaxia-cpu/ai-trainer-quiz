// 持久化存储工具
const KEYS = {
  wrongBook: 'wrongBook',
  typeProgress: 'typeProgress',
  shuffleMode: 'shuffleMode',
  quizSession: 'quizSession'
};

// ── 错题本（跨会话持久化） ──
function getWrongBook() {
  try {
    return wx.getStorageSync(KEYS.wrongBook) || [];
  } catch (e) { return []; }
}

function setWrongBook(ids) {
  try { wx.setStorageSync(KEYS.wrongBook, ids); } catch (e) {}
}

function addToWrongBook(qid) {
  const ids = getWrongBook();
  if (!ids.includes(qid)) {
    ids.push(qid);
    setWrongBook(ids);
  }
}

function removeFromWrongBook(qid) {
  const ids = getWrongBook();
  const idx = ids.indexOf(qid);
  if (idx >= 0) {
    ids.splice(idx, 1);
    setWrongBook(ids);
  }
}

function clearWrongBook() {
  setWrongBook([]);
}

// ── 各题型进度 ──
const defaultProgress = () => ({
  all:    { i: 0, c: 0, w: 0 },
  judge:  { i: 0, c: 0, w: 0 },
  single: { i: 0, c: 0, w: 0 },
  multi:  { i: 0, c: 0, w: 0 }
});

function getTypeProgress() {
  try {
    const raw = wx.getStorageSync(KEYS.typeProgress);
    if (!raw) return defaultProgress();
    const data = raw;
    for (const k of ['all', 'judge', 'single', 'multi']) {
      if (!data[k]) data[k] = { i: 0, c: 0, w: 0 };
    }
    return data;
  } catch (e) { return defaultProgress(); }
}

function setTypeProgress(prog) {
  try { wx.setStorageSync(KEYS.typeProgress, prog); } catch (e) {}
}

function resetTypeProgress(mode) {
  const prog = getTypeProgress();
  if (mode) {
    prog[mode] = { i: 0, c: 0, w: 0 };
  } else {
    for (const k of ['all', 'judge', 'single', 'multi']) prog[k] = { i: 0, c: 0, w: 0 };
  }
  setTypeProgress(prog);
}

// ── 刷题会话（断点续刷） ──
function saveQuizSession(state) {
  try { wx.setStorageSync(KEYS.quizSession, state); } catch (e) {}
}

function getQuizSession() {
  try { return wx.getStorageSync(KEYS.quizSession) || null; } catch (e) { return null; }
}

function clearQuizSession() {
  try { wx.removeStorageSync(KEYS.quizSession); } catch (e) {}
}

// ── 乱序偏好 ──
function getShufflePref() {
  try { return wx.getStorageSync(KEYS.shuffleMode) === true; } catch (e) { return false; }
}

function setShufflePref(v) {
  try { wx.setStorageSync(KEYS.shuffleMode, !!v); } catch (e) {}
}

module.exports = {
  getWrongBook, setWrongBook, addToWrongBook, removeFromWrongBook, clearWrongBook,
  getTypeProgress, setTypeProgress, resetTypeProgress,
  saveQuizSession, getQuizSession, clearQuizSession,
  getShufflePref, setShufflePref
};
