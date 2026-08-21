/* ============================================================
 *  craft.js — 采药、丹道（君臣佐使 + 火候）、坊市、炼器温养
 * ============================================================ */
window.XIAN = window.XIAN || {};
XIAN.Sys = XIAN.Sys || {};

/* ---------------- 丹药品阶 ---------------- */
XIAN.Data.pillQuality = [
  { q: 0, name: '废丹', color: '#6b6b63', mult: 0, count: 0 },
  { q: 1, name: '下品', color: '#8f9a8f', mult: 0.60, count: 1 },
  { q: 2, name: '中品', color: '#b8925a', mult: 1.00, count: 1 },
  { q: 3, name: '上品', color: '#c9803c', mult: 1.45, count: 2 },
  { q: 4, name: '极品', color: '#c8102e', mult: 2.05, count: 2 },
  { q: 5, name: '仙品', color: '#e8c86a', mult: 3.10, count: 3 }
];
XIAN.Sys.pillKey = function (id, q) { return id + '@' + (q === undefined ? 2 : q); };
XIAN.Sys.pillParse = function (key) {
  var i = String(key).indexOf('@');
  if (i < 0) return { id: key, q: 2 };
  return { id: key.slice(0, i), q: parseInt(key.slice(i + 1), 10) || 2 };
};
XIAN.Sys.pillLabel = function (key) {
  var p = XIAN.Sys.pillParse(key);
  var def = XIAN.byId(XIAN.Data.pills, p.id);
  var Q = XIAN.Data.pillQuality[p.q] || XIAN.Data.pillQuality[2];
  return (def ? def.name : p.id) + '（' + Q.name + '）';
};

/* ---------------- 君臣佐使 ---------------- */
XIAN.Data.herbRoles = {
  jun: { name: '君', full: '君药', desc: '主治之药，力专而效宏。缺之则方不立。', weight: 0.46 },
  chen: { name: '臣', full: '臣药', desc: '辅君之药，助其所长。', weight: 0.28 },
  zuo: { name: '佐', full: '佐药', desc: '佐制之药，去其偏烈。', weight: 0.16 },
  shi: { name: '使', full: '使药', desc: '引经之药，导药归所。', weight: 0.10 }
};

/* ---------------- 采药 ---------------- */
XIAN.Sys.gatherInfo = function (S) {
  var L = XIAN.byId(XIAN.Data.locations, S.loc);
  var ok = L && (L.features || []).indexOf('gather') >= 0;
  return {
    ok: !!ok,
    reason: ok ? '' : '此地不产灵药',
    days: Math.round(XIAN.Data.realms[S.realm].days * 0.5),
    loc: L
  };
};
XIAN.Sys.gather = function (S, rng) {
  var info = XIAN.Sys.gatherInfo(S);
  if (!info.ok) return { ok: false, reason: info.reason };
  var L = info.loc, st = XIAN.stats(S);
  var maxTier = XIAN.clamp(1 + Math.floor(S.realm * 0.75) + Math.round(L.danger * 0.4), 1, 5);
  var pool = (XIAN.Data.herbs || []).filter(function (h) {
    return (h.habitat || []).indexOf(S.loc) >= 0 && h.tier <= maxTier;
  });
  if (!pool.length) {
    pool = (XIAN.Data.herbs || []).filter(function (h) { return h.tier <= Math.min(2, maxTier); });
  }
  var out = { ok: true, got: [], lines: [], days: info.days };
  var luck = 1 + (st.insight - 5) * 0.02 + S.merit / 900 + ((S.fate && S.fate.mods && S.fate.mods.luck) || 0) / 200;
  var n = XIAN.clamp(Math.round(rng.float(1.4, 3.4) * L.spirit * luck), 1, 9);
  /* 卦象吉则多得 */
  if (S.divine) {
    var om = XIAN.Data.omenMeta[S.divine.omen];
    if (om) n = Math.max(1, Math.round(n * (0.6 + om.mult * 0.45)));
  }
  for (var i = 0; i < n; i++) {
    /* 高阶药稀少 */
    var cand = pool.filter(function (h) { return rng.chance(1 / Math.pow(2.6, h.tier - 1)); });
    var h = rng.pick(cand.length ? cand : pool);
    if (!h) break;
    S.herbs[h.id] = (S.herbs[h.id] || 0) + 1;
    S.stats.herbsGathered++;
    out.got.push(h);
  }
  /* 险地采药有风险 */
  if (L.danger >= 3 && rng.chance(0.10 + L.danger * 0.045)) {
    out.ambush = true;
  }
  var counts = {};
  out.got.forEach(function (h) { counts[h.name] = (counts[h.name] || 0) + 1; });
  var parts = [];
  for (var k in counts) parts.push(k + '×' + counts[k]);
  out.lines.push(parts.length ? '所得：' + parts.join('，') : '空手而归，草木无情。');
  out.death = XIAN.Sys.advanceTime(S, info.days, { regenJing: 0.08, regenQi: 0.10, regenShen: 0.05 });
  return out;
};

