// 刷题页 —— 题目展示 + 答题交互 + 完成总结
const storage = require('../../utils/storage.js');
const util = require('../../utils/util.js');

Page({
  data: {
    mode: 'all',           // 当前模式: all/judge/single/multi/wrongbook
    questions: [],          // 当前题目列表
    currentIndex: 0,        // 当前题号索引
    total: 0,               // 总题数
    correctCount: 0,        // 正确数
    wrongCount: 0,          // 错误数
    answered: false,        // 当前题是否已作答
    shuffleMode: false,     // 乱序

    // 当前题目数据
    question: null,
    type: '',
    number: 0,
    questionText: '',
    options: [],

    // 答题状态
    selectedOptions: [],    // 多选题选中项
    showExplanation: false, // 是否显示解析
    correctAnswer: '',      // 正确答案
    explanation: '',        // 解析文本
    userAnswer: '',         // 用户答案
    optionStates: {},       // 选项状态映射 { label: 'correct'|'wrong'|'reveal' }

    // 完成状态
    isComplete: false,
    completeRate: 0,
    completeEmoji: '🎉',
    wrongBookTotal: 0,

    // 进度
    progressPct: 0,
    progressText: '',
    rateText: '0%',
    wrongText: '',

    // 加载状态
    loading: true
  },

  // 临时会话状态（不渲染到 WXML）
  _wrongIds: [],
  _inReview: false,

  onLoad(options) {
    const mode = options.mode || 'all';
    const fresh = options.fresh === '1';
    const resume = options.resume === '1';

    this.setData({ mode });

    if (mode === 'wrongbook') {
      this._startWrongBook();
    } else if (resume) {
      this._resumeSession(mode);
    } else if (fresh) {
      this._startFresh(mode);
    }
  },

  // ── 开始新刷题 ──
  _startFresh(mode) {
    storage.clearQuizSession();
    this._initQuestions(mode, false);
  },

  // ── 恢复进度 ──
  _resumeSession(mode) {
    const session = storage.getQuizSession();
    const prog = storage.getTypeProgress();
    const p = prog[mode];

    if (session && session.mode === mode && session.order && session.index > 0) {
      // 有未完成的会话
      this._initQuestions(mode, false, session);
    } else if (p && (p.c + p.w) > 0) {
      // 从 typeProgress 恢复
      this._initQuestions(mode, false, { index: p.i, order: null, shuffle: false });
    } else {
      this._initQuestions(mode, false);
    }
  },

  // ── 错题本模式 ──
  _startWrongBook() {
    this._inReview = true;
    const wrongIds = storage.getWrongBook();

    if (wrongIds.length === 0) {
      wx.showToast({ title: '错题本为空 🎉', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    // 从各题型加载错题
    const judgeQs = require('../../utils/questions_judge.js');
    const singleQs = require('../../utils/questions_single.js');
    const multiQs = require('../../utils/questions_multi.js');
    const allQs = [...judgeQs, ...singleQs, ...multiQs];
    const questions = allQs.filter(q => wrongIds.includes(q.id));

    this.setData({
      questions,
      total: questions.length,
      currentIndex: 0,
      correctCount: 0,
      wrongCount: 0,
      loading: false,
      mode: 'wrongbook'
    });
    this._wrongIds = [];
    this._renderQuestion();
  },

  // ── 初始化题目列表 ──
  _initQuestions(mode, doShuffle, session) {
    wx.showLoading({ title: '加载题库…' });

    // 使用 setTimeout 让 UI 有机会渲染 loading
    setTimeout(() => {
      let questions = util.loadQuestions(mode);

      const shuffleMode = doShuffle || storage.getShufflePref();

      if (session && session.order) {
        // 恢复乱序顺序
        const orderMap = {};
        session.order.forEach((id, i) => { orderMap[id] = i; });
        questions.sort((a, b) => (orderMap[a.id] || 0) - (orderMap[b.id] || 0));
      } else if (shuffleMode) {
        questions = util.shuffle(questions);
      } else if (mode === 'all') {
        // 自然顺序：按题型排序
        const typeOrder = { judge: 0, single: 1, multi: 2 };
        questions.sort((a, b) => (typeOrder[a.type] - typeOrder[b.type]) || (a.number - b.number));
      } else {
        questions.sort((a, b) => a.number - b.number);
      }

      const startIdx = (session && session.index) ? session.index : 0;

      this.setData({
        questions,
        total: questions.length,
        currentIndex: startIdx,
        correctCount: 0,
        wrongCount: 0,
        shuffleMode,
        loading: false
      });
      this._wrongIds = [];
      this._inReview = false;

      wx.hideLoading();
      this._renderQuestion();
    }, 100);
  },

  // ── 渲染当前题目 ──
  _renderQuestion() {
    const { questions, currentIndex } = this.data;
    if (currentIndex >= questions.length) {
      this._showComplete();
      return;
    }

    const q = questions[currentIndex];
    this.setData({
      question: q,
      type: q.type,
      number: q.number,
      questionText: q.question,
      options: q.options || [],
      answered: false,
      showExplanation: false,
      correctAnswer: '',
      explanation: '',
      userAnswer: '',
      selectedOptions: [],
      optionStates: {},
      isComplete: false
    });
    this._updateStats();
  },

  // ── 更新统计 ──
  _updateStats() {
    const { total, currentIndex, correctCount, wrongCount } = this.data;
    const done = correctCount + wrongCount;
    const pct = total > 0 ? Math.round(done / total * 100) : 0;
    const rate = done > 0 ? Math.round(correctCount / done * 100) : 0;

    this.setData({
      progressPct: pct,
      progressText: total > 0 ? `第 ${Math.min(done + 1, total)}/${total} 题` : '',
      rateText: rate + '%',
      wrongText: wrongCount > 0 ? `错${wrongCount}` : ''
    });
  },

  // ── 保存会话 ──
  _saveSession() {
    if (this._inReview) return;
    const { mode, shuffleMode, questions, currentIndex, correctCount, wrongCount } = this.data;
    storage.saveQuizSession({
      mode,
      shuffle: shuffleMode,
      order: shuffleMode ? questions.map(q => q.id) : null,
      index: currentIndex,
      correct: correctCount,
      wrong: wrongCount,
      wrongIds: this._wrongIds
    });
    // 更新题型进度
    const prog = storage.getTypeProgress();
    const p = prog[mode];
    p.i = currentIndex;
    p.c = correctCount;
    p.w = wrongCount;
    storage.setTypeProgress(prog);
  },

  // ── 判断题 —— 作答 ──
  onAnswerJudge(e) {
    if (this.data.answered) return;
    const userAns = e.currentTarget.dataset.answer; // '正确' or '错误'
    const q = this.data.question;
    const correctAns = q.answer === '√' ? '正确' : '错误';
    const isCorrect = userAns === correctAns;

    this.setData({ answered: true, userAnswer: userAns, correctAnswer: correctAns });

    if (isCorrect) {
      this._onCorrect();
    } else {
      this._onWrong(correctAns, userAns);
    }
    this._saveSession();
  },

  // ── 单选题 —— 作答 ──
  onAnswerSingle(e) {
    if (this.data.answered) return;
    const label = e.currentTarget.dataset.label;
    const q = this.data.question;
    const isCorrect = label === q.answer;

    // 设置选项状态
    const states = {};
    q.options.forEach(o => {
      if (o.label === q.answer) states[o.label] = 'reveal';
    });
    if (!isCorrect) states[label] = 'wrong';
    else states[label] = 'correct';

    this.setData({
      answered: true,
      userAnswer: label,
      correctAnswer: q.answer,
      optionStates: states
    });

    if (isCorrect) {
      this._onCorrect();
    } else {
      this._onWrong(q.answer, label);
    }
    this._saveSession();
  },

  // ── 多选题 —— 选择选项 ──
  onToggleMulti(e) {
    if (this.data.answered) return;
    const label = e.currentTarget.dataset.label;
    let selected = [...this.data.selectedOptions];
    const idx = selected.indexOf(label);
    if (idx >= 0) {
      selected.splice(idx, 1);
    } else {
      selected.push(label);
    }
    this.setData({ selectedOptions: selected });
  },

  // ── 多选题 —— 提交答案 ──
  onSubmitMulti() {
    if (this.data.answered || this.data.selectedOptions.length === 0) return;
    const q = this.data.question;
    const userAns = [...this.data.selectedOptions].sort().join('');
    const isCorrect = userAns === q.answer;

    // 设置选项状态
    const states = {};
    q.options.forEach(o => {
      if (q.answer.includes(o.label)) states[o.label] = 'reveal';
    });
    this.data.selectedOptions.forEach(label => {
      if (!q.answer.includes(label)) states[label] = 'wrong';
      else states[label] = 'correct';
    });

    this.setData({
      answered: true,
      userAnswer: userAns,
      correctAnswer: q.answer,
      optionStates: states
    });

    if (isCorrect) {
      this._onCorrect();
    } else {
      this._onWrong(q.answer, userAns);
    }
    this._saveSession();
  },

  // ── 答对 ──
  _onCorrect() {
    const q = this.data.question;
    this.setData({ correctCount: this.data.correctCount + 1 });
    storage.removeFromWrongBook(q.id);
    this._updateStats();

    wx.showToast({ title: '✓ 正确！', icon: 'success', duration: 600 });

    // 自动跳下一题
    setTimeout(() => {
      this.setData({ currentIndex: this.data.currentIndex + 1 });
      this._saveSession();
      this._renderQuestion();
    }, 700);
  },

  // ── 答错 ──
  _onWrong(correctAns, userAns) {
    const q = this.data.question;
    this.setData({ wrongCount: this.data.wrongCount + 1 });
    this._wrongIds.push(q.id);
    storage.addToWrongBook(q.id);
    this._updateStats();

    // 格式化正确答案显示
    let ansDisplay = correctAns;
    if (q.type === 'single') {
      const opt = q.options.find(o => o.label === correctAns);
      if (opt) ansDisplay = correctAns + '. ' + opt.text;
    } else if (q.type === 'multi') {
      ansDisplay = correctAns.split('').map(l => {
        const opt = q.options.find(o => o.label === l);
        return l + (opt ? '. ' + opt.text : '');
      }).join('；');
    }

    this.setData({
      showExplanation: true,
      correctAnswer: ansDisplay,
      explanation: q.explanation || '暂无解析',
      userAnswer: userAns
    });

    wx.showToast({ title: '✗ 错误', icon: 'error', duration: 1000 });
  },

  // ── 下一题（答错后手动点击） ──
  onNext() {
    this.setData({ currentIndex: this.data.currentIndex + 1 });
    this._saveSession();
    this._renderQuestion();
  },

  // ── 乱序切换 ──
  onToggleShuffle() {
    const newShuffle = !this.data.shuffleMode;
    storage.setShufflePref(newShuffle);

    let questions = util.loadQuestions(this.data.mode);
    if (newShuffle) {
      questions = util.shuffle(questions);
    } else {
      const typeOrder = { judge: 0, single: 1, multi: 2 };
      questions.sort((a, b) => (typeOrder[a.type] - typeOrder[b.type]) || (a.number - b.number));
    }

    this.setData({
      shuffleMode: newShuffle,
      questions,
      currentIndex: 0,
      correctCount: 0,
      wrongCount: 0
    });
    this._wrongIds = [];
    storage.clearQuizSession();
    this._renderQuestion();
  },

  // ── 跳转题目 ──
  onJump() {
    const { total, currentIndex } = this.data;
    const current = currentIndex + 1;
    wx.showModal({
      title: '跳转题目',
      content: `当前第 ${current}/${total} 题`,
      editable: true,
      placeholderText: `输入 1-${total}`,
      success: (res) => {
        if (res.confirm && res.content) {
          let num = parseInt(res.content);
          if (isNaN(num) || num < 1) num = 1;
          if (num > total) num = total;
          this.setData({
            currentIndex: num - 1,
            correctCount: 0,
            wrongCount: 0
          });
          this._wrongIds = [];
          storage.clearQuizSession();
          this._renderQuestion();
        }
      }
    });
  },

  // ── 回到首页 ──
  onHome() {
    wx.navigateBack();
  },

  // ── 完成页面操作 ──
  onRestart() {
    storage.clearQuizSession();
    this._initQuestions(this.data.mode, this.data.shuffleMode);
  },

  onReviewWrong() {
    this._inReview = true;
    const questions = this.data.questions.filter(q => this._wrongIds.includes(q.id));
    if (questions.length === 0) {
      wx.showToast({ title: '本轮全对！🎉', icon: 'none' });
      return;
    }
    this.setData({
      questions,
      total: questions.length,
      currentIndex: 0,
      correctCount: 0,
      wrongCount: 0,
      isComplete: false
    });
    this._wrongIds = [];
    this._renderQuestion();
  },

  onGoWrongBook() {
    wx.redirectTo({ url: '/pages/quiz/quiz?mode=wrongbook' });
  },

  // ── 显示完成页 ──
  _showComplete() {
    const { total, correctCount, wrongCount } = this.data;
    const rate = total > 0 ? Math.round(correctCount / total * 100) : 0;
    let emoji = '🎉';
    if (rate >= 90) emoji = '🏆';
    else if (rate >= 70) emoji = '👍';
    else if (rate < 50) emoji = '💪';

    const sessionWrongCount = this._wrongIds.length;
    const wrongBookTotal = storage.getWrongBook().length;

    // 清除会话（如果是正常刷题模式）
    if (!this._inReview && this.data.mode !== 'wrongbook') {
      storage.clearQuizSession();
    }

    this.setData({
      isComplete: true,
      completeRate: rate,
      completeEmoji: emoji,
      wrongBookTotal,
      sessionWrongCount
    });
  }
});
