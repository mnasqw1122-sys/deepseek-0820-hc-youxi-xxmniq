/* ============================================================
 *  main.js — 总纲：游戏控制器
 * ============================================================ */
window.XIAN = window.XIAN || {};

XIAN.G = {
  S: null,
  rng: null,
  tab: 'cultivate',
  loreTab: 'realm',
  combat: null,
  trib: null,
  busy: false,
  _sceneKey: '',

  /* ---------------- 启动 ---------------- */
  init: function () {
    var G = this;
    XIAN.UI.buildShell();
    XIAN.Art.initSky(XIAN.$('#sky'));
    XIAN.Art.setScene(XIAN.Data.locations[0], XIAN.Data.solarTerms[0], 12345);
    XIAN.Art.start();

    /* 键盘 */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && XIAN.UI.modalOpen()) {
        var m = XIAN.$('#modalRoot .modal .x');
        if (m) m.click();
      }
      if (XIAN.UI.modalOpen() || !G.S) return;
      var map = { '1': 'cultivate', '2': 'alchemy', '3': 'meridian', '4': 'bag', '5': 'world', '6': 'market', '7': 'lore' };
      if (map[e.key]) { G.goTab(map[e.key]); return; }
      if (e.key === ' ') { e.preventDefault(); G.act('cultivate'); }
      if (e.key === 'r' || e.key === 'R') G.act('rest');
      if (e.key === 'w' || e.key === 'W') G.act('wander');
    });

    XIAN.UI.openIntro();
  },

  newLife: function () { XIAN.UI.openIntro(); },

  adopt: function (S) {
    this.S = S;
    this.rng = new XIAN.RNG(S.seed);
    if (S.rngState) this.rng.load(S.rngState);
    this.tab = 'cultivate';
    XIAN.recalcLifespan(S);
    XIAN.UI.renderLog();
    this.render();
    if (S.dead) this.die();
    else if (S.ascended) this.ascend();
  },

  begin: function (draft) {
    var G = this;
    this.S = draft;
    this.rng = new XIAN.RNG(draft.seed);
    if (draft.rngState) this.rng.load(draft.rngState);
    this.tab = 'cultivate';
    var S = this.S;
    S.log = [];
    S.chronicle = [];
    this.render();
    XIAN.UI.renderLog();

    /* —— 开场 —— */
    XIAN.UI.log('太　乙　玄　门', 'big');
    XIAN.UI.log('道生一，一生二，二生三，三生万物。', 'verse');
    var lines = XIAN.Data.openings.slice();
    var i = 0;
    (function next() {
      if (i >= lines.length) {
        XIAN.UI.log('——第 ' + XIAN.han(S.life) + ' 世 · ' + S.name + '（' + S.hao + '）', 'sep');
        XIAN.UI.log('你生具 <b>' + S.root.name + '</b>（' + S.root.grade + '品），主 <b class="el-' +
          S.root.main + '">' + XIAN.Data.elements[S.root.main].name + '</b> 气；命格 <b>' + S.fate.name + '</b>。', 'gold');
        XIAN.UI.log('今为 ' + XIAN.Cal.format(S.day, S.baseYear) + '，你十六岁，身在青云山。', '');
        XIAN.UI.log('先择一心法，而后打坐。若不知从何下手，可按顶栏「要旨」一观。', 'dim');
        G.chronicle('入世修行');
        G.save();
        return;
      }
      XIAN.UI.log(lines[i++], 'story');
      setTimeout(next, 420);
    })();
  },

  /* ---------------- 渲染 ---------------- */
  flushPromote: function () {
    var S = this.S;
    if (S && S._promoteTech) {
      XIAN.UI.log('境界既进，前所不解者忽然自解——你悟得《<b>' + XIAN.esc(S._promoteTech.name) + '</b>》。', 'gold');
      S._promoteTech = null;
    }
  },
  render: function () {
    var S = this.S;
    if (!S) return;
    this.flushPromote();
    XIAN.UI.renderTop();
    XIAN.UI.renderLeft();
    XIAN.UI.renderRight();
    XIAN.UI.renderTabs();
    XIAN.UI.renderPanel();
    this.updateScene();
  },
  renderLight: function () {
    this.flushPromote();
    XIAN.UI.renderTop();
    XIAN.UI.renderLeft();
    XIAN.UI.renderRight();
  },
  updateScene: function () {
    var S = this.S;
    var c = XIAN.Cal.parse(S.day, S.baseYear);
    var key = S.loc + '|' + c.termIdx;
    if (key === this._sceneKey) return;
    this._sceneKey = key;
    var L = XIAN.byId(XIAN.Data.locations, S.loc) || XIAN.Data.locations[0];
    /* 同一地域、同一节气，山形固定；节气变则微调 */
    var seed = 0;
    for (var i = 0; i < S.loc.length; i++) seed = (seed * 31 + S.loc.charCodeAt(i)) >>> 0;
    XIAN.Art.setScene(L, c.term, seed + c.termIdx * 7919);
  },

  goTab: function (id) {
    this.tab = id;
    XIAN.UI.renderTabs();
    XIAN.UI.renderPanel();
  },

  log: function (h, c) { XIAN.UI.log(h, c); },
  toast: function (m, c) { XIAN.UI.toast(m, c); },
  chronicle: function (text) {
    var S = this.S;
    S.chronicle = S.chronicle || [];
    S.chronicle.push({ when: XIAN.Cal.formatShort(S.day, S.baseYear), text: text });
    if (S.chronicle.length > 300) S.chronicle.shift();
  },
  save: function () {
    var S = this.S;
    if (!S || S.dead || S.ascended) return;
    S.rngState = this.rng.save();
    XIAN.save(S);
  },

  die: function () {
    XIAN.UI.closeModal();
    XIAN.UI.log('——身殒：' + (this.S.causeOfDeath || '不详'), 'big');
    XIAN.UI.openEnding('die');
  },
  ascend: function () {
    XIAN.UI.closeModal();
    XIAN.UI.log('——飞升', 'big');
    XIAN.UI.openEnding('ascend');
  },

  /* 时间推进后的统一收尾 */
  after: function (out, opts) {
    opts = opts || {};
    var S = this.S;
    XIAN.recalcLifespan(S);
    /* 走火 */
    if (out && out.dev) {
      XIAN.UI.log('<b class="e-bad">走火入魔 · ' + out.dev.dev.name + '</b>　' + esc0(out.dev.dev.desc), 'bad');
      XIAN.UI.log(out.dev.lines.join('　'), 'bad');
      XIAN.UI.log('（当改用「静坐」以复道心、消躁进；或往灵泉、道观静养。<span class="t-kai">躁则失君，静则得道。</span>）', 'dim');
      XIAN.Art.flash(0.4);
      var mb = document.getElementById('app');
      mb.classList.remove('shake'); void mb.offsetWidth; mb.classList.add('shake');
      setTimeout(function () { mb.classList.remove('shake'); }, 600);
    }
    /* 遇袭 */
    if (out && out.ambush && !S.dead) {
      var foe = XIAN.Sys.pickEnemy(S, this.rng, {});
      if (foe) {
        XIAN.UI.log('草木无风自动——有物窥你。', 'bad');
        var G = this;
        XIAN.UI.openCombat(foe, function () { G.render(); G.save(); });
        return;
      }
    }
    /* 随机奇遇 */
    if (!S.dead && !opts.noEvent && this.rng.chance(opts.evChance === undefined ? 0.14 : opts.evChance)) {
      var ev = XIAN.Sys.pickEvent(S, this.rng);
      if (ev) {
        var G2 = this;
        XIAN.UI.openEvent(ev, function () { G2.render(); G2.save(); });
        return;
      }
    }
    if (S.dead) return this.die();
    this.render();
    this.save();
  },

  doDivine: function () {
    var S = this.S;
    var c = XIAN.Sys.divineCost(S);
    if (!c.ok) return this.toast('神魂不足以通神明（需 ' + XIAN.num(c.shen) + '）', 'bad');
    if (c.n >= 1 && !confirm('《易》曰：初筮告，再三渎。\n本节气已卜过 ' + c.n + ' 次，再卜将耗神 ' + XIAN.num(c.shen) + ' 并增业障，且卦象或不应。\n仍要再卜？')) return;
    var r = XIAN.Sys.divine(S, this.rng);
    if (!r.ok) return this.toast(r.reason, 'bad');
    XIAN.UI.showDivine(r);
    this.renderLight();
    this.save();
  },

  /* ---------------- 行动分派 ---------------- */
  act: function (name, arg, arg2, btn) {
    var S = this.S, G = this, rng = this.rng;
    if (!S || S.dead || S.ascended) return;
    if (this.busy) return;

    switch (name) {

      /* —— 心法 —— */
      case 'stance': {
        var st = XIAN.byId(XIAN.Data.stances, arg);
        if (!st) return;
        if (st.minRealm !== undefined && S.realm < st.minRealm) return this.toast('境界未足', 'bad');
        S.stance = arg;
        this.toast('心法改为「' + st.name + '」');
        this._keepScroll = true;
        this.render();
        return;
      }

      /* —— 打坐 —— */
      case 'cultivate': {
        var L = XIAN.byId(XIAN.Data.locations, S.loc);
        var canC = L && (L.features || []).indexOf('cultivate') >= 0;
        var out = XIAN.Sys.cultivate(S, rng);
        if (!canC) { /* 不宜打坐之地：折半 */
          var half = Math.round(out.gain * 0.45);
          S.dao = Math.max(0, S.dao - (out.gain - half));
          out.gain = half;
        }
        XIAN.Art.qiBurst(S.root.main, 2);
        XIAN.Art.floaty('道行 +' + XIAN.num(out.gain), '#8a6a24');
        XIAN.UI.log('〔' + XIAN.Cal.formatShort(S.day, S.baseYear) + '〕' +
          (XIAN.byId(XIAN.Data.stances, S.stance) || {}).name + '深修 ' + XIAN.UI.fmtDays(out.days) + '，' +
          '道行 <b class="e-gold">+' + XIAN.num(out.gain) + '</b>' +
          '（×' + out.factor.mult.toFixed(2) + '）' +
          (out.balanceShift ? '　阴阳' + (out.balanceShift > 0 ? '+' : '') + out.balanceShift.toFixed(1) : '') +
          (out.qiPenalty < 1 ? '　<span class="e-bad">真炁不敷，事倍功半</span>' : ''), '');
        if (out.insightGain) XIAN.UI.log('返虚之际，忽有所悟。<em class="e-gold">悟性 +1</em>', 'gold');
        this._keepScroll = true;
        this.after(out, { evChance: 0.10 });
        return;
      }

      case 'rest': {
        var r = XIAN.Sys.rest(S, rng);
        XIAN.UI.log('〔静养〕' + r.lines.join('　') + '　（' + XIAN.UI.fmtDays(r.days) + '）', 'dim');
        this._keepScroll = true;
        this.after(r, { evChance: 0.06 });
        return;
      }

      case 'wander': {
        var w = XIAN.Sys.wander(S, rng);
        if (w.event) {
          XIAN.UI.log('〔游历〕' + XIAN.UI.fmtDays(w.days) + '后，你遇上了一桩事。', 'dim');
          XIAN.UI.openEvent(w.event, function () { G.render(); G.save(); });
          return;
        }
        XIAN.UI.log('〔游历〕' + w.lines.join('　'), 'dim');
        this._keepScroll = true;
        this.after(w, { noEvent: true });
        return;
      }

      case 'hunt': case 'trial': {
        var foe = XIAN.Sys.pickEnemy(S, rng, name === 'trial' ? { hard: true } : {});
        if (!foe) return this.toast('此地无敌可寻', 'bad');
        XIAN.UI.log('〔' + (name === 'trial' ? '试炼' : '寻敌') + '〕你寻着气机而去。', 'dim');
        XIAN.UI.openCombat(foe, function () { G.render(); G.save(); });
        return;
      }

      /* —— 三宝转化 —— */
      case 'refine': {
        var rr = XIAN.Sys.refine(S, arg, rng);
        if (!rr.ok) return this.toast(rr.reason, 'bad');
        XIAN.UI.log('〔' + rr.info.name + '〕' + rr.lines.join('　') + '　（' + XIAN.UI.fmtDays(rr.days) + '）', 'good');
        XIAN.Art.qiBurst(arg === 'jq' ? 'huo' : arg === 'qs' ? 'shui' : 'tu', 1);
        this._keepScroll = true;
        this.after(rr, { evChance: 0.04 });
        return;
      }

      /* —— 突破 —— */
      case 'break': case 'forcebreak': {
        var force = name === 'forcebreak';
        if (force && !confirm('强行冲关：成功率 −26%，业障骤积。\n若败，道行大损、精元重伤、寿元有亏，且极易走火。\n仍要为之？')) return;
        var br = XIAN.Sys.attemptBreak(S, rng, force);
        if (!br.ok) return this.toast(br.reason, 'bad');
        S.stats.breakAttempts = (S.stats.breakAttempts || 0) + 1;
        if (br.success && br.needTrib) {
          XIAN.UI.log('〔突破〕气机凝成——然劫云已至。', 'gold');
          XIAN.UI.showBreak(br, function () {
            XIAN.UI.openTrib(function () { G.render(); G.save(); });
          });
          return;
        }
        if (br.success) {
          XIAN.UI.log('〔突破〕成。今为 <b>' + XIAN.realmName(S.realm, S.stage) + '</b>。', 'big');
          this.chronicle('晋' + XIAN.realmName(S.realm, S.stage));
          XIAN.UI.showBreak(br);
        } else {
          XIAN.UI.log('〔突破〕不成。道行 <em class="e-bad">-' + XIAN.num(br.lost || 0) +
            '</em>　精元 <em class="e-bad">-' + XIAN.num(br.hurt || 0) + '</em>', 'bad');
          if (br.dev) XIAN.UI.log('<b class="e-bad">' + br.dev.dev.name + '</b>　' + br.dev.lines.join('　'), 'bad');
          XIAN.UI.showBreak(br);
        }
        if (S.dead) return this.die();
        this.renderLight();
        this.save();
        return;
      }

      /* —— 采药 / 丹道 —— */
      case 'gather': {
        var g = XIAN.Sys.gather(S, rng);
        if (!g.ok) return this.toast(g.reason, 'bad');
        XIAN.UI.log('〔采药〕' + g.lines.join('　') + '　（' + XIAN.UI.fmtDays(g.days) + '）', g.got.length ? 'good' : 'dim');
        this._keepScroll = true;
        this.after(g, { evChance: 0.10 });
        return;
      }
      case 'furnace': { XIAN.UI.openFurnace(arg); return; }
      case 'takepill': {
        var tp = XIAN.Sys.takePill(S, arg, rng);
        if (!tp.ok) return this.toast(tp.reason, 'bad');
        XIAN.UI.log('〔服丹〕' + tp.pill.name + '（' + tp.quality.name + '）　' + tp.lines.join('　'), 'good');
        XIAN.Art.floaty('丹　成', tp.quality.color);
        this._keepScroll = true;
        this.render(); this.save();
        return;
      }
      case 'sellpill': {
        var sp = XIAN.Sys.sellPill(S, arg, 1);
        if (!sp.ok) return this.toast(sp.reason, 'bad');
        this.toast(sp.msg, 'good');
        this._keepScroll = true; this.render(); this.save();
        return;
      }
      case 'sellherb': case 'sellherball': {
        var n = name === 'sellherball' ? (S.herbs[arg] || 0) : 1;
        var sh = XIAN.Sys.sellHerb(S, arg, n);
        if (!sh.ok) return this.toast(sh.reason, 'bad');
        this.toast(sh.msg, 'good');
        this._keepScroll = true; this.render(); this.save();
        return;
      }

      /* —— 经脉 —— */
      case 'merinfo': { XIAN.UI.openMeridianInfo(arg); return; }
      case 'openmer': {
        var om = XIAN.Sys.openMeridian(S, arg, rng);
        if (!om.ok) return this.toast(om.reason, 'bad');
        if (om.success) {
          XIAN.UI.log('〔冲脉〕<b class="e-gold">' + om.m.name + '</b> 贯通！　' + om.lines.join('　'), 'gold');
          XIAN.Art.rings('#e0bd76', 2);
          XIAN.Art.floaty(om.m.name + ' 通', '#8a6a24');
          this.chronicle('通' + om.m.name);
          if (S.meridians.indexOf('ren') >= 0 && S.meridians.indexOf('du') >= 0 && !S.flags.zhoutian) {
            S.flags.zhoutian = true;
            XIAN.UI.log('任督既通，真炁自尾闾上夹脊，透玉枕，入泥丸，复降丹田——<b>小周天成</b>。', 'big');
            this.chronicle('小周天成');
          }
        } else {
          XIAN.UI.log('〔冲脉〕' + om.m.name + ' 冲之不开，真炁倒冲。精元 <em class="e-bad">-' + XIAN.num(om.hurt) + '</em>', 'bad');
        }
        this._keepScroll = true;
        this.after(om, { evChance: 0.05 });
        return;
      }

      /* —— 法宝 —— */
      case 'equip': {
        var a = XIAN.byId(XIAN.Data.artifacts, arg);
        if (!a) return;
        S.equipped[a.slot] = a.id;
        this.toast('佩「' + a.name + '」');
        this._keepScroll = true; this.render(); this.save();
        return;
      }
      case 'unequip': {
        S.equipped[arg] = null;
        this._keepScroll = true; this.render(); this.save();
        return;
      }

      /* —— 行路 —— */
      case 'travel': {
        var tv = XIAN.Sys.travel(S, arg, rng);
        if (!tv.ok) return this.toast(tv.reason, 'bad');
        XIAN.UI.log('〔行路〕' + tv.lines.join('　') + '　（' + XIAN.UI.fmtDays(tv.days) + '）', '');
        XIAN.UI.log(esc0(tv.to.desc), 'story');
        this.chronicle('至' + tv.to.name);
        this.after(tv, { evChance: 0.18 });
        return;
      }

      case 'divine': { this.doDivine(); return; }

      /* —— 炼器 —— */
      case 'forge': {
        var fg = XIAN.Sys.forge(S, arg, rng);
        if (!fg.ok) return this.toast(fg.reason, 'bad');
        XIAN.UI.log('〔温养〕' + fg.lines.join('　'), 'good');
        this._keepScroll = true;
        this.after(fg, { evChance: 0.05 });
        return;
      }

      /* —— 道观 —— */
      case 'donate': {
        var cost = parseInt(arg, 10);
        if (S.stone < cost) return this.toast('灵石不足', 'bad');
        S.stone -= cost;
        var m = Math.max(1, Math.round(cost / (60 * Math.pow(1.5, S.realm))));
        /* 布施功德有上限：不可以钱买道 */
        S.donated = (S.donated || 0) + 1;
        var eff = Math.max(1, Math.round(m * Math.max(0.25, Math.pow(0.88, S.donated - 1))));
        S.merit += eff;
        XIAN.recalcLifespan(S);
        XIAN.UI.log('〔布施〕灵石 -' + XIAN.num(cost) + '　功德 <em class="e-good">+' + eff + '</em>' +
          (S.donated > 4 ? '　<span class="dim">（施之愈多，所得愈薄。上德不德。）</span>' : ''), 'good');
        this._keepScroll = true; this.render(); this.save();
        return;
      }
      case 'penance': {
        var days = Math.round(XIAN.Data.realms[S.realm].days * 1.2);
        var cut = Math.min(S.karma, Math.round(20 + S.karma * 0.22));
        if (S.karma <= 0) return this.toast('身无业障，何须苦行', 'bad');
        S.karma = Math.max(0, S.karma - cut);
        S.daoxin = XIAN.clamp(S.daoxin + 5, 0, 100);
        S.haste = XIAN.clamp(S.haste - 25, 0, 100);
        var d = XIAN.Sys.advanceTime(S, days, { regenJing: 0.12, regenQi: 0.1, regenShen: 0.2 });
        XIAN.UI.log('〔苦行〕汲水、扫阶、抄经，' + XIAN.UI.fmtDays(days) + '不与人言。' +
          '业障 <em class="e-good">-' + cut + '</em>　道心 <em class="e-good">+5</em>', 'good');
        this._keepScroll = true;
        this.after({ death: d }, { evChance: 0.05 });
        return;
      }

      /* —— 坊市 —— */
      case 'buyherb': case 'buypill': case 'buyrecipe': case 'buytech': case 'buyart': {
        var stock = XIAN.Sys.marketStock(S, rng);
        var kindMap = { buyherb: ['herbs', 'herb'], buypill: ['pills', 'pill'], buyrecipe: ['recipes', 'recipe'], buytech: ['techs', 'tech'], buyart: ['arts', 'art'] };
        var km = kindMap[name];
        var entry = stock[km[0]][parseInt(arg, 10)];
        if (!entry) return;
        var b = XIAN.Sys.buy(S, km[1], entry, rng);
        if (!b.ok) return this.toast(b.reason, 'bad');
        if (km[1] === 'recipe' || km[1] === 'tech' || km[1] === 'art') {
          stock[km[0]].splice(parseInt(arg, 10), 1);
        }
        this.toast(b.msg, 'good');
        XIAN.UI.log('〔坊市〕' + b.msg, '');
        this._keepScroll = true; this.render(); this.save();
        return;
      }

      /* —— 图鉴 —— */
      case 'loretab': { this.loreTab = arg; XIAN.UI.renderPanel(); return; }
      case 'hexinfo': { XIAN.UI.openHexInfo(parseInt(arg, 10)); return; }

      default: return;
    }
  }
};

function esc0(s) { return XIAN.esc(s); }

/* ---------------- 引导 ---------------- */
(function boot() {
  function go() {
    try {
      XIAN.G.init();
    } catch (e) {
      document.body.innerHTML =
        '<div style="padding:40px;font-family:serif;color:#e8e0d0;background:#1a1712;min-height:100vh">' +
        '<h2 style="color:#c8342a">载入失败</h2><pre style="white-space:pre-wrap">' +
        String(e && e.stack || e) + '</pre></div>';
      throw e;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else go();
})();