/* ---------------- 丹道 ---------------- */
XIAN.Sys.recipeStatus = function (S, pid) {
  var p = XIAN.byId(XIAN.Data.pills, pid);
  if (!p) return null;
  var need = [], ok = true;
  (p.recipe || []).forEach(function (r) {
    var h = XIAN.byId(XIAN.Data.herbs, r.herb);
    var have = S.herbs[r.herb] || 0;
    if (have < r.qty) ok = false;
    need.push({ herb: h, id: r.herb, qty: r.qty, have: have, role: r.role, enough: have >= r.qty });
  });
  var st = XIAN.stats(S);
  var qiCost = Math.round(st.maxQi * (0.10 + p.tier * 0.05));
  return {
    pill: p, need: need, herbsOk: ok,
    qiCost: qiCost, qiOk: S.qi >= qiCost,
    known: S.recipes.indexOf(pid) >= 0,
    days: Math.round(XIAN.Data.realms[S.realm].days * 0.6),
    ok: ok && S.qi >= qiCost && S.recipes.indexOf(pid) >= 0
  };
};

/* 火候容差：受火系亲和、悟性、九转炉、命格影响 */
XIAN.Sys.fireTolerance = function (S, p) {
  var st = XIAN.stats(S);
  var tol = p.fireTol;
  tol *= 1 + (S.aff.huo - 30) / 160;
  tol *= 1 + (st.insight - 5) * 0.012;
  var fm = (S.fate && S.fate.mods) || {};
  if (fm.alchemy) tol *= (1 + fm.alchemy);
  if (S.equipped.main === 'a_jiuzhuan_lu' || S.artifacts.indexOf('a_jiuzhuan_lu') >= 0) tol *= 1.5;
  if (S.meridians.indexOf('xin') >= 0) tol *= 1.08;
  return XIAN.clamp(tol, 0.03, 0.42);
};

