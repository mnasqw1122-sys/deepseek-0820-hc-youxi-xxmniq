/* ============================================================
 *  effects.js — 因果算：统一效果指令解释器
 *  所有事件、丹药、掉落、走火、天劫都通过此处落地
 * ============================================================ */
window.XIAN = window.XIAN || {};
XIAN.Sys = XIAN.Sys || {};

/* 给予灵药（支持 random） */
XIAN.Sys.grantHerb = function (S, id, n, rng) {
  n = n || 1;
  var H = XIAN.Data.herbs || [];
  var picked = null;
  if (!id || id === 'random') {
    var maxTier = XIAN.clamp(1 + Math.floor(S.realm * 0.7) + (rng.chance(0.18) ? 1 : 0), 1, 5);
    var pool = H.filter(function (h) { return h.tier <= maxTier; });
    /* 本地所产者概率更高 */
    var local = pool.filter(function (h) { return (h.habitat || []).indexOf(S.loc) >= 0; });
    picked = (local.length && rng.chance(0.62)) ? rng.pick(local) : rng.pick(pool);
  } else {
    picked = XIAN.byId(H, id);
  }
  if (!picked) return null;
  S.herbs[picked.id] = (S.herbs[picked.id] || 0) + n;
  S.stats.herbsGathered += n;
  return { herb: picked, n: n };
};

XIAN.Sys.grantPill = function (S, id, n, q) {
  n = n || 1;
  var p = XIAN.byId(XIAN.Data.pills, id);
  if (!p) return null;
  var key = XIAN.Sys.pillKey(id, q === undefined ? 2 : q);
  S.pills[key] = (S.pills[key] || 0) + n;
  return p;
};

XIAN.Sys.grantTech = function (S, id) {
  var t = XIAN.byId(XIAN.Data.techniques, id);
  if (!t) return null;
  if (S.techs.indexOf(id) >= 0) return { tech: t, dup: true };
  S.techs.push(id);
  return { tech: t };
};

XIAN.Sys.grantRandomTech = function (S, element, tier, rng) {
  function pool(maxRealm) {
    return (XIAN.Data.techniques || []).filter(function (t) {
      if (t.id.indexOf('m_') === 0) return false;
      if (S.techs.indexOf(t.id) >= 0) return false;
      if (tier && t.tier !== tier) return false;
      if (element && t.element !== element && t.element !== 'none') return false;
      return t.realm <= maxRealm;
    });
  }
  /* 先取当下即可运转者，无则容其略高一境（可修而未能施） */
  var p = pool(S.realm);
  if (!p.length) p = pool(S.realm + 1);
  if (!p.length) {
    p = (XIAN.Data.techniques || []).filter(function (t) {
      return t.id.indexOf('m_') !== 0 && S.techs.indexOf(t.id) < 0 && t.realm <= S.realm + 1;
    });
  }
  if (!p.length) return null;
  var t = rng.pick(p);
  S.techs.push(t.id);
  return { tech: t };
};

XIAN.Sys.grantArtifact = function (S, id) {
  var a = XIAN.byId(XIAN.Data.artifacts, id);
  if (!a) return null;
  if (S.artifacts.indexOf(id) >= 0) return { art: a, dup: true };
  S.artifacts.push(id);
  /* 未佩戴该位则自动佩戴 */
  if (!S.equipped[a.slot]) S.equipped[a.slot] = id;
  return { art: a };
};

XIAN.Sys.openRandomMeridian = function (S, rng) {
  var pool = XIAN.Data.meridians.filter(function (m) { return S.meridians.indexOf(m.id) < 0; });
  if (!pool.length) return null;
  /* 优先任督，其次按 order */
  pool.sort(function (a, b) { return a.order - b.order; });
  var m = pool[0];
  S.meridians.push(m.id);
  S.stats.meridiansOpened++;
  XIAN.recalcLifespan(S);
  return m;
};

/* ------------------------------------------------------------
 * 主解释器
 * ---------------------------------------------------------- */
