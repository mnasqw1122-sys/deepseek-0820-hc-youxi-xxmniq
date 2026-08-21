/* ============================================================
 *  cultivate.js — 修行：炼精化炁、炼炁化神、炼神还虚、开脉、突破
 * ============================================================ */
window.XIAN = window.XIAN || {};
XIAN.Sys = XIAN.Sys || {};

/* ---------------- 时光流转 ---------------- */
XIAN.Sys.advanceTime = function (S, days, opts) {
  opts = opts || {};
  var beforeTerm = Math.floor(S.day / XIAN.DAYS_PER_TERM);
  S.day += days;
  S.age += days / XIAN.DAYS_PER_YEAR;
  S.stats.daysLived += days;
  var afterTerm = Math.floor(S.day / XIAN.DAYS_PER_TERM);

  /* 节气更替：卦象失效、占卜次数重置 */
  if (afterTerm !== beforeTerm) {
    S.divineCount = 0;
    if (S.divine && S.divine.term !== XIAN.Cal.parse(S.day).termIdx) {
      /* 卦象只在所卜之节气内有效 */
      if (afterTerm - beforeTerm >= 1) S.divine = null;
    }
  }

  /* 自然回复（按行动一次计，非按日累加，故高境界不至于一坐即满） */
  if (!opts.noRegen) {
    var st = XIAN.stats(S);
    var L = XIAN.byId(XIAN.Data.locations, S.loc);
    var sp = L ? L.spirit : 1;
    var jr = (opts.regenJing === undefined ? 0.06 : opts.regenJing);
    var qr = (opts.regenQi === undefined ? 0.12 : opts.regenQi) * (0.6 + sp * 0.5);
    var sr = (opts.regenShen === undefined ? 0.04 : opts.regenShen);
    S.jing = XIAN.clamp(S.jing + st.maxJing * jr, 0, st.maxJing);
    S.qi = XIAN.clamp(S.qi + st.maxQi * qr, 0, st.maxQi);
    S.shen = XIAN.clamp(S.shen + st.maxShen * sr, 0, st.maxShen);
    S.jing = Math.round(S.jing); S.qi = Math.round(S.qi); S.shen = Math.round(S.shen);
  }

  /* 业障自消（极缓）与功德余荫 */
  var y = days / XIAN.DAYS_PER_YEAR;
  if (S.karma > 0) S.karma = Math.max(0, S.karma - y * 0.35);
  S.stats.actions++;
  XIAN.recalcLifespan(S);
  return XIAN.Sys.checkDeath(S);
};

XIAN.Sys.checkDeath = function (S) {
  if (S.dead || S.ascended) return null;
  if (S.age >= S.lifespan) {
    S.dead = true;
    S.causeOfDeath = '寿元耗尽';
    return { dead: true, cause: '寿元耗尽' };
  }
  return null;
};

/* ---------------- 走火入魔 ---------------- */
XIAN.Sys.deviationRisk = function (S, stance) {
  stance = stance || XIAN.byId(XIAN.Data.stances, S.stance) || XIAN.Data.stances[0];
  var st = XIAN.stats(S);
  var risk = stance.risk;
  risk += (S.haste / 100) * 0.20;
  risk += Math.max(0, Math.abs(S.balance) - 55) / 45 * 0.20;
  risk += Math.max(0, 55 - S.daoxin) / 55 * 0.22;
  risk += Math.min(0.12, S.karma / 1000 * 0.10);
  risk *= (1 - Math.min(0.42, (st.insight - 5) * 0.012));
  risk -= Math.min(0.12, S.merit / 4000);
  if (S.root.taihe) risk *= 0.62;
  if (S.meridians.indexOf('xinbao') >= 0) risk *= 0.85;
  if (S.meridians.indexOf('dai') >= 0) risk *= 0.85;
  return XIAN.clamp(risk, 0, 0.86);
};

