/* ============================================================
 *  state.js — 命簿：游戏状态、派生属性、存档、轮回传承
 * ============================================================ */
window.XIAN = window.XIAN || {};

XIAN.SAVE_KEY = 'xian_taiyi_save_v1';
XIAN.LEGACY_KEY = 'xian_taiyi_legacy_v1';

/* ---------------- 空白命簿 ---------------- */
XIAN.blankState = function () {
  return {
    version: 1,
    seed: 0,
    rngState: 0,
    life: 1,
    day: 0,
    baseYear: 0,
    age: 16,
    born: 16,
    name: '', hao: '', gender: '男',
    root: null,
    fate: null,
    realm: 0, stage: 0, dao: 0,
    jing: 0, qi: 0, shen: 0,
    insight: 5,
    daoxin: 60,
    balance: 0,
    merit: 0, karma: 0,
    stone: 100, repute: 0,
    haste: 0,
    lifespan: 120,
    loc: 'qingyun_shan',
    stance: 'ziran',
    meridians: [],
    techs: [],
    artifacts: [],
    equipped: { main: null, robe: null, talisman: null },
    herbs: {},
    pills: {},
    recipes: [],
    aff: { jin: 0, mu: 0, shui: 0, huo: 0, tu: 0 },
    bonus: { maxJing: 0, maxQi: 0, maxShen: 0, atk: 0, def: 0, spd: 0, crit: 0, pen: 0, insight: 0, daoxin: 0, lifespan: 0 },
    flags: {},
    seen: {},
    divine: null,
    divineTerm: -1,
    divineCount: 0,
    nextBreakBonus: 0,
    log: [],
    chronicle: [],
    stats: {
      actions: 0, cultivations: 0, deviations: 0, battles: 0, wins: 0,
      pillsMade: 0, pillsFailed: 0, herbsGathered: 0, eventsMet: 0,
      tribulations: 0, tribFails: 0, breakthroughs: 0, kills: 0, bosses: 0,
      divinations: 0, meridiansOpened: 0, peakRealm: 0, daysLived: 0
    },
    legacy: null,
    dead: false,
    ascended: false,
    causeOfDeath: ''
  };
};

/* ---------------- 传承（跨世持久） ---------------- */
XIAN.blankLegacy = function () {
  return {
    lives: 0, bestRealm: -1, bestName: '', totalMerit: 0, totalKarma: 0,
    insight: 0, stone: 0, daoxin: 0, lifespan: 0,
    rootLuck: 0,          // 提升好灵根概率
    recipes: [],          // 宿世所记丹方
    memoryTech: null,     // 宿慧：一门法术
    unlockedRoots: [],
    ascensions: 0,
    epitaphs: []
  };
};

XIAN.loadLegacy = function () {
  try {
    var raw = localStorage.getItem(XIAN.LEGACY_KEY);
    if (!raw) return XIAN.blankLegacy();
    var o = JSON.parse(raw);
    var base = XIAN.blankLegacy();
    for (var k in base) if (!(k in o)) o[k] = base[k];
    return o;
  } catch (e) { return XIAN.blankLegacy(); }
};
XIAN.saveLegacy = function (lg) {
  try { localStorage.setItem(XIAN.LEGACY_KEY, JSON.stringify(lg)); } catch (e) { }
};

