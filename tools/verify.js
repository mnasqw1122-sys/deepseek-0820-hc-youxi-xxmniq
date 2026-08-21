/* 数据契约校验：node tools/verify.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const files = [
  'js/data/core.js', 'js/core/util.js',
  'js/data/hexagrams.js', 'js/data/techniques.js',
  'js/data/alchemy.js', 'js/data/world.js', 'js/data/events.js',
  'js/state.js',
  'js/systems/effects.js', 'js/systems/cultivate.js', 'js/systems/craft.js',
  'js/systems/combat.js', 'js/systems/trib.js', 'js/systems/divine.js', 'js/systems/events.js'
];

const sandbox = { localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }, console, Math, Date, JSON };
sandbox.window = sandbox;            // 浏览器里 window 即全局对象
sandbox.document = { createElement: () => ({}), querySelector: () => null, querySelectorAll: () => [] };
sandbox.btoa = s => Buffer.from(s, 'binary').toString('base64');
sandbox.atob = s => Buffer.from(s, 'base64').toString('binary');
vm.createContext(sandbox);

for (const f of files) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) { console.error('MISSING ' + f); process.exit(1); }
  const src = fs.readFileSync(p, 'utf8');
  try { vm.runInContext(src, sandbox, { filename: f }); }
  catch (e) { console.error('LOAD FAIL ' + f + ': ' + e.message); process.exit(1); }
}
const X = sandbox.window.XIAN;
const D = X.Data;
const errs = [], warns = [];
const E = (m) => errs.push(m);
const W = (m) => warns.push(m);

const ELEMS = ['jin', 'mu', 'shui', 'huo', 'tu'];
const ELEMS_N = ELEMS.concat(['none']);

/* ---- counts ---- */
const counts = {
  hexagrams: D.hexagrams.length, bagua: D.bagua.length,
  techniques: D.techniques.length, artifacts: D.artifacts.length,
  herbs: D.herbs.length, pills: D.pills.length,
  locations: D.locations.length, enemies: D.enemies.length,
  events: D.events.length, meridians: D.meridians.length,
  realms: D.realms.length, solarTerms: D.solarTerms.length,
  stances: D.stances.length, spiritRoots: D.spiritRoots.length, fates: D.fates.length
};
console.log('计数：', JSON.stringify(counts, null, 0));

/* ---- ids unique ---- */
function uniq(arr, name, key = 'id') {
  const seen = new Set();
  arr.forEach(o => { if (seen.has(o[key])) E(name + ' 重复 ' + key + '：' + o[key]); seen.add(o[key]); });
}
uniq(D.techniques, 'techniques'); uniq(D.artifacts, 'artifacts');
uniq(D.herbs, 'herbs'); uniq(D.pills, 'pills');
uniq(D.locations, 'locations'); uniq(D.enemies, 'enemies');
uniq(D.events, 'events'); uniq(D.meridians, 'meridians');

/* ---- hexagrams ---- */
if (D.hexagrams.length !== 64) E('六十四卦数量 = ' + D.hexagrams.length);
D.hexagrams.forEach((h, i) => {
  if (h.n !== i + 1) E('卦序不连续 @' + i + ' n=' + h.n);
  if (!/^[01]{6}$/.test(h.lines)) E('卦 ' + h.n + ' lines 非法：' + h.lines);
  if (!D.omenMeta[h.omen]) E('卦 ' + h.n + ' omen 非法：' + h.omen);
  ['name', 'full', 'judgement', 'image', 'advice', 'guide'].forEach(k => { if (!h[k]) E('卦 ' + h.n + ' 缺 ' + k); });
});