XIAN.Sys.rollDeviation = function (S, rng) {
  var side = S.balance > 25 ? 'yang' : (S.balance < -25 ? 'yin' : 'any');
  var pool = XIAN.Data.deviations.filter(function (d) { return d.side === side || d.side === 'any'; });
  if (!pool.length) pool = XIAN.Data.deviations;
  var d = rng.pick(pool);
  var r = XIAN.applyEffects(S, d.effects, rng, { noScale: false });
  S.stats.deviations++;
  S.haste = XIAN.clamp(S.haste - 18, 0, 100);   /* 大伤之后，人自然安静下来 */
  return { dev: d, lines: r.lines };
};

/* ---------------- 打坐修行 ---------------- */
XIAN.Sys.cultivate = function (S, rng) {
  var R = XIAN.Data.realms[S.realm];
  var stance = XIAN.byId(XIAN.Data.stances, S.stance) || XIAN.Data.stances[0];
  var st = XIAN.stats(S);
  var L = XIAN.byId(XIAN.Data.locations, S.loc);
  var days = R.days;
  var out = { lines: [], days: days, gain: 0, dev: null, death: null };

  /* 炁不足则修行大打折扣 */
  var qiRatio = st.maxQi ? S.qi / st.maxQi : 0;
  var qiPenalty = qiRatio < 0.2 ? 0.45 : (qiRatio < 0.45 ? 0.78 : 1);

  var F = XIAN.cultivateFactor(S);
  var gain = XIAN.baseDaoGain(S) * F.mult * qiPenalty;
  gain = Math.round(gain * rng.float(0.92, 1.08));
  S.dao += gain;
  out.gain = gain;
  out.factor = F;
  out.qiPenalty = qiPenalty;

  /* 精炁消耗与吸纳 */
  var jingCost = Math.round(st.maxJing * 0.055 * stance.qiCost);
  var qiCost = Math.round(st.maxQi * 0.10 * stance.qiCost);
  S.jing = Math.max(0, S.jing - jingCost);
  S.qi = Math.max(0, S.qi - qiCost);
  out.jingCost = jingCost; out.qiCost = qiCost;

  /* 躁进与道心 */
  var hasteAdd = stance.hasteAdd;
  if (S.root.taihe) hasteAdd = Math.round(hasteAdd * 0.7);
  S.haste = XIAN.clamp(S.haste + hasteAdd, 0, 100);
  S.daoxin = XIAN.clamp(S.daoxin + stance.daoxinAdd, 0, 100);
  if (stance.karma) S.karma += stance.karma;

  /* 阴阳漂移：天时 + 本命五行 */
  var term = XIAN.Cal.parse(S.day).term;
  var elemBias = { huo: 1.0, mu: 0.5, jin: -0.5, shui: -1.0, tu: 0 }[S.root.main] || 0;
  var pull = (term.yang / 100 * 3.6 + elemBias * 2.4) * (0.4 + stance.daoMult * 0.6);
  if (stance.id === 'jingzuo' || stance.id === 'fanxu') {
    /* 静坐、返虚：收摄归中 */
    var back = -S.balance * (stance.id === 'jingzuo' ? 0.22 : 0.14);
    S.balance = XIAN.clamp(S.balance + back, -100, 100);
    out.balanceShift = back;
  } else {
    S.balance = XIAN.clamp(S.balance + pull, -100, 100);
    out.balanceShift = pull;
  }
  S.balance = Math.round(S.balance * 10) / 10;

  /* 返虚偶得悟性 */
  if (stance.id === 'fanxu' && rng.chance(0.14)) {
    S.insight += 1; out.insightGain = 1;
  }

  /* 走火入魔判定 */
  var risk = XIAN.Sys.deviationRisk(S, stance);
  out.risk = risk;
  if (rng.chance(risk)) out.dev = XIAN.Sys.rollDeviation(S, rng);

  S.stats.cultivations++;
  out.death = XIAN.Sys.advanceTime(S, days, {
    regenJing: stance.id === 'jingzuo' ? 0.26 : 0.05,
    regenQi: stance.id === 'jingzuo' ? 0.40 : 0.20,
    regenShen: stance.id === 'jingzuo' ? 0.16 : 0.05
  });
  return out;
};