/* ---------------- 新生 ---------------- */
XIAN.newGame = function (opts) {
  opts = opts || {};
  var lg = XIAN.loadLegacy();
  var seed = opts.seed || ((Date.now() ^ (Math.random() * 4294967295)) >>> 0);
  var rng = new XIAN.RNG(seed);
  var S = XIAN.blankState();
  S.seed = seed;
  S.life = lg.lives + 1;
  S.legacy = lg;
  S.baseYear = rng.int(0, 59);

  /* —— 抽取灵根：传承提升上品概率 —— */
  var pool = XIAN.Data.spiritRoots.map(function (r) {
    var w = r.weight;
    if (r.rarity >= 2) w *= (1 + lg.rootLuck * 0.35);
    if (r.rarity === 0) w *= Math.max(0.25, 1 - lg.rootLuck * 0.18);
    return { r: r, weight: w };
  });
  var rootDef = (opts.forceRoot ? { r: XIAN.byId(XIAN.Data.spiritRoots, opts.forceRoot) } : rng.weighted(pool)).r;
  if (!rootDef) rootDef = XIAN.Data.spiritRoots[3];
  var made = rootDef.make(rng);
  S.root = {
    id: rootDef.id, name: rootDef.name, grade: rootDef.grade, title: rootDef.title,
    speed: rootDef.speed, main: made.main, taihe: !!made.taihe, desc: rootDef.desc
  };
  S.aff = made.aff;
  S.daoxin = XIAN.clamp(60 + rootDef.daoxin + lg.daoxin, 5, 100);
  S.insight = 5 + rootDef.insight + lg.insight;
  if (made.bias) S.balance = made.bias;

  /* —— 命格 —— */
  var fateDef = opts.forceFate ? XIAN.byId(XIAN.Data.fates, opts.forceFate) : rng.weighted(XIAN.Data.fates);
  S.fate = { id: fateDef.id, name: fateDef.name, desc: fateDef.desc, good: fateDef.good, mods: fateDef.mods };
  var m = fateDef.mods || {};
  if (m.insight) S.insight += m.insight;
  if (m.daoxin) S.daoxin = XIAN.clamp(S.daoxin + m.daoxin, 5, 100);
  if (m.balance) S.balance = XIAN.clamp(S.balance + m.balance, -100, 100);
  if (m.stone) S.stone += m.stone;
  if (m.maxJing) S.bonus.maxJing += m.maxJing;

  /* —— 姓名道号 —— */
  var NP = XIAN.Data.nameParts;
  S.gender = rng.chance(0.5) ? '男' : '女';
  S.name = opts.name || (rng.pick(NP.xing) + rng.pick(NP.ming) + rng.pick(NP.ming2));
  S.hao = rng.pick(NP.hao1) + rng.pick(NP.hao2);

  /* —— 传承赠礼 —— */
  S.stone += lg.stone;
  S.bonus.lifespan += lg.lifespan;
  S.recipes = ['p_juqi_dan'];
  (lg.recipes || []).forEach(function (r) { if (S.recipes.indexOf(r) < 0) S.recipes.push(r); });
  /* 保证基础丹方存在 */
  if (XIAN.Data.pills && XIAN.Data.pills.length) {
    var t1 = XIAN.Data.pills.filter(function (p) { return p.tier === 1; });
    S.recipes = [];
    t1.slice(0, 3).forEach(function (p) { S.recipes.push(p.id); });
    (lg.recipes || []).forEach(function (r) { if (S.recipes.indexOf(r) < 0) S.recipes.push(r); });
  }

  /* —— 起手法术：主属性最低阶 + 一门玄门 —— */
  var T = XIAN.Data.techniques || [];
  var starters = T.filter(function (t) {
    return t.tier === 1 && t.realm === 0 && t.id.indexOf('m_') !== 0 &&
      (t.element === S.root.main || t.element === 'none');
  });
  rng.shuffle(starters);
  starters.slice(0, 2).forEach(function (t) { S.techs.push(t.id); });
  if (!S.techs.length) {
    var any = T.filter(function (t) { return t.tier === 1 && t.id.indexOf('m_') !== 0; });
    if (any.length) S.techs.push(any[0].id);
  }
  if (lg.memoryTech && S.techs.indexOf(lg.memoryTech) < 0) S.techs.push(lg.memoryTech);

  /* —— 起手灵药：须够炼起手丹方，令新修士即刻可试丹道 —— */
  var needMap = {};
  S.recipes.forEach(function (rid) {
    var p = XIAN.byId(XIAN.Data.pills, rid);
    if (!p || p.tier > 2) return;
    (p.recipe || []).forEach(function (r) {
      needMap[r.herb] = Math.max(needMap[r.herb] || 0, r.qty);
    });
  });
  Object.keys(needMap).forEach(function (hid) {
    S.herbs[hid] = (S.herbs[hid] || 0) + needMap[hid] + rng.int(0, 2);
  });
  var h1 = (XIAN.Data.herbs || []).filter(function (h) { return h.tier === 1; });
  rng.shuffle(h1);
  h1.slice(0, 3).forEach(function (h) { S.herbs[h.id] = (S.herbs[h.id] || 0) + rng.int(1, 3); });

  /* —— 任督二脉：开局未通 —— */
  S.meridians = [];

  /* —— 寿元与三宝 —— */
  XIAN.recalcLifespan(S);
  var st = XIAN.stats(S);
  S.jing = st.maxJing; S.qi = Math.round(st.maxQi * 0.6); S.shen = Math.round(st.maxShen * 0.5);
  S.rngState = rng.save();
  return S;
};