XIAN.Sys.refinePill = function (S, pid, firePos, rng) {
  var stat = XIAN.Sys.recipeStatus(S, pid);
  if (!stat) return { ok: false, reason: '无此丹方' };
  if (!stat.known) return { ok: false, reason: '未得此方' };
  if (!stat.herbsOk) return { ok: false, reason: '药材不足' };
  if (!stat.qiOk) return { ok: false, reason: '真炁不足以御火' };
  var p = stat.pill;

  /* 耗药、耗炁 */
  (p.recipe || []).forEach(function (r) {
    S.herbs[r.herb] = (S.herbs[r.herb] || 0) - r.qty;
    if (S.herbs[r.herb] <= 0) delete S.herbs[r.herb];
  });
  S.qi = Math.max(0, S.qi - stat.qiCost);

  /* 火候评分 */
  var tol = XIAN.Sys.fireTolerance(S, p);
  var err = Math.abs(firePos - p.fireIdeal);
  var acc = XIAN.clamp(1 - err / (tol * 2.6), 0, 1);   /* 0..1 */

  /* 药力评分：药材品阶是否高于方剂要求 */
  var potency = 0, want = 0;
  (p.recipe || []).forEach(function (r) {
    var h = XIAN.byId(XIAN.Data.herbs, r.herb);
    var w = (XIAN.Data.herbRoles[r.role] || { weight: 0.2 }).weight;
    potency += (h ? h.potency : 10) * w * r.qty;
    want += (h ? h.tier : 1) * w * r.qty;
  });
  /* 境界过低炼高阶丹则难成 */
  var realmGap = p.realm - S.realm;
  var score = acc * 100;
  score += (S.aff.huo - 30) * 0.25;
  score -= Math.max(0, realmGap) * 16;
  score += Math.min(12, S.stats.pillsMade * 0.25);
  score += rng.float(-6, 6);
  if (Math.abs(S.balance) <= 15) score += 4;

  var q;
  if (score < 34 || acc < 0.16) q = 0;
  else if (score < 52) q = 1;
  else if (score < 70) q = 2;
  else if (score < 84) q = 3;
  else if (score < 94) q = 4;
  else q = 5;
  if (q === 5 && p.tier >= 4 && !rng.chance(0.55)) q = 4;

  var Q = XIAN.Data.pillQuality[q];
  var count = Q.count;
  if (count > 0 && rng.chance(0.18 + (S.aff.huo - 30) / 300)) count++;

  var out = {
    ok: true, pill: p, q: q, quality: Q, count: count, acc: acc, tol: tol,
    err: err, score: Math.round(score), lines: [], days: stat.days
  };
  if (q === 0) {
    S.stats.pillsFailed++;
    S.daoxin = XIAN.clamp(S.daoxin - 2, 0, 100);
    out.lines.push('炉中一声轻响，丹未成形，化作一撮焦灰。');
    if (rng.chance(0.16)) {
      var st2 = XIAN.stats(S);
      var hurt = Math.round(st2.maxJing * rng.float(0.05, 0.14));
      S.jing = Math.max(1, S.jing - hurt);
      out.lines.push('<em class="e-bad">炉火反噬，精元 -' + XIAN.num(hurt) + '</em>');
      out.backfire = true;
    }
  } else {
    S.stats.pillsMade += count;
    var key = XIAN.Sys.pillKey(pid, q);
    S.pills[key] = (S.pills[key] || 0) + count;
    out.lines.push('丹成 <b style="color:' + Q.color + '">' + Q.name + '</b>「' + p.name + '」×' + count);
    if (q >= 4) { S.daoxin = XIAN.clamp(S.daoxin + 2, 0, 100); out.lines.push('<em class="e-good">丹道大进，道心 +2</em>'); }
  }
  out.death = XIAN.Sys.advanceTime(S, stat.days, { regenJing: 0.04, regenQi: 0.06, regenShen: 0.04 });
  return out;
};

/* ---------------- 坊市 ---------------- */
XIAN.Sys.herbPrice = function (h) { return Math.round(18 * Math.pow(3.4, h.tier - 1) + h.potency * 2.2); };
XIAN.Sys.pillPrice = function (p, q) {
  var Q = XIAN.Data.pillQuality[q === undefined ? 2 : q];
  return Math.round(90 * Math.pow(3.6, p.tier - 1) * (Q ? (0.4 + Q.mult * 0.7) : 1));
};
XIAN.Sys.recipePrice = function (p) { return Math.round(400 * Math.pow(4.2, p.tier - 1)); };
XIAN.Sys.techPrice = function (t) { return Math.round(300 * Math.pow(4.6, t.tier - 1)); };
XIAN.Sys.artPrice = function (a) { return Math.round(450 * Math.pow(4.2, a.tier - 1)); };

XIAN.Sys.marketStock = function (S, rng) {
  var term = XIAN.Sys.termIndexAbs(S);
  if (S.market && S.market.term === term && S.market.loc === S.loc) return S.market;
  var maxTier = XIAN.clamp(1 + Math.floor(S.realm * 0.8), 1, 5);
  var stock = { term: term, loc: S.loc, herbs: [], pills: [], recipes: [], techs: [], arts: [] };
  var H = (XIAN.Data.herbs || []).filter(function (h) { return h.tier <= maxTier; });
  rng.shuffle(H);
  H.slice(0, 8).forEach(function (h) {
    stock.herbs.push({ id: h.id, n: rng.int(1, 6), price: XIAN.Sys.herbPrice(h) });
  });
  var P = (XIAN.Data.pills || []).filter(function (p) { return p.tier <= Math.max(1, maxTier - 1); });
  rng.shuffle(P);
  P.slice(0, 4).forEach(function (p) {
    var q = rng.int(1, 3);
    stock.pills.push({ id: p.id, q: q, n: rng.int(1, 3), price: Math.round(XIAN.Sys.pillPrice(p, q) * 1.5) });
  });
  var R = (XIAN.Data.pills || []).filter(function (p) { return p.tier <= maxTier && S.recipes.indexOf(p.id) < 0; });
  rng.shuffle(R);
  R.slice(0, 3).forEach(function (p) {
    stock.recipes.push({ id: p.id, price: XIAN.Sys.recipePrice(p) });
  });
  var T = (XIAN.Data.techniques || []).filter(function (t) {
    return t.id.indexOf('m_') !== 0 && t.tier <= Math.min(4, maxTier) && t.realm <= S.realm && S.techs.indexOf(t.id) < 0;
  });
  rng.shuffle(T);
  T.slice(0, 3).forEach(function (t) { stock.techs.push({ id: t.id, price: XIAN.Sys.techPrice(t) }); });
  var A = (XIAN.Data.artifacts || []).filter(function (a) {
    return a.tier <= Math.min(4, maxTier) && S.artifacts.indexOf(a.id) < 0;
  });
  rng.shuffle(A);
  A.slice(0, 2).forEach(function (a) { stock.arts.push({ id: a.id, price: XIAN.Sys.artPrice(a) }); });
  S.market = stock;
  return stock;
};

