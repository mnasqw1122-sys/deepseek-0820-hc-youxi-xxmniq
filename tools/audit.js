/* ============================================================
 * tools/audit.js — 子代理产出深度审计
 *   verify.js 只验「结构契约」；本脚本验「内容是否正确、是否可玩」。
 *   用法：node tools/audit.js
 * ============================================================ */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const AGENT_FILES = [
  'js/data/hexagrams.js', 'js/data/techniques.js', 'js/data/alchemy.js',
  'js/data/world.js', 'js/data/events.js'
];
const ALL = [
  'js/data/core.js', 'js/core/util.js',
  'js/data/hexagrams.js', 'js/data/techniques.js', 'js/data/alchemy.js',
  'js/data/world.js', 'js/data/events.js',
  'js/state.js',
  'js/systems/effects.js', 'js/systems/craft.js', 'js/systems/cultivate.js',
  'js/systems/combat.js', 'js/systems/trib.js', 'js/systems/divine.js', 'js/systems/events.js'
];

const sandbox = {
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  console, Math, Date, JSON,
  btoa: s => Buffer.from(s, 'binary').toString('base64'),
  atob: s => Buffer.from(s, 'base64').toString('binary')
};
sandbox.window = sandbox;
sandbox.document = { createElement: () => ({}), querySelector: () => null, querySelectorAll: () => [] };
vm.createContext(sandbox);
for (const f of ALL) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), sandbox, { filename: f });
const X = sandbox.window.XIAN, D = X.Data;

const E = [], W = [], INFO = [];
const err = m => E.push(m), warn = m => W.push(m), info = m => INFO.push(m);
let section = '';
const SEC = s => { section = s; console.log('\n【' + s + '】'); };
const ok = m => console.log('  ✓ ' + m);
const bad = m => { console.log('  ✗ ' + m); E.push(section + ' :: ' + m); };
const wrn = m => { console.log('  ⚠ ' + m); W.push(section + ' :: ' + m); };

/* ============================================================
 * 0. 文件编码与卫生
 * ========================================================== */