/* ---------------- 派生属性 ---------------- */
XIAN.stats = function (S) {
  var R = XIAN.Data.realms[S.realm] || XIAN.Data.realms[0];
  var stageMul = 1 + S.stage * 0.32;
  var st = {
    maxJing: R.jing * stageMul,
    maxQi: R.qi * stageMul,
    maxShen: R.shen * stageMul,
    atk: R.atk * stageMul,
    def: R.def * stageMul,
    spd: R.spd + S.stage * 2,
    crit: 5, pen: 0,
    insight: S.insight,
    daoxinCap: 100
  };

  /* 经脉 */
  var mrd = XIAN.indexById(XIAN.Data.meridians);
  var meridianLife = 0;
  (S.meridians || []).forEach(function (id) {
    var M = mrd[id]; if (!M) return;
    var b = M.bonus || {};
    if (b.maxJing) st.maxJing += b.maxJing * (1 + S.realm * 0.85);
    if (b.maxQi) st.maxQi += b.maxQi * (1 + S.realm * 0.85);
    if (b.maxShen) st.maxShen += b.maxShen * (1 + S.realm * 0.85);
    if (b.atk) st.atk += b.atk * (1 + S.realm * 0.75);
    if (b.def) st.def += b.def * (1 + S.realm * 0.75);
    if (b.spd) st.spd += b.spd;
    if (b.crit) st.crit += b.crit;
    if (b.insight) st.insight += b.insight;
    if (b.lifespan) meridianLife += b.lifespan;
  });
  st.meridianLife = meridianLife;

  /* 法宝 */
  var arts = XIAN.indexById(XIAN.Data.artifacts || []);
  ['main', 'robe', 'talisman'].forEach(function (slot) {
    var id = S.equipped && S.equipped[slot];
    if (!id) return;
    var A = arts[id]; if (!A) return;
    var s = A.stats || {};
    var scale = 1 + S.realm * 0.9;
    if (s.maxJing) st.maxJing += s.maxJing * scale;
    if (s.maxQi) st.maxQi += s.maxQi * scale;
    if (s.maxShen) st.maxShen += s.maxShen * scale;
    if (s.atk) st.atk += s.atk * scale;
    if (s.def) st.def += s.def * scale;
    if (s.spd) st.spd += s.spd;
    if (s.crit) st.crit += s.crit;
    if (s.insight) st.insight += s.insight;
  });

  /* 固定加成 */
  var b = S.bonus || {};
  st.maxJing += b.maxJing || 0; st.maxQi += b.maxQi || 0; st.maxShen += b.maxShen || 0;
  st.atk += b.atk || 0; st.def += b.def || 0; st.spd += b.spd || 0;
  st.crit += b.crit || 0; st.pen += b.pen || 0; st.insight += b.insight || 0;

  /* 命格百分比 */
  var fm = (S.fate && S.fate.mods) || {};
  if (fm.maxJingPct) st.maxJing *= (1 + fm.maxJingPct / 100);
  if (fm.maxShenPct) st.maxShen *= (1 + fm.maxShenPct / 100);
  if (fm.atkPct) st.atk *= (1 + fm.atkPct / 100);

  /* 阴阳：偏阳增攻减守，偏阴增神减攻 */
  var bal = S.balance / 100;
  st.atk *= (1 + bal * 0.16);
  st.def *= (1 - bal * 0.10);
  st.maxShen *= (1 - bal * 0.14);
  /* 太极调和 */
  st.harmony = Math.abs(S.balance) <= 15;
  if (st.harmony) { st.atk *= 1.10; st.def *= 1.10; st.maxQi *= 1.08; }

  /* 五行亲和 → 主属性攻伐 */
  var mainAff = (S.aff && S.aff[S.root ? S.root.main : 'tu']) || 30;
  st.atk *= (1 + (mainAff - 30) / 300);

  ['maxJing', 'maxQi', 'maxShen', 'atk', 'def', 'spd'].forEach(function (k) {
    st[k] = Math.max(1, Math.round(st[k]));
  });
  st.crit = XIAN.clamp(Math.round(st.crit), 0, 75);
  st.insight = Math.max(1, Math.round(st.insight));
  return st;
};

