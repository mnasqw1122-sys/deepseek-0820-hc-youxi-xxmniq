/* ============================================================
 *  util.js — 通用工具：随机数、格式化、干支历法、数值辅助
 * ============================================================ */
window.XIAN = window.XIAN || {};

/* ---------- 可复现随机数：mulberry32 ---------- */
XIAN.RNG = function (seed) {
  this.seed = (seed >>> 0) || (Math.random() * 4294967295) >>> 0;
  this._s = this.seed;
};
XIAN.RNG.prototype.next = function () {
  this._s = (this._s + 0x6D2B79F5) >>> 0;
  var t = this._s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
XIAN.RNG.prototype.float = function (a, b) {
  if (a === undefined) return this.next();
  if (b === undefined) { b = a; a = 0; }
  return a + this.next() * (b - a);
};
XIAN.RNG.prototype.int = function (a, b) {
  if (b === undefined) { b = a; a = 0; }
  return Math.floor(a + this.next() * (b - a + 1));
};
XIAN.RNG.prototype.chance = function (p) { return this.next() < p; };
XIAN.RNG.prototype.pick = function (arr) {
  if (!arr || !arr.length) return null;
  return arr[Math.floor(this.next() * arr.length)];
};
XIAN.RNG.prototype.shuffle = function (arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(this.next() * (i + 1));
    var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
};
/* 按 weight 字段加权抽取 */
XIAN.RNG.prototype.weighted = function (arr, wkey) {
  if (!arr || !arr.length) return null;
  wkey = wkey || 'weight';
  var total = 0, i;
  for (i = 0; i < arr.length; i++) total += (arr[i][wkey] || 1);
  var r = this.next() * total;
  for (i = 0; i < arr.length; i++) {
    r -= (arr[i][wkey] || 1);
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
};
/* 正态近似（三次均匀和） */
XIAN.RNG.prototype.norm = function (mean, dev) {
  var s = (this.next() + this.next() + this.next()) / 3;
  return mean + (s - 0.5) * 2 * dev;
};
XIAN.RNG.prototype.save = function () { return this._s; };
XIAN.RNG.prototype.load = function (s) { this._s = s >>> 0; };

/* ---------- 数值 ---------- */
XIAN.clamp = function (v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); };
XIAN.lerp = function (a, b, t) { return a + (b - a) * t; };

/* 大数汉化：修仙数值动辄上亿 */
XIAN.num = function (n) {
  if (n === null || n === undefined || isNaN(n)) return '0';
  var neg = n < 0; n = Math.abs(n);
  var s;
  if (n < 10000) s = String(Math.round(n));
  else if (n < 1e8) s = trimNum(n / 1e4) + '万';
  else if (n < 1e12) s = trimNum(n / 1e8) + '亿';
  else if (n < 1e16) s = trimNum(n / 1e12) + '兆';
  else s = trimNum(n / 1e16) + '京';
  return (neg ? '-' : '') + s;
  function trimNum(x) {
    if (x >= 100) return String(Math.round(x));
    if (x >= 10) return (Math.round(x * 10) / 10).toFixed(1).replace(/\.0$/, '');
    return (Math.round(x * 100) / 100).toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  }
};
XIAN.signed = function (n) { return (n > 0 ? '+' : '') + XIAN.num(n); };

/* 汉字数字（用于「第三日」「九重」） */
XIAN.HANNUM = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
XIAN.han = function (n) {
  n = Math.floor(n);
  if (n < 0) return '负' + XIAN.han(-n);
  if (n < 10) return XIAN.HANNUM[n];
  if (n < 20) return '十' + (n % 10 ? XIAN.HANNUM[n % 10] : '');
  if (n < 100) return XIAN.HANNUM[Math.floor(n / 10)] + '十' + (n % 10 ? XIAN.HANNUM[n % 10] : '');
  if (n < 1000) {
    var h = XIAN.HANNUM[Math.floor(n / 100)] + '百', r = n % 100;
    if (!r) return h;
    if (r < 10) return h + '零' + XIAN.han(r);
    return h + XIAN.han(r);
  }
  if (n < 10000) {
    var t = XIAN.HANNUM[Math.floor(n / 1000)] + '千', r2 = n % 1000;
    if (!r2) return t;
    if (r2 < 100) return t + '零' + XIAN.han(r2);
    return t + XIAN.han(r2);
  }
  return String(n);
};

/* 年数汉化：用于寿元 */
XIAN.years = function (y) {
  y = Math.floor(y);
  if (y >= 10000) return XIAN.num(y) + '载';
  return XIAN.num(y) + '载';
};

/* ---------- 干支历法 ----------
 * 游戏内时间以「日」为最小单位。
 * 一年 = 360 日 = 24 节气 × 15 日（写意历，非天文历）
 */
XIAN.DAYS_PER_TERM = 15;
XIAN.TERMS_PER_YEAR = 24;
XIAN.DAYS_PER_YEAR = XIAN.DAYS_PER_TERM * XIAN.TERMS_PER_YEAR; // 360

XIAN.Cal = {
  /* day: 从开局起累计的绝对日数（0 起） */
  parse: function (day, baseYear) {
    baseYear = baseYear || 0;
    var year = Math.floor(day / XIAN.DAYS_PER_YEAR);
    var rem = day - year * XIAN.DAYS_PER_YEAR;
    var termIdx = Math.floor(rem / XIAN.DAYS_PER_TERM);
    var dayInTerm = rem - termIdx * XIAN.DAYS_PER_TERM;
    var absYear = baseYear + year;
    var gi = ((absYear % 10) + 10) % 10;
    var zi = ((absYear % 12) + 12) % 12;
    var term = XIAN.Data.solarTerms[termIdx];
    return {
      day: day,
      year: absYear,
      yearIndex: year,
      gan: XIAN.Data.tiangan[gi],
      zhi: XIAN.Data.dizhi[zi],
      ganzhi: XIAN.Data.tiangan[gi] + XIAN.Data.dizhi[zi],
      cycle: (((absYear % 60) + 60) % 60) + 1,
      termIdx: termIdx,
      term: term,
      dayInTerm: dayInTerm,
      season: XIAN.Cal.seasonOf(termIdx),
      yearElement: XIAN.Data.ganElement[XIAN.Data.tiangan[gi]],
      beast: XIAN.Data.zhiBeast[XIAN.Data.dizhi[zi]]
    };
  },
  seasonOf: function (termIdx) {
    if (termIdx < 6) return '春';
    if (termIdx < 12) return '夏';
    if (termIdx < 18) return '秋';
    return '冬';
  },
  /* 「甲子年 · 惊蛰 · 第三日」 */
  format: function (day, baseYear) {
    var c = XIAN.Cal.parse(day, baseYear);
    return c.ganzhi + '年 · ' + c.term.name + ' · 第' + XIAN.han(c.dayInTerm + 1) + '日';
  },
  formatShort: function (day, baseYear) {
    var c = XIAN.Cal.parse(day, baseYear);
    return c.ganzhi + '年 ' + c.term.name;
  },
  /* 跨越 n 日后所处节气（用于预告） */
  termAfter: function (day, n) {
    return XIAN.Cal.parse(day + n).term;
  },
  /* 天时对某五行的加成：当令则旺，被克则衰 */
  timeMult: function (day, element) {
    var c = XIAN.Cal.parse(day);
    if (!element || element === 'none') return 1;
    var rel = XIAN.elemRelation(c.term.element, element);
    switch (rel) {
      case 'same': return 1.30;   // 当令
      case 'gen': return 1.15;    // 时气生我
      case 'genBy': return 0.95;  // 我生时气（泄）
      case 'ke': return 0.75;     // 时气克我
      case 'keBy': return 1.05;   // 我克时气
      default: return 1;
    }
  }
};

/* ---------- 文本 ---------- */
XIAN.esc = function (s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};
/* 把 effects 数组渲染为可读中文 */
XIAN.EFFECT_LABEL = {
  jing: { n: '精', unit: '' }, qi: { n: '炁', unit: '' }, shen: { n: '神', unit: '' },
  maxJing: { n: '精之上限', unit: '' }, maxQi: { n: '炁之上限', unit: '' }, maxShen: { n: '神之上限', unit: '' },
  dao: { n: '道行', unit: '' }, insight: { n: '悟性', unit: '' }, daoxin: { n: '道心', unit: '' },
  balance: { n: '阴阳', unit: '' }, merit: { n: '功德', unit: '' }, karma: { n: '业障', unit: '' },
  stone: { n: '灵石', unit: '' }, repute: { n: '名望', unit: '' }, lifespan: { n: '寿元', unit: '载' },
  haste: { n: '躁进', unit: '' }, healPct: { n: '疗愈', unit: '%' }, hurtPct: { n: '受创', unit: '%' },
  meridian: { n: '经脉', unit: '条' }, breakthrough: { n: '突破助力', unit: '%' }, age: { n: '年岁', unit: '载' }
};
XIAN.describeEffects = function (effects) {
  if (!effects || !effects.length) return '';
  var out = [];
  effects.forEach(function (e) {
    var t = XIAN.describeEffect(e);
    if (t) out.push(t);
  });
  return out.join('　');
};
XIAN.describeEffect = function (e) {
  if (!e) return '';
  var L = XIAN.EFFECT_LABEL[e.k];
  if (L) {
    if (e.k === 'balance') return '阴阳' + (e.v > 0 ? '偏阳 +' : '偏阴 ') + XIAN.num(e.v);
    if (e.k === 'healPct') return '回复精元 ' + e.v + '%';
    if (e.k === 'hurtPct') return '损伤精元 ' + e.v + '%';
    var sign = e.v > 0 ? '+' : '';
    return L.n + ' ' + sign + XIAN.num(e.v) + L.unit;
  }
  switch (e.k) {
    case 'affinity':
      var el = XIAN.Data.elements[e.element];
      return (el ? el.name : '') + '之亲和 ' + (e.v > 0 ? '+' : '') + e.v;
    case 'herb': return '得灵药 ' + (e.v || 1) + ' 株';
    case 'pill': return '得丹药 ' + (e.v || 1) + ' 枚';
    case 'artifact':
      var a = XIAN.byId(XIAN.Data.artifacts, e.id);
      return '得法宝「' + (a ? a.name : e.id) + '」';
    case 'tech':
      var t = XIAN.byId(XIAN.Data.techniques, e.id);
      return '习得「' + (t ? t.name : e.id) + '」';
    case 'techRandom': return '习得一门' + (e.element && XIAN.Data.elements[e.element] ? XIAN.Data.elements[e.element].name + '系' : '') + '法术';
    case 'flag': return '';
    case 'combat': return '临敌';
    case 'move':
      var l = XIAN.byId(XIAN.Data.locations, e.loc);
      return '往' + (l ? l.name : e.loc);
    case 'time': return '耗时 ' + e.days + ' 日';
    default: return '';
  }
};

/* ---------- 集合 ---------- */
XIAN.byId = function (arr, id) {
  if (!arr) return null;
  for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
  return null;
};
XIAN.indexById = function (arr) {
  var m = {};
  (arr || []).forEach(function (o) { m[o.id] = o; });
  return m;
};

/* ---------- DOM 快捷 ---------- */
XIAN.$ = function (sel, root) { return (root || document).querySelector(sel); };
XIAN.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
XIAN.el = function (tag, cls, html) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
};
XIAN.on = function (node, ev, fn) { if (node) node.addEventListener(ev, fn); return node; };

/* 罗马式罗盘方位 */
XIAN.pct = function (a, b) {
  if (!b) return 0;
  return XIAN.clamp(a / b * 100, 0, 100);
};