/* ---------------- 三宝转化 ---------------- */
XIAN.Sys.termIndexAbs = function (S) { return Math.floor(S.day / XIAN.DAYS_PER_TERM); };

XIAN.Sys.refineInfo = function (S, kind) {
  var st = XIAN.stats(S);
  S.refineTerm = S.refineTerm || {};
  var used = S.refineTerm[kind] === XIAN.Sys.termIndexAbs(S);
  var info = { kind: kind, used: used, ok: false, reason: '' };
  var hasDu = S.meridians.indexOf('du') >= 0;
  var hasRen = S.meridians.indexOf('ren') >= 0;
  var hasChong = S.meridians.indexOf('chong') >= 0;
  var R = XIAN.Data.realms[S.realm];

  if (kind === 'jq') {
    info.name = '炼精化炁'; info.motto = '精者，炁之母也。';
    info.from = '精'; info.to = '炁';
    info.days = Math.max(1, Math.round(R.days * 0.14));
    info.spend = Math.round(st.maxJing * 0.22);
    info.rate = 1.05 + S.realm * 0.07 + (hasDu ? 0.12 : 0) + (hasRen ? 0.08 : 0);
    info.gain = Math.round(info.spend * info.rate * (st.maxQi / Math.max(1, st.maxJing)));
    info.can = S.jing - info.spend >= st.maxJing * 0.22;
    if (!info.can) info.reason = '精元不足二成有余，再炼则伤本';
  } else if (kind === 'qs') {
    info.name = '炼炁化神'; info.motto = '炁盛则神明，神明则慧生。';
    info.from = '炁'; info.to = '神';
    info.days = Math.max(1, Math.round(R.days * 0.14));
    info.spend = Math.round(st.maxQi * 0.28);
    info.rate = 0.52 + S.realm * 0.05 + (hasChong ? 0.14 : 0);
    info.gain = Math.round(info.spend * info.rate * (st.maxShen / Math.max(1, st.maxQi)));
    info.can = S.qi >= info.spend;
    if (!info.can) info.reason = '真炁不敷，何以化神';
    if (S.realm < 1) { info.can = false; info.reason = '须筑基之后，方可炼炁化神'; }
  } else {
    info.name = '炼神还虚'; info.motto = '神返于虚，则道行自增。';
    info.from = '神'; info.to = '道行';
    info.days = Math.max(1, Math.round(R.days * 0.26));
    info.spend = Math.round(st.maxShen * 0.42);
    var F = XIAN.cultivateFactor(S);
    info.gain = Math.round(XIAN.baseDaoGain(S) * (0.30 + S.realm * 0.045) * Math.min(2.4, F.mult * 0.62));
    info.can = S.shen >= info.spend;
    if (!info.can) info.reason = '神魂未足，虚境难入';
    if (S.realm < 2) { info.can = false; info.reason = '须金丹之后，方可炼神还虚'; }
  }
  info.ok = info.can && !used;
  if (used && !info.reason) info.reason = '一节气之内，只可行一次';
  return info;
};

XIAN.Sys.refine = function (S, kind, rng) {
  var info = XIAN.Sys.refineInfo(S, kind);
  if (!info.ok) return { ok: false, reason: info.reason };
  var st = XIAN.stats(S);
  S.refineTerm[kind] = XIAN.Sys.termIndexAbs(S);
  var lines = [];
  if (kind === 'jq') {
    S.jing -= info.spend;
    S.qi = XIAN.clamp(S.qi + info.gain, 0, st.maxQi);
    lines.push('精 -' + XIAN.num(info.spend) + '　炁 +' + XIAN.num(info.gain));
    S.balance = XIAN.clamp(S.balance + 1.5, -100, 100);
  } else if (kind === 'qs') {
    S.qi -= info.spend;
    S.shen = XIAN.clamp(S.shen + info.gain, 0, st.maxShen);
    lines.push('炁 -' + XIAN.num(info.spend) + '　神 +' + XIAN.num(info.gain));
    S.daoxin = XIAN.clamp(S.daoxin + 1, 0, 100);
  } else {
    S.shen -= info.spend;
    S.dao += info.gain;
    lines.push('神 -' + XIAN.num(info.spend) + '　道行 +' + XIAN.num(info.gain));
    S.haste = XIAN.clamp(S.haste - 6, 0, 100);
    S.daoxin = XIAN.clamp(S.daoxin + 2, 0, 100);
  }
  var death = XIAN.Sys.advanceTime(S, info.days, { regenJing: 0.02, regenQi: 0.03, regenShen: 0.02 });
  return { ok: true, info: info, lines: lines, days: info.days, death: death };
};

