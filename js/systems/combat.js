/* ============================================================
 *  combat.js — 斗法：回合制、五行生克、护体罡气、神魂之伤
 * ============================================================ */
window.XIAN = window.XIAN || {};
XIAN.Sys = XIAN.Sys || {};

/* 选敌：按境界与地域 */
XIAN.Sys.pickEnemy = function (S, rng, opts) {
  opts = opts || {};
  var all = XIAN.Data.enemies || [];
  var L = XIAN.byId(XIAN.Data.locations, S.loc);
  var pool = [];
  if (L && L.enemies && L.enemies.length && !opts.anywhere) {
    L.enemies.forEach(function (id) {
      var e = XIAN.byId(all, id);
      if (e) pool.push(e);
    });
  }
  if (!pool.length) pool = all.slice();
  var lo = Math.max(0, S.realm - 1), hi = Math.min(8, S.realm + (opts.hard ? 1 : 0));
  var band = pool.filter(function (e) {
    if (opts.boss && !e.boss) return false;
    if (opts.noBoss && e.boss) return false;
    return e.realm >= lo && e.realm <= hi;
  });
  /* 试炼：优先寻魁首 */
  if (opts.hard) {
    var bosses = band.filter(function (e) { return e.boss; });
    if (bosses.length && rng.chance(0.55)) return rng.pick(bosses);
  }
  if (!band.length) band = pool.filter(function (e) { return e.realm <= S.realm; });
  if (!band.length) band = pool;
  /* 同境界权重最高 */
  var weighted = band.map(function (e) {
    var d = Math.abs(e.realm - S.realm);
    return { e: e, weight: (d === 0 ? 10 : (d === 1 ? 4 : 1)) * (e.boss ? (opts.hard ? 1.2 : 0.35) : 1) };
  });
  var pickd = rng.weighted(weighted);
  return pickd ? pickd.e : band[0];
};

/* ------------------------------------------------------------
 * 妖魔属性归一化
 *   图籍中的妖魔数值以 2.0^境界 递增，而修士三宝以 3.4^境界 递增。
 *   若不归一，高境界妖魔将不堪一击。此处按境界表折算，
 *   同时保留图籍原有的个体差异（快而脆 / 慢而硬 / 魁首加成）。
 * ---------------------------------------------------------- */
XIAN.Sys.enemyStats = function (E) {
  var R = XIAN.Data.realms[E.realm] || XIAN.Data.realms[0];
  var r = E.realm;
  var refJing = 110 * Math.pow(2.35, r);
  var refQi = 55 * Math.pow(2.1, r);
  var refShen = 35 * Math.pow(2.1, r);
  var refAtk = 17 * Math.pow(2.0, r);
  var refDef = 9 * Math.pow(2.0, r);
  /* 目标：与同境界「中期」修士相当（stage 1 → ×1.32） */
  var k = 1.32;
  var s = {
    jing: Math.max(1, Math.round(E.jing / refJing * R.jing * k)),
    qi: Math.max(1, Math.round(E.qi / refQi * R.qi * k)),
    shen: Math.max(1, Math.round(E.shen / refShen * R.shen * k)),
    atk: Math.max(1, Math.round(E.atk / refAtk * R.atk * k)),
    def: Math.max(1, Math.round(E.def / refDef * R.def * k)),
    spd: E.spd
  };
  return s;
};

/* 掉落归一化：道行按「一次深修之几成」折算，方不至于早期暴涨、后期如尘 */
XIAN.Sys.enemyDrops = function (S, E) {
  var refDao = 110 * Math.pow(2.6, E.realm);
  var st = XIAN.stats(S);
  var out = [];
  (E.drops || []).forEach(function (d) {
    if (d.k === 'dao') {
      var ratio = d.v / refDao;                        /* 图籍中此敌相对标准值之倍数 */
      var abs = Math.round(XIAN.baseDaoGain(S) * 0.42 * ratio * (E.boss ? 2.6 : 1));
      out.push({ k: 'dao', v: abs, abs: true });
    } else if (d.k === 'stone') {
      out.push({ k: 'stone', v: Math.round(d.v * Math.pow(1.21, E.realm)) });
    } else if (d.k === 'shen') {
      /* 神魂之利，按己身神海折算 */
      out.push({ k: 'shen', v: Math.round(st.maxShen * (d.v / 60) * 0.22) });
    } else {
      out.push(d);
    }
  });
  return out;
};