/* ---- techniques ---- */
const OKEFF = new Set(['damage', 'multihit', 'shield', 'heal', 'buff', 'debuff', 'dot', 'stun', 'drain', 'qiburn', 'restoreQi', 'cleanse', 'purge', 'reflect', 'evade', 'execute', 'soul', 'insta']);
const OKSTAT = new Set(['atk', 'def', 'spd', 'crit', 'pen']);
const LEGEND = ['t_taiyi_wuji', 't_ziwei_leifa', 't_beiming_zhenshui', 't_liyan_fenkong', 't_houtu_zhenyue', 't_gengjin_jianyu', 't_qingmu_changsheng', 't_wuwei_zhenjing'];
const MON = ['m_claw', 'm_bite', 'm_tail', 'm_roar', 'm_venom', 'm_flame', 'm_frost', 'm_stone', 'm_gale', 'm_thunder', 'm_soulcry', 'm_drain', 'm_shell', 'm_regen', 'm_curse'];
const tById = Object.fromEntries(D.techniques.map(t => [t.id, t]));
LEGEND.concat(MON).forEach(id => { if (!tById[id]) E('缺法术 ' + id); });
D.techniques.forEach(t => {
  if (ELEMS_N.indexOf(t.element) < 0) E('法术 ' + t.id + ' element 非法：' + t.element);
  if (!(t.tier >= 1 && t.tier <= 5)) E('法术 ' + t.id + ' tier 非法');
  if (!(t.realm >= 0 && t.realm <= 8)) E('法术 ' + t.id + ' realm 非法');
  if (typeof t.cost !== 'number') E('法术 ' + t.id + ' cost 非数');
  if (!Array.isArray(t.effects) || !t.effects.length) E('法术 ' + t.id + ' 无 effects');
  (t.effects || []).forEach(ef => {
    if (!OKEFF.has(ef.k)) E('法术 ' + t.id + ' 非法效果 ' + ef.k);
    if ((ef.k === 'buff' || ef.k === 'debuff') && !OKSTAT.has(ef.stat)) E('法术 ' + t.id + ' 非法 stat ' + ef.stat);
  });
});
/* 玩家可用法术必须存在低阶起手 */
const starters = D.techniques.filter(t => t.tier === 1 && t.realm === 0 && !t.id.startsWith('m_'));
if (starters.length < 5) W('tier1/realm0 玩家法术仅 ' + starters.length + ' 个');
ELEMS.forEach(el => {
  const n = starters.filter(t => t.element === el || t.element === 'none').length;
  if (n === 0) E('五行 ' + el + ' 无起手法术');
});

/* ---- artifacts ---- */
const TOPART = ['a_taiji_tu', 'a_luoshu_pan', 'a_zhuque_ling', 'a_xuanwu_jia', 'a_qinglong_jiao', 'a_baihu_po', 'a_hetu_bi', 'a_wuji_zhong', 'a_jiuzhuan_lu', 'a_zhaoyao_jing'];
const aById = Object.fromEntries(D.artifacts.map(a => [a.id, a]));
TOPART.forEach(id => { if (!aById[id]) E('缺法宝 ' + id); });
const OKSLOT = new Set(['main', 'robe', 'talisman']);
const OKASTAT = new Set(['atk', 'def', 'spd', 'crit', 'maxQi', 'maxJing', 'maxShen', 'insight', 'daoxin']);
D.artifacts.forEach(a => {
  if (!OKSLOT.has(a.slot)) E('法宝 ' + a.id + ' slot 非法：' + a.slot);
  if (ELEMS_N.indexOf(a.element) < 0) E('法宝 ' + a.id + ' element 非法');
  Object.keys(a.stats || {}).forEach(k => { if (!OKASTAT.has(k)) E('法宝 ' + a.id + ' 非法属性 ' + k); });
});
['main', 'robe', 'talisman'].forEach(s => {
  if (!D.artifacts.some(a => a.slot === s && a.tier <= 2)) E('slot ' + s + ' 缺低阶法宝');
});