/* ---------------- 经脉 ---------------- */
XIAN.Sys.meridianGate = function (S, m) {
  var opened = S.meridians || [];
  if (opened.indexOf(m.id) >= 0) return { open: true };
  var hasRen = opened.indexOf('ren') >= 0, hasDu = opened.indexOf('du') >= 0;
  var zhengCount = 0;
  opened.forEach(function (id) {
    var mm = XIAN.byId(XIAN.Data.meridians, id);
    if (mm && mm.group === '正经') zhengCount++;
  });
  if (m.group === '奇经' && m.id !== 'ren' && m.id !== 'du') {
    if (!(hasRen && hasDu)) return { ok: false, reason: '须先贯通任督二脉' };
    var need = { chong: 2, dai: 2, yinwei: 3, yangwei: 3, yinqiao: 4, yangqiao: 4 };
    var rq = { chong: 4, dai: 4, yinwei: 6, yangwei: 6, yinqiao: 8, yangqiao: 8 };
    if (S.realm < need[m.id]) return { ok: false, reason: '须' + XIAN.Data.realms[need[m.id]].name + '之境方可行此' };
    if (zhengCount < rq[m.id]) return { ok: false, reason: '十二正经须先通' + rq[m.id] + '条' };
  }
  if (m.id !== 'ren' && m.id !== 'du' && !(hasRen || hasDu)) {
    return { ok: false, reason: '任督二脉，当为诸经之先' };
  }
  return { ok: true };
};

XIAN.Sys.meridianCost = function (S, m) {
  var st = XIAN.stats(S);
  return {
    qi: Math.round(st.maxQi * (0.34 + m.cost * 0.15)),
    jing: Math.round(st.maxJing * (0.12 + m.cost * 0.05)),
    days: Math.round(XIAN.Data.realms[S.realm].days * 0.7)
  };
};

XIAN.Sys.meridianChance = function (S, m) {
  var st = XIAN.stats(S);
  var c = 56 + S.daoxin * 0.30 + (st.insight - 5) * 1.0;
  var aff = (S.aff[m.element] || 30);
  c += (aff - 30) * 0.22;
  c -= m.cost * 7;
  c -= Math.max(0, Math.abs(S.balance) - 30) * 0.20;
  c -= S.haste * 0.12;
  c += S.realm * 2.2;
  if (S.root.taihe) c += 8;
  return XIAN.clamp(Math.round(c), 8, 96);
};