/* ---------------- 战斗对象 ---------------- */
XIAN.Combat = function (S, enemyDef, rng, opts) {
  this.S = S; this.rng = rng; this.opts = opts || {};
  this.round = 1;
  this.log = [];
  this.over = false;
  this.result = null;
  this.turnLog = [];

  var st = XIAN.stats(S);
  this.player = {
    isPlayer: true,
    name: S.name, hao: S.hao,
    realmName: XIAN.realmName(S.realm, S.stage),
    element: S.root.main,
    jing: S.jing, maxJing: st.maxJing,
    qi: S.qi, maxQi: st.maxQi,
    shen: S.shen, maxShen: st.maxShen,
    atk: st.atk, def: st.def, spd: st.spd, crit: st.crit, pen: st.pen,
    buffs: [], shield: 0, shieldTurns: 0, dots: [], stun: 0,
    reflect: 0, reflectTurns: 0, evade: 0, evadeTurns: 0,
    cds: {}
  };
  var E = enemyDef;
  var ns = XIAN.Sys.enemyStats(E);
  var scale = this.opts.scale || 1;
  this.foe = {
    isPlayer: false,
    name: (E.title ? E.title : '') + E.name,
    baseName: E.name,
    realmName: XIAN.realmName(E.realm, 1),
    realm: E.realm,
    element: E.element,
    kind: E.kind,
    boss: !!E.boss,
    def_: E,
    jing: Math.round(ns.jing * scale), maxJing: Math.round(ns.jing * scale),
    qi: Math.round(ns.qi * scale), maxQi: Math.round(ns.qi * scale),
    shen: Math.round(ns.shen * scale), maxShen: Math.round(ns.shen * scale),
    atk: Math.round(ns.atk * scale), def: Math.round(ns.def * scale),
    spd: ns.spd, crit: E.boss ? 12 : 6, pen: 0,
    buffs: [], shield: 0, shieldTurns: 0, dots: [], stun: 0,
    reflect: 0, reflectTurns: 0, evade: 0, evadeTurns: 0,
    cds: {},
    techs: (E.techs || []).slice(),
    taunt: E.taunt, desc: E.desc
  };
  this.push('div', '「' + this.foe.name + '」' + (E.taunt ? '——' + E.taunt : ''));
  var rel = XIAN.elemRelationText(S.root.main, E.element);
  if (rel) this.push('info', '五行之势：' + rel);
};

XIAN.Combat.prototype.push = function (cls, text) {
  this.log.push({ cls: cls, text: text });
  this.turnLog.push({ cls: cls, text: text });
};

XIAN.Combat.prototype.statOf = function (c, key) {
  var base = c[key] || 0, pct = 0;
  c.buffs.forEach(function (b) { if (b.stat === key) pct += b.pct; });
  return Math.max(key === 'def' ? 0 : 1, base * (1 + pct / 100));
};

XIAN.Combat.prototype.techList = function () {
  var self = this, S = this.S;
  return (S.techs || []).map(function (id) {
    var t = XIAN.byId(XIAN.Data.techniques, id);
    if (!t) return null;
    var cd = self.player.cds[id] || 0;
    /* 境界未足者，虽得其经亦不能行其法 */
    var realmOk = t.realm <= S.realm;
    return {
      t: t,
      usable: realmOk && self.player.qi >= t.cost && cd <= 0,
      cd: cd,
      locked: !realmOk,
      reason: !realmOk ? ('须' + XIAN.Data.realms[t.realm].name)
        : cd > 0 ? ('尚需 ' + cd + ' 回合')
          : (self.player.qi < t.cost ? '真炁不足' : '')
    };
  }).filter(Boolean);
};

