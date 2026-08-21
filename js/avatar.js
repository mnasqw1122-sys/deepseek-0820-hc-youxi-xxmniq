/* ============================================================
 *  avatar.js — 水墨人物立绘：修士与妖魔，皆以笔意程序生成
 *    · 修士立绘随「境界」演变：金丹现丹光、元婴出婴、化神显法身、
 *      炼虚身透、合体环五气、大乘悬宝光、渡劫顶雷冠、飞升化金身
 *    · 五行定衣色，阴阳定气色，精元定伤态，真炁定灵纹
 *    · 妖魔依「妖兽/魔物/幽魂/修士/精怪/龙属」六类各具其形
 * ============================================================ */
window.XIAN = window.XIAN || {};
XIAN.Avatar = (function () {

  /* ---------------- 工具 ---------------- */
  function h2r(h) {
    h = (h || '#888').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function rgba(h, a) { var c = h2r(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function mix(a, b, t) {
    var p = h2r(a), q = h2r(b), o = '#';
    for (var i = 0; i < 3; i++) {
      var v = Math.round(p[i] + (q[i] - p[i]) * t).toString(16);
      o += v.length < 2 ? '0' + v : v;
    }
    return o;
  }
  function srnd(seed) {
    var s = (seed >>> 0) || 1;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  var TAU = Math.PI * 2;

  /* 笔触：变宽描线，模拟毛笔起收 */
  function brush(g, pts, w0, w1, color, alpha) {
    if (pts.length < 2) return;
    g.lineCap = 'round'; g.lineJoin = 'round';
    var layers = 3;
    for (var L = 0; L < layers; L++) {
      var f = 1 + L * 0.55;
      g.strokeStyle = rgba(color, alpha * (L === 0 ? 1 : 0.22 / L));
      for (var i = 1; i < pts.length; i++) {
        var t = i / (pts.length - 1);
        g.lineWidth = (w0 + (w1 - w0) * t) * f;
        g.beginPath();
        g.moveTo(pts[i - 1][0], pts[i - 1][1]);
        g.lineTo(pts[i][0], pts[i][1]);
        g.stroke();
      }
    }
  }
  /* 平滑取样贝塞尔链 */
  function curve(p0, p1, p2, n) {
    var out = [];
    for (var i = 0; i <= n; i++) {
      var t = i / n, u = 1 - t;
      out.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
      u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]);
    }
    return out;
  }
  function fillPath(g, pts, fill, alpha) {
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.closePath();
    g.fillStyle = typeof fill === 'string' ? rgba(fill, alpha === undefined ? 1 : alpha) : fill;
    g.fill();
  }

  /* ---------------- 描述子 ---------------- */
  var REALM_TAG = ['炼气', '筑基', '金丹', '元婴', '化神', '炼虚', '合体', '大乘', '渡劫', '仙'];

  function describePlayer(S, over) {
    var st = XIAN.stats(S);
    var R = XIAN.Data.realms[S.realm] || XIAN.Data.realms[0];
    var E = XIAN.Data.elements[S.root ? S.root.main : 'tu'] || XIAN.Data.elements.tu;
    var d = {
      kind: 'player', pose: 'sit',
      element: S.root ? S.root.main : 'tu',
      realm: S.realm, stage: S.stage,
      balance: S.balance || 0,
      hpRatio: st.maxJing ? XIAN.clamp(S.jing / st.maxJing, 0, 1) : 1,
      qiRatio: st.maxQi ? XIAN.clamp(S.qi / st.maxQi, 0, 1) : 1,
      shenRatio: st.maxShen ? XIAN.clamp(S.shen / st.maxShen, 0, 1) : 1,
      aura: R.color, robe: E.color, robeDeep: E.deep, accent: E.glow,
      daoxin: S.daoxin, haste: S.haste,
      gender: S.gender || '男',
      seed: 20240 + (S.seed || 0) % 9999,
      artifact: S.equipped ? (S.equipped.main || S.equipped.robe) : null,
      dead: !!S.dead, ascended: !!S.ascended,
      label: XIAN.realmName(S.realm, S.stage)
    };
    if (over) for (var k in over) d[k] = over[k];
    return d;
  }

  function describeEnemy(E, opts) {
    opts = opts || {};
    var el = XIAN.Data.elements[E.element] || { color: '#9a9a92', deep: '#5a5a52', glow: '#d8d8d0' };
    var seed = 0;
    for (var i = 0; i < E.id.length; i++) seed = (seed * 31 + E.id.charCodeAt(i)) >>> 0;
    return {
      kind: E.kind || 'beast', pose: 'stand', facing: -1,
      element: E.element, realm: E.realm, stage: 1,
      balance: E.kind === 'ghost' || E.kind === 'demon' ? -60 : 0,
      hpRatio: opts.hpRatio === undefined ? 1 : opts.hpRatio,
      qiRatio: 1, shenRatio: 1,
      aura: (XIAN.Data.realms[E.realm] || {}).color || '#8a8a82',
      robe: el.color, robeDeep: el.deep, accent: el.glow,
      boss: !!E.boss, seed: seed, label: (E.title || '') + E.name,
      dead: false
    };
  }

  /* ============================================================
   * 修士立绘
   * ========================================================== */
  function drawCultivator(g, W, H, d, t) {
    var rnd = srnd(d.seed);
    var X = function (u) { return u * W; }, Y = function (v) { return v * H; };
    var breath = Math.sin(t * 1.5) * 0.5 + 0.5;         /* 0..1 吐纳 */
    var sway = Math.sin(t * 0.9) * 0.006;
    var hurt = d.hpRatio < 0.36;
    var faint = d.hpRatio < 0.15;
    var yin = XIAN.clamp(-d.balance / 100, 0, 1);
    var yang = XIAN.clamp(d.balance / 100, 0, 1);
    var auraCol = mix(d.aura, yang > yin ? '#e07a52' : '#5f8fc0', Math.max(yin, yang) * 0.5);
    var sit = d.pose === 'sit';

    /* —— 一、背光气轮 —— */
    var glowR = Math.min(W, H) * (sit ? 0.46 : 0.42) * (1 + breath * 0.04);
    var gg = g.createRadialGradient(X(0.5), Y(sit ? 0.55 : 0.5), glowR * 0.15, X(0.5), Y(sit ? 0.55 : 0.5), glowR);
    gg.addColorStop(0, rgba(auraCol, 0.30 + d.qiRatio * 0.20 + breath * 0.05));
    gg.addColorStop(0.45, rgba(auraCol, 0.12));
    gg.addColorStop(1, rgba(auraCol, 0));
    g.fillStyle = gg;
    g.fillRect(0, 0, W, H);

    /* 境界环：几重境界，几道环 */
    var rings = Math.min(4, Math.ceil((d.realm + 1) / 2.4));
    for (var r = 0; r < rings; r++) {
      var rr = glowR * (0.62 + r * 0.13);
      g.save();
      g.translate(X(0.5), Y(sit ? 0.55 : 0.5));
      g.rotate(t * (0.10 + r * 0.05) * (r % 2 ? -1 : 1));
      g.strokeStyle = rgba(d.aura, 0.16 + 0.05 * d.realm / 9);
      g.lineWidth = 1;
      g.setLineDash([Math.max(3, rr * 0.06), rr * 0.13]);
      g.beginPath(); g.arc(0, 0, rr, 0, TAU); g.stroke();
      g.setLineDash([]);
      g.restore();
    }

    /* —— 大乘以上：宝光轮（曼陀罗） —— */
    if (d.realm >= 7) {
      g.save();
      g.translate(X(0.5), Y(sit ? 0.42 : 0.36));
      var petals = 12 + d.realm;
      for (var p = 0; p < petals; p++) {
        var a = p / petals * TAU + t * 0.12;
        var len = glowR * (0.72 + Math.sin(t * 2 + p) * 0.04);
        g.strokeStyle = rgba('#f0dca0', 0.10 + 0.06 * Math.abs(Math.sin(t + p)));
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(Math.cos(a) * glowR * 0.34, Math.sin(a) * glowR * 0.34);
        g.lineTo(Math.cos(a) * len, Math.sin(a) * len);
        g.stroke();
      }
      g.restore();
    }

    /* —— 合体：五气环身 —— */
    if (d.realm >= 6) {
      XIAN.Data.elementOrder.forEach(function (k, i) {
        var EL = XIAN.Data.elements[k];
        var a = t * 0.6 + i / 5 * TAU;
        var rx = glowR * 0.60, ry = glowR * 0.24;
        var px = X(0.5) + Math.cos(a) * rx;
        var py = Y(sit ? 0.58 : 0.54) + Math.sin(a) * ry;
        var s = 3 + Math.sin(a) * 1.4 + 2;
        g.fillStyle = rgba(EL.color, 0.5);
        g.shadowBlur = 10; g.shadowColor = EL.color;
        g.beginPath(); g.arc(px, py, s, 0, TAU); g.fill();
        g.shadowBlur = 0;
      });
    }

    /* —— 化神：法身重影 —— */
    if (d.realm >= 4) {
      g.save();
      g.globalAlpha = 0.16 + 0.05 * Math.sin(t * 1.1);
      g.translate(X(0.5), Y(0.5));
      g.scale(1.22, 1.22);
      g.translate(-X(0.5), -Y(0.5));
      bodyShape(g, X, Y, d, breath, sway, true, sit);
      g.restore();
    }

    /* —— 渡劫：雷冠 —— */
    if (d.realm >= 8 && !d.ascended) {
      g.save();
      g.globalCompositeOperation = 'lighter';
      var lr = srnd(Math.floor(t * 3) * 977 + d.seed);
      for (var b = 0; b < 3; b++) {
        var bx = X(0.5) + (lr() - 0.5) * W * 0.5;
        g.strokeStyle = rgba('#dce8ff', 0.5 + lr() * 0.4);
        g.lineWidth = 1 + lr() * 1.4;
        g.shadowBlur = 8; g.shadowColor = '#cfe0ff';
        g.beginPath();
        g.moveTo(bx, 0);
        var cy = 0;
        while (cy < Y(0.16)) {
          cy += Y(0.035);
          bx += (lr() - 0.5) * W * 0.09;
          g.lineTo(bx, cy);
        }
        g.stroke();
        g.shadowBlur = 0;
      }
      g.restore();
    }

    /* —— 二、身形 —— */
    bodyShape(g, X, Y, d, breath, sway, false, sit);

    /* —— 三、丹田 / 金丹 / 元婴 —— */
    var dtY = sit ? 0.665 : 0.60;
    if (d.realm >= 2) {
      var core = 4 + d.realm * 1.5 + breath * 2;
      var cg = g.createRadialGradient(X(0.5), Y(dtY), 0, X(0.5), Y(dtY), core * 3.4);
      var coreCol = d.realm >= 5 ? '#f0e0b0' : '#e8c86a';
      cg.addColorStop(0, rgba(coreCol, 0.95));
      cg.addColorStop(0.3, rgba(coreCol, 0.5));
      cg.addColorStop(1, rgba(coreCol, 0));
      g.fillStyle = cg;
      g.beginPath(); g.arc(X(0.5), Y(dtY), core * 3.4, 0, TAU); g.fill();
      g.fillStyle = rgba('#fff6dc', 0.9);
      g.beginPath(); g.arc(X(0.5), Y(dtY), core * 0.55, 0, TAU); g.fill();
    } else {
      /* 炼气筑基：丹田仅一点微芒，随吐纳明灭 */
      g.fillStyle = rgba(d.accent, 0.20 + d.qiRatio * 0.30 * breath);
      g.beginPath(); g.arc(X(0.5), Y(dtY), 3 + breath * 2, 0, TAU); g.fill();
    }

    /* 元婴：顶上小人 */
    if (d.realm >= 3 && !d.ascended) {
      var by = 0.075 + Math.sin(t * 1.3) * 0.006;
      g.save();
      g.globalCompositeOperation = 'lighter';
      var bg2 = g.createRadialGradient(X(0.5), Y(by), 0, X(0.5), Y(by), W * 0.10);
      bg2.addColorStop(0, rgba('#ffeec0', 0.75));
      bg2.addColorStop(1, rgba('#ffeec0', 0));
      g.fillStyle = bg2;
      g.beginPath(); g.arc(X(0.5), Y(by), W * 0.10, 0, TAU); g.fill();
      g.restore();
      /* 婴形：小小盘坐轮廓 */
      g.fillStyle = rgba('#fff4d8', 0.82);
      g.beginPath(); g.arc(X(0.5), Y(by - 0.018), W * 0.017, 0, TAU); g.fill();   /* 头 */
      g.beginPath();
      g.moveTo(X(0.5) - W * 0.026, Y(by + 0.026));
      g.quadraticCurveTo(X(0.5), Y(by - 0.008), X(0.5) + W * 0.026, Y(by + 0.026));
      g.closePath(); g.fill();
    }

    /* —— 四、真炁灵纹：绕身上升的气点 —— */
    var motes = 8 + Math.round(d.qiRatio * 14);
    g.save();
    g.globalCompositeOperation = 'lighter';
    for (var m = 0; m < motes; m++) {
      var ph = (t * 0.42 + m / motes) % 1;
      var ang = m / motes * TAU + t * 0.5;
      var rad = Math.min(W, H) * (0.20 + Math.sin(ph * Math.PI) * 0.16);
      var mx = X(0.5) + Math.cos(ang) * rad;
      var my = Y(sit ? 0.86 : 0.9) - ph * H * (sit ? 0.42 : 0.5);
      var al = Math.sin(ph * Math.PI) * 0.55;
      g.fillStyle = rgba(d.accent, al);
      g.shadowBlur = 6; g.shadowColor = d.accent;
      g.beginPath(); g.arc(mx, my, 1.2 + Math.sin(ph * Math.PI) * 1.5, 0, TAU); g.fill();
    }
    g.shadowBlur = 0;
    g.restore();

    /* —— 五、伤态 —— */
    if (hurt) {
      var hr = srnd(d.seed + 31);
      for (var s2 = 0; s2 < (faint ? 6 : 3); s2++) {
        var sx = X(0.36 + hr() * 0.28), sy = Y(0.42 + hr() * 0.28);
        brush(g, curve([sx, sy], [sx + (hr() - 0.5) * 14, sy + 10], [sx + (hr() - 0.5) * 10, sy + 22], 6),
          2.4, 0.4, '#8f1f18', 0.55);
      }
    }
    /* 走火：躁气外泄 */
    if (d.haste !== undefined && d.haste > 62) {
      g.save();
      g.globalCompositeOperation = 'lighter';
      var q = srnd(Math.floor(t * 6) + d.seed);
      for (var f2 = 0; f2 < 5; f2++) {
        var fx = X(0.32 + q() * 0.36), fy = Y(0.34 + q() * 0.34);
        g.fillStyle = rgba(d.balance >= 0 ? '#e2703c' : '#6f5aa8', 0.35);
        g.beginPath(); g.arc(fx, fy, 2 + q() * 3, 0, TAU); g.fill();
      }
      g.restore();
    }

    /* —— 六、飞升 —— */
    if (d.ascended) {
      g.save();
      g.globalCompositeOperation = 'lighter';
      var wg = g.createRadialGradient(X(0.5), Y(0.5), 0, X(0.5), Y(0.5), Math.max(W, H) * 0.6);
      wg.addColorStop(0, 'rgba(255,246,214,.55)');
      wg.addColorStop(0.4, 'rgba(240,220,160,.20)');
      wg.addColorStop(1, 'rgba(255,246,214,0)');
      g.fillStyle = wg; g.fillRect(0, 0, W, H);
      for (var w2 = 0; w2 < 26; w2++) {
        var wa = w2 / 26 * TAU;
        var wl = Math.min(W, H) * (0.30 + Math.abs(Math.sin(wa * 3 + t)) * 0.22);
        g.strokeStyle = 'rgba(255,244,208,.28)';
        g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(X(0.5) + Math.cos(wa) * Math.min(W, H) * 0.18, Y(0.5) + Math.sin(wa) * Math.min(W, H) * 0.18);
        g.lineTo(X(0.5) + Math.cos(wa) * wl, Y(0.5) + Math.sin(wa) * wl);
        g.stroke();
      }
      g.restore();
    }

    /* —— 七、坐台 / 影 —— */
    if (sit) {
      g.fillStyle = rgba('#2a251d', 0.10);
      g.beginPath(); g.ellipse(X(0.5), Y(0.895), W * 0.30, H * 0.022, 0, 0, TAU); g.fill();
      /* 莲台简笔 */
      for (var lp = -3; lp <= 3; lp++) {
        var lx = X(0.5) + lp * W * 0.075;
        brush(g, curve([lx - W * 0.05, Y(0.885)], [lx, Y(0.855)], [lx + W * 0.05, Y(0.885)], 8),
          1.6, 0.6, '#4a4238', 0.34);
      }
    }
  }

  /* 身形：袍、袖、颈、头、发、面 */
  function bodyShape(g, X, Y, d, breath, sway, silhouette, sit) {
    var robe = silhouette ? '#ffffff' : d.robe;
    var deep = silhouette ? '#ffffff' : d.robeDeep;
    var ink = silhouette ? '#ffffff' : '#2a251d';
    var alpha = silhouette ? 1 : 1;
    var sheer = d.realm >= 5 ? 0.80 : 1;     /* 炼虚以上身透 */
    var headY = sit ? 0.235 : 0.19;
    var headR = (sit ? 0.061 : 0.056);
    var shY = sit ? 0.345 : 0.30;
    var hemY = sit ? 0.845 : 0.905;
    var halfSh = sit ? 0.135 : 0.125;
    var halfHem = sit ? 0.275 : 0.205;
    var s = sway;

    /* 袍身 */
    var body = [];
    body.push([X(0.5 - halfSh + s), Y(shY)]);
    var segs = 10;
    for (var i = 0; i <= segs; i++) {
      var tt = i / segs;
      var wid = halfSh + (halfHem - halfSh) * Math.pow(tt, sit ? 1.5 : 1.25);
      var wob = Math.sin(tt * 3 + breath * 2) * 0.006 * tt;
      body.push([X(0.5 - wid + s * (1 - tt) + wob), Y(shY + (hemY - shY) * tt)]);
    }
    for (var j = segs; j >= 0; j--) {
      var t2 = j / segs;
      var w2 = halfSh + (halfHem - halfSh) * Math.pow(t2, sit ? 1.5 : 1.25);
      var wb = Math.sin(t2 * 3 + breath * 2 + 1.7) * 0.006 * t2;
      body.push([X(0.5 + w2 + s * (1 - t2) + wb), Y(shY + (hemY - shY) * t2)]);
    }
    body.push([X(0.5 + halfSh + s), Y(shY)]);
    var bgGrad = g.createLinearGradient(X(0.5), Y(shY), X(0.5), Y(hemY));
    bgGrad.addColorStop(0, rgba(robe, 0.86 * sheer));
    bgGrad.addColorStop(0.55, rgba(mix(robe, deep, 0.35), 0.90 * sheer));
    bgGrad.addColorStop(1, rgba(deep, 0.94 * sheer));
    fillPath(g, body, silhouette ? rgba('#ffffff', 0.5) : bgGrad, undefined);
    /* 袍缘 */
    if (!silhouette) {
      brush(g, body.slice(1, segs + 2), 1.3, 1.0, ink, 0.42 * sheer);
      brush(g, body.slice(segs + 2, segs * 2 + 3), 1.0, 1.3, ink, 0.42 * sheer);
    }

    /* 两袖 */
    [-1, 1].forEach(function (side) {
      var sx = 0.5 + side * halfSh * 0.92 + s;
      var ex = 0.5 + side * (sit ? 0.20 : 0.17);
      var ey = sit ? 0.68 : 0.70;
      var mx = 0.5 + side * (sit ? 0.235 : 0.20);
      var pts = curve([X(sx), Y(shY + 0.01)], [X(mx), Y((shY + ey) / 2)], [X(ex), Y(ey)], 10);
      var sl = pts.slice();
      var back = curve([X(ex - side * 0.03), Y(ey)], [X(mx - side * 0.055), Y((shY + ey) / 2 + 0.02)], [X(sx - side * 0.05), Y(shY + 0.02)], 10);
      fillPath(g, sl.concat(back), silhouette ? rgba('#ffffff', 0.5) : rgba(mix(robe, deep, 0.18), 0.9 * sheer));
      if (!silhouette) brush(g, pts, 1.2, 0.8, ink, 0.36 * sheer);
    });

    /* 手：结印于丹田（坐）或垂袖（立） */
    if (sit && !silhouette) {
      g.fillStyle = rgba('#e8d9c0', 0.92);
      g.beginPath(); g.ellipse(X(0.5), Y(0.688), X(0.052), Y(0.020), 0, 0, TAU); g.fill();
      brush(g, curve([X(0.452), Y(0.688)], [X(0.5), Y(0.676)], [X(0.548), Y(0.688)], 6), 1.0, 1.0, ink, 0.4);
    }

    /* 衣襟交领 */
    if (!silhouette) {
      brush(g, curve([X(0.5 - halfSh * 0.62 + s), Y(shY + 0.005)], [X(0.5 + s), Y(shY + 0.085)], [X(0.5 + halfSh * 0.62 + s), Y(shY + 0.005)], 10),
        1.5, 1.5, ink, 0.46);
      /* 腰带 */
      var beltY = sit ? 0.60 : 0.56;
      var bw = halfSh + (halfHem - halfSh) * Math.pow((beltY - shY) / (hemY - shY), sit ? 1.5 : 1.25);
      fillPath(g, [
        [X(0.5 - bw * 0.98 + s), Y(beltY)], [X(0.5 + bw * 0.98 + s), Y(beltY)],
        [X(0.5 + bw * 0.98 + s), Y(beltY + 0.030)], [X(0.5 - bw * 0.98 + s), Y(beltY + 0.030)]
      ], rgba(d.accent, 0.55));
      brush(g, [[X(0.5 - bw + s), Y(beltY)], [X(0.5 + bw + s), Y(beltY)]], 1.1, 1.1, ink, 0.3);
    }

    /* 颈 */
    if (!silhouette) {
      fillPath(g, [
        [X(0.472 + s), Y(headY + headR * 0.7)], [X(0.528 + s), Y(headY + headR * 0.7)],
        [X(0.532 + s), Y(shY + 0.006)], [X(0.468 + s), Y(shY + 0.006)]
      ], rgba('#ddcdb2', 0.95 * sheer));
    }

    /* 头 */
    var hx = X(0.5 + s), hy = Y(headY + (d.hpRatio < 0.2 ? 0.012 : 0));
    if (silhouette) {
      g.fillStyle = rgba('#ffffff', 0.5);
      g.beginPath(); g.ellipse(hx, hy, X(headR * 0.86), Y(headR), 0, 0, TAU); g.fill();
    } else {
      g.fillStyle = rgba('#e8d9c0', 0.96 * sheer);
      g.beginPath(); g.ellipse(hx, hy, X(headR * 0.86), Y(headR), 0, 0, TAU); g.fill();
      g.strokeStyle = rgba(ink, 0.40 * sheer); g.lineWidth = 1.1;
      g.beginPath(); g.ellipse(hx, hy, X(headR * 0.86), Y(headR), 0, 0, TAU); g.stroke();

      /* 发：顶髻 + 两侧垂发 */
      g.fillStyle = rgba('#241f19', 0.90);
      g.beginPath();
      g.ellipse(hx, hy - Y(headR * 0.82), X(headR * 0.84), Y(headR * 0.46), 0, Math.PI, TAU);
      g.fill();
      g.beginPath(); g.ellipse(hx, hy - Y(headR * 1.30), X(headR * 0.34), Y(headR * 0.30), 0, 0, TAU); g.fill();
      [-1, 1].forEach(function (sd) {
        brush(g, curve([hx + sd * X(headR * 0.80), hy - Y(headR * 0.25)],
          [hx + sd * X(headR * 1.02), hy + Y(headR * 0.9)],
          [hx + sd * X(headR * 0.66), Y(shY + 0.03)], 8), 3.2, 1.0, '#241f19', 0.72);
      });
      /* 面：眉、目（打坐则闭目）、唇 */
      var ey2 = hy + Y(headR * 0.10);
      var exo = X(headR * 0.40);
      brush(g, [[hx - exo - X(0.012), ey2 - Y(headR * 0.30)], [hx - exo + X(0.012), ey2 - Y(headR * 0.36)]], 1.3, 0.7, ink, 0.55);
      brush(g, [[hx + exo - X(0.012), ey2 - Y(headR * 0.36)], [hx + exo + X(0.012), ey2 - Y(headR * 0.30)]], 0.7, 1.3, ink, 0.55);
      if (sit) {
        brush(g, curve([hx - exo - X(0.011), ey2], [hx - exo, ey2 + Y(headR * 0.10)], [hx - exo + X(0.011), ey2], 5), 1.2, 1.2, ink, 0.62);
        brush(g, curve([hx + exo - X(0.011), ey2], [hx + exo, ey2 + Y(headR * 0.10)], [hx + exo + X(0.011), ey2], 5), 1.2, 1.2, ink, 0.62);
      } else {
        g.fillStyle = rgba(ink, 0.72);
        g.beginPath(); g.ellipse(hx - exo, ey2, X(0.008), Y(headR * 0.13), 0, 0, TAU); g.fill();
        g.beginPath(); g.ellipse(hx + exo, ey2, X(0.008), Y(headR * 0.13), 0, 0, TAU); g.fill();
      }
      brush(g, [[hx - X(0.010), hy + Y(headR * 0.52)], [hx + X(0.010), hy + Y(headR * 0.52)]], 0.9, 0.9, ink, 0.40);
      /* 眉心：化神以上现印记 */
      if (d.realm >= 4) {
        g.fillStyle = rgba('#e8c86a', 0.55 + 0.25 * breath);
        g.beginPath(); g.arc(hx, hy - Y(headR * 0.42), X(0.010), 0, TAU); g.fill();
      }
    }
  }

  /* ============================================================
   * 妖魔形貌
   * ========================================================== */
  function drawFoe(g, W, H, d, t) {
    var rnd = srnd(d.seed);
    var X = function (u) { return u * W; }, Y = function (v) { return v * H; };
    var bob = Math.sin(t * 1.7) * 0.008;
    var col = d.robe, deep = d.robeDeep, ink = '#221d18';
    var faceX = d.facing === undefined ? -1 : d.facing;   /* -1 朝左 */
    var hurt = d.hpRatio < 0.35;
    var scale = d.boss ? 1.12 : 1;

    /* 背光 */
    var glowR = Math.min(W, H) * 0.44 * scale;
    var gg = g.createRadialGradient(X(0.5), Y(0.56), glowR * 0.1, X(0.5), Y(0.56), glowR);
    gg.addColorStop(0, rgba(col, d.boss ? 0.34 : 0.22));
    gg.addColorStop(1, rgba(col, 0));
    g.fillStyle = gg; g.fillRect(0, 0, W, H);
    if (d.boss) {
      for (var r = 0; r < 3; r++) {
        g.save(); g.translate(X(0.5), Y(0.56)); g.rotate(-t * (0.14 + r * 0.06));
        g.strokeStyle = rgba('#a8261f', 0.20); g.lineWidth = 1.2;
        g.setLineDash([6, 10]);
        g.beginPath(); g.arc(0, 0, glowR * (0.62 + r * 0.12), 0, TAU); g.stroke();
        g.setLineDash([]); g.restore();
      }
    }

    g.save();
    g.translate(X(0.5), Y(0.5 + bob));
    g.scale(faceX * scale, scale);
    g.translate(-X(0.5), -Y(0.5));

    if (d.kind === 'beast') {
      /* 妖兽：四足 */
      fillPath(g, ellPts(X(0.52), Y(0.62), X(0.24), Y(0.135), 20), gradV(g, Y(0.48), Y(0.76), col, deep));
      [[0.36, 1], [0.46, 0.9], [0.60, 1], [0.68, 0.9]].forEach(function (lg) {
        brush(g, curve([X(lg[0]), Y(0.70)], [X(lg[0] - 0.01), Y(0.79)], [X(lg[0] + 0.012), Y(0.87)], 6),
          7 * lg[1], 4 * lg[1], deep, 0.92);
      });
      /* 尾 */
      brush(g, curve([X(0.74), Y(0.58)], [X(0.86), Y(0.46 + Math.sin(t * 2) * 0.03)], [X(0.80), Y(0.34)], 10), 6, 1.4, deep, 0.85);
      /* 颈头 */
      brush(g, curve([X(0.34), Y(0.56)], [X(0.26), Y(0.50)], [X(0.22), Y(0.44)], 6), 15, 11, deep, 0.95);
      fillPath(g, ellPts(X(0.195), Y(0.415), X(0.088), Y(0.070), 18), gradV(g, Y(0.35), Y(0.49), col, deep));
      /* 吻 */
      fillPath(g, [[X(0.13), Y(0.40)], [X(0.075), Y(0.425)], [X(0.13), Y(0.452)]], rgba(deep, 0.95));
      /* 耳 */
      [[0.20, -1], [0.245, 1]].forEach(function (er) {
        fillPath(g, [[X(er[0]), Y(0.355)], [X(er[0] - 0.022), Y(0.288)], [X(er[0] + 0.030), Y(0.338)]], rgba(deep, 0.95));
      });
      eye(g, X(0.175), Y(0.398), X(0.013), col);
      /* 鬃 */
      for (var mn = 0; mn < 7; mn++) {
        var mt = mn / 6;
        brush(g, curve([X(0.26 + mt * 0.16), Y(0.50 - mt * 0.02)], [X(0.28 + mt * 0.16), Y(0.42 - mt * 0.03)], [X(0.25 + mt * 0.16), Y(0.36 - mt * 0.03)], 5),
          2.4, 0.5, col, 0.55);
      }
    } else if (d.kind === 'dragon') {
      /* 龙属：蜿蜒 */
      var seg = 16, pts = [];
      for (var i = 0; i <= seg; i++) {
        var u = i / seg;
        pts.push([X(0.86 - u * 0.66), Y(0.66 - Math.sin(u * 3.2 + t * 1.4) * 0.13 - u * 0.06)]);
      }
      for (var k = 0; k < pts.length - 1; k++) {
        var wv = 16 * (1 - k / pts.length * 0.72);
        g.strokeStyle = rgba(k % 2 ? col : deep, 0.94);
        g.lineWidth = wv; g.lineCap = 'round';
        g.beginPath(); g.moveTo(pts[k][0], pts[k][1]); g.lineTo(pts[k + 1][0], pts[k + 1][1]); g.stroke();
      }
      var hd = pts[pts.length - 1];
      fillPath(g, ellPts(hd[0], hd[1], X(0.075), Y(0.055), 18), gradV(g, hd[1] - Y(0.06), hd[1] + Y(0.06), col, deep));
      fillPath(g, [[hd[0] - X(0.055), hd[1] - Y(0.005)], [hd[0] - X(0.115), hd[1] + Y(0.018)], [hd[0] - X(0.050), hd[1] + Y(0.030)]], rgba(deep, 0.95));
      [[-1, 0.02], [1, 0.05]].forEach(function (hn) {
        brush(g, curve([hd[0] + X(hn[1]), hd[1] - Y(0.040)], [hd[0] + X(hn[1] + 0.03), hd[1] - Y(0.105)], [hd[0] + X(hn[1] - 0.005), hd[1] - Y(0.145)], 6), 3.4, 0.8, deep, 0.9);
      });
      brush(g, curve([hd[0] - X(0.05), hd[1] + Y(0.02)], [hd[0] - X(0.12), hd[1] + Y(0.08)], [hd[0] - X(0.16), hd[1] + Y(0.05)], 6), 1.8, 0.4, col, 0.7);
      eye(g, hd[0] - X(0.020), hd[1] - Y(0.012), X(0.012), '#ffd76a');
    } else if (d.kind === 'ghost') {
      /* 幽魂：下身化雾 */
      g.globalAlpha = 0.86;
      var tg = g.createLinearGradient(0, Y(0.30), 0, Y(0.92));
      tg.addColorStop(0, rgba(col, 0.80));
      tg.addColorStop(0.55, rgba(deep, 0.42));
      tg.addColorStop(1, rgba(deep, 0));
      var gp = [];
      for (var q = 0; q <= 14; q++) {
        var v = q / 14;
        var wd = 0.15 - v * 0.02 + Math.sin(v * 5 + t * 2) * 0.035 * v;
        gp.push([X(0.5 - wd), Y(0.34 + v * 0.58)]);
      }
      for (var q2 = 14; q2 >= 0; q2--) {
        var v2 = q2 / 14;
        var wd2 = 0.15 - v2 * 0.02 + Math.sin(v2 * 5 + t * 2 + 2) * 0.035 * v2;
        gp.push([X(0.5 + wd2), Y(0.34 + v2 * 0.58)]);
      }
      fillPath(g, gp, tg);
      fillPath(g, ellPts(X(0.5), Y(0.29), X(0.083), Y(0.095), 20), rgba(col, 0.78));
      /* 空洞双目 */
      [-1, 1].forEach(function (sd) {
        g.fillStyle = 'rgba(10,8,14,.92)';
        g.beginPath(); g.ellipse(X(0.5 + sd * 0.033), Y(0.285), X(0.017), Y(0.024), 0, 0, TAU); g.fill();
        g.fillStyle = rgba('#c8f0ff', 0.55 + 0.3 * Math.sin(t * 3 + sd)); g.shadowBlur = 8; g.shadowColor = '#a8e0ff';
        g.beginPath(); g.arc(X(0.5 + sd * 0.033), Y(0.288), X(0.006), 0, TAU); g.fill();
        g.shadowBlur = 0;
      });
      brush(g, curve([X(0.474), Y(0.335)], [X(0.5), Y(0.352)], [X(0.526), Y(0.335)], 6), 1.4, 1.4, '#0f0c12', 0.6);
      g.globalAlpha = 1;
    } else if (d.kind === 'demon') {
      /* 魔物：宽肩、犄角、破袍 */
      fillPath(g, [
        [X(0.34), Y(0.36)], [X(0.66), Y(0.36)], [X(0.74), Y(0.62)],
        [X(0.70), Y(0.86)], [X(0.62), Y(0.78)], [X(0.55), Y(0.88)],
        [X(0.47), Y(0.76)], [X(0.40), Y(0.87)], [X(0.30), Y(0.62)]
      ], gradV(g, Y(0.34), Y(0.88), col, '#1a1218'));
      [[-1, 0], [1, 0]].forEach(function (sd) {
        brush(g, curve([X(0.5 + sd[0] * 0.15), Y(0.40)], [X(0.5 + sd[0] * 0.30), Y(0.56)], [X(0.5 + sd[0] * 0.22), Y(0.72)], 8), 9, 4, '#1a1218', 0.92);
      });
      fillPath(g, ellPts(X(0.5), Y(0.29), X(0.078), Y(0.086), 18), gradV(g, Y(0.20), Y(0.38), col, '#1a1218'));
      [[-1, 0.052], [1, 0.052]].forEach(function (hn) {
        brush(g, curve([X(0.5 + hn[0] * hn[1]), Y(0.235)], [X(0.5 + hn[0] * 0.115), Y(0.150)], [X(0.5 + hn[0] * 0.075), Y(0.085)], 7), 5.5, 1.0, '#150f14', 0.95);
      });
      eye(g, X(0.470), Y(0.288), X(0.013), '#ff6a4a');
      eye(g, X(0.530), Y(0.288), X(0.013), '#ff6a4a');
      /* 獠牙 */
      fillPath(g, [[X(0.482), Y(0.330)], [X(0.492), Y(0.362)], [X(0.500), Y(0.330)]], 'rgba(240,236,224,.9)');
      fillPath(g, [[X(0.508), Y(0.330)], [X(0.518), Y(0.362)], [X(0.526), Y(0.330)]], 'rgba(240,236,224,.9)');
    } else if (d.kind === 'spirit') {
      /* 精怪：灵核 + 花瓣触须 */
      var pet = 7;
      for (var pi = 0; pi < pet; pi++) {
        var pa = pi / pet * TAU + t * 0.55;
        var pl = Math.min(W, H) * (0.20 + Math.sin(t * 2 + pi) * 0.03);
        g.save(); g.translate(X(0.5), Y(0.55)); g.rotate(pa);
        fillPath(g, [[0, 0], [pl * 0.35, -pl * 0.22], [pl, 0], [pl * 0.35, pl * 0.22]], rgba(col, 0.5));
        g.restore();
      }
      var cg2 = g.createRadialGradient(X(0.5), Y(0.55), 0, X(0.5), Y(0.55), Math.min(W, H) * 0.13);
      cg2.addColorStop(0, rgba(d.accent, 0.95));
      cg2.addColorStop(0.5, rgba(col, 0.8));
      cg2.addColorStop(1, rgba(deep, 0.1));
      g.fillStyle = cg2;
      g.beginPath(); g.arc(X(0.5), Y(0.55), Math.min(W, H) * 0.13, 0, TAU); g.fill();
      eye(g, X(0.472), Y(0.535), X(0.011), '#2a251d');
      eye(g, X(0.528), Y(0.535), X(0.011), '#2a251d');
    } else {
      /* 修士（人族）：借用立姿身形，衣色偏暗 */
      var dd = {};
      for (var kk in d) dd[kk] = d[kk];
      dd.robe = mix(col, '#3a3038', 0.35);
      dd.robeDeep = mix(deep, '#1e1a20', 0.4);
      dd.accent = d.accent;
      dd.realm = Math.min(3, d.realm);   /* 不给敌人画元婴法身，免得混淆 */
      bodyShape(g, X, Y, dd, Math.sin(t * 1.5) * 0.5 + 0.5, Math.sin(t * 0.9) * 0.005, false, false);
    }
    g.restore();

    /* 伤态 */
    if (hurt) {
      var hr2 = srnd(d.seed + 77);
      for (var s3 = 0; s3 < 4; s3++) {
        var sx2 = X(0.34 + hr2() * 0.32), sy2 = Y(0.40 + hr2() * 0.30);
        brush(g, curve([sx2, sy2], [sx2 + (hr2() - 0.5) * 16, sy2 + 12], [sx2 + (hr2() - 0.5) * 12, sy2 + 26], 6), 2.6, 0.4, '#8f1f18', 0.5);
      }
    }
    /* 影 */
    g.fillStyle = rgba('#2a251d', 0.10);
    g.beginPath(); g.ellipse(X(0.5), Y(0.905), W * 0.24, H * 0.020, 0, 0, TAU); g.fill();
  }

  function ellPts(cx, cy, rx, ry, n) {
    var o = [];
    for (var i = 0; i < n; i++) { var a = i / n * TAU; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
    return o;
  }
  function gradV(g, y0, y1, c0, c1) {
    var gr = g.createLinearGradient(0, y0, 0, y1);
    gr.addColorStop(0, rgba(c0, 0.94));
    gr.addColorStop(1, rgba(c1, 0.96));
    return gr;
  }
  function eye(g, x, y, r, col) {
    g.fillStyle = rgba(col, 0.95);
    g.shadowBlur = 7; g.shadowColor = col;
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    g.shadowBlur = 0;
    g.fillStyle = 'rgba(20,16,12,.85)';
    g.beginPath(); g.ellipse(x, y, r * 0.34, r * 0.85, 0, 0, TAU); g.fill();
  }

  /* ============================================================
   * 挂载与动画
   * ========================================================== */
  var reg = [];      /* {cv, ctx, get, dpr, w, h, fx:[]} */
  var raf = 0, running = false, last = 0;

  function mount(canvas, getDesc) {
    if (!canvas) return null;
    unmount(canvas);
    var ctx = canvas.getContext('2d');
    var e = { cv: canvas, ctx: ctx, get: getDesc, fx: [], born: performance.now() };
    resize(e);
    reg.push(e);
    start();
    return e;
  }
  function unmount(canvas) {
    for (var i = reg.length - 1; i >= 0; i--) if (reg[i].cv === canvas) reg.splice(i, 1);
  }
  function unmountAll() { reg.length = 0; }
  function resize(e) {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = e.cv.clientWidth || 220, h = e.cv.clientHeight || 300;
    e.w = w; e.h = h; e.dpr = dpr;
    e.cv.width = Math.round(w * dpr);
    e.cv.height = Math.round(h * dpr);
    e.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  /* 战斗反馈：受击 / 施法 */
  function pulse(canvas, kind, color) {
    for (var i = 0; i < reg.length; i++) {
      if (reg[i].cv === canvas) reg[i].fx.push({ kind: kind, col: color || '#c8102e', born: performance.now(), dur: kind === 'cast' ? 520 : 420 });
    }
  }

  function frame(now) {
    if (!running) return;
    var t = now / 1000;
    for (var i = reg.length - 1; i >= 0; i--) {
      var e = reg[i];
      if (!e.cv.isConnected) { reg.splice(i, 1); continue; }
      if ((e.cv.clientWidth || 0) !== e.w || (e.cv.clientHeight || 0) !== e.h) resize(e);
      var d;
      try { d = e.get(); } catch (err) { continue; }
      if (!d) continue;
      var g = e.ctx;
      g.clearRect(0, 0, e.w, e.h);
      /* 受击抖动 */
      var shake = 0, flash = 0;
      for (var f = e.fx.length - 1; f >= 0; f--) {
        var age = (now - e.fx[f].born) / e.fx[f].dur;
        if (age >= 1) { e.fx.splice(f, 1); continue; }
        if (e.fx[f].kind === 'hit') { shake = Math.sin(age * 28) * (1 - age) * 7; flash = Math.max(flash, (1 - age) * 0.5); }
        else shake += Math.sin(age * 12) * (1 - age) * 2;
      }
      g.save();
      if (shake) g.translate(shake, 0);
      if (d.dead) g.globalAlpha = 0.42;
      try {
        if (d.kind === 'player') drawCultivator(g, e.w, e.h, d, t);
        else drawFoe(g, e.w, e.h, d, t);
      } catch (err2) { /* 单帧异常不致中断 */ }
      g.restore();
      if (flash > 0.001) {
        g.fillStyle = 'rgba(200,16,46,' + flash.toFixed(3) + ')';
        g.fillRect(0, 0, e.w, e.h);
      }
      /* 施法光 */
      for (var f2 = 0; f2 < e.fx.length; f2++) {
        if (e.fx[f2].kind !== 'cast') continue;
        var a2 = (now - e.fx[f2].born) / e.fx[f2].dur;
        g.save(); g.globalCompositeOperation = 'lighter';
        var rr = Math.min(e.w, e.h) * (0.12 + a2 * 0.42);
        g.strokeStyle = rgba(e.fx[f2].col, (1 - a2) * 0.8);
        g.lineWidth = 3 * (1 - a2) + 0.6;
        g.beginPath(); g.arc(e.w / 2, e.h * 0.55, rr, 0, TAU); g.stroke();
        g.restore();
      }
    }
    if (!reg.length) { running = false; return; }
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
  function stop() { running = false; cancelAnimationFrame(raf); }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else if (reg.length) start();
  });

  return {
    mount: mount, unmount: unmount, unmountAll: unmountAll, pulse: pulse,
    describePlayer: describePlayer, describeEnemy: describeEnemy,
    start: start, stop: stop, count: function () { return reg.length; },
    /* 测试/调试：立即渲染一帧（不等 rAF），并把异常抛出以供诊断 */
    _debugRenderNow: function () {
      for (var i = 0; i < reg.length; i++) {
        var e = reg[i];
        if (!e.cv.isConnected) continue;
        var d = e.get();
        if (!d) continue;
        var g = e.ctx;
        g.clearRect(0, 0, e.w, e.h);
        if (d.kind === 'player') drawCultivator(g, e.w, e.h, d, 1.2);
        else drawFoe(g, e.w, e.h, d, 1.2);
      }
    }
  };
})();