XIAN.Sys.discount = function (S) {
  var fm = (S.fate && S.fate.mods) || {};
  var d = 1 - (fm.tradeDiscount || 0) - Math.min(0.2, S.repute / 500);
  return XIAN.clamp(d, 0.55, 1);
};

XIAN.Sys.buy = function (S, kind, entry, rng) {
  var price = Math.round(entry.price * XIAN.Sys.discount(S));
  if (S.stone < price) return { ok: false, reason: '灵石不足（需 ' + XIAN.num(price) + '）' };
  if (entry.n !== undefined && entry.n <= 0) return { ok: false, reason: '此货已售罄' };
  S.stone -= price;
  if (entry.n !== undefined) entry.n--;
  var msg = '';
  if (kind === 'herb') { S.herbs[entry.id] = (S.herbs[entry.id] || 0) + 1; msg = '得「' + XIAN.byId(XIAN.Data.herbs, entry.id).name + '」'; }
  else if (kind === 'pill') {
    var key = XIAN.Sys.pillKey(entry.id, entry.q);
    S.pills[key] = (S.pills[key] || 0) + 1;
    msg = '得' + XIAN.Sys.pillLabel(key);
  }
  else if (kind === 'recipe') { if (S.recipes.indexOf(entry.id) < 0) S.recipes.push(entry.id); msg = '得丹方《' + XIAN.byId(XIAN.Data.pills, entry.id).name + '》'; }
  else if (kind === 'tech') { XIAN.Sys.grantTech(S, entry.id); msg = '习得《' + XIAN.byId(XIAN.Data.techniques, entry.id).name + '》'; }
  else if (kind === 'art') { XIAN.Sys.grantArtifact(S, entry.id); msg = '得法宝「' + XIAN.byId(XIAN.Data.artifacts, entry.id).name + '」'; }
  return { ok: true, price: price, msg: msg + '　灵石 -' + XIAN.num(price) };
};

XIAN.Sys.sellHerb = function (S, id, n) {
  var h = XIAN.byId(XIAN.Data.herbs, id);
  if (!h) return { ok: false, reason: '无此药' };
  var have = S.herbs[id] || 0;
  n = Math.min(n || 1, have);
  if (n <= 0) return { ok: false, reason: '囊中无此药' };
  var gain = Math.round(XIAN.Sys.herbPrice(h) * 0.55 * n);
  S.herbs[id] -= n;
  if (S.herbs[id] <= 0) delete S.herbs[id];
  S.stone += gain;
  return { ok: true, msg: '售「' + h.name + '」×' + n + '　灵石 +' + XIAN.num(gain) };
};
XIAN.Sys.sellPill = function (S, key, n) {
  var pp = XIAN.Sys.pillParse(key);
  var p = XIAN.byId(XIAN.Data.pills, pp.id);
  if (!p) return { ok: false, reason: '无此丹' };
  var have = S.pills[key] || 0;
  n = Math.min(n || 1, have);
  if (n <= 0) return { ok: false, reason: '囊中无此丹' };
  var gain = Math.round(XIAN.Sys.pillPrice(p, pp.q) * 0.6 * n);
  S.pills[key] -= n;
  if (S.pills[key] <= 0) delete S.pills[key];
  S.stone += gain;
  return { ok: true, msg: '售' + XIAN.Sys.pillLabel(key) + '×' + n + '　灵石 +' + XIAN.num(gain) };
};