/* 计算并施加一次法术 */
XIAN.Combat.prototype.cast = function (src, dst, tech) {
  var rng = this.rng, self = this;
  src.qi = Math.max(0, src.qi - tech.cost);
  if (tech.cd) src.cds[tech.id] = tech.cd + 1;
  var elem = tech.element === 'none' ? src.element : tech.element;
  var em = XIAN.elemMult(elem, dst.element);
  var who = src.isPlayer ? '你' : src.name;
  var tgt = dst.isPlayer ? '你' : dst.name;
  var elCls = 'el-' + (tech.element === 'none' ? 'none' : tech.element);
  this.push(src.isPlayer ? 'me' : 'foe',
    who + '施「<b class="' + elCls + '">' + tech.name + '</b>」' +
    (em > 1.2 ? '<span class="adv">（相克，势盛）</span>' : (em < 0.8 ? '<span class="dis">（被制，势弱）</span>' : '')));

  (tech.effects || []).forEach(function (ef) {
    switch (ef.k) {
      case 'damage': self.hit(src, dst, ef.mult, elem, em); break;
      case 'multihit':
        for (var i = 0; i < (ef.hits || 2); i++) {
          if (dst.jing <= 0) break;
          self.hit(src, dst, ef.mult, elem, em, i + 1);
        }
        break;
      case 'shield':
        var sh = Math.round(self.statOf(src, 'atk') * ef.mult * 1.5);
        src.shield += sh; src.shieldTurns = Math.max(src.shieldTurns, ef.turns || 2);
        self.push('info', who + '身外凝罡气 ' + XIAN.num(sh));
        break;
      case 'heal':
        var hl = Math.round(self.statOf(src, 'atk') * ef.mult * 1.7);
        src.jing = XIAN.clamp(src.jing + hl, 0, src.maxJing);
        self.push('good', who + '精元回复 ' + XIAN.num(hl));
        break;
      case 'buff':
        src.buffs.push({ stat: ef.stat, pct: ef.pct, turns: (ef.turns || 2) + 1, up: true });
        self.push('good', who + (ef.stat === 'atk' ? '法力大盛' : ef.stat === 'def' ? '护体愈坚' : ef.stat === 'spd' ? '身法转疾' : '机变愈灵') + ' +' + ef.pct + '%');
        break;
      case 'debuff':
        if (dst.boss && rng.chance(0.3)) { self.push('info', tgt + '气机雄浑，不受所制'); break; }
        dst.buffs.push({ stat: ef.stat, pct: -ef.pct, turns: (ef.turns || 2) + 1, up: false });
        self.push('info', tgt + (ef.stat === 'atk' ? '法力受挫' : ef.stat === 'def' ? '护体生隙' : '身法迟滞') + ' -' + ef.pct + '%');
        break;
      case 'dot':
        dst.dots.push({ mult: ef.mult, turns: (ef.turns || 3) + 1, elem: elem, atk: self.statOf(src, 'atk'), em: em });
        self.push('info', tgt + '为' + (XIAN.Data.elements[elem] ? XIAN.Data.elements[elem].name : '') + '气所侵，创伤不止');
        break;
      case 'stun':
        if (dst.boss && rng.chance(0.45)) { self.push('info', tgt + '心念如渊，未能定住'); break; }
        if (rng.chance(ef.chance || 0.3)) {
          dst.stun = Math.max(dst.stun, ef.turns || 1);
          self.push('good', tgt + '为法所定，' + (ef.turns || 1) + ' 回合不得动');
        } else self.push('dim', tgt + '挣脱束缚');
        break;
      case 'drain':
        var d = self.hit(src, dst, ef.mult, elem, em);
        var back = Math.round(d * (ef.pct || 50) / 100);
        src.jing = XIAN.clamp(src.jing + back, 0, src.maxJing);
        self.push('good', who + '夺其精元 ' + XIAN.num(back));
        break;
      case 'qiburn':
        var qb = Math.round((ef.amount || 20) * (1 + (src.realm !== undefined ? src.realm : self.S.realm) * 0.9));
        dst.qi = Math.max(0, dst.qi - qb);
        self.push('info', tgt + '真炁被灼 ' + XIAN.num(qb));
        break;
      case 'restoreQi':
        var rq = Math.round((ef.amount || 20) * (1 + (src.isPlayer ? self.S.realm : src.realm) * 0.9));
        src.qi = XIAN.clamp(src.qi + rq, 0, src.maxQi);
        self.push('good', who + '真炁回复 ' + XIAN.num(rq));
        break;
      case 'cleanse':
        var n = src.buffs.filter(function (b) { return !b.up; }).length + src.dots.length;
        src.buffs = src.buffs.filter(function (b) { return b.up; });
        src.dots = [];
        self.push('good', who + '涤除玄览，去秽 ' + n + ' 处');
        break;
      case 'purge':
        var m = dst.buffs.filter(function (b) { return b.up; }).length;
        dst.buffs = dst.buffs.filter(function (b) { return !b.up; });
        self.push('good', '破其增益 ' + m + ' 重');
        break;
      case 'reflect':
        src.reflect = ef.pct; src.reflectTurns = (ef.turns || 2) + 1;
        self.push('good', who + '立返照之势，' + ef.pct + '% 加害者自受');
        break;
      case 'evade':
        src.evade = ef.chance; src.evadeTurns = (ef.turns || 1) + 1;
        self.push('good', who + '形若无物，难以捉摸');
        break;
      case 'execute':
        var low = dst.jing / dst.maxJing <= (ef.hpBelow || 0.3);
        self.hit(src, dst, low ? ef.mult : ef.mult * 0.45, elem, em, 0, low);
        break;
      case 'soul':
        var sd = Math.round(self.statOf(src, 'atk') * ef.mult * em * rng.float(0.9, 1.1) * 0.55);
        dst.shen = Math.max(0, dst.shen - sd);
        self.push(src.isPlayer ? 'me' : 'foe', tgt + '<b class="soul">神魂受创</b> ' + XIAN.num(sd));
        if (dst.shen <= 0) {
          self.push('crit', tgt + '神魂溃散！');
          dst.jing = Math.min(dst.jing, Math.round(dst.maxJing * 0.12));
          dst.buffs.push({ stat: 'def', pct: -40, turns: 99, up: false });
        }
        break;
      case 'insta':
        if (!dst.boss && rng.chance(ef.chance || 0.05)) {
          self.push('crit', '天机一线——' + tgt + '形神俱灭！');
          dst.jing = 0;
        } else {
          self.hit(src, dst, 0.8, elem, em);
        }
        break;
      default: break;
    }
  });
};

