// i18n Engine — dual-market bilingual support
const I18n = {
  _lang: 'zh',
  _data: {},

  async init() {
    // Detect language: .cn → zh, .com → en, localStorage override
    const host = window.location.hostname;
    let lang = 'zh';
    if (host.endsWith('.com') || host.includes('vercel.app')) lang = 'en';
    // localStorage override
    const saved = localStorage.getItem('pdftools_lang');
    if (saved) lang = saved;

    this._lang = lang;
    await this._load(lang);
    this._render();
  },

  async _load(lang) {
    try {
      const r = await fetch(`/locales/${lang}.json`);
      this._data = await r.json();
    } catch(e) {
      // Fallback to Chinese
      const r = await fetch('/locales/zh.json');
      this._data = await r.json();
    }
    document.documentElement.lang = lang;
  },

  t(key) {
    return key.split('.').reduce((o, k) => (o || {})[k], this._data) || key;
  },

  switch(lang) {
    localStorage.setItem('pdftools_lang', lang);
    location.reload();
  },

  getLang() { return this._lang; },

  _render() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const text = this.t(key);
      if (text) el.textContent = text;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = this.t(el.dataset.i18nPlaceholder);
    });
    document.title = this.t('title');
  }
};

// Global helper
function __(key) { return I18n.t(key); }

document.addEventListener('DOMContentLoaded', () => I18n.init());
