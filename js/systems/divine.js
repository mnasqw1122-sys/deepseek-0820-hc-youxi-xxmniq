/* ============================================================
 *  divine.js — 占卜：以《易》问天。善易者不卜。
 * ============================================================ */
window.XIAN = window.XIAN || {};
XIAN.Sys = XIAN.Sys || {};

XIAN.Sys.luckValue = function (S) {
  var fm = (S.fate && S.fate.mods) || {};
  var v = 10 + (fm.luck || 0) / 4 + S.merit / 40 - S.karma / 50 + (S.repute / 60);
  if (S.divine) {
    var om = XIAN.Data.omenMeta[S.divine.omen];
    if (om) v += (om.mult - 1) * 8;
  }
  return v;
};

XIAN.Sys.divineCost = function (S) {
  var st = XIAN.stats(S);
  var base = Math.round(st.maxShen * 0.10);
  var n = S.divineCount || 0;
  return {
    shen: Math.round(base * Math.pow(2.2, n)),
    n: n,
    ok: S.shen >= Math.round(base * Math.pow(2.2, n)),
    warn: n >= 1
  };
};

XIAN.Sys.divine = function (S, rng) {
  var c = XIAN.Sys.divineCost(S);
  if (!c.ok) return { ok: false, reason: '神魂不足以通神明（需 ' + XIAN.num(c.shen) + '）' };
  S.shen -= c.shen;
  S.divineCount = (S.divineCount || 0) + 1;
  S.stats.divinations++;

  var out = { ok: true, cost: c.shen, lines: [] };

  /* 亵卦：一节气之内再三而卜，则天不告 */
  if (c.n >= 1) {
    S.karma += 3 * c.n;
    out.lines.push('<em class="e-bad">《易》曰：初筮告，再三渎。业障 +' + (3 * c.n) + '</em>');
  }
  var profane = c.n >= 1 && rng.chance(0.25 * c.n);

  var luck = XIAN.Sys.luckValue(S);
  var fm = (S.fate && S.fate.mods) || {};
  var acc = 1 + (fm.divine || 0);

  /* 加权取卦：气运越厚，吉卦越易得 */
  var GOOD = { daji: 3, ji: 2, xiaoji: 1 }, BAD = { daxiong: 3, xiong: 2, xiaoxiong: 1 };
  var pool = (XIAN.Data.hexagrams || []).map(function (h) {
    var w = 1;
    if (GOOD[h.omen]) w *= Math.max(0.15, 1 + (luck - 10) / 40 * GOOD[h.omen] * acc);
    if (BAD[h.omen]) w *= Math.max(0.15, 1 - (luck - 10) / 46 * BAD[h.omen] * acc);
    return { h: h, weight: w };
  });
  var picked = rng.weighted(pool);
  var hex = picked ? picked.h : XIAN.Data.hexagrams[0];

  /* 动爻与变卦 */
  var moving = rng.int(1, 6);
  var lines = hex.lines.split('');
  var flipped = lines.slice();
  flipped[moving - 1] = flipped[moving - 1] === '1' ? '0' : '1';
  var target = null, ft = flipped.join('');
  (XIAN.Data.hexagrams || []).forEach(function (h) { if (h.lines === ft) target = h; });

  var omen = hex.omen;
  if (profane) {
    omen = 'ping';
    out.lines.push('<em class="e-dim">蓍草三分而断，卦象晦暗不明——天已不告。</em>');
  }

  S.divine = {
    n: hex.n, name: hex.name, full: hex.full, lines: hex.lines,
    judgement: hex.judgement, image: hex.image, advice: hex.advice, guide: hex.guide,
    omen: omen, trueOmen: hex.omen, moving: moving,
    target: target ? { n: target.n, name: target.name, full: target.full } : null,
    term: XIAN.Cal.parse(S.day).termIdx,
    profane: profane
  };
  out.hex = hex; out.moving = moving; out.target = target; out.omen = omen;
  S.daoxin = XIAN.clamp(S.daoxin + 1, 0, 100);
  return out;
};

/* 卦象是否仍在效期 */
XIAN.Sys.divineActive = function (S) {
  if (!S.divine) return false;
  return S.divine.term === XIAN.Cal.parse(S.day).termIdx;
};