XIAN.Sys.openMeridian = function (S, id, rng) {
  var m = XIAN.byId(XIAN.Data.meridians, id);
  if (!m) return { ok: false, reason: '无此经脉' };
  var gate = XIAN.Sys.meridianGate(S, m);
  if (gate.open) return { ok: false, reason: '此脉已通' };
  if (!gate.ok) return { ok: false, reason: gate.reason };
  var cost = XIAN.Sys.meridianCost(S, m);
  if (S.qi < cost.qi) return { ok: false, reason: '真炁不足（需 ' + XIAN.num(cost.qi) + '）' };
  if (S.jing < cost.jing + 1) return { ok: false, reason: '精元不足（需 ' + XIAN.num(cost.jing) + '）' };

  S.qi -= cost.qi; S.jing -= cost.jing;
  var chance = XIAN.Sys.meridianChance(S, m);
  var success = rng.int(1, 100) <= chance;
  var out = { ok: true, m: m, chance: chance, success: success, cost: cost, lines: [] };

  if (success) {
    S.meridians.push(m.id);
    S.stats.meridiansOpened++;
    XIAN.recalcLifespan(S);
    S.daoxin = XIAN.clamp(S.daoxin + 3, 0, 100);
    var bl = [];
    var b = m.bonus || {};
    var names = { maxJing: '精之上限', maxQi: '炁之上限', maxShen: '神之上限', atk: '法力', def: '护体', spd: '身法', crit: '机变', insight: '悟性', daoxin: '道心', lifespan: '寿元', balanceYin: '阴维', balanceYang: '阳维' };
    for (var k in b) bl.push((names[k] || k) + ' +' + b[k]);
    out.lines.push(bl.join('　'));
    if (b.daoxin) S.daoxin = XIAN.clamp(S.daoxin + b.daoxin, 0, 100);
    if (b.balanceYin) S.balance = XIAN.clamp(S.balance - b.balanceYin, -100, 100);
    if (b.balanceYang) S.balance = XIAN.clamp(S.balance + b.balanceYang, -100, 100);
  } else {
    var st = XIAN.stats(S);
    var hurt = Math.round(st.maxJing * rng.float(0.12, 0.26));
    S.jing = Math.max(1, S.jing - hurt);
    S.daoxin = XIAN.clamp(S.daoxin - rng.int(4, 9), 0, 100);
    S.haste = XIAN.clamp(S.haste + 6, 0, 100);
    out.hurt = hurt;
    if (rng.chance(0.22)) out.dev = XIAN.Sys.rollDeviation(S, rng);
  }
  out.death = XIAN.Sys.advanceTime(S, cost.days, { regenQi: 0.06, regenJing: 0.03, regenShen: 0.03 });
  return out;
};

/* ---------------- 突破 ---------------- */
XIAN.Sys.breakInfo = function (S, force) {
  var need = XIAN.daoNeed(S);
  var kind = S.stage < 2 ? 'stage' : 'realm';
  var R = XIAN.Data.realms[S.realm];
  var st = XIAN.stats(S);
  var daoxinNeed = kind === 'realm' ? (28 + S.realm * 4) : 12;
  var info = {
    kind: kind, need: need, have: S.dao, ratio: need > 0 ? S.dao / need : 1,
    ready: S.dao >= need, blockers: [], force: !!force,
    daoxinNeed: daoxinNeed, chance: 0,
    nextName: kind === 'stage' ? XIAN.realmName(S.realm, S.stage + 1) : XIAN.realmName(S.realm + 1, 0),
    trib: kind === 'realm' ? R.tribulation : null,
    note: kind === 'realm' ? R.breakthrough : ''
  };
  if (S.realm >= 9) {
    info.blockers.push('已臻仙境，更无可破');
    info.ascended = true;
    info.nextName = '——';
    info.note = '';
    info.trib = null;
    return info;
  }
  if (!info.ready && !force) info.blockers.push('道行未满（' + Math.floor(info.ratio * 100) + '%）');
  if (force && info.ratio < 0.7) info.blockers.push('道行不足七成，强行冲关必死');

  if (S.daoxin < daoxinNeed) info.blockers.push('道心不足（需 ' + daoxinNeed + '）');
  if (kind === 'realm' && S.jing < st.maxJing * 0.7) info.blockers.push('精元未复（需七成，渡劫须留余力）');
  if (kind === 'realm' && S.qi < st.maxQi * 0.7) info.blockers.push('真炁未盈（需七成，渡劫须留余力）');

  var base = kind === 'stage' ? 88 : (64 - S.realm * 2.6);
  base += S.daoxin * 0.34;
  base += (st.insight - 5) * 0.62;
  base += (S.nextBreakBonus || 0);
  base += Math.min(20, S.merit / 45);
  base -= Math.min(30, S.karma / 22);
  base -= S.haste * 0.30;
  base -= Math.max(0, Math.abs(S.balance) - 30) * 0.36;
  base += Math.min(24, Math.max(0, info.ratio - 1) * 42);
  var fm = (S.fate && S.fate.mods) || {};
  if (force) {
    base -= 26;
    base += (fm.forceBonus || 0) * 100;
  }
  if (S.root.taihe) base += 6;
  if (Math.abs(S.balance) <= 15) base += 6;
  info.chance = XIAN.clamp(Math.round(base), 3, 97);
  return info;
};