/* ---------------- 炼器温养 ---------------- */
XIAN.Data.forgeOps = [
  { id: 'cuiti', name: '淬体', target: 'maxJing', label: '精之上限', desc: '以地火淬炼肉身，精元之府愈广。', base: 0.055 },
  { id: 'lianqi', name: '炼炁', target: 'maxQi', label: '炁之上限', desc: '以风箱鼓荡真炁，气海为之一阔。', base: 0.055 },
  { id: 'ningshen', name: '凝神', target: 'maxShen', label: '神之上限', desc: '以静室凝聚神魂，识海渐深。', base: 0.05 },
  { id: 'kaifeng', name: '开锋', target: 'atk', label: '法力', desc: '磨砺本命法器锋芒，出手更利。', base: 0.06 },
  { id: 'gujia', name: '固甲', target: 'def', label: '护体', desc: '重铸护身罡气之基，受创更轻。', base: 0.06 }
];
XIAN.Sys.forgeCost = function (S, op) {
  S.forgeCount = S.forgeCount || {};
  var n = S.forgeCount[op.id] || 0;
  var st = XIAN.stats(S);
  return {
    stone: Math.round((120 + n * 90) * Math.pow(2.6, S.realm)),
    qi: Math.round(st.maxQi * 0.32),
    days: Math.round(XIAN.Data.realms[S.realm].days * 0.5),
    n: n,
    gain: Math.round(st[op.target] * op.base * Math.max(0.35, 1 - n * 0.07))
  };
};
XIAN.Sys.forge = function (S, opId, rng) {
  var L = XIAN.byId(XIAN.Data.locations, S.loc);
  if (!L || (L.features || []).indexOf('forge') < 0) return { ok: false, reason: '此地无炉鼎' };
  var op = XIAN.byId(XIAN.Data.forgeOps, opId);
  if (!op) return { ok: false, reason: '无此工序' };
  var c = XIAN.Sys.forgeCost(S, op);
  if (S.stone < c.stone) return { ok: false, reason: '灵石不足（需 ' + XIAN.num(c.stone) + '）' };
  if (S.qi < c.qi) return { ok: false, reason: '真炁不足' };
  S.stone -= c.stone; S.qi -= c.qi;
  S.forgeCount[op.id] = (S.forgeCount[op.id] || 0) + 1;
  var g = c.gain;
  if (rng.chance(0.12)) g = Math.round(g * 1.8);
  S.bonus[op.target] += g;
  XIAN.recalcLifespan(S);
  var out = { ok: true, op: op, gain: g, lines: ['炉火三日不熄。' + op.label + ' <em class="e-good">+' + XIAN.num(g) + '</em>'], days: c.days };
  out.death = XIAN.Sys.advanceTime(S, c.days, { regenJing: 0.05, regenQi: 0.05, regenShen: 0.03 });
  return out;
};

/* ---------------- 行路 ---------------- */
XIAN.Sys.travelInfo = function (S, locId) {
  var L = XIAN.byId(XIAN.Data.locations, locId);
  if (!L) return { ok: false, reason: '无此去处' };
  if (locId === S.loc) return { ok: false, reason: '你正在此处' };
  if (S.realm < L.realmMin) return { ok: false, reason: '须' + XIAN.Data.realms[L.realmMin].name + '之境方可涉足' };
  var days = Math.max(3, Math.round(XIAN.Data.realms[S.realm].days * 0.45));
  return { ok: true, days: days, loc: L };
};
XIAN.Sys.travel = function (S, locId, rng) {
  var info = XIAN.Sys.travelInfo(S, locId);
  if (!info.ok) return info;
  var from = XIAN.byId(XIAN.Data.locations, S.loc);
  S.loc = locId;
  S.market = null;
  var out = { ok: true, from: from, to: info.loc, days: info.days, lines: [] };
  out.lines.push('自' + (from ? from.name : '此地') + '往' + info.loc.name + '，' + info.loc.subtitle + '。');
  /* 路遇 */
  if (rng.chance(0.16 + info.loc.danger * 0.05)) out.ambush = true;
  out.death = XIAN.Sys.advanceTime(S, info.days, { regenJing: 0.06, regenQi: 0.08, regenShen: 0.04 });
  return out;
};
