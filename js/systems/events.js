/* ============================================================
 *  events.js — 奇遇：因果、检定、抉择
 * ============================================================ */
window.XIAN = window.XIAN || {};
XIAN.Sys = XIAN.Sys || {};

/* ------------------------------------------------------------
 * 检定属性归一
 *   图籍中 dc 取值集中在 13–20，故各属性须折算至同一刻度：
 *     疏于此道者 ≈ 4–6　　寻常修士 ≈ 9–11　　精修此道者 ≈ 14–17
 *   加一枚十二面天数（d12），则 dc 16 处「寻常」约五成，
 *   「疏者」难成，「精者」几必成 —— 检定方有意义。
 * ---------------------------------------------------------- */
XIAN.Sys.checkStat = function (S, stat) {
  var st = XIAN.stats(S);
  var fm = (S.fate && S.fate.mods) || {};
  var v;
  switch (stat) {
    case 'insight':
      /* 与本境界应有之悟性相较，故非一味随境界膨胀 */
      var expect = 6 + S.realm * 2.2;
      v = 9 + (st.insight - expect) * 0.8;
      break;
    case 'daoxin': v = 2.5 + S.daoxin * 0.115; break;
    case 'shen': v = 3 + (st.maxShen ? S.shen / st.maxShen : 0) * 11.5; break;
    case 'qi': v = 3 + (st.maxQi ? S.qi / st.maxQi : 0) * 11.5; break;
    case 'jing': v = 3 + (st.maxJing ? S.jing / st.maxJing : 0) * 11.5; break;
    case 'atk':
      v = 5.5 + Math.min(7.5, (S.techs || []).length * 0.42) + S.stage * 0.5
        + (S.equipped && S.equipped.main ? 1.5 : 0);
      break;
    case 'luck':
      v = 6.5 + (fm.luck || 0) / 9
        + Math.min(5, S.merit / 130) - Math.min(4, S.karma / 140)
        + Math.min(2, S.repute / 90);
      if (XIAN.Sys.divineActive && XIAN.Sys.divineActive(S) && S.divine) {
        var om = XIAN.Data.omenMeta[S.divine.omen];
        if (om) v += (om.mult - 1) * 4;
      }
      break;
    case 'merit': v = 3 + Math.min(12, S.merit / 55); break;
    case 'karma': v = 3 + Math.min(12, S.karma / 55); break;
    case 'yang': v = 2.5 + Math.max(0, S.balance) / 6.5; break;
    case 'yin': v = 2.5 + Math.max(0, -S.balance) / 6.5; break;
    case 'realm': v = 5 + S.realm * 1.15 + S.stage * 0.4; break;
    default: v = 9;
  }
  return XIAN.clamp(v, 1, 20);
};
XIAN.Sys.statLabel = {
  insight: '悟性', daoxin: '道心', shen: '神魂', qi: '真炁', jing: '精元',
  atk: '法力', luck: '气运', merit: '功德', karma: '业障',
  yang: '阳盛', yin: '阴盛', realm: '境界'
};

XIAN.Sys.checkOdds = function (S, check) {
  if (!check) return 1;
  var v = XIAN.Sys.checkStat(S, check.stat);
  var need = check.dc - v;          /* 须掷得之数 */
  if (need <= 1) return 1;          /* d12 最小为 1，必成 */
  if (need > 12) return 0;          /* 天数不足，必不成 */
  return (13 - need) / 12;
};
XIAN.Sys.oddsText = function (p) {
  if (p >= 0.995) return '十拿九稳';
  if (p >= 0.72) return '颇有把握';
  if (p >= 0.55) return '五五之数';
  if (p >= 0.36) return '略有险阻';
  if (p >= 0.18) return '凶险难料';
  if (p > 0) return '几无胜算';
  return '力有不及';
};

/* 事件资格 */
XIAN.Sys.eventEligible = function (S, ev) {
  if (ev.once && S.seen[ev.id]) return false;
  var c = ev.cond || {};
  if (c.realmMin !== undefined && S.realm < c.realmMin) return false;
  if (c.realmMax !== undefined && S.realm > c.realmMax) return false;
  if (c.loc && c.loc.length && c.loc.indexOf(S.loc) < 0) return false;
  if (c.features && c.features.length) {
    var L = XIAN.byId(XIAN.Data.locations, S.loc);
    var f = (L && L.features) || [];
    var hit = false;
    c.features.forEach(function (x) { if (f.indexOf(x) >= 0) hit = true; });
    if (!hit) return false;
  }
  if (c.karmaMin !== undefined && S.karma < c.karmaMin) return false;
  if (c.karmaMax !== undefined && S.karma > c.karmaMax) return false;
  if (c.meritMin !== undefined && S.merit < c.meritMin) return false;
  if (c.needFlag && !S.flags[c.needFlag]) return false;
  if (c.notFlag && S.flags[c.notFlag]) return false;
  return true;
};