/* 第一步：凝聚（不含天劫） */
XIAN.Sys.attemptBreak = function (S, rng, force) {
  var info = XIAN.Sys.breakInfo(S, force);
  var hard = info.blockers.filter(function (b) { return b.indexOf('强行冲关') >= 0 || b.indexOf('仙境') >= 0; });
  if (hard.length) return { ok: false, reason: hard[0] };
  if (!force && info.blockers.length) return { ok: false, reason: info.blockers[0] };
  if (force && info.blockers.filter(function (b) { return b.indexOf('道心') >= 0; }).length && S.daoxin < 8) {
    return { ok: false, reason: '道心崩散，此时冲关，是自寻死路' };
  }

  var st = XIAN.stats(S);
  var days = Math.round(XIAN.Data.realms[S.realm].days * (info.kind === 'realm' ? 1.6 : 0.8));
  var roll = rng.int(1, 100);
  var success = roll <= info.chance;
  var out = { ok: true, info: info, roll: roll, success: success, kind: info.kind, lines: [], days: days };

  /* 消耗：大境界之凝聚亦耗，然须留余力以渡劫 */
  S.qi = Math.max(0, S.qi - Math.round(st.maxQi * (info.kind === 'realm' ? 0.26 : 0.3)));
  S.jing = Math.max(1, S.jing - Math.round(st.maxJing * (info.kind === 'realm' ? 0.12 : 0.12)));
  S.nextBreakBonus = 0;
  if (force) { S.karma += 12 + S.realm * 4; S.haste = XIAN.clamp(S.haste + 15, 0, 100); }

  if (!success) {
    var lossRatio = info.kind === 'realm' ? rng.float(0.22, 0.42) : rng.float(0.10, 0.22);
    if (force) lossRatio *= 1.5;
    var lost = Math.round(S.dao * lossRatio);
    S.dao = Math.max(0, S.dao - lost);
    var hurt = Math.round(st.maxJing * (info.kind === 'realm' ? rng.float(0.25, 0.5) : rng.float(0.08, 0.2)));
    S.jing = Math.max(1, S.jing - hurt);
    S.daoxin = XIAN.clamp(S.daoxin - (info.kind === 'realm' ? rng.int(8, 18) : rng.int(3, 8)), 0, 100);
    S.bonus.lifespan -= info.kind === 'realm' ? Math.round(XIAN.Data.realms[S.realm].lifespan * 0.03) : 0;
    out.lost = lost; out.hurt = hurt;
    if (rng.chance(info.kind === 'realm' ? 0.42 : 0.18)) out.dev = XIAN.Sys.rollDeviation(S, rng);
    out.death = XIAN.Sys.advanceTime(S, days, { regenQi: 0.05, regenJing: 0.02, regenShen: 0.02 });
    return out;
  }

  /* 凝聚成功：小阶直接晋升；大境界须先渡劫 */
  if (info.kind === 'stage') {
    XIAN.Sys.promote(S, false, rng);
    out.death = XIAN.Sys.advanceTime(S, days, { regenQi: 0.3, regenJing: 0.3, regenShen: 0.2 });
  } else {
    out.needTrib = !!info.trib;
    out.days = days;
    if (!info.trib) {
      XIAN.Sys.promote(S, true, rng);
      out.death = XIAN.Sys.advanceTime(S, days, { regenQi: 0.4, regenJing: 0.4, regenShen: 0.3 });
    }
  }
  return out;
};

