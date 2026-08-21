/* ============================================================
 *  art.js — 水墨程序化山水、太极图、五行生克图、经脉内景、雷劫丹火
 *  纯 Canvas / SVG，无外部素材。
 * ============================================================ */
window.XIAN = window.XIAN || {};
XIAN.Art = (function () {

  /* ---------- 工具 ---------- */
  function hex2rgb(h) {
    h = (h || '#888888').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function rgba(h, a) { var c = hex2rgb(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function mix(h1, h2, t) {
    var a = hex2rgb(h1), b = hex2rgb(h2);
    return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * t) + ',' + Math.round(a[1] + (b[1] - a[1]) * t) + ',' + Math.round(a[2] + (b[2] - a[2]) * t) + ')';
  }
  function mixHex(h1, h2, t) {
    var a = hex2rgb(h1), b = hex2rgb(h2), o = '#';
    for (var i = 0; i < 3; i++) {
      var v = Math.round(a[i] + (b[i] - a[i]) * t).toString(16);
      o += v.length < 2 ? '0' + v : v;
    }
    return o;
  }
  /* 稳定伪随机 */
  function srnd(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  /* ============================================================
   * 一、背景山水
   * ========================================================== */
  var sky = {
    cv: null, ctx: null, w: 0, h: 0, dpr: 1,
    off: null, offCtx: null,
    loc: null, term: null, weather: 'none',
    parts: [], mist: [], t0: 0, raf: 0, running: false,
    seed: 12345
  };

  function initSky(canvas) {
    sky.cv = canvas;
    sky.ctx = canvas.getContext('2d');
    sky.off = document.createElement('canvas');
    sky.offCtx = sky.off.getContext('2d');
    resizeSky();
    window.addEventListener('resize', function () {
      clearTimeout(sky._rt);
      sky._rt = setTimeout(function () { resizeSky(); buildStatic(); }, 140);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });
    sky.t0 = performance.now();
  }
  function resizeSky() {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    sky.dpr = dpr;
    sky.w = sky.cv.clientWidth || window.innerWidth;
    sky.h = sky.cv.clientHeight || window.innerHeight;
    sky.cv.width = Math.round(sky.w * dpr);
    sky.cv.height = Math.round(sky.h * dpr);
    sky.off.width = sky.cv.width;
    sky.off.height = sky.cv.height;
    sky.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sky.offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* 山脊线：多重正弦 + 抖动 */
  function ridge(rnd, w, baseY, amp, rough) {
    var pts = [], n = Math.max(24, Math.floor(w / 14));
    var ph = [rnd() * 6.28, rnd() * 6.28, rnd() * 6.28, rnd() * 6.28];
    var fr = [0.55 + rnd() * .5, 1.4 + rnd(), 2.9 + rnd() * 1.6, 6 + rnd() * 4];
    for (var i = 0; i <= n; i++) {
      var x = i / n;
      var y = baseY
        - Math.sin(x * Math.PI * fr[0] + ph[0]) * amp
        - Math.sin(x * Math.PI * fr[1] + ph[1]) * amp * .48
        - Math.sin(x * Math.PI * fr[2] + ph[2]) * amp * .22 * rough
        - Math.sin(x * Math.PI * fr[3] + ph[3]) * amp * .09 * rough;
      pts.push([x * w, y]);
    }
    return pts;
  }

  function buildStatic() {
    if (!sky.offCtx) return;
    var g = sky.offCtx, w = sky.w, h = sky.h;
    var L = sky.loc || { sky: ['#dfe7e2', '#c3cfc6', '#9aab9f'], ink: '#3d5245', accent: '#7fae8c', element: 'mu', danger: 1, id: 'x' };
    var C = sky.term || { name: '立春', element: 'mu', yang: -80 };
    g.clearRect(0, 0, w, h);

    /* —— 天色 —— */
    var grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, L.sky[0]);
    grd.addColorStop(.46, L.sky[1]);
    grd.addColorStop(1, L.sky[2]);
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);

    /* —— 日月 —— */
    var yang = C.yang / 100;               /* -1..1 */
    var discX = w * (0.22 + (yang + 1) / 2 * 0.56);
    var discY = h * (0.30 - yang * 0.14);
    var isDay = yang > -0.25;
    var discR = Math.min(w, h) * (isDay ? 0.052 : 0.044);
    var discCol = isDay
      ? mixHex('#f6e0b0', '#e8a06a', Math.max(0, yang) * .7)
      : '#f2f4ee';
    var halo = g.createRadialGradient(discX, discY, discR * .5, discX, discY, discR * 7);
    halo.addColorStop(0, rgba(discCol, .55));
    halo.addColorStop(.28, rgba(discCol, .16));
    halo.addColorStop(1, rgba(discCol, 0));
    g.fillStyle = halo;
    g.beginPath(); g.arc(discX, discY, discR * 7, 0, 6.2832); g.fill();
    g.fillStyle = rgba(discCol, isDay ? .82 : .9);
    g.beginPath(); g.arc(discX, discY, discR, 0, 6.2832); g.fill();
    if (!isDay) {
      /* 月相缺口 */
      g.globalCompositeOperation = 'destination-out';
      g.beginPath(); g.arc(discX + discR * .62, discY - discR * .3, discR * .92, 0, 6.2832); g.fill();
      g.globalCompositeOperation = 'source-over';
    }

    /* —— 远云带 —— */
    var rnd = srnd(sky.seed);
    for (var c = 0; c < 5; c++) {
      var cy = h * (0.14 + rnd() * 0.3);
      var cw = w * (0.3 + rnd() * .6), cx = rnd() * w;
      var ch = h * (0.012 + rnd() * 0.026);
      var cg = g.createLinearGradient(0, cy - ch, 0, cy + ch);
      cg.addColorStop(0, 'rgba(255,255,255,0)');
      cg.addColorStop(.5, 'rgba(255,255,255,' + (0.14 + rnd() * .16).toFixed(3) + ')');
      cg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = cg;
      g.beginPath();
      g.ellipse(cx, cy, cw / 2, ch, 0, 0, 6.2832);
      g.fill();
    }

    /* —— 山峦：由远及近 5 层 —— */
    var layers = 5;
    var horizon = h * 0.58;
    for (var i = 0; i < layers; i++) {
      var d = i / (layers - 1);                   /* 0 远 → 1 近 */
      var lr = srnd(sky.seed + i * 977);
      var baseY = horizon + d * h * 0.30 - h * 0.02;
      var amp = h * (0.055 + (1 - d) * 0.15) * (0.7 + (L.danger || 1) * 0.09);
      var rough = 0.5 + d * 1.2;
      var pts = ridge(lr, w, baseY, amp, rough);
      var col = mixHex(L.sky[2], L.ink, 0.30 + d * 0.70);
      var alpha = 0.36 + d * 0.52;

      g.beginPath();
      g.moveTo(0, h);
      g.lineTo(pts[0][0], pts[0][1]);
      for (var p = 1; p < pts.length; p++) {
        var a = pts[p - 1], b = pts[p];
        g.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
      }
      g.lineTo(w, h);
      g.closePath();
      var lg = g.createLinearGradient(0, baseY - amp, 0, h);
      lg.addColorStop(0, rgba(col, alpha));
      lg.addColorStop(.42, rgba(col, alpha * .82));
      lg.addColorStop(1, rgba(mixHex(col, '#000000', .18), alpha * .5));
      g.fillStyle = lg;
      g.fill();

      /* 山脊淡墨勾线 */
      g.strokeStyle = rgba(mixHex(col, '#000000', .35), alpha * .5);
      g.lineWidth = 0.8 + d * 0.7;
      g.beginPath();
      g.moveTo(pts[0][0], pts[0][1]);
      for (var q = 1; q < pts.length; q++) {
        var a2 = pts[q - 1], b2 = pts[q];
        g.quadraticCurveTo(a2[0], a2[1], (a2[0] + b2[0]) / 2, (a2[1] + b2[1]) / 2);
      }
      g.stroke();

      /* 近层加飞泉 / 皴笔 */
      if (i >= 3) {
        g.strokeStyle = rgba(mixHex(col, '#000000', .5), alpha * .32);
        g.lineWidth = 0.7;
        for (var s = 0; s < 26; s++) {
          var sx = lr() * w;
          var idx = Math.min(pts.length - 1, Math.floor(sx / w * (pts.length - 1)));
          var sy = pts[idx][1] + lr() * amp * .5;
          var len = 6 + lr() * 22;
          g.beginPath();
          g.moveTo(sx, sy);
          g.quadraticCurveTo(sx + (lr() - .5) * 8, sy + len * .5, sx + (lr() - .5) * 12, sy + len);
          g.stroke();
        }
      }
      /* 层间留白（云气） */
      if (i < layers - 1) {
        var mg = g.createLinearGradient(0, baseY - amp * .1, 0, baseY + h * .07);
        mg.addColorStop(0, 'rgba(255,255,255,0)');
        mg.addColorStop(.4, 'rgba(255,255,255,.20)');
        mg.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = mg;
        g.fillRect(0, baseY - amp * .1, w, h * .1);
      }
    }

    /* —— 水面 —— */
    if (L.element === 'shui' || L.id === 'beiming_hai' || L.id === 'hanyu_gu') {
      var wy = h * 0.86;
      var wg = g.createLinearGradient(0, wy, 0, h);
      wg.addColorStop(0, rgba(mixHex(L.ink, L.sky[1], .5), .45));
      wg.addColorStop(1, rgba(mixHex(L.ink, '#000000', .3), .6));
      g.fillStyle = wg;
      g.fillRect(0, wy, w, h - wy);
      g.strokeStyle = 'rgba(255,255,255,.20)';
      g.lineWidth = 1;
      for (var wl = 0; wl < 16; wl++) {
        var ly = wy + (h - wy) * (wl / 16) + 2;
        var lw = w * (0.1 + rnd() * .6), lx = rnd() * w;
        g.beginPath();
        g.moveTo(lx, ly); g.lineTo(lx + lw, ly);
        g.globalAlpha = 0.06 + rnd() * .12;
        g.stroke();
      }
      g.globalAlpha = 1;
    }

    /* —— 前景：松枝 / 竹 —— */
    drawForeground(g, w, h, L, C);
    /* —— 边角留白 —— */
    var vg = g.createRadialGradient(w * .5, h * .45, Math.min(w, h) * .3, w * .5, h * .5, Math.max(w, h) * .78);
    vg.addColorStop(0, 'rgba(255,252,244,0)');
    vg.addColorStop(1, 'rgba(250,246,236,.28)');
    g.fillStyle = vg;
    g.fillRect(0, 0, w, h);
  }

  /* 前景植物：程序化枝干 */
  function drawForeground(g, w, h, L, C) {
    var ink = mixHex(L.ink, '#000000', .45);
    var rnd = srnd(sky.seed + 4242);
    var season = C ? C.element : 'mu';
    var right = rnd() > .5;

    function branch(x, y, ang, len, wid, depth) {
      if (depth <= 0 || len < 5) return;
      var x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
      g.strokeStyle = rgba(ink, 0.46 + depth * .07);
      g.lineWidth = wid;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + Math.cos(ang + .3) * len * .5, y + Math.sin(ang + .3) * len * .5, x2, y2);
      g.stroke();
      /* 松针 / 叶 */
      if (depth <= 2) {
        var nCol = season === 'huo' ? mixHex(ink, '#8a3a22', .35)
          : season === 'jin' ? mixHex(ink, '#8a6a24', .4)
            : season === 'shui' ? mixHex(ink, '#5a6b7a', .35)
              : mixHex(ink, L.accent || '#4f7a52', .45);
        for (var k = 0; k < 7; k++) {
          var t = k / 6;
          var px = x + (x2 - x) * t, py = y + (y2 - y) * t;
          var na = ang + (rnd() - .5) * 2.4;
          var nl = 6 + rnd() * 12;
          g.strokeStyle = rgba(nCol, .3 + rnd() * .3);
          g.lineWidth = .9;
          g.beginPath();
          g.moveTo(px, py);
          g.lineTo(px + Math.cos(na) * nl, py + Math.sin(na) * nl);
          g.stroke();
        }
      }
      var n = depth > 2 ? 3 : 2;
      for (var i = 0; i < n; i++) {
        branch(x2, y2, ang + (rnd() - .5) * 1.25, len * (0.56 + rnd() * .26), wid * .62, depth - 1);
      }
    }
    var bx = right ? w + 24 : -24;
    var dir = right ? Math.PI : 0;
    branch(bx, h * (0.06 + rnd() * .1), dir + (right ? -0.42 : 0.42), Math.min(w, h) * 0.14, 5.5, 4);
    /* 底角石头 */
    g.fillStyle = rgba(ink, .38);
    g.beginPath();
    var rx = right ? w * .06 : w * .92, ry = h * .97;
    g.moveTo(rx - 60, ry + 20);
    g.quadraticCurveTo(rx - 40, ry - 22, rx - 6, ry - 14);
    g.quadraticCurveTo(rx + 26, ry - 26, rx + 48, ry + 12);
    g.closePath();
    g.fill();
  }

  /* ---------- 天气粒子 ---------- */
  var WEATHER = {
    mu: { n: 34, kind: 'petal', col: ['#f0c8d0', '#f6dce0', '#e8b8c4'] },
    huo: { n: 30, kind: 'ember', col: ['#e8a05a', '#d4643c', '#f0c880'] },
    jin: { n: 28, kind: 'leaf', col: ['#c8a05a', '#b0863c', '#d8bc7c'] },
    shui: { n: 46, kind: 'snow', col: ['#ffffff', '#eaf2f8', '#dce8f0'] },
    tu: { n: 22, kind: 'dust', col: ['#c8b48c', '#d8c8a4', '#b8a078'] },
    none: { n: 18, kind: 'dust', col: ['#d8d0c0', '#e8e0d0', '#c8c0b0'] }
  };
  function seedWeather(kind) {
    var W = WEATHER[kind] || WEATHER.none;
    sky.weather = kind;
    sky.parts = [];
    for (var i = 0; i < W.n; i++) sky.parts.push(newPart(W, true));
    /* 云雾带 */
    sky.mist = [];
    for (var m = 0; m < 6; m++) {
      sky.mist.push({
        y: sky.h * (0.42 + Math.random() * 0.44),
        x: Math.random() * sky.w,
        w: sky.w * (0.35 + Math.random() * .7),
        h: sky.h * (0.014 + Math.random() * .034),
        v: (0.06 + Math.random() * 0.20) * (Math.random() < .5 ? -1 : 1),
        a: 0.10 + Math.random() * 0.18,
        ph: Math.random() * 6.28
      });
    }
  }
  function newPart(W, any) {
    return {
      x: Math.random() * sky.w,
      y: any ? Math.random() * sky.h : -12,
      r: W.kind === 'snow' ? 1.1 + Math.random() * 2.2 : 1.8 + Math.random() * 3.4,
      vy: W.kind === 'ember' ? -(0.18 + Math.random() * 0.45) : (0.20 + Math.random() * 0.72),
      vx: (Math.random() - .5) * 0.5,
      sp: Math.random() * 6.28,
      ss: 0.012 + Math.random() * 0.03,
      col: W.col[(Math.random() * W.col.length) | 0],
      a: 0.32 + Math.random() * 0.5,
      kind: W.kind,
      rot: Math.random() * 6.28,
      vr: (Math.random() - .5) * .04
    };
  }

  /* ---------- 动态特效队列 ---------- */
  var fxq = [];
  function pushFx(o) { o.born = performance.now(); fxq.push(o); }

  function frame(now) {
    if (!sky.ctx) return;
    var g = sky.ctx, w = sky.w, h = sky.h;
    var t = (now - sky.t0) / 1000;
    g.clearRect(0, 0, w, h);
    if (sky.off) g.drawImage(sky.off, 0, 0, w, h);

    /* 云雾 */
    for (var i = 0; i < sky.mist.length; i++) {
      var m = sky.mist[i];
      m.x += m.v;
      if (m.x > w + m.w) m.x = -m.w;
      if (m.x < -m.w) m.x = w + m.w;
      var yy = m.y + Math.sin(t * 0.25 + m.ph) * 5;
      var mg = g.createLinearGradient(0, yy - m.h, 0, yy + m.h);
      mg.addColorStop(0, 'rgba(255,255,255,0)');
      mg.addColorStop(.5, 'rgba(255,255,255,' + m.a.toFixed(3) + ')');
      mg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = mg;
      g.beginPath();
      g.ellipse(m.x, yy, m.w / 2, m.h, 0, 0, 6.2832);
      g.fill();
    }

    /* 粒子 */
    var W = WEATHER[sky.weather] || WEATHER.none;
    for (var p = 0; p < sky.parts.length; p++) {
      var s = sky.parts[p];
      s.sp += s.ss;
      s.x += s.vx + Math.sin(s.sp) * (s.kind === 'petal' ? 1.0 : 0.5);
      s.y += s.vy;
      s.rot += s.vr;
      if (s.y > h + 14 || s.y < -20 || s.x < -30 || s.x > w + 30) {
        sky.parts[p] = newPart(W, false);
        if (W.kind === 'ember') sky.parts[p].y = h + 10;
        continue;
      }
      g.globalAlpha = s.a;
      g.fillStyle = s.col;
      if (s.kind === 'petal' || s.kind === 'leaf') {
        g.save(); g.translate(s.x, s.y); g.rotate(s.rot);
        g.beginPath();
        g.ellipse(0, 0, s.r * 1.7, s.r * 0.8, 0, 0, 6.2832);
        g.fill(); g.restore();
      } else if (s.kind === 'ember') {
        g.shadowBlur = 8; g.shadowColor = s.col;
        g.beginPath(); g.arc(s.x, s.y, s.r * .6, 0, 6.2832); g.fill();
        g.shadowBlur = 0;
      } else {
        g.beginPath(); g.arc(s.x, s.y, s.r, 0, 6.2832); g.fill();
      }
    }
    g.globalAlpha = 1;

    /* 特效层 */
    drawFx(g, now, w, h);
    sky.raf = requestAnimationFrame(frame);
  }

  function drawFx(g, now, w, h) {
    for (var i = fxq.length - 1; i >= 0; i--) {
      var f = fxq[i];
      var age = (now - f.born) / f.dur;
      if (age >= 1) { fxq.splice(i, 1); continue; }
      if (f.type === 'bolt') drawBolt(g, f, age, w, h);
      else if (f.type === 'flash') {
        g.fillStyle = 'rgba(255,250,235,' + ((1 - age) * f.a).toFixed(3) + ')';
        g.fillRect(0, 0, w, h);
      } else if (f.type === 'ring') {
        var r = f.r0 + (f.r1 - f.r0) * age;
        g.strokeStyle = rgba(f.col, (1 - age) * .85);
        g.lineWidth = f.lw * (1 - age * .6);
        g.beginPath(); g.arc(f.x, f.y, r, 0, 6.2832); g.stroke();
      } else if (f.type === 'spiral') {
        drawSpiral(g, f, age, w, h);
      } else if (f.type === 'dark') {
        g.fillStyle = 'rgba(14,12,18,' + (Math.sin(age * Math.PI) * f.a).toFixed(3) + ')';
        g.fillRect(0, 0, w, h);
      }
    }
  }

  function drawBolt(g, f, age, w, h) {
    var alpha = age < .12 ? 1 : Math.max(0, 1 - (age - .12) / .88);
    g.save();
    g.globalCompositeOperation = 'lighter';
    function seg(x1, y1, x2, y2, depth, wid) {
      if (depth <= 0) {
        g.strokeStyle = rgba(f.col, alpha * .95);
        g.lineWidth = wid;
        g.shadowBlur = 18; g.shadowColor = f.col;
        g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
        return;
      }
      var mx = (x1 + x2) / 2 + (f.rnd() - .5) * (y2 - y1) * .42;
      var my = (y1 + y2) / 2 + (f.rnd() - .5) * 14;
      seg(x1, y1, mx, my, depth - 1, wid);
      seg(mx, my, x2, y2, depth - 1, wid);
      if (depth === 3 && f.rnd() < .6) {
        var bx = mx + (f.rnd() - .5) * 130, by = my + (30 + f.rnd() * 90);
        seg(mx, my, bx, by, 1, wid * .48);
      }
    }
    seg(f.x, -10, f.x2, f.y2, 4, f.lw);
    g.shadowBlur = 0;
    g.restore();
  }

  function drawSpiral(g, f, age, w, h) {
    var cx = f.x, cy = f.y;
    g.save();
    g.globalCompositeOperation = 'lighter';
    for (var i = 0; i < f.n; i++) {
      var ph = i / f.n * 6.2832 * 3 + f.rot;
      var pr = f.r * (1 - age) * (0.35 + (i % 5) / 5 * .8);
      var a = (1 - age) * .8 * (0.4 + (i % 3) / 3 * .6);
      var x = cx + Math.cos(ph + age * 7) * pr;
      var y = cy + Math.sin(ph + age * 7) * pr * .62;
      g.fillStyle = rgba(f.col, a);
      g.shadowBlur = 10; g.shadowColor = f.col;
      g.beginPath(); g.arc(x, y, 1.6 + (1 - age) * 2.2, 0, 6.2832); g.fill();
    }
    g.shadowBlur = 0;
    g.restore();
  }

  function start() { if (!sky.running) { sky.running = true; sky.t0 = performance.now() - 1; sky.raf = requestAnimationFrame(frame); } }
  function stop() { sky.running = false; cancelAnimationFrame(sky.raf); }

  function setScene(loc, term, seed) {
    sky.loc = loc; sky.term = term;
    if (seed !== undefined) sky.seed = seed;
    var wk = (term && term.element) || (loc && loc.element) || 'none';
    if (loc && loc.id === 'fuyao_cheng') wk = 'none';
    buildStatic();
    seedWeather(wk);
  }

  /* ============================================================
   * 二、太极图
   * ========================================================== */
  var taiji = { cv: null, ctx: null, rot: 0, k: 0, target: 0, raf: 0, r: 0 };
  function initTaiji(canvas) {
    taiji.cv = canvas;
    taiji.ctx = canvas.getContext('2d');
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var s = canvas.clientWidth || 118;
    canvas.width = s * dpr; canvas.height = s * dpr;
    taiji.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    taiji.r = s / 2 - 3;
    loopTaiji();
  }
  function loopTaiji() {
    if (!taiji.ctx) return;
    taiji.k += (taiji.target - taiji.k) * 0.06;
    taiji.rot += 0.0042;
    var g = taiji.ctx, s = taiji.cv.clientWidth || 118, R = taiji.r;
    g.clearRect(0, 0, s, s);
    var cx = s / 2, cy = s / 2;
    var kk = Math.max(-0.30, Math.min(0.30, taiji.k * 0.30));
    var rl = R * (0.5 + kk), rd = R * (0.5 - kk);
    var YIN = '#221f1a', YANG = '#f4efe2';

    g.save();
    g.translate(cx, cy);
    /* 外圈 */
    g.strokeStyle = 'rgba(120,96,50,.55)';
    g.lineWidth = 1;
    g.beginPath(); g.arc(0, 0, R + 2, 0, 6.2832); g.stroke();
    g.rotate(taiji.rot);
    /* 整圆阴 */
    g.beginPath(); g.arc(0, 0, R, 0, 6.2832); g.fillStyle = YIN; g.fill();
    /* 右半阳 */
    g.beginPath(); g.arc(0, 0, R, -Math.PI / 2, Math.PI / 2); g.closePath();
    g.fillStyle = YANG; g.fill();
    /* 上抱阳 */
    g.beginPath(); g.arc(0, -(R - rl), rl, 0, 6.2832); g.fillStyle = YANG; g.fill();
    /* 下抱阴 */
    g.beginPath(); g.arc(0, (R - rd), rd, 0, 6.2832); g.fillStyle = YIN; g.fill();
    /* 鱼眼 */
    g.beginPath(); g.arc(0, -(R - rl), rl * 0.30, 0, 6.2832); g.fillStyle = YIN; g.fill();
    g.beginPath(); g.arc(0, (R - rd), rd * 0.30, 0, 6.2832); g.fillStyle = YANG; g.fill();
    g.restore();

    /* 中和光晕 */
    if (Math.abs(taiji.target) < 0.16) {
      var a = (0.16 - Math.abs(taiji.target)) / 0.16;
      var hg = g.createRadialGradient(cx, cy, R * .6, cx, cy, R * 1.5);
      hg.addColorStop(0, 'rgba(224,189,118,0)');
      hg.addColorStop(.55, 'rgba(224,189,118,' + (0.30 * a).toFixed(3) + ')');
      hg.addColorStop(1, 'rgba(224,189,118,0)');
      g.fillStyle = hg;
      g.beginPath(); g.arc(cx, cy, R * 1.5, 0, 6.2832); g.fill();
    }
    taiji.raf = requestAnimationFrame(loopTaiji);
  }
  function setBalance(b) { taiji.target = Math.max(-1, Math.min(1, (b || 0) / 100)); }

  /* 八卦环 HTML */
  function baguaRing() {
    var B = XIAN.Data.bagua || [];
    var html = '';
    B.forEach(function (b, i) {
      var ang = -90 + i * 45;
      html += '<span style="transform:rotate(' + ang + 'deg) translate(80px) rotate(' + (-ang) + 'deg) translate(-50%,-50%)" title="' + b.name + '（' + b.nature + '）">' + b.symbol + '</span>';
    });
    return html;
  }

  /* ============================================================
   * 三、五行生克图
   * ========================================================== */
  /* 火 -90°，土 -18°，金 54°，水 126°，木 198° —— 顺时针即相生 */
  var WX_ORDER = ['huo', 'tu', 'jin', 'shui', 'mu'];
  function drawWuxing(canvas, aff, main) {
    var g = canvas.getContext('2d');
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = canvas.clientWidth || 190, h = canvas.clientHeight || 178;
    canvas.width = w * dpr; canvas.height = h * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    var cx = w / 2, cy = h / 2 + 2, R = Math.min(w, h) * 0.36;
    var pos = {};
    WX_ORDER.forEach(function (k, i) {
      var a = (-90 + i * 72) * Math.PI / 180;
      pos[k] = [cx + Math.cos(a) * R, cy + Math.sin(a) * R];
    });

    function arrow(from, to, col, wid, shrink, dash) {
      var a = pos[from], b = pos[to];
      var dx = b[0] - a[0], dy = b[1] - a[1];
      var len = Math.sqrt(dx * dx + dy * dy);
      var ux = dx / len, uy = dy / len;
      var x1 = a[0] + ux * shrink, y1 = a[1] + uy * shrink;
      var x2 = b[0] - ux * shrink, y2 = b[1] - uy * shrink;
      g.strokeStyle = col; g.lineWidth = wid;
      if (dash) g.setLineDash(dash); else g.setLineDash([]);
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
      g.setLineDash([]);
      /* 箭头 */
      var ah = 5.2;
      g.fillStyle = col;
      g.beginPath();
      g.moveTo(x2, y2);
      g.lineTo(x2 - ux * ah - uy * ah * .55, y2 - uy * ah + ux * ah * .55);
      g.lineTo(x2 - ux * ah + uy * ah * .55, y2 - uy * ah - ux * ah * .55);
      g.closePath(); g.fill();
    }
    /* 相生（外五边形，顺时针） */
    for (var i = 0; i < 5; i++) {
      arrow(WX_ORDER[i], WX_ORDER[(i + 1) % 5], 'rgba(79,138,99,.62)', 1.5, 17);
    }
    /* 相克（内五角星） */
    for (var j = 0; j < 5; j++) {
      arrow(WX_ORDER[j], WX_ORDER[(j + 2) % 5], 'rgba(168,68,58,.5)', 1.1, 17, [4, 3]);
    }
    /* 节点 */
    WX_ORDER.forEach(function (k) {
      var E = XIAN.Data.elements[k];
      var v = (aff && aff[k]) || 0;
      var r = 11 + Math.min(18, v * 0.16);
      var p = pos[k];
      var isMain = k === main;
      if (isMain) {
        g.shadowBlur = 14; g.shadowColor = E.color;
      }
      var rg = g.createRadialGradient(p[0] - r * .3, p[1] - r * .3, r * .1, p[0], p[1], r);
      rg.addColorStop(0, E.glow);
      rg.addColorStop(.55, E.color);
      rg.addColorStop(1, E.deep);
      g.fillStyle = rg;
      g.beginPath(); g.arc(p[0], p[1], r, 0, 6.2832); g.fill();
      g.shadowBlur = 0;
      g.strokeStyle = isMain ? 'rgba(168,38,31,.9)' : 'rgba(28,26,22,.4)';
      g.lineWidth = isMain ? 1.8 : 1;
      g.beginPath(); g.arc(p[0], p[1], r, 0, 6.2832); g.stroke();
      /* 字 */
      g.fillStyle = (k === 'jin' || k === 'tu') ? '#2a251c' : '#fdf9ee';
      g.font = '600 ' + Math.round(r * 0.95) + 'px "Songti SC","SimSun",serif';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(E.name, p[0], p[1] + 0.5);
      /* 数值 */
      g.fillStyle = 'rgba(40,34,26,.72)';
      g.font = '10px "Songti SC",serif';
      var ly = p[1] + r + 9;
      g.fillText(String(Math.round(v)), p[0], ly);
    });
  }

  /* ============================================================
   * 四、经脉内景图（侧身打坐）
   * ========================================================== */
  var MER_PT = {
    ren: [77, 78], du: [46, 62],
    fei: [70, 48], dachang: [85, 58], wei: [75, 90], pi: [66, 98],
    xin: [67, 42], xiaochang: [57, 46], pangguang: [43, 90], shen: [51, 82],
    xinbao: [74, 44], sanjiao: [81, 40], dan: [88, 102], gan: [70, 68],
    chong: [59, 76], dai: [58, 90], yinwei: [84, 94], yangwei: [38, 74],
    yinqiao: [90, 110], yangqiao: [34, 106]
  };
  function meridianSvg(S) {
    var open = {}; (S.meridians || []).forEach(function (id) { open[id] = 1; });
    var zt = open.ren && open.du;
    var pts = '';
    XIAN.Data.meridians.forEach(function (m) {
      var p = MER_PT[m.id]; if (!p) return;
      var on = open[m.id];
      pts += '<circle class="pt' + (on ? ' on' : '') + '" cx="' + p[0] + '" cy="' + p[1] + '" r="' + (on ? 3.4 : 2.4) + '"><title>' + m.name + (on ? '（已通）' : '（未通）') + '</title></circle>';
    });
    return '' +
      '<svg id="meridianSvg" class="' + (zt ? 'zt' : '') + '" width="120" height="200" viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      '<filter id="merGlow" x="-120%" y="-120%" width="340%" height="340%">' +
      '<feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<linearGradient id="merBody" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="rgba(80,70,55,.10)"/><stop offset="1" stop-color="rgba(60,52,40,.04)"/></linearGradient>' +
      '</defs>' +
      /* 身形：侧面打坐，面向右 */
      '<path class="fill" fill="url(#merBody)" d="M62 14 q13 0 13 13 q0 9 -7 12 l3 8 q14 5 16 20 q2 16 -3 30 q-2 10 -6 16 l6 8 q10 2 16 6 q6 4 4 8 l-62 0 q-4 -4 2 -8 q7 -5 16 -6 l4 -8 q-8 -8 -12 -20 q-6 -18 -3 -34 q3 -14 15 -20 l3 -8 q-7 -3 -7 -12 q0 -13 13 -13 z"/>' +
      /* 头 */
      '<circle class="body" cx="65" cy="26" r="12.5"/>' +
      /* 脊（督脉） */
      '<path class="body" d="M56 38 q-9 10 -10 26 q-1 18 4 32 q2 8 6 14"/>' +
      /* 前正中（任脉） */
      '<path class="body" d="M74 40 q7 9 7 22 q0 18 -4 30 q-2 8 -7 14"/>' +
      /* 盘腿 */
      '<path class="body" d="M30 118 q10 -12 30 -12 q22 0 32 12 q3 5 -3 6 l-56 0 q-6 -1 -3 -6z"/>' +
      '<path class="body" d="M40 112 q22 -8 42 2"/>' +
      /* 臂 */
      '<path class="body" d="M60 46 q18 6 24 26 q4 14 -2 30"/>' +
      /* 丹田 */
      '<circle class="dantian" cx="70" cy="80" r="13"/>' +
      '<circle class="dantian" cx="70" cy="80" r="6" stroke-dasharray="2 2"/>' +
      /* 小周天循行路线 */
      '<path class="zhoutian" d="M62 112 q-14 -6 -16 -26 q-2 -22 4 -34 q5 -10 15 -14 q10 4 14 14 q6 12 4 34 q-2 20 -17 26 z"/>' +
      pts +
      /* 百会 · 涌泉标记 */
      '<circle class="pt" cx="65" cy="13" r="1.8"><title>百会</title></circle>' +
      '<text x="60" y="134" text-anchor="middle" font-size="8" fill="rgba(60,52,40,.5)" font-family="serif">' + (zt ? '小周天已通' : '任督未贯') + '</text>' +
      '</svg>';
  }

  /* ============================================================
   * 五、丹炉
   * ========================================================== */
  var furn = { cv: null, ctx: null, raf: 0, heat: 0.4, t: 0, sparks: [] };
  function initFurnace(canvas) {
    furn.cv = canvas; furn.ctx = canvas.getContext('2d');
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = canvas.clientWidth || 200, h = canvas.clientHeight || 130;
    canvas.width = w * dpr; canvas.height = h * dpr;
    furn.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    furn.sparks = [];
    for (var i = 0; i < 34; i++) furn.sparks.push({ x: Math.random(), y: Math.random(), v: .3 + Math.random(), r: Math.random() });
    loopFurnace();
  }
  function stopFurnace() { cancelAnimationFrame(furn.raf); furn.cv = null; }
  function setHeat(v) { furn.heat = Math.max(0, Math.min(1, v)); }
  function loopFurnace() {
    if (!furn.cv) return;
    var g = furn.ctx, w = furn.cv.clientWidth || 200, h = furn.cv.clientHeight || 130;
    furn.t += 0.05;
    g.clearRect(0, 0, w, h);
    var cx = w / 2, base = h - 8;
    var heat = furn.heat;
    var fcol = heat < .3 ? '#4d7a8f' : heat < .5 ? '#9fa872' : heat < .7 ? '#d9a640' : heat < .87 ? '#cc6b2c' : '#a02a1c';

    /* 炉火 */
    var fh = 22 + heat * 46;
    for (var i = 0; i < 4; i++) {
      var sw = (18 + heat * 22) * (1 - i * 0.16);
      var sh = fh * (1 - i * 0.18);
      var wob = Math.sin(furn.t * (1.4 + i * .4)) * (2 + heat * 4);
      var fg = g.createLinearGradient(cx, base, cx, base - sh);
      fg.addColorStop(0, rgba(fcol, .85));
      fg.addColorStop(.5, rgba(mixHex(fcol, '#ffe9a0', .5), .55));
      fg.addColorStop(1, 'rgba(255,240,200,0)');
      g.fillStyle = fg;
      g.beginPath();
      g.moveTo(cx - sw / 2, base);
      g.quadraticCurveTo(cx - sw / 2 + wob, base - sh * .55, cx + wob * .5, base - sh);
      g.quadraticCurveTo(cx + sw / 2 + wob, base - sh * .55, cx + sw / 2, base);
      g.closePath(); g.fill();
    }
    /* 火星 */
    g.globalCompositeOperation = 'lighter';
    furn.sparks.forEach(function (s) {
      s.y -= 0.006 * s.v * (0.4 + heat);
      if (s.y < 0) { s.y = 1; s.x = Math.random(); }
      var px = cx + (s.x - .5) * (30 + heat * 34) + Math.sin(furn.t + s.r * 6) * 4;
      var py = base - (1 - s.y) * (fh + 34);
      g.fillStyle = rgba('#ffd79a', (s.y) * .55 * (0.4 + heat));
      g.beginPath(); g.arc(px, py, 0.8 + s.r * 1.3, 0, 6.2832); g.fill();
    });
    g.globalCompositeOperation = 'source-over';

    /* 鼎 */
    var rw = 74, rh = 46, ry = base - 4;
    g.fillStyle = 'rgba(46,40,32,.92)';
    g.strokeStyle = 'rgba(200,178,130,.55)';
    g.lineWidth = 1.2;
    /* 足 */
    [-1, 1].forEach(function (s) {
      g.beginPath();
      g.moveTo(cx + s * rw * .28, ry - 4);
      g.quadraticCurveTo(cx + s * rw * .36, ry + 8, cx + s * rw * .3, ry + 12);
      g.lineTo(cx + s * rw * .18, ry + 12);
      g.quadraticCurveTo(cx + s * rw * .24, ry + 6, cx + s * rw * .18, ry - 4);
      g.closePath(); g.fill(); g.stroke();
    });
    /* 腹 */
    g.beginPath();
    g.moveTo(cx - rw / 2, ry - rh * .82);
    g.quadraticCurveTo(cx - rw * .62, ry - rh * .28, cx - rw * .3, ry - 2);
    g.lineTo(cx + rw * .3, ry - 2);
    g.quadraticCurveTo(cx + rw * .62, ry - rh * .28, cx + rw / 2, ry - rh * .82);
    g.closePath();
    g.fill(); g.stroke();
    /* 口沿 */
    g.beginPath();
    g.ellipse(cx, ry - rh * .82, rw / 2, 6, 0, 0, 6.2832);
    g.fillStyle = 'rgba(30,26,20,.95)'; g.fill(); g.stroke();
    /* 耳 */
    [-1, 1].forEach(function (s) {
      g.beginPath();
      g.arc(cx + s * (rw / 2 + 2), ry - rh * .88, 6, 0, 6.2832);
      g.strokeStyle = 'rgba(200,178,130,.55)'; g.lineWidth = 2.4; g.stroke();
    });
    /* 饕餮纹 */
    g.strokeStyle = 'rgba(200,178,130,.30)'; g.lineWidth = 1;
    for (var n = 0; n < 3; n++) {
      var yy = ry - rh * .62 + n * 8;
      g.beginPath();
      g.moveTo(cx - rw * .32, yy);
      for (var xx = -rw * .32; xx < rw * .32; xx += 7) {
        g.lineTo(cx + xx + 3.5, yy + (n % 2 ? 3 : -3));
        g.lineTo(cx + xx + 7, yy);
      }
      g.stroke();
    }
    /* 丹光 */
    var dg = g.createRadialGradient(cx, ry - rh * .82, 1, cx, ry - rh * .82, 24);
    dg.addColorStop(0, rgba('#ffe9b0', .55 * (0.3 + heat)));
    dg.addColorStop(1, 'rgba(255,233,176,0)');
    g.fillStyle = dg;
    g.beginPath(); g.ellipse(cx, ry - rh * .82, 26, 12, 0, 0, 6.2832); g.fill();

    furn.raf = requestAnimationFrame(loopFurnace);
  }

  /* ============================================================
   * 六、对外特效
   * ========================================================== */
  function lightning(color, n) {
    n = n || 1;
    for (var i = 0; i < n; i++) {
      setTimeout(function () {
        var x = sky.w * (0.2 + Math.random() * 0.6);
        pushFx({
          type: 'bolt', dur: 620, col: color || '#dce8ff',
          x: x, x2: x + (Math.random() - .5) * 160, y2: sky.h * (0.55 + Math.random() * .3),
          lw: 2 + Math.random() * 2.4, rnd: srnd((Math.random() * 1e9) | 0)
        });
        pushFx({ type: 'flash', dur: 320, a: 0.42 });
      }, i * 150);
    }
  }
  function qiBurst(element, strength) {
    var E = XIAN.Data.elements[element];
    pushFx({
      type: 'spiral', dur: 1500, n: 90,
      col: E ? E.glow : '#e8dcc0',
      x: sky.w * 0.5, y: sky.h * 0.5,
      r: Math.min(sky.w, sky.h) * (0.22 + (strength || 1) * 0.08),
      rot: Math.random() * 6.28
    });
  }
  function rings(color, n) {
    n = n || 3;
    for (var i = 0; i < n; i++) {
      setTimeout(function () {
        pushFx({
          type: 'ring', dur: 1200, col: color || '#e0bd76',
          x: sky.w / 2, y: sky.h * 0.48,
          r0: 20, r1: Math.max(sky.w, sky.h) * 0.62, lw: 3.4
        });
      }, i * 220);
    }
  }
  function darken(a, dur) { pushFx({ type: 'dark', dur: dur || 2400, a: a || 0.5 }); }
  function flash(a) { pushFx({ type: 'flash', dur: 400, a: a || 0.5 }); }

  /* 飘字 */
  function floaty(text, color, x, y) {
    var d = document.createElement('div');
    d.className = 'floaty';
    d.textContent = text;
    d.style.color = color || '#a8261f';
    d.style.left = (x !== undefined ? x : window.innerWidth / 2) + 'px';
    d.style.top = (y !== undefined ? y : window.innerHeight * 0.4) + 'px';
    d.style.transform = 'translateX(-50%)';
    document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, 1200);
  }

  /* 卦象爻线 HTML */
  function hexLinesHtml(lines, moving) {
    var h = '';
    for (var i = 0; i < 6; i++) {
      var yang = lines[i] === '1';
      var mv = moving === (i + 1);
      h += '<div class="ln' + (yang ? '' : ' yin') + (mv ? ' moving' : '') + '">' +
        (yang ? '<i></i>' : '<i></i><i></i>') + '</div>';
    }
    return h;
  }

  /* logo */
  function logoSvg() {
    return '<svg class="logo" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="20" cy="20" r="18" fill="none" stroke="rgba(120,96,50,.7)" stroke-width="1.2"/>' +
      '<path d="M20 2 a18 18 0 0 1 0 36 a9 9 0 0 1 0 -18 a9 9 0 0 0 0 -18z" fill="#2a251d"/>' +
      '<path d="M20 2 a18 18 0 0 0 0 36 a9 9 0 0 0 0 -18 a9 9 0 0 1 0 -18z" fill="#f2ece0"/>' +
      '<circle cx="20" cy="11" r="2.6" fill="#f2ece0"/><circle cx="20" cy="29" r="2.6" fill="#2a251d"/>' +
      '</svg>';
  }

  return {
    initSky: initSky, setScene: setScene, start: start, stop: stop, buildStatic: buildStatic,
    initTaiji: initTaiji, setBalance: setBalance, baguaRing: baguaRing,
    drawWuxing: drawWuxing, meridianSvg: meridianSvg,
    initFurnace: initFurnace, stopFurnace: stopFurnace, setHeat: setHeat,
    lightning: lightning, qiBurst: qiBurst, rings: rings, darken: darken, flash: flash,
    floaty: floaty, hexLinesHtml: hexLinesHtml, logoSvg: logoSvg,
    mixHex: mixHex, rgba: rgba
  };
})();