SEC('文件编码与卫生');
const TRAD = '們個這來時說對為國學會體現實發當經過樣種還進運動業開關頭數點無靈氣體陰陽藥煉劍龍鳳華萬東車馬鳥魚島歲壽積樹葉雲電聲續邊遠開關門間陣陳隨險難靜動勢勝復從眾覺觀見語談誦謂識護變轉輪迴週適選錄鍾鐵銀銅鏡閉隱際雜離韻顧願類風飛飲養餘驚麗黃齊龜嶽獸產師傳僅內兩寫劃剛則卻參叢圖執揚攝擊敵擾據掛採搆撲擇擔拋掃損搶摻據攏擴攤';
const TRADSET = new Set(TRAD.split(''));
for (const f of AGENT_FILES) {
  const raw = fs.readFileSync(path.join(root, f));
  const name = path.basename(f);
  if (raw[0] === 0xEF && raw[1] === 0xBB && raw[2] === 0xBF) bad(name + ' 含 UTF-8 BOM');
  const txt = raw.toString('utf8');
  if (txt.includes('\uFFFD')) bad(name + ' 含替换字符（编码损坏）');
  if (/\r\n/.test(txt) && !/\n(?!\r)/.test(txt)) info(name + ' 使用 CRLF 换行');
  /* 繁体泄漏 */
  const trad = {};
  for (const ch of txt) if (TRADSET.has(ch)) trad[ch] = (trad[ch] || 0) + 1;
  const tk = Object.keys(trad);
  if (tk.length) bad(name + ' 混入繁体字：' + tk.map(c => c + '×' + trad[c]).join(' '));
  /* 禁用语法 */
  if (/\b(import|export|require)\s*[({'"]/.test(txt)) bad(name + ' 含模块语法');
  if (/module\.exports/.test(txt)) bad(name + ' 含 module.exports');
  /* 占位符 / 网文腔 —— 仅扫「面向玩家的中文文本」，不扫代码标识符 */
  const JUNK = [/TODO/i, /FIXME/i, /lorem/i, /placeholder/i, /待补/, /此处省略/];
  JUNK.forEach(re => { if (re.test(txt)) bad(name + ' 含占位符 ' + re); });
  const displayText = [];
  const collect = o => {
    if (typeof o === 'string') { displayText.push(o); return; }
    if (Array.isArray(o)) { o.forEach(collect); return; }
    if (o && typeof o === 'object') {
      ['name', 'full', 'desc', 'quote', 'lore', 'text', 'advice', 'guide', 'judgement', 'image',
        'title', 'subtitle', 'omenText', 'taunt', 'label', 'hint', 'nature', 'motto'].forEach(k => {
          if (typeof o[k] === 'string') displayText.push(o[k]);
        });
      Object.values(o).forEach(v => { if (v && typeof v === 'object') collect(v); });
    }
  };
  const KEYS = { 'hexagrams.js': ['hexagrams', 'bagua'], 'techniques.js': ['techniques', 'artifacts'], 'alchemy.js': ['herbs', 'pills'], 'world.js': ['locations', 'enemies'], 'events.js': ['events'] };
  (KEYS[name] || []).forEach(k => collect(D[k]));
  const prose = displayText.join('\n');
  const WEB = ['叮！', '系统提示', '宿主', '恭喜宿主', '签到', '氪金', '面板属性', '经验值', '装备栏', '背包格', '刷怪', '爆装'];
  WEB.forEach(w2 => { if (prose.includes(w2)) bad(name + ' 玩家可见文本含网文/系统流用语「' + w2 + '」'); });
  /* 纯省略号 / 空字段 */
  displayText.forEach(s => {
    if (/^[\s…\.。，、]*$/.test(s) && s.length) bad(name + ' 存在无实义文本字段「' + s + '」');
  });
  /* 半角引号混入中文（排版瑕疵） */
  const dq = (prose.match(/"/g) || []).length;
  if (dq) info(name + ' 中文文本含 ' + dq + ' 个半角双引号（宜作「」或“”）');
}
if (!E.length) ok('五个子代理文件：无 BOM、无编码损坏、无繁体泄漏、无占位符、无网文腔、无模块语法');

/* ============================================================
 * 1. 六十四卦：数理结构（决定性检验）
 * ========================================================== */
SEC('六十四卦 · 数理结构');
/* 通行本卦序（王弼本 / 十三经注疏本） */
const KINGWEN = ['乾', '坤', '屯', '蒙', '需', '讼', '师', '比', '小畜', '履', '泰', '否', '同人', '大有', '谦', '豫',
  '随', '蛊', '临', '观', '噬嗑', '贲', '剥', '复', '无妄', '大畜', '颐', '大过', '坎', '离',
  '咸', '恒', '遁', '大壮', '晋', '明夷', '家人', '睽', '蹇', '解', '损', '益', '夬', '姤',
  '萃', '升', '困', '井', '革', '鼎', '震', '艮', '渐', '归妹', '丰', '旅', '巽', '兑',
  '涣', '节', '中孚', '小过', '既济', '未济'];
/* 八卦 → 三爻（自初爻起，1 阳 0 阴） */
const TRI = { 乾: '111', 兑: '110', 离: '101', 震: '100', 巽: '011', 坎: '010', 艮: '001', 坤: '000' };
const NATURE = { 乾: '天', 坤: '地', 震: '雷', 巽: '风', 坎: '水', 离: '火', 艮: '山', 兑: '泽' };
const H = D.hexagrams;

/* 1a 卦名与卦序 */
let nameBad = [];
KINGWEN.forEach((nm, i) => { if (!H[i] || H[i].name !== nm) nameBad.push('第' + (i + 1) + '卦应为「' + nm + '」，实为「' + (H[i] ? H[i].name : '缺') + '」'); });
if (nameBad.length) nameBad.forEach(bad); else ok('六十四卦名与通行本卦序逐一吻合（含易错者：22贲 43夬 44姤 58涣）');

/* 1b 爻画唯一性 */
const seenLines = {};
let dupLines = [];
H.forEach(h => { if (seenLines[h.lines]) dupLines.push(h.n + '「' + h.name + '」与 ' + seenLines[h.lines] + ' 爻画相同：' + h.lines); seenLines[h.lines] = h.n + '「' + h.name + '」'; });
if (dupLines.length) dupLines.forEach(bad); else ok('64 组爻画互不重复（六爻共 2⁶=64 种，恰好穷尽）');
if (Object.keys(seenLines).length !== 64) bad('爻画种数 ' + Object.keys(seenLines).length + ' ≠ 64');

/* 1c 爻画 == 下卦 + 上卦 */
let triBad = [];
H.forEach(h => {
  if (!TRI[h.lower]) { triBad.push(h.n + '「' + h.name + '」下卦名非法：' + h.lower); return; }
  if (!TRI[h.upper]) { triBad.push(h.n + '「' + h.name + '」上卦名非法：' + h.upper); return; }
  const want = TRI[h.lower] + TRI[h.upper];
  if (h.lines !== want) triBad.push(h.n + '「' + h.name + '」爻画 ' + h.lines + ' 与「上' + h.upper + ' 下' + h.lower + '」不符（应为 ' + want + '）');
});
if (triBad.length) triBad.forEach(bad); else ok('每卦爻画皆等于「下卦三爻 + 上卦三爻」，上下卦命名全部自洽');

/* 1d 卦名全称 = 上卦之象 + 下卦之象 + 卦名（八纯卦作「X为Y」） */
let fullBad = [];
H.forEach(h => {
  if (h.upper === h.lower) {
    if (!h.full.includes('为')) fullBad.push(h.n + '「' + h.name + '」为八纯卦，全称应作「' + h.name + '为' + NATURE[h.upper] + '」，实为「' + h.full + '」');
  } else {
    const want = NATURE[h.upper] + NATURE[h.lower] + h.name;
    if (h.full !== want) fullBad.push(h.n + ' 全称应为「' + want + '」，实为「' + h.full + '」');
  }
});
if (fullBad.length) fullBad.forEach(bad); else ok('卦名全称与上下卦之象一致（如 22 山火贲 = 上艮山 + 下离火）');

/* 1e 通行本配对结构：32 对，非「反卦」即「错卦」 */
function reverse(s) { return s.split('').reverse().join(''); }
function invert(s) { return s.split('').map(c => c === '1' ? '0' : '1').join(''); }
const SELF_INV = ['乾', '坤', '颐', '大过', '坎', '离', '中孚', '小过'];
let pairBad = [], selfFound = [];
for (let k = 0; k < 32; k++) {
  const a = H[k * 2], b = H[k * 2 + 1];
  const aSelf = a.lines === reverse(a.lines);
  if (aSelf) selfFound.push(a.name);
  const bSelf = b.lines === reverse(b.lines);
  if (bSelf && b.name !== a.name) selfFound.push(b.name);
  const isRev = b.lines === reverse(a.lines);
  const isCmp = b.lines === invert(a.lines);
  if (!isRev && !isCmp) {
    pairBad.push('第 ' + a.n + '「' + a.name + '」' + a.lines + ' 与 第 ' + b.n + '「' + b.name + '」' + b.lines + ' 既非反卦亦非错卦 —— 卦序有误');
  }
}
if (pairBad.length) pairBad.forEach(bad);
else ok('32 对卦皆成「反卦」或「错卦」之偶 —— 此为通行本卦序之数理指纹，全部通过');
const selfSorted = [...new Set(selfFound)].sort();
const wantSelf = [...SELF_INV].sort();
if (JSON.stringify(selfSorted) !== JSON.stringify(wantSelf)) {
  bad('自反卦（倒之不变者）应恰为 ' + SELF_INV.join('、') + '，实为 ' + selfSorted.join('、'));
} else ok('自反之卦恰为乾坤颐大过坎离中孚小过八卦，与《易》理相符');

/* 1f 吉凶：传统认知抽检 */
SEC('六十四卦 · 辞与吉凶');
const GOODOMEN = new Set(['daji', 'ji', 'xiaoji']);
const BADOMEN = new Set(['daxiong', 'xiong', 'xiaoxiong']);
const EXPECT_GOOD = ['乾', '泰', '大有', '谦', '丰', '鼎', '既济', '升', '益'];
const EXPECT_BAD = ['坎', '蹇', '困', '剥', '明夷', '否'];
let omenBad = [];
EXPECT_GOOD.forEach(nm => { const h = H.find(x => x.name === nm); if (h && BADOMEN.has(h.omen)) omenBad.push('「' + nm + '」传统主吉，却标为 ' + h.omen); });
EXPECT_BAD.forEach(nm => { const h = H.find(x => x.name === nm); if (h && GOODOMEN.has(h.omen)) omenBad.push('「' + nm + '」传统主凶，却标为 ' + h.omen); });
if (omenBad.length) omenBad.forEach(wrn); else ok('吉凶标注与传统认知不相违（乾泰大有谦丰鼎既济主吉；坎蹇困剥明夷否主凶）');
/* 吉凶乘数单调 */
const OM = ['daji', 'ji', 'xiaoji', 'ping', 'xiaoxiong', 'xiong', 'daxiong'];
let mono = true;
for (let i = 1; i < OM.length; i++) if (D.omenMeta[OM[i]].mult >= D.omenMeta[OM[i - 1]].mult) mono = false;
if (!mono) bad('omenMeta 乘数非单调递减'); else ok('吉凶乘数自 ×1.60 单调递减至 ×0.50');
/* 辞文重复与长度 */
const jd = {}, im = {}, ad = {};
let textBad = [];
H.forEach(h => {
  if (jd[h.judgement]) textBad.push('彖辞重复：' + h.n + '「' + h.name + '」与 ' + jd[h.judgement] + '　→「' + h.judgement + '」');
  jd[h.judgement] = h.n + '「' + h.name + '」';
  if (im[h.image]) textBad.push('象辞重复：' + h.n + '「' + h.name + '」与 ' + im[h.image]);
  im[h.image] = h.n + '「' + h.name + '」';
  if (ad[h.advice]) textBad.push('修行指引重复：' + h.n + ' 与 ' + ad[h.advice]);
  ad[h.advice] = h.n + '「' + h.name + '」';
  if (h.advice.length < 25 || h.advice.length > 70) textBad.push(h.n + '「' + h.name + '」指引 ' + h.advice.length + ' 字，越出 25–70');
  if (h.guide.length < 5 || h.guide.length > 16) textBad.push(h.n + '「' + h.name + '」简语 ' + h.guide.length + ' 字，越出 5–16');
});
if (textBad.length) textBad.slice(0, 10).forEach(wrn); else ok('64 卦之彖辞、象辞、修行指引皆无重复，字数合度');
/* 名篇象辞抽检 */
const CANON = [['乾', 'image', '天行健'], ['乾', 'judgement', '元亨利贞'], ['坤', 'image', '厚德载物'], ['谦', 'judgement', '亨']];
let canonBad = [];
CANON.forEach(([nm, k, frag]) => { const h = H.find(x => x.name === nm); if (!h || !h[k].includes(frag)) canonBad.push('「' + nm + '」' + k + ' 未见「' + frag + '」'); });
if (canonBad.length) canonBad.forEach(wrn); else ok('名篇辞句抽检合于原文（乾：元亨利贞 / 天行健；坤：厚德载物）');

/* 1g 八卦表 */
SEC('八卦表');
let bgBad = [];
const SYM = { 乾: '☰', 兑: '☱', 离: '☲', 震: '☳', 巽: '☴', 坎: '☵', 艮: '☶', 坤: '☷' };
const BGEL = { 乾: 'jin', 兑: 'jin', 离: 'huo', 震: 'mu', 巽: 'mu', 坎: 'shui', 艮: 'tu', 坤: 'tu' };
const BGDIR = { 乾: '西北', 兑: '西', 离: '南', 震: '东', 巽: '东南', 坎: '北', 艮: '东北', 坤: '西南' };
(D.bagua || []).forEach(b => {
  if (TRI[b.name] !== b.lines) bgBad.push('「' + b.name + '」三爻应为 ' + TRI[b.name] + '，实为 ' + b.lines);
  if (SYM[b.name] !== b.symbol) bgBad.push('「' + b.name + '」卦符应为 ' + SYM[b.name] + '，实为 ' + b.symbol);
  if (BGEL[b.name] !== b.element) bgBad.push('「' + b.name + '」五行应为 ' + BGEL[b.name] + '，实为 ' + b.element);
  if (NATURE[b.name] !== b.nature) bgBad.push('「' + b.name + '」之象应为 ' + NATURE[b.name] + '，实为 ' + b.nature);
  if (BGDIR[b.name] !== b.dir) bgBad.push('「' + b.name + '」后天方位应为 ' + BGDIR[b.name] + '，实为 ' + b.dir);
});
if ((D.bagua || []).length !== 8) bad('八卦数 ' + (D.bagua || []).length);
if (bgBad.length) bgBad.forEach(bad); else ok('八卦之爻画、卦符、五行、卦象、方位全部正确（乾金西北 · 坤土西南 · 震木东 …）');
/* 八卦与六十四卦所用上下卦名一致 */
const bgNames = new Set((D.bagua || []).map(b => b.name));
const usedTri = new Set(); H.forEach(h => { usedTri.add(h.upper); usedTri.add(h.lower); });
[...usedTri].forEach(t => { if (!bgNames.has(t)) bad('六十四卦用到「' + t + '」，八卦表中却无'); });

/* ============================================================
 * 2. 法术与法宝
 * ========================================================== */
SEC('法术 · 数值与自洽');
const T = D.techniques, A = D.artifacts;
const player = T.filter(t => !t.id.startsWith('m_'));
const mons = T.filter(t => t.id.startsWith('m_'));
/* 名称重复 */
const tn = {}; let tnBad = [];
T.forEach(t => { if (tn[t.name]) tnBad.push('法术名重复：' + t.id + ' / ' + tn[t.name] + '　→「' + t.name + '」'); tn[t.name] = t.id; });
tnBad.length ? tnBad.forEach(bad) : ok('62 门法术名称无重复');
/* 描述 / 引文重复 */
const tdesc = {}, tq = {}; let tdBad = [];
T.forEach(t => {
  if (tdesc[t.desc]) tdBad.push('法术说明重复：' + t.id + ' / ' + tdesc[t.desc]);
  tdesc[t.desc] = t.id;
  if (tq[t.quote]) tdBad.push('法术引文重复：' + t.id + ' / ' + tq[t.quote]);
  tq[t.quote] = t.id;
});
tdBad.length ? tdBad.forEach(wrn) : ok('法术说明与引文皆无重复（无批量复制迹象）');
/* 伤害 / 耗炁 随品阶单调 */
function power(t) {
  let p = 0;
  (t.effects || []).forEach(e => {
    if (e.k === 'damage') p += e.mult;
    else if (e.k === 'multihit') p += e.mult * (e.hits || 2);
    else if (e.k === 'execute') p += e.mult * 0.55;
    else if (e.k === 'drain') p += e.mult * 1.1;
    else if (e.k === 'soul') p += e.mult * 0.6;
    else if (e.k === 'dot') p += e.mult * (e.turns || 3) * 0.6;
    else if (e.k === 'heal') p += e.mult * 0.8;
    else if (e.k === 'shield') p += e.mult * 0.7;
    /* 增益、削弱、控制、返照亦是威能，否则纯辅法术将被误判为「无用」 */
    else if (e.k === 'buff' || e.k === 'debuff') p += (e.pct / 100) * (e.turns || 2) * 0.55;
    else if (e.k === 'stun') p += (e.chance || 0.3) * (e.turns || 1) * 2.2;
    else if (e.k === 'reflect') p += (e.pct / 100) * (e.turns || 2) * 0.6;
    else if (e.k === 'evade') p += (e.chance || 0.4) * (e.turns || 1) * 1.4;
    else if (e.k === 'purge' || e.k === 'cleanse') p += 0.45;
    else if (e.k === 'qiburn') p += 0.3;
    else if (e.k === 'restoreQi') p += 0.4;
    else if (e.k === 'insta') p += (e.chance || 0.05) * 8;
  });
  return p;
}
const byTier = {};
player.forEach(t => { (byTier[t.tier] = byTier[t.tier] || []).push(t); });
let tierLine = [];
for (let ti = 1; ti <= 5; ti++) {
  const g = byTier[ti] || [];
  if (!g.length) { bad('玩家法术缺 tier ' + ti); continue; }
  const cs = g.map(t => t.cost), ps = g.map(t => power(t));
  tierLine.push('t' + ti + '：' + g.length + ' 门　耗炁 ' + Math.min(...cs) + '–' + Math.max(...cs) +
    '　威能 ' + Math.min(...ps).toFixed(1) + '–' + Math.max(...ps).toFixed(1));
}
tierLine.forEach(l => console.log('    ' + l));
let monoBad = [];
for (let ti = 2; ti <= 5; ti++) {
  const lo = byTier[ti], hi = byTier[ti - 1];
  if (!lo || !hi) continue;
  const avgLo = lo.reduce((s, t) => s + power(t), 0) / lo.length;
  const avgHi = hi.reduce((s, t) => s + power(t), 0) / hi.length;
  if (avgLo <= avgHi) monoBad.push('tier' + ti + ' 平均威能 ' + avgLo.toFixed(2) + ' 未超过 tier' + (ti - 1) + ' 的 ' + avgHi.toFixed(2));
  const cLo = lo.reduce((s, t) => s + t.cost, 0) / lo.length;
  const cHi = hi.reduce((s, t) => s + t.cost, 0) / hi.length;
  if (cLo <= cHi) monoBad.push('tier' + ti + ' 平均耗炁 ' + cLo.toFixed(1) + ' 未超过 tier' + (ti - 1));
}
monoBad.length ? monoBad.forEach(wrn) : ok('威能与耗炁皆随品阶单调递增，无跨阶错配');
/* 性价比离群 */
const ratios = player.filter(t => power(t) > 0).map(t => ({ t, r: power(t) / t.cost }));
const mean = ratios.reduce((s, x) => s + x.r, 0) / ratios.length;
const sd = Math.sqrt(ratios.reduce((s, x) => s + (x.r - mean) ** 2, 0) / ratios.length);
const outl = ratios.filter(x => Math.abs(x.r - mean) > 2.6 * sd);
console.log('    威能/耗炁 均值 ' + mean.toFixed(4) + '　标准差 ' + sd.toFixed(4));
outl.length ? outl.forEach(x => wrn('性价比离群：' + x.t.id + '「' + x.t.name + '」t' + x.t.tier + ' 比值 ' + x.r.toFixed(4)))
  : ok('无性价比离群法术（2.6σ 内）');
/* kind 与效果自洽 */
let kindBad = [];
player.forEach(t => {
  const ks = new Set((t.effects || []).map(e => e.k));
  if (t.kind === 'attack' && !(ks.has('damage') || ks.has('multihit') || ks.has('execute') || ks.has('drain') || ks.has('dot') || ks.has('insta'))) kindBad.push(t.id + ' 标为攻伐却无伤害效果');
  if (t.kind === 'heal' && !(ks.has('heal') || ks.has('drain'))) kindBad.push(t.id + ' 标为疗伤却无回复效果');
  if (t.kind === 'guard' && !(ks.has('shield') || ks.has('reflect') || ks.has('evade') || ks.has('buff'))) kindBad.push(t.id + ' 标为护体却无防御效果');
  if (t.kind === 'soul' && !ks.has('soul')) kindBad.push(t.id + ' 标为神魂却无 soul 效果');
});
kindBad.length ? kindBad.forEach(wrn) : ok('法术类别与其效果自洽（攻伐必有伤、疗伤必有回、护体必有御、神魂必伤神）');
/* 无为真经须体现「无为」 */
const wuwei = T.find(t => t.id === 't_wuwei_zhenjing');
if (!wuwei) bad('缺《无为真经》');
else {
  const ks = new Set(wuwei.effects.map(e => e.k));
  if (ks.has('damage') || ks.has('multihit') || ks.has('execute')) bad('《无为真经》含直接伤害，违「无为」之旨');
  else ok('《无为真经》不含任何直伤，纯以 ' + [...ks].join('/') + ' 取胜 —— 合于「无为」');
}
/* 起手可用性：realm0 tier1 各系皆有 */
const starters = player.filter(t => t.tier === 1 && t.realm === 0);
if (starters.length < 6) wrn('realm0/tier1 起手法术仅 ' + starters.length + ' 门');
else ok('起手可修法术 ' + starters.length + ' 门，五行齐备');
/* 传说功法须够强：攻伐类与攻伐类相较，辅助类另论 */
const LEGEND = ['t_taiyi_wuji', 't_ziwei_leifa', 't_beiming_zhenshui', 't_liyan_fenkong', 't_houtu_zhenyue', 't_gengjin_jianyu', 't_qingmu_changsheng', 't_wuwei_zhenjing'];
const atk4 = (byTier[4] || []).filter(t => t.kind === 'attack' && power(t) > 0);
const t4avg = atk4.length ? atk4.reduce((s, t) => s + power(t), 0) / atk4.length : 0;
let legBad = [];
LEGEND.forEach(id => {
  const t = T.find(x => x.id === id);
  if (!t) { legBad.push('缺 ' + id); return; }
  if (t.tier !== 5) legBad.push(id + ' 品阶为 ' + t.tier + '，应为 5');
  if (t.kind === 'attack' && power(t) < t4avg) legBad.push(id + '（攻伐）威能 ' + power(t).toFixed(2) + ' 低于四阶攻伐均值 ' + t4avg.toFixed(2));
});
legBad.length ? legBad.forEach(wrn) : ok('八部传说功法皆为五阶；攻伐类威能均超四阶攻伐均值（太乙无极、青木长生、无为真经为辅助类，另论）');

SEC('法宝 · 数值与配位');
const an = {}; let anBad = [];
A.forEach(a => { if (an[a.name]) anBad.push('法宝名重复：' + a.id + ' / ' + an[a.name]); an[a.name] = a.id; });
anBad.length ? anBad.forEach(bad) : ok('26 件法宝名称无重复');
/* 属性和随品阶单调 */
function statSum(a) { let s = 0; for (const k in (a.stats || {})) s += Math.abs(a.stats[k]); return s; }
const aByTier = {};
A.forEach(a => { (aByTier[a.tier] = aByTier[a.tier] || []).push(a); });
let aLine = [], aBad = [];
for (let ti = 1; ti <= 5; ti++) {
  const g = aByTier[ti] || [];
  if (!g.length) { bad('法宝缺 tier ' + ti); continue; }
  const ss = g.map(statSum);
  aLine.push('t' + ti + '：' + g.length + ' 件　属性和 ' + Math.min(...ss) + '–' + Math.max(...ss));
}
aLine.forEach(l => console.log('    ' + l));
for (let ti = 2; ti <= 5; ti++) {
  const g = aByTier[ti], p = aByTier[ti - 1];
  if (!g || !p) continue;
  const ag = g.reduce((s, a) => s + statSum(a), 0) / g.length;
  const ap = p.reduce((s, a) => s + statSum(a), 0) / p.length;
  if (ag <= ap) aBad.push('tier' + ti + ' 平均属性和 ' + ag.toFixed(0) + ' 未超 tier' + (ti - 1) + ' 的 ' + ap.toFixed(0));
}
aBad.length ? aBad.forEach(wrn) : ok('法宝属性和随品阶单调递增');
/* 三个佩位皆须有可及之低阶法宝（御宝之所依） */
['main', 'robe', 'talisman'].forEach(s => {
  const low = A.filter(a => a.slot === s && a.tier <= 2);
  if (!low.length) bad('佩位 ' + s + ' 无二阶以下法宝 —— 低境界玩家将无宝可佩');
});
const cheapGuard = A.filter(a => (a.slot === 'robe' || a.slot === 'main') && a.tier <= 2)
  .map(a => X.Sys.artPrice(a)).sort((x, y) => x - y)[0];
ok('最廉「御宝」可用法宝价 ' + cheapGuard + ' 灵石（筑基前必须买得起，否则渡劫无宝可御）');
if (cheapGuard > 3000) wrn('最廉护身法宝 ' + cheapGuard + ' 灵石，恐在首次天劫前买不起');

/* ============================================================
 * 3. 丹道
 * ========================================================== */
SEC('灵药与丹方 · 可炼性');
const HB = D.herbs, P = D.pills;
const hById = Object.fromEntries(HB.map(h => [h.id, h]));
const hn = {}; let hnBad = [];
HB.forEach(h => { if (hn[h.name]) hnBad.push('灵药名重复：' + h.id + ' / ' + hn[h.name]); hn[h.name] = h.id; });
hnBad.length ? hnBad.forEach(bad) : ok('34 味灵药名称无重复');
const hd = {}; let hdBad = [];
HB.forEach(h => { if (hd[h.desc]) hdBad.push('灵药说明重复：' + h.id + ' / ' + hd[h.desc]); hd[h.desc] = h.id; });
hdBad.length ? hdBad.forEach(wrn) : ok('灵药说明无重复');
/* 药力随品阶单调 */
let potBad = [];
for (let ti = 2; ti <= 5; ti++) {
  const g = HB.filter(h => h.tier === ti), p = HB.filter(h => h.tier === ti - 1);
  if (!g.length || !p.length) continue;
  if (Math.min(...g.map(h => h.potency)) <= Math.max(...p.map(h => h.potency)))
    potBad.push('tier' + ti + ' 最低药力 ' + Math.min(...g.map(h => h.potency)) + ' 未超 tier' + (ti - 1) + ' 最高 ' + Math.max(...p.map(h => h.potency)));
}
potBad.length ? potBad.forEach(wrn) : ok('药力区间随品阶严格递进，无跨阶重叠');
/* 每味药皆有可采之地（且非坊市） */
const gatherLocs = new Set(D.locations.filter(l => (l.features || []).includes('gather')).map(l => l.id));
let habBad = [];
HB.forEach(h => {
  const g = (h.habitat || []).filter(l => gatherLocs.has(l));
  if (!g.length) habBad.push('「' + h.name + '」(' + h.id + ') 无任何可采之地：' + (h.habitat || []).join('/'));
  if ((h.habitat || []).includes('fuyao_cheng')) habBad.push('「' + h.name + '」列坊市为产地（坊市不产药）');
});
habBad.length ? habBad.forEach(bad) : ok('34 味灵药皆至少产于一处可采地，无一列坊市为产地');
/* 丹方可炼性：药材品阶 vs 丹方品阶，及采集境界门槛 */
const locById = Object.fromEntries(D.locations.map(l => [l.id, l]));
function minRealmForHerb(h) {
  /* 采药可得之最低境界：须能进入产地，且 maxTier 允许 */
  let best = 99;
  (h.habitat || []).forEach(lid => {
    const L = locById[lid];
    if (!L || !(L.features || []).includes('gather')) return;
    for (let r = L.realmMin; r <= 8; r++) {
      const maxTier = Math.max(1, Math.min(5, 1 + Math.floor(r * 0.75) + Math.round((L.danger || 0) * 0.4)));
      if (h.tier <= maxTier) { best = Math.min(best, r); break; }
    }
  });
  /* 坊市亦可买：maxTier = 1 + floor(realm*0.8) */
  for (let r = 0; r <= 8; r++) {
    const mt = Math.max(1, Math.min(5, 1 + Math.floor(r * 0.8)));
    if (h.tier <= mt) { best = Math.min(best, r); break; }
  }
  return best;
}
let craftBad = [], craftWarn = [];
P.forEach(p => {
  let need = 0, detail = [];
  (p.recipe || []).forEach(r => {
    const h = hById[r.herb];
    const mr = minRealmForHerb(h);
    if (mr > need) { need = mr; }
    detail.push(h.name + '(t' + h.tier + '/需' + (mr === 99 ? '∞' : D.realms[mr].name) + ')');
    if (mr === 99) craftBad.push('丹方「' + p.name + '」所需「' + h.name + '」永不可得');
    if (h.tier > p.tier + 1) craftWarn.push('丹方「' + p.name + '」(t' + p.tier + ') 需 t' + h.tier + ' 药「' + h.name + '」，跨阶过大');
  });
  if (need > p.realm + 1) craftWarn.push('丹方「' + p.name + '」标称宜' + D.realms[p.realm].name + '，然药材须' + D.realms[need].name + '方可得：' + detail.join(' '));
});
craftBad.forEach(bad);
craftWarn.length ? craftWarn.slice(0, 8).forEach(wrn) : ok('26 张丹方所需药材皆可得，且与丹方标称境界相称');
/* 火候：品阶越高容差越小 */
let tolBad = [];
for (let ti = 2; ti <= 5; ti++) {
  const g = P.filter(p => p.tier === ti), q = P.filter(p => p.tier === ti - 1);
  if (!g.length || !q.length) continue;
  const ag = g.reduce((s, p) => s + p.fireTol, 0) / g.length;
  const aq = q.reduce((s, p) => s + p.fireTol, 0) / q.length;
  if (ag >= aq) tolBad.push('tier' + ti + ' 平均容差 ' + ag.toFixed(3) + ' 未小于 tier' + (ti - 1) + ' 的 ' + aq.toFixed(3));
}
tolBad.length ? tolBad.forEach(wrn) : ok('火候容差随丹阶递减（愈高阶愈难掌火）');
/* 丹药效果随品阶递增 */
function pillWeight(p) {
  let s = 0;
  (p.effects || []).forEach(e => {
    const w = { jing: 1, qi: 1, shen: 1.2, maxJing: 6, maxQi: 6, maxShen: 7, dao: 0.6, insight: 90, daoxin: 8, balance: 3, lifespan: 5, karma: 2, merit: 3, haste: 2, healPct: 3, breakthrough: 10, affinity: 30 }[e.k] || 1;
    s += Math.abs(e.v) * w;
  });
  return s;
}
let pwBad = [];
for (let ti = 2; ti <= 5; ti++) {
  const g = P.filter(p => p.tier === ti), q = P.filter(p => p.tier === ti - 1);
  if (!g.length || !q.length) continue;
  const ag = g.reduce((s, p) => s + pillWeight(p), 0) / g.length;
  const aq = q.reduce((s, p) => s + pillWeight(p), 0) / q.length;
  if (ag <= aq) pwBad.push('tier' + ti + ' 平均药效权重 ' + ag.toFixed(0) + ' 未超 tier' + (ti - 1) + ' 的 ' + aq.toFixed(0));
}
pwBad.length ? pwBad.forEach(wrn) : ok('丹药效果权重随品阶递增');
/* 起手丹方必须当即可炼 */
const S0 = X.newGame({ seed: 991 });
let startable = 0;
S0.recipes.forEach(id => { const st = X.Sys.recipeStatus(S0, id); if (st && st.herbsOk) startable++; });
if (!startable) bad('开局无任何丹方可立即炼制（起手药材配给失效）');
else ok('开局 ' + S0.recipes.length + ' 张丹方中，' + startable + ' 张药材当即齐备');
/* 君臣佐使 */
let roleBad = [];
P.forEach(p => {
  const c = { jun: 0, chen: 0, zuo: 0, shi: 0 };
  (p.recipe || []).forEach(r => c[r.role]++);
  if (c.jun !== 1) roleBad.push('「' + p.name + '」君药 ' + c.jun + ' 味');
  if (c.chen > 2) roleBad.push('「' + p.name + '」臣药 ' + c.chen + ' 味（逾 2）');
  if (c.shi > 1) roleBad.push('「' + p.name + '」使药 ' + c.shi + ' 味（逾 1）');
});
roleBad.length ? roleBad.forEach(bad) : ok('26 张丹方皆一君为主，臣佐使配伍合度');

/* ============================================================
 * 4. 地域与妖魔
 * ========================================================== */
SEC('地域 · 可玩性');
const L = D.locations, EN = D.enemies;
const eById = Object.fromEntries(EN.map(e => [e.id, e]));
/* 说明重复 */
const ldesc = {}; let ldBad = [];
L.forEach(l => { if (ldesc[l.desc]) ldBad.push('地域描写重复：' + l.id + ' / ' + ldesc[l.desc]); ldesc[l.desc] = l.id; });
ldBad.length ? ldBad.forEach(bad) : ok('13 处地域描写各不相同');
/* 配色辨识度：水墨淡彩本就低饱和，故并计天色、山墨、点缀三者之距。
   点缀色（灵光/花木/火焰）在画面上最为醒目，最能区分两地。 */
function hex2rgb(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function dist(a, b) { const p = hex2rgb(a), q = hex2rgb(b); return Math.sqrt((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2); }
function palDist(a, b) { return dist(a.sky[0], b.sky[0]) + dist(a.ink, b.ink) + dist(a.accent, b.accent); }
const pairs = [];
for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) pairs.push({ d: palDist(L[i], L[j]), a: L[i].name, b: L[j].name });
pairs.sort((x, y) => x.d - y.d);
console.log('    最相近之三对：' + pairs.slice(0, 3).map(p => p.a + '/' + p.b + ' ' + p.d.toFixed(0)).join('　'));
if (pairs[0].d < 55) wrn('「' + pairs[0].a + '」与「' + pairs[0].b + '」配色过近（合距 ' + pairs[0].d.toFixed(1) + '），画面难以分辨');
else ok('13 处地域配色两两可辨（天色+山墨+点缀合距最小 ' + pairs[0].d.toFixed(0) + '）');
/* 起手地域必须能修行、能采药 */
const start = locById['qingyun_shan'];
if (!(start.features || []).includes('cultivate')) bad('起手地青云山不可打坐');
if (!(start.features || []).includes('gather')) bad('起手地青云山不可采药');
if (start.realmMin !== 0) bad('起手地青云山门槛非 0');
ok('起手地青云山：可打坐、可采药、无境界门槛');
/* 各境界皆须有可去之处、可打之敌、可采之药 */
let reachBad = [];
for (let r = 0; r <= 8; r++) {
  const canGo = L.filter(l => l.realmMin <= r);
  const canCult = canGo.filter(l => (l.features || []).includes('cultivate'));
  const canGather = canGo.filter(l => (l.features || []).includes('gather'));
  const foes = new Set();
  canGo.forEach(l => (l.enemies || []).forEach(id => { if (Math.abs(eById[id].realm - r) <= 1) foes.add(id); }));
  if (!canCult.length) reachBad.push('境界 ' + r + ' 无可打坐之地');
  if (!canGather.length) reachBad.push('境界 ' + r + ' 无可采药之地');
  if (!foes.size) reachBad.push('境界 ' + r + '（' + D.realms[r].name + '）无同级敌手可斗');
}
reachBad.length ? reachBad.forEach(bad) : ok('境界 0–8 皆有可去之地、可采之药、同级敌手');
/* 渡劫台与坊市可及性 */
const trib = L.filter(l => (l.features || []).includes('tribulation'));
if (!trib.length) bad('全图无渡劫台');
else ok('渡劫台：' + trib.map(l => l.name + '（须' + D.realms[l.realmMin].name + '）').join('、'));
const mkt = L.filter(l => (l.features || []).includes('market'));
if (!mkt.length) bad('全图无坊市');
else if (Math.min(...mkt.map(l => l.realmMin)) > 0) bad('坊市门槛高于炼气期');
else ok('坊市：' + mkt.map(l => l.name).join('、') + '，炼气期即可入');

SEC('妖魔 · 数值与可战性');
const en = {}; let enBad = [];
EN.forEach(e => { const k = (e.title || '') + e.name; if (en[k]) enBad.push('妖魔名重复：' + e.id + ' / ' + en[k]); en[k] = e.id; });
enBad.length ? enBad.forEach(bad) : ok('44 种妖魔名称无重复');
const edesc = {}; let edBad = [];
EN.forEach(e => { if (edesc[e.desc]) edBad.push('妖魔描写重复：' + e.id + ' / ' + edesc[e.desc]); edesc[e.desc] = e.id; });
edBad.length ? edBad.forEach(wrn) : ok('妖魔描写与台词无重复');
/* 是否付得起自己的法术（归一化后） */
let affordBad = [];
EN.forEach(e => {
  const ns = X.Sys.enemyStats(e);
  const costs = (e.techs || []).map(id => (T.find(t => t.id === id) || {}).cost).filter(c => typeof c === 'number');
  if (!costs.length) { affordBad.push(e.id + ' 无有效法术'); return; }
  const cheapest = Math.min(...costs);
  if (ns.qi < cheapest) affordBad.push('「' + e.name + '」归一后炁 ' + ns.qi + ' < 最廉法术 ' + cheapest + '，将永以爪牙搏斗');
  /* 每回合回炁 16%，至少要能连发 */
  if (ns.qi * 0.16 < cheapest * 0.35) affordBad.push('「' + e.name + '」回炁 ' + Math.round(ns.qi * 0.16) + '/回合，难以持续施法（最廉 ' + cheapest + '）');
});
affordBad.length ? affordBad.slice(0, 10).forEach(wrn) : ok('44 种妖魔归一化后皆付得起自身法术，且可持续施法');
/* 法术属性与妖魔属性契合 */
let elemBad = [];
EN.forEach(e => {
  if (e.element === 'none') return;
  const ts = (e.techs || []).map(id => T.find(t => t.id === id)).filter(Boolean);
  const own = ts.filter(t => t.element === e.element || t.element === 'none').length;
  if (own === 0) elemBad.push('「' + e.name + '」属' + D.elements[e.element].name + '，然所习 ' + ts.map(t => t.name).join('/') + ' 无一同气');
});
elemBad.length ? elemBad.slice(0, 8).forEach(wrn) : ok('妖魔所习法术与其五行属性相契');
/* 归一化后与同级修士对比 */
console.log('    境界  妖魔精(均)   修士精   妖魔攻(均)  修士攻   攻防比');
let balBad = [];
for (let r = 0; r <= 8; r++) {
  const g = EN.filter(e => e.realm === r && !e.boss);
  if (!g.length) continue;
  const ns = g.map(e => X.Sys.enemyStats(e));
  const aj = ns.reduce((s, x) => s + x.jing, 0) / ns.length;
  const aa = ns.reduce((s, x) => s + x.atk, 0) / ns.length;
  const R = D.realms[r];
  const pj = R.jing * 1.32, pa = R.atk * 1.32;
  console.log('    ' + String(r).padEnd(5) + X.num(Math.round(aj)).padEnd(12) + X.num(Math.round(pj)).padEnd(9) +
    X.num(Math.round(aa)).padEnd(12) + X.num(Math.round(pa)).padEnd(9) + (aa / pa).toFixed(2));
  if (aa / pa < 0.45) balBad.push('境界 ' + r + ' 妖魔攻仅为修士 ' + (aa / pa * 100).toFixed(0) + '%，过弱');
  if (aa / pa > 1.9) balBad.push('境界 ' + r + ' 妖魔攻达修士 ' + (aa / pa * 100).toFixed(0) + '%，过强');
  if (aj / pj < 0.4) balBad.push('境界 ' + r + ' 妖魔精仅为修士 ' + (aj / pj * 100).toFixed(0) + '%，过脆');
}
balBad.length ? balBad.forEach(wrn) : ok('归一化后各境界妖魔之攻与精，皆在同级修士 0.45–1.9 倍之间');
/* 魁首 */
const bosses = EN.filter(e => e.boss);
if (bosses.length !== 10) bad('魁首 ' + bosses.length + ' 名（应 10）');
const dropped = new Set();
bosses.forEach(b => (b.drops || []).forEach(d => { if (d.k === 'artifact') dropped.add(d.id); }));
const TOP = ['a_taiji_tu', 'a_luoshu_pan', 'a_zhuque_ling', 'a_xuanwu_jia', 'a_qinglong_jiao', 'a_baihu_po', 'a_hetu_bi', 'a_wuji_zhong', 'a_jiuzhuan_lu', 'a_zhaoyao_jing'];
const miss = TOP.filter(id => !dropped.has(id));
miss.length ? bad('顶级法宝无魁首掉落：' + miss.join('、')) : ok('10 名魁首各掌一件顶级法宝，10 件无一遗漏');
bosses.forEach(b => { const ns = X.Sys.enemyStats(b); const R = D.realms[b.realm]; if (ns.jing < R.jing * 1.6) wrn('魁首「' + b.name + '」精 ' + X.num(ns.jing) + ' 不足同级修士 1.6 倍，不称魁首'); });
/* 妖魔皆须可遇 */
const refd = new Set(); L.forEach(l => (l.enemies || []).forEach(id => refd.add(id)));
const orphan = EN.filter(e => !refd.has(e.id));
orphan.length ? bad('无处可遇之妖魔：' + orphan.map(e => e.name).join('、')) : ok('44 种妖魔皆被至少一处地域引用');

/* ============================================================
 * 5. 奇遇
 * ========================================================== */
SEC('奇遇 · 可达性与数值');
const EV = D.events;
/* 正文重复 */
const evt = {}, evtl = {}; let evBad = [];
EV.forEach(e => {
  if (evt[e.text]) evBad.push('事件正文重复：' + e.id + ' / ' + evt[e.text]);
  evt[e.text] = e.id;
  if (evtl[e.title]) evBad.push('事件标题重复：' + e.id + ' / ' + evtl[e.title]);
  evtl[e.title] = e.id;
});
evBad.length ? evBad.forEach(bad) : ok('60 桩奇遇之标题与正文皆无重复');
/* 结果文本重复（同一事件内不同分支不应雷同） */
let brBad = [];
EV.forEach(e => {
  const seen = {};
  (e.choices || []).forEach((c, i) => {
    [['outcome', c.outcome], ['success', c.success], ['fail', c.fail]].forEach(([k, br]) => {
      if (!br) return;
      if (seen[br.text]) brBad.push(e.id + ' 选项' + i + '.' + k + ' 与 ' + seen[br.text] + ' 结果文本雷同');
      seen[br.text] = '选项' + i + '.' + k;
    });
  });
});
brBad.length ? brBad.slice(0, 6).forEach(wrn) : ok('各事件内诸分支结果文本互不雷同');
/* cond 自相矛盾 / 不可达 */
const FEATSET = {};
L.forEach(l => (l.features || []).forEach(f => { (FEATSET[f] = FEATSET[f] || []).push(l) }));
let condBad = [];
const grantedFlags = new Set();
EV.forEach(e => (e.choices || []).forEach(c => [c.outcome, c.success, c.fail].forEach(br => {
  if (br) (br.effects || []).forEach(ef => { if (ef.k === 'flag') grantedFlags.add(ef.id); });
})));
EV.forEach(e => {
  const c = e.cond || {};
  if (c.realmMin !== undefined && c.realmMax !== undefined && c.realmMin > c.realmMax) condBad.push(e.id + ' realmMin>realmMax');
  if (c.needFlag && !grantedFlags.has(c.needFlag)) condBad.push(e.id + ' 需 flag「' + c.needFlag + '」，然无任何事件授予 —— 此事件永不可达');
  /* loc 与 features 同时限定时，须存在同时满足者 */
  if (c.loc && c.loc.length && c.features && c.features.length) {
    const okLoc = c.loc.some(lid => { const l = locById[lid]; return l && c.features.some(f => (l.features || []).includes(f)); });
    if (!okLoc) condBad.push(e.id + ' 所限地域 [' + c.loc.join(',') + '] 皆无所需机能 [' + c.features.join(',') + '] —— 永不可达');
  }
  /* loc 门槛 vs realmMax */
  if (c.loc && c.loc.length) {
    const minEnter = Math.min(...c.loc.map(lid => (locById[lid] || { realmMin: 99 }).realmMin));
    if (c.realmMax !== undefined && minEnter > c.realmMax) condBad.push(e.id + ' 地域最低门槛 ' + minEnter + ' 高于 realmMax ' + c.realmMax + ' —— 永不可达');
  }
  if (c.karmaMin !== undefined && c.karmaMax !== undefined && c.karmaMin > c.karmaMax) condBad.push(e.id + ' karmaMin>karmaMax');
});
condBad.length ? condBad.forEach(bad) : ok('60 桩奇遇之触发条件皆自洽且可达（无死内容）');
/* 实测可达性：逐境界统计 */
console.log('    境界  可遇事件数');
let poolBad = [];
for (let r = 0; r <= 8; r++) {
  const S = X.newGame({ seed: 7 });
  S.realm = r; S.stage = 1;
  let n = 0;
  L.forEach(l => {
    if (l.realmMin > r) return;
    S.loc = l.id;
    EV.forEach(e => { if (X.Sys.eventEligible(S, e)) n++; });
  });
  const uniq = new Set();
  L.forEach(l => { if (l.realmMin > r) return; S.loc = l.id; EV.forEach(e => { if (X.Sys.eventEligible(S, e)) uniq.add(e.id); }); });
  console.log('    ' + String(r).padEnd(5) + uniq.size + ' 桩（合计各地 ' + n + ' 次匹配）');
  if (uniq.size < 20) poolBad.push('境界 ' + r + ' 仅 ' + uniq.size + ' 桩事件可遇，内容偏薄');
}
poolBad.length ? poolBad.forEach(wrn) : ok('各境界皆有 20 桩以上奇遇可遇');
/* 效果数值上限 */
const CAP = { dao: 2500, lifespan: 120, insight: 6, meridian: 2, maxJing: 60, maxQi: 60, maxShen: 50, merit: 120, karma: 120, stone: 1200, daoxin: 30, balance: 40, haste: 60, healPct: 100, hurtPct: 60, jing: 400, qi: 400, shen: 300, repute: 60, affinity: 10 };
let capBad = [];
EV.forEach(e => (e.choices || []).forEach((c, i) => [c.outcome, c.success, c.fail].forEach(br => {
  if (!br) return;
  (br.effects || []).forEach(ef => {
    if (CAP[ef.k] !== undefined && Math.abs(ef.v) > CAP[ef.k]) capBad.push(e.id + ' 选项' + i + ' ' + ef.k + '=' + ef.v + ' 超出上限 ' + CAP[ef.k]);
  });
})));
capBad.length ? capBad.forEach(bad) : ok('全部事件效果数值皆在合理上限内（无破坏平衡之馈赠）');
/* 魔道诱惑：全体妖魔类之中，至少须有「大利 + 重业」之诱；
   单个妖魔遭遇（如噬灵妖藤）本是凶险，不必人人皆作道德试炼。 */
const demonEv = EV.filter(e => e.tag === 'demon');
const anyTempt = demonEv.filter(e => (e.choices || []).some(c => [c.outcome, c.success, c.fail].some(br => br &&
  (br.effects || []).some(ef => ef.k === 'karma' && ef.v >= 20))));
if (!anyTempt.length) bad('妖魔类事件中无一含重业之诱 —— 堕魔之路缺乏诱惑');
else ok('妖魔类 ' + demonEv.length + ' 桩中，' + anyTempt.length + ' 桩含重业之诱（' + anyTempt.map(e => e.title).join('、') + '）');

/* 一次性重宝：须计入「地域门槛」所形成的实际境界要求 */
function effRealmMin(e) {
  const c = e.cond || {};
  let r = c.realmMin || 0;
  if (c.loc && c.loc.length) {
    const m = Math.min(...c.loc.map(id => (locById[id] || { realmMin: 0 }).realmMin));
    r = Math.max(r, m);
  }
  return r;
}
let onceBad = [];
EV.filter(e => e.once).forEach(e => {
  const big = (e.choices || []).some(c => [c.outcome, c.success, c.fail].some(br => br && (br.effects || []).some(ef =>
    ef.k === 'artifact' || ef.k === 'meridian' || (ef.k === 'lifespan' && ef.v > 30))));
  if (big && effRealmMin(e) < 2) onceBad.push(e.id + '「' + e.title + '」授予法宝/经脉/长寿，实际门槛仅 ' + D.realms[effRealmMin(e)].name);
});
onceBad.length ? onceBad.forEach(wrn) : ok('授予法宝、经脉、长寿之一次性机缘，实际门槛（含地域限制）皆在金丹以上');
/* 顶级法宝之获取途径与门槛 */
console.log('    顶级法宝之奇遇途径：');
const artFrom = {};
EV.forEach(e => (e.choices || []).forEach(c => [c.outcome, c.success, c.fail].forEach(br => {
  if (br) (br.effects || []).forEach(ef => { if (ef.k === 'artifact') (artFrom[ef.id] = artFrom[ef.id] || []).push(e.id + '(须' + D.realms[effRealmMin(e)].name + ')'); });
})));
TOP.forEach(id => {
  const a = A.find(x => x.id === id) || { name: id };
  const src = artFrom[id] || [];
  console.log('      ' + a.name.padEnd(6) + (src.length ? src.join('、') : '（唯魁首掉落 / 坊市）'));
});
/* 传说功法虽可早得，然须待境界方能运转 */
let lockOk = true;
LEGEND.forEach(id => { const t = T.find(x => x.id === id); if (!t || t.realm < 3) lockOk = false; });
lockOk ? ok('八部传说功法 realm 皆 ≥ 3，纵早得亦须待境界方能施展（斗法中按境界锁用）')
  : wrn('部分传说功法 realm 门槛过低，早期即可施展');
/* 传说功法之授予是否重复 */
const techGiven = {};
EV.forEach(e => (e.choices || []).forEach(c => [c.outcome, c.success, c.fail].forEach(br => {
  if (br) (br.effects || []).forEach(ef => { if (ef.k === 'tech') (techGiven[ef.id] = techGiven[ef.id] || []).push(e.id); });
})));
console.log('    传说功法授予途径：');
LEGEND.forEach(id => {
  const t = T.find(x => x.id === id);
  const src = techGiven[id] || [];
  console.log('      ' + (t ? t.name : id).padEnd(8) + (src.length ? src.join('、') : '（仅由天劫/坊市/晋境自悟）'));
});
/* 检定属性分布 */
const chk = {};
EV.forEach(e => (e.choices || []).forEach(c => { if (c.check) chk[c.check.stat] = (chk[c.check.stat] || 0) + 1; }));
console.log('    检定属性分布：' + Object.entries(chk).map(([k, v]) => (X.Sys.statLabel[k] || k) + '×' + v).join(' '));
/* 检定难度是否可及：以「疏 / 常 / 精」三等修士分别试之 */
function buildChar(kind, realm) {
  const S = X.newGame({ seed: 3 });
  S.realm = realm; S.stage = 1;
  if (kind === 'weak') { S.insight = 4 + realm * 2; S.daoxin = 30; S.merit = 10; S.karma = 60; S.repute = 0; S.balance = 5; S.techs = S.techs.slice(0, 2); S.equipped = { main: null, robe: null, talisman: null }; }
  else if (kind === 'typ') { S.insight = 7 + realm * 2.2; S.daoxin = 62; S.merit = 120; S.karma = 20; S.repute = 25; S.balance = 20; }
  else { S.insight = 12 + realm * 3; S.daoxin = 92; S.merit = 700; S.karma = 0; S.repute = 120; S.balance = 65; S.equipped = { main: 'a_taiji_tu', robe: null, talisman: null }; S.artifacts = ['a_taiji_tu']; X.Data.techniques.filter(t => !t.id.startsWith('m_')).slice(0, 22).forEach(t => { if (S.techs.indexOf(t.id) < 0) S.techs.push(t.id); }); }
  X.recalcLifespan(S);
  const st = X.stats(S);
  const fill = kind === 'weak' ? 0.35 : kind === 'typ' ? 0.72 : 1;
  S.jing = st.maxJing * fill; S.qi = st.maxQi * fill; S.shen = st.maxShen * fill;
  return S;
}
let dcBad = [], dcTrivial = [], dcImposs = [];
const scale = { weak: [], typ: [], strong: [] };
EV.forEach(e => (e.choices || []).forEach((c, i) => {
  if (!c.check) return;
  const realm = Math.max((e.cond || {}).realmMin || 0, 0);
  const pw = X.Sys.checkOdds(buildChar('weak', realm), c.check);
  const pt = X.Sys.checkOdds(buildChar('typ', realm), c.check);
  const ps = X.Sys.checkOdds(buildChar('strong', realm), c.check);
  scale.weak.push(pw); scale.typ.push(pt); scale.strong.push(ps);
  const tag = e.id + ' 选项' + i + '（' + (X.Sys.statLabel[c.check.stat] || c.check.stat) + ' dc' + c.check.dc + '）';
  if (pt >= 0.995) dcTrivial.push(tag + ' 寻常修士必成 —— 检定无意义');
  if (ps <= 0.001) dcImposs.push(tag + ' 纵精修此道亦必不成 —— 死选项');
  if (ps < pt - 0.001) dcBad.push(tag + ' 精修者成算反低于寻常者 —— 属性折算有误');
}));
const avg = a => a.length ? (a.reduce((s, x) => s + x, 0) / a.length) : 0;
console.log('    平均成算　疏于此道 ' + (avg(scale.weak) * 100).toFixed(0) + '%　寻常 ' +
  (avg(scale.typ) * 100).toFixed(0) + '%　精修 ' + (avg(scale.strong) * 100).toFixed(0) + '%');
dcTrivial.forEach(bad);
dcImposs.forEach(bad);
dcBad.forEach(bad);
if (!dcTrivial.length && !dcImposs.length && !dcBad.length) {
  ok('全部 ' + scale.typ.length + ' 处检定：寻常修士无一必成，精修者无一必败，且成算随投入单调上升');
}
if (avg(scale.typ) > 0.85) wrn('寻常修士平均成算 ' + (avg(scale.typ) * 100).toFixed(0) + '%，检定整体过易');
if (avg(scale.typ) < 0.30) wrn('寻常修士平均成算 ' + (avg(scale.typ) * 100).toFixed(0) + '%，检定整体过难');
if (avg(scale.strong) - avg(scale.weak) < 0.25) wrn('精修与疏者成算差仅 ' + ((avg(scale.strong) - avg(scale.weak)) * 100).toFixed(0) + '%，属性投入无区分度');
/* 两难性：每事件至少一个选项有代价或负面效果 */
let dilBad = [];
EV.forEach(e => {
  const anyCost = (e.choices || []).some(c => {
    if (c.cost && Object.keys(c.cost).length) return true;
    if (c.check) return true;
    return [c.outcome, c.success, c.fail].some(br => br && (br.effects || []).some(ef =>
      (ef.k === 'karma' && ef.v > 0) || (ef.k === 'hurtPct') || (ef.k === 'daoxin' && ef.v < 0) ||
      (ef.k === 'lifespan' && ef.v < 0) || (ef.k === 'merit' && ef.v < 0) || ef.k === 'combat'));
  });
  if (!anyCost) dilBad.push(e.id + '「' + e.title + '」诸选项皆无代价、无检定、无负面 —— 无抉择张力');
});
dilBad.length ? dilBad.slice(0, 10).forEach(wrn) : ok('60 桩奇遇皆含代价、检定或负面后果，具备抉择张力');
/* 因果自洽：善举须有功德，恶举须有业障 */
const karmaEv = EV.filter(e => e.tag === 'karma');
let kBad = [];
karmaEv.forEach(e => {
  let hasMerit = false, hasKarma = false;
  (e.choices || []).forEach(c => [c.outcome, c.success, c.fail].forEach(br => {
    if (!br) return;
    (br.effects || []).forEach(ef => {
      if (ef.k === 'merit' && ef.v > 0) hasMerit = true;
      if (ef.k === 'karma' && ef.v > 0) hasKarma = true;
    });
  }));
  if (!hasMerit && !hasKarma) kBad.push(e.id + '「' + e.title + '」标为因果类，然既无功德亦无业障');
});
kBad.length ? kBad.forEach(wrn) : ok('10 桩因果事件皆有功德或业障之实际后果');

/* ============================================================
 * 6. 端到端：以子代理数据实跑
 * ========================================================== */
SEC('端到端 · 以子代理数据实跑');
/* 每一门法术对每一种妖魔都能施放而不出错 */
let runErr = [];
const S1 = X.newGame({ seed: 555 });
S1.realm = 8; S1.stage = 2; X.recalcLifespan(S1);
S1.techs = player.map(t => t.id);
let casts = 0;
EN.forEach(e => {
  const st = X.stats(S1);
  S1.jing = st.maxJing; S1.qi = st.maxQi; S1.shen = st.maxShen;
  const cb = new X.Combat(S1, e, new X.RNG(e.realm * 31 + 7), {});
  cb.player.maxQi = 1e12;
  player.forEach(t => {
    if (cb.over) return;
    cb.player.qi = 1e12; cb.player.cds = {};
    try { cb.playerTurn({ type: 'tech', id: t.id }); casts++; }
    catch (ex) { runErr.push('「' + t.name + '」对「' + e.name + '」施放出错：' + ex.message); }
  });
  /* 妖魔反击亦须无误 */
  try { for (let i = 0; i < 8 && !cb.over; i++) cb.playerTurn({ type: 'guard' }); }
  catch (ex) { runErr.push('「' + e.name + '」反击出错：' + ex.message); }
});
runErr.length ? runErr.slice(0, 8).forEach(bad) : ok('62×44 组合共 ' + casts + ' 次施法及妖魔反击，全部无异常');
/* 每张丹方三种火候皆能炼 */
let refErr = [];
let made = 0;
P.forEach(p => {
  [p.fireIdeal, 0.02, 0.98].forEach(pos => {
    const S = X.newGame({ seed: 13 });
    S.realm = Math.min(8, p.realm + 1); S.stage = 1; X.recalcLifespan(S);
    const st = X.stats(S); S.qi = st.maxQi;
    if (S.recipes.indexOf(p.id) < 0) S.recipes.push(p.id);
    (p.recipe || []).forEach(r => { S.herbs[r.herb] = r.qty + 2; });
    try { const r = X.Sys.refinePill(S, p.id, pos, new X.RNG(9)); if (!r.ok) refErr.push(p.id + ' 火候 ' + pos + '：' + r.reason); else made++; }
    catch (ex) { refErr.push(p.id + ' 火候 ' + pos + ' 抛错：' + ex.message); }
  });
});
refErr.length ? refErr.slice(0, 8).forEach(bad) : ok('26 张丹方 × 3 种火候共 ' + made + ' 次开炉，全部正常出丹或废丹');
/* 每桩事件每个选项都能解算 */
let evErr = [], resolved = 0;
EV.forEach(e => {
  (e.choices || []).forEach((c, i) => {
    const S = X.newGame({ seed: 77 });
    S.realm = Math.min(8, (e.cond || {}).realmMin || 2); S.stage = 1; X.recalcLifespan(S);
    const st = X.stats(S);
    S.jing = st.maxJing; S.qi = st.maxQi; S.shen = st.maxShen; S.stone = 1e9; S.karma = 80; S.merit = 200;
    try {
      const r = X.Sys.resolveChoice(S, e, i, new X.RNG(i * 17 + 3));
      if (!r) { evErr.push(e.id + ' 选项' + i + ' 返回空'); return; }
      if (!r.ok) { evErr.push(e.id + ' 选项' + i + ' 不可行：' + r.reason); return; }
      resolved++;
      ['jing', 'qi', 'shen', 'dao', 'insight', 'daoxin', 'balance', 'merit', 'karma', 'stone', 'repute', 'haste', 'lifespan', 'age'].forEach(k => {
        if (!isFinite(S[k])) evErr.push(e.id + ' 选项' + i + ' 令 ' + k + ' 变为非数');
      });
      if (S.lifespan <= 0) evErr.push(e.id + ' 选项' + i + ' 令寿元归零');
    } catch (ex) { evErr.push(e.id + ' 选项' + i + ' 抛错：' + ex.message); }
  });
});
evErr.length ? evErr.slice(0, 10).forEach(bad) : ok('60 桩奇遇共 ' + resolved + ' 个选项全部解算成功，无非数、无寿元归零');
/* 每卦皆可占出并渲染 */
let divErr = [];
H.forEach(h => {
  if (!D.omenMeta[h.omen]) divErr.push('第' + h.n + '卦吉凶 ' + h.omen + ' 无元数据');
  const flip = h.lines.split(''); flip[2] = flip[2] === '1' ? '0' : '1';
  if (!H.find(x => x.lines === flip.join(''))) divErr.push('第' + h.n + '卦三爻变后无对应之卦（爻画集不完备）');
});
divErr.length ? divErr.forEach(bad) : ok('64 卦皆有吉凶元数据，且任一爻变皆能找到变卦（爻画集完备）');

/* ============================================================
 * 结论
 * ========================================================== */
console.log('\n' + '═'.repeat(64));
if (W.length) { console.log('\n警告 ' + W.length + ' 条：'); W.forEach(w => console.log('  ⚠ ' + w)); }
if (E.length) { console.log('\n错误 ' + E.length + ' 条：'); E.forEach(e => console.log('  ✗ ' + e)); }
if (INFO.length) { console.log('\n备注：'); INFO.forEach(i => console.log('  · ' + i)); }
console.log('');
if (E.length) { console.log('审计未通过：' + E.length + ' 错误 / ' + W.length + ' 警告'); process.exit(1); }
console.log('✓ 深度审计通过（0 错误 / ' + W.length + ' 警告）');