/* 晋升 */
XIAN.Sys.promote = function (S, realmUp, rng) {
  S.dao = 0;
  if (realmUp) {
    S.realm = Math.min(9, S.realm + 1);
    S.stage = 0;
    S.haste = XIAN.clamp(S.haste - 30, 0, 100);
    S.daoxin = XIAN.clamp(S.daoxin + 8, 0, 100);
    S.balance = Math.round(S.balance * 0.7 * 10) / 10;
    /* 境界既进，前所不解者自解——必得一门新法 */
    var r = rng || new XIAN.RNG((S.day * 7919 + S.realm) >>> 0);
    var tier = XIAN.clamp(Math.ceil(S.realm / 2) + (r.chance(0.3) ? 1 : 0), 1, 5);
    var g = XIAN.Sys.grantRandomTech(S, r.chance(0.6) ? S.root.main : null, tier, r);
    if (!g) g = XIAN.Sys.grantRandomTech(S, null, null, r);
    S._promoteTech = g ? g.tech : null;
  } else {
    S.stage = Math.min(2, S.stage + 1);
    S.daoxin = XIAN.clamp(S.daoxin + 3, 0, 100);
    S._promoteTech = null;
  }
  S.stats.breakthroughs++;
  if (S.realm > S.stats.peakRealm) S.stats.peakRealm = S.realm;
  XIAN.recalcLifespan(S);
  var st = XIAN.stats(S);
  S.jing = Math.round(st.maxJing * (realmUp ? 1 : 0.85));
  S.qi = Math.round(st.maxQi * (realmUp ? 0.85 : 0.6));
  S.shen = Math.round(Math.max(S.shen, st.maxShen * (realmUp ? 0.7 : 0.5)));
  if (S.realm >= 9) { S.ascended = true; }
  return S;
};

/* ---------------- 疗养 ---------------- */
XIAN.Sys.rest = function (S, rng) {
  var days = Math.round(XIAN.Data.realms[S.realm].days * 0.8);
  var st = XIAN.stats(S);
  var L = XIAN.byId(XIAN.Data.locations, S.loc);
  var spring = L && (L.features || []).indexOf('spring') >= 0;
  var sect = L && (L.features || []).indexOf('sect') >= 0;
  var out = { lines: [], days: days };
  var jr = spring ? 0.55 : 0.30;
  var qr = spring ? 0.5 : 0.35;
  var sr = sect ? 0.35 : 0.20;
  S.haste = XIAN.clamp(S.haste - (sect ? 30 : 20), 0, 100);
  S.daoxin = XIAN.clamp(S.daoxin + (sect ? 6 : 4), 0, 100);
  S.balance = XIAN.clamp(S.balance * 0.86, -100, 100);
  out.lines.push('躁进渐平，道心稍安。' + (spring ? '灵泉温润，创伤自愈。' : '') + (sect ? '钟磬之声入耳，心念渐澄。' : ''));
  out.death = XIAN.Sys.advanceTime(S, days, { regenJing: jr, regenQi: qr, regenShen: sr });
  return out;
};

/* ---------------- 服丹 ---------------- */
XIAN.Sys.takePill = function (S, key, rng) {
  var pp = XIAN.Sys.pillParse(key);
  var p = XIAN.byId(XIAN.Data.pills, pp.id);
  if (!p) return { ok: false, reason: '无此丹' };
  var have = S.pills[key] || 0;
  if (have <= 0) return { ok: false, reason: '囊中无此丹' };
  S.pills[key] = have - 1;
  if (S.pills[key] <= 0) delete S.pills[key];

  var Q = XIAN.Data.pillQuality[pp.q] || XIAN.Data.pillQuality[2];
  /* 丹毒：同一丹连服过多则药力递减 —— 是药三分毒 */
  S.pillCount = S.pillCount || {};
  S.pillCount[pp.id] = (S.pillCount[pp.id] || 0) + 1;
  var n = S.pillCount[pp.id];
  var decay = n <= 3 ? 1 : Math.max(0.35, Math.pow(0.82, n - 3));

  var r = XIAN.applyEffects(S, p.effects, rng, { scale: Q.mult * decay });
  var out = { ok: true, pill: p, quality: Q, key: key, lines: r.lines };
  if (n > 3) out.lines.push('<em class="e-dim">丹毒渐积，药力仅存 ' + Math.round(decay * 100) + '%</em>');
  if (n > 6) { S.karma += 1; S.daoxin = XIAN.clamp(S.daoxin - 1, 0, 100); }
  return out;
};