/* ---- herbs / pills ---- */
const hById = Object.fromEntries(D.herbs.map(h => [h.id, h]));
const LOCIDS = D.locations.map(l => l.id);
D.herbs.forEach(h => {
  if (ELEMS.indexOf(h.element) < 0) E('灵药 ' + h.id + ' element 非法');
  if (['yang', 'yin', 'ping'].indexOf(h.nature) < 0) E('灵药 ' + h.id + ' nature 非法');
  (h.habitat || []).forEach(l => { if (LOCIDS.indexOf(l) < 0) E('灵药 ' + h.id + ' 产地未知 ' + l); });
  if (!(h.habitat || []).length) E('灵药 ' + h.id + ' 无产地');
});
const OKPEFF = new Set(['jing', 'qi', 'shen', 'maxJing', 'maxQi', 'maxShen', 'dao', 'insight', 'daoxin', 'balance', 'lifespan', 'karma', 'merit', 'haste', 'healPct', 'breakthrough', 'affinity']);
D.pills.forEach(p => {
  if (!(p.recipe || []).length) E('丹方 ' + p.id + ' 无配方');
  const jun = (p.recipe || []).filter(r => r.role === 'jun').length;
  if (jun !== 1) E('丹方 ' + p.id + ' 君药数 = ' + jun);
  (p.recipe || []).forEach(r => {
    if (!hById[r.herb]) E('丹方 ' + p.id + ' 引用未知灵药 ' + r.herb);
    if (['jun', 'chen', 'zuo', 'shi'].indexOf(r.role) < 0) E('丹方 ' + p.id + ' role 非法 ' + r.role);
  });
  (p.effects || []).forEach(ef => { if (!OKPEFF.has(ef.k)) E('丹方 ' + p.id + ' 非法效果 ' + ef.k); });
  if (!(p.fireIdeal > 0.1 && p.fireIdeal < 0.95)) E('丹方 ' + p.id + ' fireIdeal 越界');
  if (!(p.fireTol >= 0.03 && p.fireTol <= 0.25)) E('丹方 ' + p.id + ' fireTol 越界');
});
/* 每个地域都要产药（除坊市） */
D.locations.forEach(l => {
  if ((l.features || []).indexOf('gather') >= 0) {
    const n = D.herbs.filter(h => (h.habitat || []).indexOf(l.id) >= 0).length;
    if (n === 0) E('地域 ' + l.id + ' 可采药但无药');
  }
});
/* tier1 丹方须可用低阶药 */
const t1p = D.pills.filter(p => p.tier === 1);
if (t1p.length < 3) E('tier1 丹方仅 ' + t1p.length + ' 张');
t1p.forEach(p => {
  p.recipe.forEach(r => { if (hById[r.herb].tier > 2) W('tier1 丹方 ' + p.id + ' 需 tier' + hById[r.herb].tier + ' 药 ' + r.herb); });
});