/* 寿元上限 */
XIAN.recalcLifespan = function (S) {
  var R = XIAN.Data.realms[S.realm] || XIAN.Data.realms[0];
  var base = R.lifespan;
  var fm = (S.fate && S.fate.mods) || {};
  if (fm.lifespanPct) base *= (1 + fm.lifespanPct / 100);
  var st = XIAN.stats(S);
  base += (st.meridianLife || 0) * (1 + S.realm * 0.8);
  base += (S.bonus.lifespan || 0);
  base += Math.floor((S.merit || 0) / 40);      // 功德延寿
  base -= Math.floor((S.karma || 0) / 30);      // 业障折寿
  S.lifespan = Math.max(20, Math.round(base));
  return S.lifespan;
};

/* 修行速度总系数 */
XIAN.cultivateFactor = function (S, opts) {
  opts = opts || {};
  var f = 1;
  var detail = [];
  function add(label, mult) { if (Math.abs(mult - 1) > 0.001) detail.push({ label: label, mult: mult }); f *= mult; }

  /* 灵根 */
  add('灵根（' + S.root.name + '）', S.root.speed);
  /* 悟性 */
  var st = XIAN.stats(S);
  add('悟性', 1 + (st.insight - 5) * 0.055);
  /* 姿势 */
  var stance = XIAN.byId(XIAN.Data.stances, S.stance) || XIAN.Data.stances[0];
  add('心法（' + stance.name + '）', stance.daoMult);
  /* 地气 */
  var L = XIAN.byId(XIAN.Data.locations, S.loc);
  if (L) add('地脉（' + L.name + '）', L.spirit);
  /* 天时：节气之气与主属性 */
  var tm = XIAN.Cal.timeMult(S.day, S.root.main);
  var term = XIAN.Cal.parse(S.day).term;
  add('天时（' + term.name + '）', tm);
  /* 卦象 */
  if (S.divine && S.divine.term === XIAN.Cal.parse(S.day).termIdx) {
    var om = XIAN.Data.omenMeta[S.divine.omen];
    if (om) add('卦象（' + S.divine.name + '·' + om.label + '）', om.mult);
  }
  /* 道心 */
  add('道心', 0.62 + S.daoxin / 100 * 0.55);
  /* 阴阳 */
  var ab = Math.abs(S.balance);
  if (ab <= 15) add('太极调和', 1.18);
  else if (ab >= 80) add('阴阳失衡', 0.66);
  else if (ab >= 60) add('阴阳偏颇', 0.84);
  /* 业障 */
  if (S.karma > 100) add('业障缠身', Math.max(0.55, 1 - (S.karma - 100) / 900));
  /* 功德 */
  if (S.merit > 80) add('功德庇佑', Math.min(1.30, 1 + (S.merit - 80) / 1400));
  /* 太和之体：五气均衡额外奖励 */
  if (S.root.taihe) {
    var vals = XIAN.Data.elementOrder.map(function (k) { return S.aff[k]; });
    var mx = Math.max.apply(null, vals), mn = Math.min.apply(null, vals);
    if (mx - mn <= 8) add('五气朝元', 1.35);
  }
  /* 孤修 */
  var fm = (S.fate && S.fate.mods) || {};
  if (fm.soloBonus) add('天煞孤星', 1 + fm.soloBonus);
  /* 经脉贯通度 */
  var mp = (S.meridians || []).length / XIAN.Data.meridians.length;
  if (mp > 0) add('经脉贯通 ' + Math.round(mp * 100) + '%', 1 + mp * 0.40);

  /* 众缘和合，然天道恶盈：诸利叠加，其效渐钝，终有所止。
     以渐近曲线收之，上限为 CAP —— 此即「持而盈之，不如其已」。 */
  var raw = f;
  var CAP = 5.0, K = 3.0;
  if (raw > 1) {
    f = CAP - (CAP - 1) * Math.exp(-(raw - 1) / K);
    if (f < raw) detail.push({ label: '天道恶盈（收束）', mult: f / raw });
    else f = raw;
  }
  return { mult: f, raw: raw, detail: detail };
};

/* 每次深修的基准道行：expect 为「诸缘平平时，一小阶约需几次深修」 */
XIAN.baseDaoGain = function (S) {
  var R = XIAN.Data.realms[S.realm];
  var expect = [12, 15, 19, 24, 30, 37, 45, 54, 60, 60][S.realm] || 30;
  return R.dao[S.stage] / expect;
};
XIAN.daoNeed = function (S) {
  var R = XIAN.Data.realms[S.realm];
  return R.dao[S.stage];
};