/* 单次伤害 */
XIAN.Combat.prototype.hit = function (src, dst, mult, elem, em, seq, isExec) {
  var rng = this.rng;
  if (dst.evadeTurns > 0 && rng.chance(dst.evade)) {
    this.push('dim', (dst.isPlayer ? '你' : dst.name) + '身形一转，此击落空');
    return 0;
  }
  var atk = this.statOf(src, 'atk');
  var def = this.statOf(dst, 'def');
  var raw = atk * mult * em;
  var mitig = def / (def + atk * 1.6);
  var dmg = raw * (1 - mitig * 0.78) * rng.float(0.92, 1.08);
  var crit = rng.int(1, 100) <= this.statOf(src, 'crit');
  if (crit) dmg *= 1.85;
  dmg = Math.max(1, Math.round(dmg));

  /* 护体罡气 */
  var absorbed = 0;
  if (dst.shield > 0) {
    absorbed = Math.min(dst.shield, dmg);
    dst.shield -= absorbed;
    dmg -= absorbed;
  }
  dst.jing = Math.max(0, dst.jing - dmg);

  var tgt = dst.isPlayer ? '你' : dst.name;
  var txt = tgt + ' 精元 <b class="dmg">-' + XIAN.num(dmg) + '</b>';
  if (absorbed) txt += '<span class="dim">（罡气挡下 ' + XIAN.num(absorbed) + '）</span>';
  if (crit) txt = '<b class="crit">暴击！</b>' + txt;
  if (isExec) txt = '<b class="crit">断魂一击！</b>' + txt;
  if (seq) txt = '第' + XIAN.han(seq) + '击：' + txt;
  this.push(src.isPlayer ? 'me' : 'foe', txt);

  /* 反照 */
  if (dst.reflectTurns > 0 && dst.reflect > 0 && dmg > 0) {
    var rf = Math.round(dmg * dst.reflect / 100);
    src.jing = Math.max(0, src.jing - rf);
    this.push('info', (src.isPlayer ? '你' : src.name) + '为返照所伤 ' + XIAN.num(rf));
  }
  return dmg;
};