XIAN.applyEffects = function (S, effects, rng, ctx) {
  ctx = ctx || {};
  var lines = [];
  var pending = { combat: null, move: null, days: 0 };
  if (!effects || !effects.length) return { lines: lines, pending: pending };
  var st = XIAN.stats(S);
  var scale = ctx.scale === undefined ? 1 : ctx.scale;

  /* ------------------------------------------------------------
   * 尺度换算
   *   图籍中所记之数（如「精 +60」）以炼气初期为准（精上限 120，即五成）。
   *   高境界三宝动辄百万，故须按「相对之数」折算，
   *   否则一枚丹、一场奇遇，至化神之后便如尘土。
   *   noScale：战利品已在别处归一，此处不再折算。
   * ---------------------------------------------------------- */
  var noS = !!ctx.noScale;
  var R0 = XIAN.Data.realms[0];
  var sJ = noS ? 1 : st.maxJing / R0.jing;      /* ≈ 3.4^境界 */
  var sQ = noS ? 1 : st.maxQi / R0.qi;
  var sS = noS ? 1 : st.maxShen / R0.shen;
  var sEcon = noS ? 1 : Math.pow(2.55, S.realm) * (1 + S.stage * 0.12);
  var sLife = noS ? 1 : (1 + S.realm * 1.6);
  var CAPDIV = 500;                             /* 永久上限之效，折算更保守 */

  effects.forEach(function (e) {
    if (!e || !e.k) return;
    var v = e.v;
    switch (e.k) {
      case 'jing':
        var dj = Math.round(v * sJ * scale);
        S.jing = XIAN.clamp(S.jing + dj, 0, st.maxJing);
        lines.push(tag(dj, '精') + ' ' + XIAN.signed(dj)); break;
      case 'qi':
        var dq = Math.round(v * sQ * scale);
        S.qi = XIAN.clamp(S.qi + dq, 0, st.maxQi);
        lines.push(tag(dq, '炁') + ' ' + XIAN.signed(dq)); break;
      case 'shen':
        var ds = Math.round(v * sS * scale);
        S.shen = XIAN.clamp(S.shen + ds, 0, st.maxShen);
        lines.push(tag(ds, '神') + ' ' + XIAN.signed(ds)); break;
      case 'maxJing':
        var mj = Math.round(noS ? v : st.maxJing * (v / CAPDIV) * scale);
        S.bonus.maxJing += mj;
        lines.push(tag(mj, '精之上限') + ' ' + XIAN.signed(mj)); break;
      case 'maxQi':
        var mq = Math.round(noS ? v : st.maxQi * (v / CAPDIV) * scale);
        S.bonus.maxQi += mq;
        lines.push(tag(mq, '炁之上限') + ' ' + XIAN.signed(mq)); break;
      case 'maxShen':
        var ms = Math.round(noS ? v : st.maxShen * (v / CAPDIV) * scale);
        S.bonus.maxShen += ms;
        lines.push(tag(ms, '神之上限') + ' ' + XIAN.signed(ms)); break;
      case 'dao':
        var dd;
        if (e.abs) {
          dd = Math.round(v);
        } else if (Math.abs(v) < 1 && v !== 0) {
          /* 小数视为按本阶所需之比例增减（走火倒退用） */
          dd = Math.round(XIAN.daoNeed(S) * v);
        } else {
          /* 整数视为「一次深修之百分数 ÷ 2」：v=400 ≈ 两次深修之功 */
          dd = Math.round(XIAN.baseDaoGain(S) * (v / 200) * scale);
        }
        S.dao = Math.max(0, S.dao + dd);
        lines.push(tag(dd, '道行') + ' ' + XIAN.signed(dd)); break;
      case 'insight':
        S.insight = Math.max(1, S.insight + v);
        lines.push(tag(v, '悟性') + ' ' + XIAN.signed(v)); break;
      case 'daoxin':
        S.daoxin = XIAN.clamp(S.daoxin + v, 0, 100);
        lines.push(tag(v, '道心') + ' ' + XIAN.signed(v)); break;
      case 'balance':
        S.balance = XIAN.clamp(S.balance + v, -100, 100);
        lines.push('<em class="' + (v > 0 ? 'e-yang' : 'e-yin') + '">阴阳' + (v > 0 ? '偏阳' : '偏阴') + ' ' + XIAN.signed(v) + '</em>'); break;
      case 'merit':
        var fmm = (S.fate && S.fate.mods) || {};
        var mv = Math.round(v * (1 + (fmm.meritRate || 0)));
        S.merit = Math.max(0, S.merit + mv);
        XIAN.recalcLifespan(S);
        lines.push(tag(mv, '功德') + ' ' + XIAN.signed(mv)); break;
      case 'karma':
        var fmk = (S.fate && S.fate.mods) || {};
        var kv = v > 0 ? Math.round(v * (1 + (fmk.karmaRate || 0))) : v;
        S.karma = Math.max(0, S.karma + kv);
        XIAN.recalcLifespan(S);
        lines.push('<em class="' + (kv > 0 ? 'e-bad' : 'e-good') + '">业障 ' + XIAN.signed(kv) + '</em>'); break;
      case 'stone':
        var sv = Math.round(v > 0 ? v * sEcon : v);
        S.stone = Math.max(0, S.stone + sv);
        lines.push(tag(sv, '灵石') + ' ' + XIAN.signed(sv)); break;
      case 'repute':
        S.repute = Math.max(0, S.repute + v);
        lines.push(tag(v, '名望') + ' ' + XIAN.signed(v)); break;
      case 'lifespan':
        var lv = Math.round(v * sLife);
        S.bonus.lifespan += lv; XIAN.recalcLifespan(S);
        lines.push(tag(lv, '寿元') + ' ' + XIAN.signed(lv) + '载'); break;
      case 'age':
        S.age += v; lines.push(tag(-v, '年岁') + ' ' + XIAN.signed(v) + '载'); break;
      case 'haste':
        S.haste = XIAN.clamp(S.haste + v, 0, 100);
        lines.push('<em class="' + (v > 0 ? 'e-bad' : 'e-good') + '">躁进 ' + XIAN.signed(v) + '</em>'); break;
      case 'healPct':
        var hp = Math.round(st.maxJing * v / 100);
        S.jing = XIAN.clamp(S.jing + hp, 0, st.maxJing);
        lines.push('<em class="e-good">精元回复 ' + XIAN.num(hp) + '</em>'); break;
      case 'hurtPct':
        var dp = Math.round(st.maxJing * v / 100);
        S.jing = Math.max(0, S.jing - dp);
        lines.push('<em class="e-bad">精元受损 ' + XIAN.num(dp) + '</em>'); break;
      case 'affinity':
        if (S.aff[e.element] !== undefined) {
          S.aff[e.element] = XIAN.clamp(S.aff[e.element] + v, 0, 120);
          var EL = XIAN.Data.elements[e.element];
          lines.push('<em class="el-' + e.element + '">' + EL.name + '之亲和 ' + XIAN.signed(v) + '</em>');
        }
        break;
      case 'herb':
        var gh = XIAN.Sys.grantHerb(S, e.id, v || 1, rng);
        if (gh) lines.push('<em class="e-good">得「' + gh.herb.name + '」×' + gh.n + '</em>');
        break;
      case 'pill':
        var gp = XIAN.Sys.grantPill(S, e.id, v || 1);
        if (gp) lines.push('<em class="e-good">得丹「' + gp.name + '」×' + (v || 1) + '</em>');
        break;
      case 'recipe':
        if (S.recipes.indexOf(e.id) < 0) {
          S.recipes.push(e.id);
          var rp = XIAN.byId(XIAN.Data.pills, e.id);
          lines.push('<em class="e-gold">得丹方《' + (rp ? rp.name : e.id) + '》</em>');
        }
        break;
      case 'artifact':
        var ga = XIAN.Sys.grantArtifact(S, e.id);
        if (ga) lines.push(ga.dup
          ? '<em class="e-dim">「' + ga.art.name + '」你已有之</em>'
          : '<em class="e-gold">获法宝「' + ga.art.name + '」</em>');
        break;
      case 'tech':
        var gt = XIAN.Sys.grantTech(S, e.id);
        if (gt) lines.push(gt.dup
          ? '<em class="e-dim">「' + gt.tech.name + '」你已通晓</em>'
          : '<em class="e-gold">习得《' + gt.tech.name + '》</em>');
        break;
      case 'techRandom':
        var gr = XIAN.Sys.grantRandomTech(S, e.element, e.tier, rng);
        if (gr) lines.push('<em class="e-gold">习得《' + gr.tech.name + '》</em>');
        break;
      case 'meridian':
        for (var i = 0; i < (v || 1); i++) {
          var mm = XIAN.Sys.openRandomMeridian(S, rng);
          if (mm) lines.push('<em class="e-gold">贯通「' + mm.name + '」</em>');
        }
        break;
      case 'breakthrough':
        S.nextBreakBonus = (S.nextBreakBonus || 0) + v;
        lines.push('<em class="e-gold">突破助力 +' + v + '%</em>'); break;
      case 'flag':
        S.flags[e.id] = (e.v === undefined ? true : e.v); break;
      case 'combat':
        pending.combat = e.enemy || 'auto'; break;
      case 'move':
        pending.move = e.loc; break;
      case 'time':
        pending.days += (e.days || 0); break;
      default: break;
    }
  });

  /* 走火可能把炁/神打空：-9999 语义 */
  S.jing = XIAN.clamp(S.jing, 0, st.maxJing);
  return { lines: lines, pending: pending };

  function tag(val, name) {
    var cls = val > 0 ? 'e-good' : (val < 0 ? 'e-bad' : 'e-dim');
    return '<em class="' + cls + '">' + name + '</em>';
  }
};