/* ---- locations / enemies ---- */
const OKFEAT = new Set(['gather', 'cultivate', 'market', 'sect', 'altar', 'ruin', 'forge', 'spring', 'trial', 'tribulation']);
const eById = Object.fromEntries(D.enemies.map(e => [e.id, e]));
D.locations.forEach(l => {
  if (ELEMS_N.indexOf(l.element) < 0) E('地域 ' + l.id + ' element 非法');
  (l.features || []).forEach(f => { if (!OKFEAT.has(f)) E('地域 ' + l.id + ' feature 非法 ' + f); });
  (l.enemies || []).forEach(id => { if (!eById[id]) E('地域 ' + l.id + ' 引用未知妖魔 ' + id); });
  if (!Array.isArray(l.sky) || l.sky.length !== 3) E('地域 ' + l.id + ' sky 非三色');
  (l.sky || []).concat([l.ink, l.accent]).forEach(c => { if (!/^#[0-9a-fA-F]{6}$/.test(c || '')) E('地域 ' + l.id + ' 颜色非法 ' + c); });
  if (!(l.realmMin >= 0 && l.realmMin <= 8)) E('地域 ' + l.id + ' realmMin 非法');
});
const monSet = new Set(MON);
D.enemies.forEach(e => {
  if (!(e.realm >= 0 && e.realm <= 8)) E('妖魔 ' + e.id + ' realm 非法');
  if (ELEMS_N.indexOf(e.element) < 0) E('妖魔 ' + e.id + ' element 非法');
  (e.techs || []).forEach(t => { if (!monSet.has(t)) E('妖魔 ' + e.id + ' 法术越界 ' + t); });
  if (!(e.techs || []).length) E('妖魔 ' + e.id + ' 无法术');
  ['jing', 'qi', 'shen', 'atk', 'def', 'spd'].forEach(k => { if (typeof e[k] !== 'number' || e[k] <= 0) E('妖魔 ' + e.id + ' ' + k + ' 非法'); });
  (e.drops || []).forEach(d => {
    if (['stone', 'dao', 'herb', 'shen', 'merit', 'repute', 'artifact'].indexOf(d.k) < 0) E('妖魔 ' + e.id + ' drop 非法 ' + d.k);
    if (d.k === 'artifact' && !aById[d.id]) E('妖魔 ' + e.id + ' 掉落未知法宝 ' + d.id);
  });
});
/* 每个境界都要有敌人可打 */
for (let r = 0; r <= 8; r++) {
  if (!D.enemies.some(e => e.realm === r)) E('境界 ' + r + ' 无敌人');
}
/* 每个可遇敌地域，玩家在其 realmMin 时须有同级或更低敌人 */
D.locations.forEach(l => {
  if (!(l.enemies || []).length) return;
  const min = Math.min(...l.enemies.map(id => eById[id].realm));
  if (min > l.realmMin + 1) W('地域 ' + l.id + ' realmMin=' + l.realmMin + ' 但最弱敌人 realm=' + min);
});
const bosses = D.enemies.filter(e => e.boss);
console.log('boss 数：' + bosses.length);
const dropArts = new Set();
bosses.forEach(b => (b.drops || []).forEach(d => { if (d.k === 'artifact') dropArts.add(d.id); }));
TOPART.forEach(id => { if (!dropArts.has(id)) W('顶级法宝无 boss 掉落：' + id); });

/* ---- events ---- */
const OKEV = new Set(['jing', 'qi', 'shen', 'maxJing', 'maxQi', 'maxShen', 'dao', 'insight', 'daoxin', 'balance', 'merit', 'karma', 'stone', 'repute', 'lifespan', 'haste', 'healPct', 'hurtPct', 'affinity', 'herb', 'pill', 'recipe', 'meridian', 'artifact', 'tech', 'techRandom', 'flag', 'combat', 'move', 'time', 'age']);
const OKCHK = new Set(['insight', 'daoxin', 'shen', 'qi', 'jing', 'atk', 'luck', 'merit', 'karma', 'yang', 'yin', 'realm']);
let onceN = 0, tagCount = {};
D.events.forEach(ev => {
  if (ev.once) onceN++;
  tagCount[ev.tag] = (tagCount[ev.tag] || 0) + 1;
  if (['chance', 'karma', 'danger', 'dao', 'people', 'relic', 'demon'].indexOf(ev.tag) < 0) E('事件 ' + ev.id + ' tag 非法 ' + ev.tag);
  if (!ev.text || ev.text.length < 40) E('事件 ' + ev.id + ' 正文过短');
  if (!(ev.choices || []).length) E('事件 ' + ev.id + ' 无选项');
  const c = ev.cond || {};
  (c.loc || []).forEach(l => { if (LOCIDS.indexOf(l) < 0) E('事件 ' + ev.id + ' loc 未知 ' + l); });
  (c.features || []).forEach(f => { if (!OKFEAT.has(f)) E('事件 ' + ev.id + ' feature 未知 ' + f); });
  (ev.choices || []).forEach((ch, i) => {
    if (ch.check) {
      if (!OKCHK.has(ch.check.stat)) E('事件 ' + ev.id + ' 检定属性非法 ' + ch.check.stat);
      if (!ch.success || !ch.fail) E('事件 ' + ev.id + ' 选项' + i + ' 有 check 但缺 success/fail');
    } else if (!ch.outcome && !ch.success) E('事件 ' + ev.id + ' 选项' + i + ' 无结果');
    [ch.outcome, ch.success, ch.fail].forEach(br => {
      if (!br) return;
      if (!br.text) E('事件 ' + ev.id + ' 分支缺 text');
      (br.effects || []).forEach(ef => {
        if (!OKEV.has(ef.k)) E('事件 ' + ev.id + ' 效果非法 ' + ef.k);
        if (ef.k === 'artifact' && !aById[ef.id]) E('事件 ' + ev.id + ' 未知法宝 ' + ef.id);
        if (ef.k === 'tech' && !tById[ef.id]) E('事件 ' + ev.id + ' 未知法术 ' + ef.id);
        if (ef.k === 'move' && LOCIDS.indexOf(ef.loc) < 0) E('事件 ' + ev.id + ' 未知去处 ' + ef.loc);
        if (ef.k === 'affinity' && ELEMS.indexOf(ef.element) < 0) E('事件 ' + ev.id + ' affinity element 非法');
        if (ef.k === 'herb' && ef.id && ef.id !== 'random' && !hById[ef.id]) E('事件 ' + ev.id + ' 未知灵药 ' + ef.id);
        if (ef.k === 'pill' && ef.id && !D.pills.some(p => p.id === ef.id)) E('事件 ' + ev.id + ' 未知丹药 ' + ef.id);
        if (ef.k === 'recipe' && !D.pills.some(p => p.id === ef.id)) E('事件 ' + ev.id + ' 未知丹方 ' + ef.id);
      });
    });
  });
});
console.log('事件 tag 分布：' + JSON.stringify(tagCount) + '  once=' + onceN);
/* 无 loc 限制的事件数量 */
const anywhere = D.events.filter(e => !(e.cond && e.cond.loc && e.cond.loc.length)).length;
console.log('不限地域事件：' + anywhere);
if (anywhere < 12) W('不限地域事件过少：' + anywhere);
/* 起手境界 0 有可用事件 */
const r0 = D.events.filter(e => !(e.cond && e.cond.realmMin > 0));
console.log('境界0 可遇事件：' + r0.length);
if (r0.length < 15) W('境界0 可遇事件偏少');

/* ---- 核心数据自洽 ---- */
if (D.realms.length !== 10) E('境界数 != 10');
if (D.solarTerms.length !== 24) E('节气数 != 24');
if (D.meridians.length !== 20) E('经脉数 != 20');
D.meridians.forEach(m => { if (ELEMS.indexOf(m.element) < 0) E('经脉 ' + m.id + ' element 非法'); });
D.spiritRoots.forEach(r => {
  const made = r.make(new X.RNG(7));
  const sum = ELEMS.reduce((s, k) => s + (made.aff[k] || 0), 0);
  if (sum < 100 || sum > 200) W('灵根 ' + r.id + ' 亲和总和 ' + sum);
  ELEMS.forEach(k => { if (made.aff[k] === undefined) E('灵根 ' + r.id + ' 缺 ' + k); });
  if (ELEMS.indexOf(made.main) < 0) E('灵根 ' + r.id + ' main 非法');
});

console.log('');
if (warns.length) { console.log('警告 ' + warns.length + ' 条：'); warns.forEach(w => console.log('  ⚠ ' + w)); }
if (errs.length) { console.log('错误 ' + errs.length + ' 条：'); errs.forEach(e => console.log('  ✗ ' + e)); process.exit(1); }
console.log('✓ 数据契约校验通过（警告 ' + warns.length + ' 条）');