/* 回合末：持续伤害、状态倒计时 */
XIAN.Combat.prototype.tick = function (c) {
  var self = this;
  var total = 0;
  c.dots.forEach(function (d) {
    if (d.turns <= 0) return;
    var dmg = Math.max(1, Math.round(d.atk * d.mult * d.em * 0.62));
    c.jing = Math.max(0, c.jing - dmg);
    total += dmg;
    d.turns--;
  });
  c.dots = c.dots.filter(function (d) { return d.turns > 0; });
  if (total > 0) this.push('info', (c.isPlayer ? '你' : c.name) + '余毒发作 -' + XIAN.num(total));
  c.buffs.forEach(function (b) { b.turns--; });
  c.buffs = c.buffs.filter(function (b) { return b.turns > 0; });
  if (c.shieldTurns > 0) { c.shieldTurns--; if (c.shieldTurns <= 0) c.shield = 0; }
  if (c.reflectTurns > 0) { c.reflectTurns--; if (c.reflectTurns <= 0) c.reflect = 0; }
  if (c.evadeTurns > 0) { c.evadeTurns--; if (c.evadeTurns <= 0) c.evade = 0; }
  for (var k in c.cds) { if (c.cds[k] > 0) c.cds[k]--; }
  /* 妖魔回炁 */
  if (!c.isPlayer) c.qi = XIAN.clamp(c.qi + c.maxQi * 0.16, 0, c.maxQi);
  else c.qi = XIAN.clamp(c.qi + c.maxQi * 0.05, 0, c.maxQi);
};

/* 妖魔行动 AI */
XIAN.Combat.prototype.foeAct = function () {
  var f = this.foe, rng = this.rng, self = this;
  if (f.stun > 0) { f.stun--; this.push('dim', f.name + '为法所制，动弹不得'); return; }
  var opts = f.techs.map(function (id) { return XIAN.byId(XIAN.Data.techniques, id); })
    .filter(function (t) { return t && f.qi >= t.cost && !(f.cds[t.id] > 0); });
  if (!opts.length) {
    var d = Math.max(1, Math.round(this.statOf(f, 'atk') * 0.65 * (1 - this.statOf(this.player, 'def') / (this.statOf(this.player, 'def') + this.statOf(f, 'atk') * 1.6) * 0.78)));
    this.player.jing = Math.max(0, this.player.jing - d);
    this.push('foe', f.name + '力竭，以爪牙扑击　你 精元 <b class="dmg">-' + XIAN.num(d) + '</b>');
    return;
  }
  var lowHp = f.jing / f.maxJing < 0.35;
  var scored = opts.map(function (t) {
    var w = 10;
    var hasHeal = (t.effects || []).some(function (e) { return e.k === 'heal' || e.k === 'drain'; });
    var hasGuard = (t.effects || []).some(function (e) { return e.k === 'shield' || (e.k === 'buff' && e.stat === 'def'); });
    var hasDmg = (t.effects || []).some(function (e) { return e.k === 'damage' || e.k === 'multihit' || e.k === 'execute'; });
    if (lowHp && (hasHeal || hasGuard)) w += 40;
    if (!lowHp && hasDmg) w += 18;
    if (self.player.jing / self.player.maxJing < 0.3 && hasDmg) w += 22;
    w += t.tier * 4;
    if (XIAN.elemMult(t.element === 'none' ? f.element : t.element, self.player.element) > 1.2) w += 14;
    return { t: t, weight: w };
  });
  var pickd = rng.weighted(scored);
  this.cast(f, this.player, pickd.t);
};