/* 境界称谓 */
XIAN.realmName = function (realm, stage) {
  var R = XIAN.Data.realms[realm];
  if (!R) return '？';
  if (realm >= 9) return R.full;
  return R.name + XIAN.Data.stageNames[stage];
};

/* ---------------- 存档 ---------------- */
XIAN.save = function (S) {
  try {
    localStorage.setItem(XIAN.SAVE_KEY, JSON.stringify(S));
    return true;
  } catch (e) { return false; }
};
XIAN.hasSave = function () {
  try { return !!localStorage.getItem(XIAN.SAVE_KEY); } catch (e) { return false; }
};
XIAN.load = function () {
  try {
    var raw = localStorage.getItem(XIAN.SAVE_KEY);
    if (!raw) return null;
    var S = JSON.parse(raw);
    var base = XIAN.blankState();
    for (var k in base) if (!(k in S)) S[k] = base[k];
    if (!S.legacy) S.legacy = XIAN.loadLegacy();
    return S;
  } catch (e) { return null; }
};
XIAN.clearSave = function () {
  try { localStorage.removeItem(XIAN.SAVE_KEY); } catch (e) { }
};

/* 导出/导入（文本存档） */
XIAN.exportSave = function (S) {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(S)))); } catch (e) { return ''; }
};
XIAN.importSave = function (txt) {
  try {
    var S = JSON.parse(decodeURIComponent(escape(atob(txt.trim()))));
    if (!S || !S.root) return null;
    var base = XIAN.blankState();
    for (var k in base) if (!(k in S)) S[k] = base[k];
    return S;
  } catch (e) { return null; }
};

/* ---------------- 轮回结算 ---------------- */
XIAN.settleLegacy = function (S) {
  var lg = S.legacy || XIAN.loadLegacy();
  lg.lives = (lg.lives || 0) + 1;
  if (S.realm > (lg.bestRealm === undefined ? -1 : lg.bestRealm)) {
    lg.bestRealm = S.realm; lg.bestName = S.name;
  }
  lg.totalMerit = (lg.totalMerit || 0) + S.merit;
  lg.totalKarma = (lg.totalKarma || 0) + S.karma;

  /* 传承计分：境界为主，功德、悟性、经脉为辅 */
  var score = S.realm * 100 + S.stage * 20 + Math.floor(S.merit / 5)
    + S.insight * 3 + (S.meridians || []).length * 6 - Math.floor(S.karma / 10);
  if (S.ascended) score += 800;
  score = Math.max(0, score);

  lg.insight = Math.min(30, (lg.insight || 0) + Math.floor(score / 120));
  lg.stone = Math.min(20000, (lg.stone || 0) + Math.floor(score * 3.2));
  lg.daoxin = Math.min(25, (lg.daoxin || 0) + Math.floor(score / 220));
  lg.lifespan = Math.min(400, (lg.lifespan || 0) + Math.floor(score / 8));
  lg.rootLuck = Math.min(6, (lg.rootLuck || 0) + (S.realm >= 2 ? 1 : 0) + (S.ascended ? 2 : 0));

  /* 宿世丹方：保留已掌握之高阶丹方 */
  lg.recipes = lg.recipes || [];
  (S.recipes || []).forEach(function (id) {
    var p = XIAN.byId(XIAN.Data.pills, id);
    if (p && p.tier <= Math.max(1, S.realm) && lg.recipes.indexOf(id) < 0) lg.recipes.push(id);
  });
  if (lg.recipes.length > 14) lg.recipes = lg.recipes.slice(0, 14);

  /* 宿慧：留一门最高阶法术 */
  var best = null;
  (S.techs || []).forEach(function (id) {
    var t = XIAN.byId(XIAN.Data.techniques, id);
    if (!t) return;
    if (!best || t.tier > best.tier) best = t;
  });
  if (best && S.realm >= 1) lg.memoryTech = best.id;
  if (S.ascended) lg.ascensions = (lg.ascensions || 0) + 1;

  lg.epitaphs = lg.epitaphs || [];
  lg.epitaphs.unshift({
    life: S.life, name: S.name, hao: S.hao, root: S.root.name,
    realm: XIAN.realmName(S.realm, S.stage), age: Math.floor(S.age),
    cause: S.causeOfDeath || (S.ascended ? '飞升' : '不详'),
    merit: S.merit, karma: S.karma, score: score
  });
  if (lg.epitaphs.length > 24) lg.epitaphs.length = 24;

  XIAN.saveLegacy(lg);
  return { legacy: lg, score: score };
};