/* 抽事件 */
XIAN.Sys.pickEvent = function (S, rng, opts) {
  opts = opts || {};
  var all = (XIAN.Data.events || []).filter(function (ev) { return XIAN.Sys.eventEligible(S, ev); });
  if (!all.length) return null;
  var fm = (S.fate && S.fate.mods) || {};
  var luck = XIAN.Sys.luckValue(S);
  var pool = all.map(function (ev) {
    var w = ev.weight || 8;
    if (ev.tag === 'people' && fm.peopleRate) w *= Math.max(0.1, 1 + fm.peopleRate);
    if (ev.tag === 'chance' || ev.tag === 'relic') w *= Math.max(0.3, 1 + (luck - 10) / 32);
    if (ev.tag === 'danger' || ev.tag === 'demon') w *= Math.max(0.3, 1 - (luck - 10) / 42);
    if (ev.tag === 'karma' && S.karma > 120) w *= 1.5;
    if (opts.tag && ev.tag === opts.tag) w *= 4;
    if (S.seen[ev.id]) w *= 0.45;
    return { ev: ev, weight: Math.max(0.05, w) };
  });
  var p = rng.weighted(pool);
  return p ? p.ev : null;
};

/* 游历：耗时 + 抽事件 */
XIAN.Sys.wanderInfo = function (S) {
  return { days: Math.round(XIAN.Data.realms[S.realm].days * 0.55) };
};
XIAN.Sys.wander = function (S, rng) {
  var info = XIAN.Sys.wanderInfo(S);
  var ev = XIAN.Sys.pickEvent(S, rng);
  var out = { ok: true, days: info.days, event: ev, lines: [] };
  S.haste = XIAN.clamp(S.haste - 5, 0, 100);
  out.death = XIAN.Sys.advanceTime(S, info.days, { regenJing: 0.10, regenQi: 0.12, regenShen: 0.06 });
  if (!ev) out.lines.push('山川寂寂，此行无事。');
  return out;
};

/* 解算抉择 */
XIAN.Sys.resolveChoice = function (S, ev, idx, rng) {
  var ch = (ev.choices || [])[idx];
  if (!ch) return null;
  var st = XIAN.stats(S);
  var out = { ok: true, choice: ch, lines: [], text: '', pending: null, days: 0 };

  /* 代价 */
  var cost = ch.cost || {};
  if (cost.stone && S.stone < cost.stone) return { ok: false, reason: '灵石不足（需 ' + XIAN.num(cost.stone) + '）' };
  if (cost.qi) {
    var qn = Math.round(cost.qi * (1 + S.realm * 1.1));
    if (S.qi < qn) return { ok: false, reason: '真炁不足（需 ' + XIAN.num(qn) + '）' };
  }
  if (cost.jing) {
    var jn = Math.round(cost.jing * (1 + S.realm * 1.1));
    if (S.jing <= jn) return { ok: false, reason: '精元不足（需 ' + XIAN.num(jn) + '）' };
  }
  if (cost.shen) {
    var sn = Math.round(cost.shen * (1 + S.realm * 1.1));
    if (S.shen < sn) return { ok: false, reason: '神魂不足（需 ' + XIAN.num(sn) + '）' };
  }
  if (cost.stone) { S.stone -= cost.stone; out.lines.push('<em class="e-bad">灵石 -' + XIAN.num(cost.stone) + '</em>'); }
  if (cost.qi) { var q2 = Math.round(cost.qi * (1 + S.realm * 1.1)); S.qi -= q2; out.lines.push('<em class="e-bad">炁 -' + XIAN.num(q2) + '</em>'); }
  if (cost.jing) { var j2 = Math.round(cost.jing * (1 + S.realm * 1.1)); S.jing -= j2; out.lines.push('<em class="e-bad">精 -' + XIAN.num(j2) + '</em>'); }
  if (cost.shen) { var s2 = Math.round(cost.shen * (1 + S.realm * 1.1)); S.shen -= s2; out.lines.push('<em class="e-bad">神 -' + XIAN.num(s2) + '</em>'); }
  if (cost.days) out.days += cost.days;

  /* 检定 */
  var branch, pass = null;
  if (ch.check) {
    var v = XIAN.Sys.checkStat(S, ch.check.stat);
    var roll = rng.int(1, 12);
    pass = (v + roll) >= ch.check.dc;
    out.check = { stat: ch.check.stat, dc: ch.check.dc, value: Math.round(v * 10) / 10, roll: roll, pass: pass };
    branch = pass ? ch.success : ch.fail;
    if (!branch) branch = ch.outcome || ch.success || ch.fail;
  } else {
    branch = ch.outcome || ch.success;
  }
  if (!branch) branch = { text: '一切如故。', effects: [] };

  out.text = branch.text || '';
  var r = XIAN.applyEffects(S, branch.effects || [], rng, {});
  out.lines = out.lines.concat(r.lines);
  out.pending = r.pending;
  out.days += r.pending.days || 0;

  S.seen[ev.id] = (S.seen[ev.id] || 0) + 1;
  S.stats.eventsMet++;

  if (out.pending.move) {
    var L = XIAN.byId(XIAN.Data.locations, out.pending.move);
    if (L) { S.loc = out.pending.move; S.market = null; out.lines.push('<em class="e-dim">你已身在' + L.name + '</em>'); }
  }
  if (out.days > 0) out.death = XIAN.Sys.advanceTime(S, out.days, { regenJing: 0.04, regenQi: 0.06, regenShen: 0.03 });
  else XIAN.recalcLifespan(S);
  return out;
};