/* 玩家行动 → 推进一整回合 */
XIAN.Combat.prototype.playerTurn = function (action) {
  if (this.over) return { over: true };
  this.turnLog = [];
  var p = this.player, f = this.foe, rng = this.rng;
  this.push('round', '── 第' + XIAN.han(this.round) + '回合 ──');

  var playerFirst = this.statOf(p, 'spd') >= this.statOf(f, 'spd')
    ? true : rng.chance(0.25);

  var acts = [];
  var self = this;
  function doPlayer() {
    if (p.stun > 0) { p.stun--; self.push('dim', '你为法所制，未能出手'); return; }
    if (action.type === 'tech') {
      var t = XIAN.byId(XIAN.Data.techniques, action.id);
      if (!t) return;
      if (t.realm > self.S.realm) { self.push('dim', '境界未足，此法运转不起'); return; }
      if (p.qi < t.cost) { self.push('dim', '真炁不足，法术未成'); return; }
      self.cast(p, f, t);
    } else if (action.type === 'guard') {
      var sh = Math.round(self.statOf(p, 'atk') * 1.2);
      p.shield += sh; p.shieldTurns = Math.max(p.shieldTurns, 2);
      p.qi = XIAN.clamp(p.qi + p.maxQi * 0.16, 0, p.maxQi);
      p.buffs.push({ stat: 'def', pct: 35, turns: 2, up: true });
      self.push('good', '你守气不发，凝罡气 ' + XIAN.num(sh) + '，真炁略复');
    } else if (action.type === 'pill') {
      var r = XIAN.Sys.takePill(self.S, action.id, rng);
      if (r.ok) {
        var st = XIAN.stats(self.S);
        p.maxJing = st.maxJing; p.maxQi = st.maxQi; p.maxShen = st.maxShen;
        p.jing = XIAN.clamp(self.S.jing, 0, p.maxJing);
        p.qi = XIAN.clamp(self.S.qi, 0, p.maxQi);
        p.shen = XIAN.clamp(self.S.shen, 0, p.maxShen);
        self.push('good', '你服下「' + r.pill.name + '」　' + r.lines.join('　'));
      } else self.push('dim', r.reason);
    } else if (action.type === 'wuwei') {
      /* 无为：不攻不守，静观其变 —— 回炁大、道心增、有几率使敌自乱 */
      p.qi = XIAN.clamp(p.qi + p.maxQi * 0.30, 0, p.maxQi);
      p.shen = XIAN.clamp(p.shen + p.maxShen * 0.12, 0, p.maxShen);
      self.push('good', '你收摄心念，任其自来。真炁自复。');
      if (rng.chance(0.30)) {
        f.buffs.push({ stat: 'atk', pct: -22, turns: 3, up: false });
        self.push('info', f.name + '寻不着你的气机，攻势自乱');
      }
    }
  }
  function doFoe() {
    if (f.jing <= 0) return;
    self.foeAct();
  }

  if (action.type === 'flee') {
    var chance = XIAN.clamp(0.34 + (this.statOf(p, 'spd') - this.statOf(f, 'spd')) * 0.03, 0.1, 0.9);
    if (rng.chance(chance)) {
      this.over = true;
      this.result = { win: false, fled: true };
      this.push('dim', '你遁光一闪，脱出重围。此番虽保性命，然名望有损。');
      this.sync();
      return { over: true, result: this.result, beats: this.turnLog };
    }
    this.push('dim', '遁法未成，反落下空门！');
    doFoe(); doFoe();
  } else {
    if (playerFirst) { doPlayer(); doFoe(); }
    else { doFoe(); doPlayer(); }
  }

  /* 极速者追击 */
  if (!this.over && f.jing > 0 && p.jing > 0) {
    if (this.statOf(p, 'spd') > this.statOf(f, 'spd') * 1.6 && rng.chance(0.35)) {
      this.push('good', '你身法太疾，再进一击！');
      doPlayer();
    } else if (this.statOf(f, 'spd') > this.statOf(p, 'spd') * 1.6 && rng.chance(0.30)) {
      this.push('foe', f.name + '快如鬼魅，又是一击！');
      doFoe();
    }
  }

  this.tick(p); this.tick(f);
  this.round++;
  this.sync();

  if (f.jing <= 0) { this.finish(true); }
  else if (p.jing <= 0) { this.finish(false); }
  else if (this.round > 40) {
    this.over = true;
    this.result = { win: false, draw: true };
    this.push('dim', '斗至日暮，两下罢手。');
  }
  return { over: this.over, result: this.result, beats: this.turnLog };
};

