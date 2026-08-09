// 证件照尺寸模板配置
// dpi: 300, 每个模板包含物理尺寸和像素尺寸

const TEMPLATES = [
  // ─── 国内常用 ───
  {
    group: '国内常用',
    items: [
      { id: 'cn1',     name: '一寸',       mmW: 25, mmH: 35,  pxW: 295, pxH: 413,  bg: '#FFFFFF' },
      { id: 'cn1_s',   name: '小一寸',     mmW: 22, mmH: 32,  pxW: 260, pxH: 378,  bg: '#FFFFFF' },
      { id: 'cn2',     name: '二寸',       mmW: 35, mmH: 49,  pxW: 413, pxH: 579,  bg: '#FFFFFF' },
      { id: 'cn2_s',   name: '小二寸',     mmW: 35, mmH: 45,  pxW: 413, pxH: 531,  bg: '#438EDB' },
      { id: 'cn5',     name: '五寸',       mmW: 89, mmH: 127, pxW: 1050, pxH: 1500, bg: '#FFFFFF' },
      { id: 'cn_idcard', name: '身份证',    mmW: 26, mmH: 32,  pxW: 358, pxH: 441,  bg: '#FFFFFF' },
    ]
  },
  // ─── 各国签证 ───
  {
    group: '各国签证',
    items: [
      { id: 'us',      name: '美国签证',    mmW: 51, mmH: 51,  pxW: 600, pxH: 600,  bg: '#FFFFFF' },
      { id: 'jp',      name: '日本签证',    mmW: 45, mmH: 35,  pxW: 531, pxH: 413,  bg: '#FFFFFF' },
      { id: 'schengen',name: '申根签证',    mmW: 35, mmH: 45,  pxW: 413, pxH: 531,  bg: '#FFFFFF' },
      { id: 'uk',      name: '英国签证',    mmW: 45, mmH: 35,  pxW: 531, pxH: 413,  bg: '#D9D9D9' },
      { id: 'ca',      name: '加拿大签证',  mmW: 35, mmH: 45,  pxW: 413, pxH: 531,  bg: '#FFFFFF' },
      { id: 'au',      name: '澳大利亚签证',mmW: 35, mmH: 45,  pxW: 413, pxH: 531,  bg: '#FFFFFF' },
      { id: 'nz',      name: '新西兰签证',  mmW: 35, mmH: 45,  pxW: 413, pxH: 531,  bg: '#438EDB'},
      { id: 'kr',      name: '韩国签证',    mmW: 35, mmH: 45,  pxW: 413, pxH: 531,  bg: '#FFFFFF' },
      { id: 'in',      name: '印度签证',    mmW: 51, mmH: 51,  pxW: 600, pxH: 600,  bg: '#FFFFFF' },
      { id: 'sg',      name: '新加坡签证',  mmW: 35, mmH: 45,  pxW: 413, pxH: 531,  bg: '#FFFFFF' },
    ]
  }
];

// 预设底色
const BG_COLORS = [
  { id: 'white',  name: '白色', color: '#FFFFFF', hex: '#FFFFFF' },
  { id: 'blue',   name: '蓝色', color: '#438EDB', hex: '#438EDB' },
  { id: 'red',    name: '红色', color: '#D9001B', hex: '#D9001B' },
  { id: 'gray',   name: '浅灰', color: '#D9D9D9', hex: '#D9D9D9' },
  { id: 'dkblue', name: '深蓝', color: '#1B3A7C', hex: '#1B3A7C' },
];

// 查找模板
function findTemplate(id) {
  for (const group of TEMPLATES) {
    const found = group.items.find(t => t.id === id);
    if (found) return found;
  }
  return null;
}

module.exports = { TEMPLATES, BG_COLORS, findTemplate };