XIAN.Combat.prototype.sync = function () {
  this.S.jing = Math.round(XIAN.clamp(this.player.jing, 0, this.player.maxJing));
  this.S.qi = Math.round(XIAN.clamp(this.player.qi, 0, this.player.maxQi));
  this.S.shen = Math.round(XIAN.clamp(this.player.shen, 0, this.player.maxShen));
};

XIAN.Combat.prototype.finish = function (win) {
  this.over = true;
  var S = this.S, rng = this.rng, E = this.foe.def_;
  var res = { win: win, rewards: [], lines: [] };
  S.stats.battles++;
  if (win) {
    S.stats.wins++; S.stats.kills++;
    if (this.foe.boss) S.stats.bosses++;
    this.push('crit', this.foe.name + '气息断绝。');
    var drops = XIAN.Sys.enemyDrops(S, E);
    var r = XIAN.applyEffects(S, drops, rng, { noScale: true });
    res.lines = r.lines;
    /* 因果：斩妖魔得功德，杀修士积业障 */
    if (E.kind === 'human') {
      var k = 8 + E.realm * 3;
      S.karma += k;
      res.lines.push('<em class="e-bad">业障 +' + k + '（同道相残，天理难容）</em>');
      S.daoxin = XIAN.clamp(S.daoxin - 3, 0, 100);
    } else if (E.kind === 'demon' || E.kind === 'ghost') {
      var mt = 4 + E.realm * 2;
      S.merit += mt;
      res.lines.push('<em class="e-good">功德 +' + mt + '（除魔卫道）</em>');
    }
    S.balance = XIAN.clamp(S.balance + 2, -100, 100);
    S.haste = XIAN.clamp(S.haste + 4, 0, 100);
  } else {
    this.push('crit', '你精元枯竭，眼前一黑。');
    /* 战败：重伤而不必死 —— 除非精尽且无护身 */
    var st = XIAN.stats(S);
    S.jing = Math.max(1, Math.round(st.maxJing * 0.08));
    S.daoxin = XIAN.clamp(S.daoxin - rng.int(6, 14), 0, 100);
    var lostDao = Math.round(S.dao * rng.float(0.06, 0.16));
    S.dao = Math.max(0, S.dao - lostDao);
    var lostStone = Math.round(S.stone * 0.3);
    S.stone -= lostStone;
    S.repute = Math.max(0, S.repute - 5);
    res.lines.push('<em class="e-bad">道行 -' + XIAN.num(lostDao) + '　灵石 -' + XIAN.num(lostStone) + '　道心受损</em>');
    if (this.foe.boss || E.realm > S.realm) {
      var life = Math.round(XIAN.Data.realms[S.realm].lifespan * 0.04);
      S.bonus.lifespan -= life; XIAN.recalcLifespan(S);
      res.lines.push('<em class="e-bad">重伤折寿 -' + life + '载</em>');
    }
    /* 若境界远低于敌，且道心崩坏，则身死 */
    if (E.realm >= S.realm + 2 && rng.chance(0.5)) {
      S.dead = true; S.causeOfDeath = '死于' + this.foe.name + '之手';
      res.death = true;
      this.push('crit', '——那一击之后，再无一击。');
    }
  }
  this.result = res;
  /* 斗法耗时 */
  XIAN.Sys.advanceTime(S, Math.max(2, Math.round(XIAN.Data.realms[S.realm].days * 0.25)), { regenJing: 0.02, regenQi: 0.08, regenShen: 0.04 });
  return res;
};
