/* ============================================================
 *  ui-modals.js — 开局、奇遇、斗法、天劫、丹炉、结局
 * ============================================================ */
window.XIAN = window.XIAN || {};
XIAN.UI = XIAN.UI || {};

(function (U) {
  var $ = XIAN.$, $$ = XIAN.$$, esc = XIAN.esc, num = XIAN.num;
  var ELN = function (k) { var e = XIAN.Data.elements[k]; return e ? e.name : '玄'; };

  /* ============================================================
   * 一、开局：抽灵根定命格
   * ========================================================== */
  U.openIntro = function () {
    var lg = XIAN.loadLegacy();
    var rolls = 3 + Math.min(4, Math.floor((lg.lives || 0) / 2));
    var draft = null;

    function roll() {
      draft = XIAN.newGame({});
      rolls--;
      paint();
    }

    function affBars(S) {
      return '<div class="aff-bars">' + XIAN.Data.elementOrder.map(function (k) {
        var E = XIAN.Data.elements[k], v = S.aff[k];
        return '<div class="aff-row"><span class="g el-' + k + '">' + E.name + '</span>' +
          '<span class="tr"><span class="fl" style="width:' + Math.min(100, v / 1.2) + '%;background:linear-gradient(90deg,' + E.deep + ',' + E.color + ')"></span></span>' +
          '<span class="vv">' + Math.round(v) + '</span></div>';
      }).join('') + '</div>';
    }

    function paint() {
      var S = draft;
      var st = XIAN.stats(S);
      var body =
        '<div class="intro-shell">' +
        '<div class="game-title">太乙玄门</div>' +
        '<div class="game-sub">修 仙 模 拟 器</div>' +
        '<div class="brush-hr"></div>' +
        '<div class="intro-verse">道生一，一生二，二生三，三生万物。<br>' +
        '万物负阴而抱阳，冲气以为和。</div>' +
        '</div>' +
        '<div class="root-card">' +
        '<div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap">' +
        '<span class="root-name">' + S.root.name + '</span>' +
        '<span class="root-grade">' + S.root.grade + '品 · ' + S.root.title + '</span>' +
        '<span class="chip">进境 ×' + S.root.speed.toFixed(2) + '</span>' +
        '<span class="chip">主' + ELN(S.root.main) + '气</span>' +
        '</div>' +
        '<div class="root-desc">' + esc(S.root.desc) + '</div>' +
        affBars(S) +
        '</div>' +
        '<div class="root-card" style="margin-top:8px">' +
        '<div style="display:flex;align-items:baseline;gap:10px">' +
        '<span style="font-size:17px;letter-spacing:.16em;color:' + (S.fate.good === false ? '#8f2d1d' : S.fate.good ? '#3f7a52' : '#4a453c') + '">' + S.fate.name + '</span>' +
        '<span class="tiny dim">命格</span></div>' +
        '<div class="root-desc">' + esc(S.fate.desc) + '</div>' +
        '</div>' +
        '<div class="metrics" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(110px,1fr))">' +
        mm('姓　名', '<input id="inName" value="' + esc(S.name) + '" style="width:6em;background:transparent;border:0;border-bottom:1px solid var(--line-2);text-align:right;color:var(--zhu)">') +
        mm('道　号', esc(S.hao)) +
        mm('性　别', esc(S.gender)) +
        mm('悟　性', num(st.insight)) +
        mm('道　心', Math.round(S.daoxin)) +
        mm('寿　元', num(S.lifespan) + ' 载') +
        mm('灵　石', num(S.stone)) +
        mm('起手法术', S.techs.length + ' 门') +
        '</div>' +
        (S.balance !== 0 ? '<div class="note ' + (Math.abs(S.balance) > 20 ? 'warn' : '') + '" style="margin-top:8px">生而阴阳有偏：' +
          (S.balance > 0 ? '偏阳 +' + S.balance : '偏阴 ' + S.balance) + '。此为天赋，亦为隐患。</div>' : '') +
        (lg.lives ? '<div class="note dao" style="margin-top:8px">宿世所积：悟性 +' + (lg.insight || 0) +
          '　灵石 +' + num(lg.stone || 0) + '　寿元 +' + (lg.lifespan || 0) + ' 载　道心 +' + (lg.daoxin || 0) +
          (lg.memoryTech ? '　宿慧《' + esc((XIAN.byId(XIAN.Data.techniques, lg.memoryTech) || {}).name || '') + '》' : '') +
          '</div>' : '') +
        '<div class="tiny dim center" style="margin-top:8px">尚可重投 <b>' + Math.max(0, rolls) + '</b> 次。灵根不可选，此谓「命」；然如何用之，此谓「运」。</div>';

      var m = U.modal({
        title: '投　胎', sub: '第 ' + XIAN.han((lg.lives || 0) + 1) + ' 世',
        closable: false, cls: '',
        body: body,
        foot:
          '<button class="btn" id="btnLives">前世碑铭</button>' +
          '<button class="btn" id="btnHelp2">玄门要旨</button>' +
          (XIAN.hasSave() ? '<button class="btn" id="btnCont">续　前　缘</button>' : '') +
          '<button class="btn ink" id="btnReroll" ' + (rolls <= 0 ? 'disabled' : '') + '>重　投（' + Math.max(0, rolls) + '）</button>' +
          '<button class="btn zhu" id="btnGo">入　世</button>'
      });
      XIAN.on(m.querySelector('#btnReroll'), 'click', roll);
      XIAN.on(m.querySelector('#btnLives'), 'click', function () { U.openLives(); });
      XIAN.on(m.querySelector('#btnHelp2'), 'click', function () { U.openHelp(); });
      var cb = m.querySelector('#btnCont');
      if (cb) XIAN.on(cb, 'click', function () {
        var L = XIAN.load();
        if (!L) return XIAN.G.toast('未见存档', 'bad');
        U.closeModal(); XIAN.G.adopt(L);
      });
      XIAN.on(m.querySelector('#btnGo'), 'click', function () {
        var nm = (m.querySelector('#inName').value || '').trim();
        if (nm) draft.name = nm.slice(0, 8);
        U.closeModal();
        XIAN.G.begin(draft);
      });
    }
    function mm(k, v) { return '<div class="metric"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; }
    roll();
  };

  /* ============================================================
   * 二、奇遇
   * ========================================================== */
  U.openEvent = function (ev, onDone) {
    var S = XIAN.G.S;
    var TAG = { chance: '机缘', karma: '因果', danger: '凶险', dao: '悟道', people: '人情', relic: '遗宝', demon: '妖魔' };
    var choices = (ev.choices || []).map(function (ch, i) {
      var costTxt = [];
      var c = ch.cost || {};
      var blocked = '';
      if (c.stone) { costTxt.push('灵石 ' + num(c.stone)); if (S.stone < c.stone) blocked = '灵石不足'; }
      if (c.qi) { var q = Math.round(c.qi * (1 + S.realm * 1.1)); costTxt.push('炁 ' + num(q)); if (S.qi < q) blocked = '真炁不足'; }
      if (c.jing) { var j = Math.round(c.jing * (1 + S.realm * 1.1)); costTxt.push('精 ' + num(j)); if (S.jing <= j) blocked = '精元不足'; }
      if (c.shen) { var sh = Math.round(c.shen * (1 + S.realm * 1.1)); costTxt.push('神 ' + num(sh)); if (S.shen < sh) blocked = '神魂不足'; }
      if (c.days) costTxt.push('耗时 ' + c.days + ' 日');
      var odds = '';
      if (ch.check) {
        var p = XIAN.Sys.checkOdds(S, ch.check);
        var cls = p >= 0.7 ? 'g' : p >= 0.4 ? 'y' : 'r';
        odds = '<span class="od ' + cls + '">〔' + XIAN.Sys.statLabel[ch.check.stat] + ' ' + XIAN.Sys.oddsText(p) + '〕</span>';
      }
      return '<button class="choice" ' + (blocked ? 'disabled' : '') + ' data-i="' + i + '">' +
        '<div class="lb">' + esc(ch.label) + odds + '</div>' +
        (ch.hint || costTxt.length || blocked
          ? '<div class="hn">' + (ch.hint ? esc(ch.hint) : '') +
          (costTxt.length ? '　<span class="e-bad">代价：' + costTxt.join('，') + '</span>' : '') +
          (blocked ? '　<span class="e-bad">（' + blocked + '）</span>' : '') + '</div>'
          : '') +
        '</button>';
    }).join('');

    var m = U.modal({
      title: ev.title, sub: TAG[ev.tag] || '',
      closable: false,
      body: '<div class="ev-text">' + esc(ev.text).replace(/\n/g, '<br>') + '</div>' +
        '<div class="choices">' + choices + '</div>'
    });
    $$('.choice', m).forEach(function (b) {
      XIAN.on(b, 'click', function () {
        if (b.hasAttribute('disabled')) return;
        var i = parseInt(b.getAttribute('data-i'), 10);
        var r = XIAN.Sys.resolveChoice(S, ev, i, XIAN.G.rng);
        if (!r || !r.ok) { XIAN.G.toast((r && r.reason) || '不可行', 'bad'); return; }
        showResult(ev, r, onDone);
      });
    });
  };

  function showResult(ev, r, onDone) {
    var S = XIAN.G.S;
    var chk = '';
    if (r.check) {
      chk = '<div class="note ' + (r.check.pass ? 'dao' : 'warn') + '" style="margin:0 0 8px">' +
        '检定 · ' + XIAN.Sys.statLabel[r.check.stat] + '　' +
        r.check.value + ' + 天数 ' + r.check.roll + ' = <b>' + (Math.round((r.check.value + r.check.roll) * 10) / 10) + '</b>' +
        '　须 ' + r.check.dc + '　→　<b>' + (r.check.pass ? '成' : '不成') + '</b></div>';
    }
    var m = U.modal({
      title: ev.title, sub: r.check ? (r.check.pass ? '如　愿' : '不　遂') : '因　果',
      closable: false,
      body: chk +
        '<div class="ev-text result">' + esc(r.text).replace(/\n/g, '<br>') + '</div>' +
        (r.lines.length ? '<div class="brush-hr"></div><div style="font-size:13.5px;line-height:2">' + r.lines.join('　') + '</div>' : '') +
        (r.pending && r.pending.combat ? '<div class="note warn" style="margin-top:8px">杀气已起——须得一战。</div>' : ''),
      foot: '<button class="btn zhu" id="evOk">' + (r.pending && r.pending.combat ? '迎　战' : '如　是') + '</button>'
    });
    /* 写入纪事 */
    XIAN.G.chronicle('遇「' + ev.title + '」');
    XIAN.UI.log('〔' + ev.title + '〕' + esc(r.text), 'story');
    if (r.lines.length) XIAN.UI.log(r.lines.join('　'), '');

    XIAN.on(m.querySelector('#evOk'), 'click', function () {
      U.closeModal();
      if (r.pending && r.pending.combat) {
        var foe = XIAN.Sys.pickEnemy(S, XIAN.G.rng, {});
        U.openCombat(foe, function () { if (onDone) onDone(); XIAN.G.render(); });
      } else {
        if (onDone) onDone();
        XIAN.G.render();
      }
    });
  }

  /* ============================================================
   * 三、斗法
   * ========================================================== */
  U.openCombat = function (enemyDef, onDone) {
    var S = XIAN.G.S;
    S.flags['met_' + enemyDef.id] = true;
    var cb = new XIAN.Combat(S, enemyDef, XIAN.G.rng, {});
    XIAN.G.combat = cb;

    function bar(cls, glyph, v, max) {
      return '<div class="bar-row ' + cls + ' cb-mini"><div class="bar-top">' +
        '<span class="bar-glyph">' + glyph + '</span>' +
        '<span class="bar-val">' + num(Math.max(0, Math.floor(v))) + ' / ' + num(Math.round(max)) + '</span></div>' +
        '<div class="bar-track thin"><div class="bar-fill" style="width:' + XIAN.pct(v, max) + '%"></div></div></div>';
    }
    function buffs(c) {
      var out = [];
      c.buffs.forEach(function (b) {
        var nm = { atk: '法力', def: '护体', spd: '身法', crit: '机变', pen: '穿透' }[b.stat] || b.stat;
        out.push('<span class="cb-buff ' + (b.up ? 'up' : 'dn') + '">' + nm + ' ' + (b.pct > 0 ? '+' : '') + b.pct + '%</span>');
      });
      if (c.shield > 0) out.push('<span class="cb-buff sh">罡气 ' + num(Math.round(c.shield)) + '</span>');
      if (c.dots.length) out.push('<span class="cb-buff dn">余毒 ×' + c.dots.length + '</span>');
      if (c.stun > 0) out.push('<span class="cb-buff dn">被定 ' + c.stun + '</span>');
      if (c.reflectTurns > 0) out.push('<span class="cb-buff up">返照 ' + c.reflect + '%</span>');
      if (c.evadeTurns > 0) out.push('<span class="cb-buff up">虚形</span>');
      return out.join('');
    }

    function paint(beats) {
      var p = cb.player, f = cb.foe;
      var techs = cb.techList();
      var pills = Object.keys(S.pills || {}).filter(function (k) { return S.pills[k] > 0; });
      var rel = XIAN.elemRelationText(p.element, f.element);
      var relCls = XIAN.elemMult(p.element, f.element) > 1.1 ? 'adv' : (XIAN.elemMult(p.element, f.element) < 0.8 ? 'dis' : '');
      var body =
        '<div class="cb-arena">' +
        '<div class="cb-side">' +
        '<div class="cb-name">' + esc(p.hao) + '</div>' +
        '<div class="cb-sub">' + p.realmName + ' · ' + ELN(p.element) + '气</div>' +
        '<div class="cb-portrait"><canvas id="cbP"></canvas>' +
        '<div class="pl">' + esc(p.hao) + '</div></div>' +
        bar('bar-jing', '精', p.jing, p.maxJing) +
        bar('bar-qi', '炁', p.qi, p.maxQi) +
        bar('bar-shen', '神', p.shen, p.maxShen) +
        '<div class="cb-buffs">' + buffs(p) + '</div>' +
        '</div>' +
        '<div class="cb-vs-wrap">' +
        '<div class="cb-vs">斗<br>法</div>' +
        (rel ? '<div class="cb-elem-rel ' + relCls + '">' + rel + '</div>' : '') +
        '</div>' +
        '<div class="cb-side foe">' +
        '<div class="cb-name">' + esc(f.name) + (f.boss ? ' <span class="seal" style="font-size:10px">魁</span>' : '') + '</div>' +
        '<div class="cb-sub">' + f.realmName + ' · ' + ELN(f.element) + '气</div>' +
        '<div class="cb-portrait foe"><canvas id="cbF"></canvas>' +
        '<div class="pl">' + esc(f.name) + '</div></div>' +
        bar('bar-jing', '精', f.jing, f.maxJing) +
        bar('bar-qi', '炁', f.qi, f.maxQi) +
        bar('bar-shen', '神', f.shen, f.maxShen) +
        '<div class="cb-buffs">' + buffs(f) + '</div>' +
        '</div></div>' +
        '<div class="cb-log" id="cbLog">' + cb.log.map(function (l) {
          return '<div class="' + l.cls + '">' + l.text + '</div>';
        }).join('') + '</div>' +
        (cb.over ? '' :
          '<div class="cb-techs">' + techs.map(function (t) {
            return '<button class="tech-btn' + (t.locked ? ' locked' : '') + '" ' + (t.usable ? '' : 'disabled') +
              ' data-tech="' + t.t.id + '" title="' + esc(t.t.desc) + '">' +
              '<div class="tn">' + esc(t.t.name) + '<span class="el el-' + t.t.element + '">' + ELN(t.t.element) + '</span></div>' +
              '<div class="tc">' + (t.locked
                ? '<span class="cd">' + esc(t.reason) + '</span>'
                : '<span class="cst">炁 ' + t.t.cost + '</span>' +
                (t.cd > 0 ? '<span class="cd">冷 ' + t.cd + '</span>' : '') +
                '<span class="dim">' + effBrief(t.t) + '</span>') +
              '</div></button>';
          }).join('') + '</div>' +
          '<div class="btn-row" style="margin-top:8px">' +
          '<button class="btn" data-cb="guard">守　气（凝罡气 · 回炁）</button>' +
          '<button class="btn ink" data-cb="wuwei">无　为（大回炁 · 或使敌自乱）</button>' +
          (pills.length ? '<button class="btn" data-cb="pill">服　丹</button>' : '') +
          '<button class="btn" data-cb="flee">遁　走</button>' +
          '</div>');

      var m = U.modal({
        title: '斗　法', sub: '第' + XIAN.han(cb.round) + '回合' + (f.boss ? ' · 魁首之战' : ''),
        cls: 'wide', closable: false,
        body: body,
        foot: cb.over ? '<button class="btn zhu" id="cbEnd">' + (cb.result && cb.result.win ? '收　功' : '罢　手') + '</button>' : ''
      });
      var lg = m.querySelector('#cbLog');
      if (lg) lg.scrollTop = lg.scrollHeight;

      /* 双方立绘 */
      var pv = m.querySelector('#cbP'), fv = m.querySelector('#cbF');
      if (pv) XIAN.Avatar.mount(pv, function () {
        return XIAN.Avatar.describePlayer(S, { pose: 'stand', hpRatio: cb.player.maxJing ? cb.player.jing / cb.player.maxJing : 1 });
      });
      if (fv) XIAN.Avatar.mount(fv, function () {
        return XIAN.Avatar.describeEnemy(enemyDef, { hpRatio: cb.foe.maxJing ? cb.foe.jing / cb.foe.maxJing : 1 });
      });

      $$('[data-tech]', m).forEach(function (b) {
        XIAN.on(b, 'click', function () {
          if (b.hasAttribute('disabled')) return;
          step({ type: 'tech', id: b.getAttribute('data-tech') });
        });
      });
      $$('[data-cb]', m).forEach(function (b) {
        XIAN.on(b, 'click', function () {
          var k = b.getAttribute('data-cb');
          if (k === 'pill') return pillPick();
          step({ type: k });
        });
      });
      var endB = m.querySelector('#cbEnd');
      if (endB) XIAN.on(endB, 'click', function () { finish(); });
    }

    function effBrief(t) {
      var o = [];
      (t.effects || []).forEach(function (e) {
        if (e.k === 'damage') o.push('伤×' + e.mult);
        else if (e.k === 'multihit') o.push(e.hits + '段×' + e.mult);
        else if (e.k === 'shield') o.push('罡');
        else if (e.k === 'heal') o.push('疗');
        else if (e.k === 'buff') o.push('增');
        else if (e.k === 'debuff') o.push('削');
        else if (e.k === 'dot') o.push('续伤');
        else if (e.k === 'stun') o.push('定');
        else if (e.k === 'drain') o.push('吸');
        else if (e.k === 'soul') o.push('神伤');
        else if (e.k === 'execute') o.push('斩');
        else if (e.k === 'reflect') o.push('返照');
        else if (e.k === 'evade') o.push('虚形');
        else if (e.k === 'cleanse') o.push('涤');
        else if (e.k === 'purge') o.push('破增');
        else if (e.k === 'restoreQi') o.push('回炁');
        else if (e.k === 'qiburn') o.push('灼炁');
        else if (e.k === 'insta') o.push('即杀');
      });
      return o.join('·');
    }

    function pillPick() {
      var keys = Object.keys(S.pills || {}).filter(function (k) { return S.pills[k] > 0; });
      var m = U.modal({
        title: '服　丹', cls: 'narrow',
        body: '<div class="list">' + keys.map(function (k) {
          var pp = XIAN.Sys.pillParse(k);
          var p = XIAN.byId(XIAN.Data.pills, pp.id);
          var Q = XIAN.Data.pillQuality[pp.q];
          return '<div class="card click" data-pk="' + k + '"><div class="card-h">' +
            '<span class="n">' + p.name + '</span><span class="t" style="color:' + Q.color + '">' + Q.name + '</span>' +
            '<span class="t">×' + S.pills[k] + '</span>' +
            '<span class="r tiny e-good">' + XIAN.describeEffects(p.effects) + '</span></div></div>';
        }).join('') + '</div>',
        foot: '<button class="btn" id="pkBack">退</button>'
      });
      $$('[data-pk]', m).forEach(function (c) {
        XIAN.on(c, 'click', function () { step({ type: 'pill', id: c.getAttribute('data-pk') }); });
      });
      XIAN.on(m.querySelector('#pkBack'), 'click', function () { paint(); });
    }

    function step(action) {
      /* 战前血量，以辨此轮受击者 */
      var pBefore = cb.player.jing, fBefore = cb.foe.jing;
      var castByMe = action.type === 'tech';
      var res = cb.playerTurn(action);
      /* 立绘视效：谁施法谁放光，谁受创谁抖动 */
      var pNow = document.querySelector('#cbP'), fNow = document.querySelector('#cbF');
      if (castByMe && pNow) XIAN.Avatar.pulse(pNow, 'cast', cb.player.element ? (XIAN.Data.elements[cb.player.element] || {}).glow : '#e8dcc0');
      if (cb.player.jing < pBefore && pNow) XIAN.Avatar.pulse(pNow, 'hit');
      if (cb.foe.jing < fBefore && fNow) XIAN.Avatar.pulse(fNow, 'hit');
      if (action.type === 'tech') {
        var t = XIAN.byId(XIAN.Data.techniques, action.id);
        if (t) XIAN.Art.qiBurst(t.element === 'none' ? S.root.main : t.element, t.tier);
        if (t && t.tier >= 4) XIAN.Art.flash(0.3);
      }
      paint();
      var mb = $('#modalRoot .modal');
      if (mb) { mb.classList.remove('shake'); void mb.offsetWidth; if (cb.player.jing < cb.player.maxJing * 0.3) mb.classList.add('shake'); }
      if (cb.over) {
        cb.log.forEach(function () { });
        (cb.result.lines || []).forEach(function (l) { cb.push('good', l); });
        paint();
      }
    }

    function finish() {
      U.closeModal();
      XIAN.G.combat = null;
      var r = cb.result || {};
      if (r.win) {
        XIAN.UI.log('胜「' + esc(cb.foe.name) + '」。' + (r.lines || []).join('　'), 'good');
        XIAN.G.chronicle('诛' + cb.foe.name);
        if (cb.foe.boss) XIAN.Art.rings('#e0bd76', 2);
      } else if (r.fled) {
        XIAN.UI.log('自「' + esc(cb.foe.name) + '」处遁走。', 'dim');
        S.repute = Math.max(0, S.repute - 3);
      } else if (r.draw) {
        XIAN.UI.log('与「' + esc(cb.foe.name) + '」斗至日暮，各自罢手。', 'dim');
      } else {
        XIAN.UI.log('败于「' + esc(cb.foe.name) + '」。' + (r.lines || []).join('　'), 'bad');
        XIAN.G.chronicle('败于' + cb.foe.name);
      }
      if (S.dead) return XIAN.G.die();
      if (onDone) onDone();
      XIAN.G.render();
    }

    paint();
  };

  /* ============================================================
   * 四、天劫
   * ========================================================== */
  U.openTrib = function (onDone) {
    var S = XIAN.G.S;
    var T = new XIAN.Trib(S, XIAN.G.rng);
    XIAN.G.trib = T;
    $('#tribVeil').classList.add('on');
    XIAN.Art.darken(0.55, 60000);
    var pendingElem = null;

    function paint(lastLines) {
      var st = XIAN.stats(S);
      var w = T.cur();
      var dots = '';
      for (var i = 0; i < T.total; i++) {
        dots += '<i class="' + (i < T.idx ? 'done' : (i === T.idx ? 'cur' : '')) + '"></i>';
      }
      var body = '<div class="trib-shell">' +
        '<div class="trib-wave-dots">' + dots + '</div>' +
        '<div class="trib-title">' + T.meta.name + '</div>' +
        '<div class="tiny dim">业障加劫 ×' + T.karmaMult.toFixed(2) + '　功德减劫 ×' + T.meritMult.toFixed(2) +
        (T.mercy ? '　<span class="e-good">天道垂怜 −' + Math.round(T.mercy * 100) + '%</span>' : '') + '</div>';

      if (w) {
        body += '<div class="trib-kind" style="color:' + w.type.color + '">' + w.type.name + '</div>' +
          '<div class="trib-target">第' + XIAN.han(T.idx + 1) + '重 / 共' + XIAN.han(T.total) + '重　伤及' +
          ({ jing: '精元', qi: '真炁', shen: '神魂', lifespan: '寿元' }[w.type.target]) +
          '　劫威 ×' + w.power.toFixed(2) + '</div>' +
          '<div class="trib-desc">' + esc(w.q ? w.q.q : w.type.desc) + '</div>';
      }

      body += '<div class="metrics" style="grid-template-columns:1fr 1fr 1fr;text-align:left">' +
        '<div class="metric"><span class="k">精</span><span class="v ' + (S.jing < st.maxJing * .3 ? 'hi' : '') + '">' + num(S.jing) + '</span></div>' +
        '<div class="metric"><span class="k">炁</span><span class="v">' + num(S.qi) + '</span></div>' +
        '<div class="metric"><span class="k">神</span><span class="v">' + num(S.shen) + '</span></div>' +
        '</div>';

      if (!T.done && w) {
        var opts = T.options();
        body += '<div class="trib-opts">' + opts.map(function (o) {
          return '<button class="trib-opt ' + (o.kind === 'dao' ? 'dao' : '') + '" ' +
            (o.disabled ? 'disabled' : '') + ' data-to="' + o.id + '" data-kind="' + o.kind + '">' +
            '<div class="on1">' + esc(o.label) + '</div>' +
            '<div class="oh">' + esc(o.disabled ? (o.reason || '不可用') : o.hint) + '</div></button>';
        }).join('') + '</div>';
        body += '<div id="elemPick"></div>';
        /* 劫中服丹：不耗劫数 */
        var pk = Object.keys(S.pills || {}).filter(function (k) { return S.pills[k] > 0; });
        if (pk.length) {
          body += '<div class="brush-hr"></div><div class="tiny dim">劫光间隙，尚可服丹（不耗劫数）</div>' +
            '<div class="btn-row" style="justify-content:center;margin-top:4px">' +
            pk.slice(0, 6).map(function (k) {
              var pp = XIAN.Sys.pillParse(k);
              var pd = XIAN.byId(XIAN.Data.pills, pp.id);
              var Q = XIAN.Data.pillQuality[pp.q];
              return '<button class="btn sm" data-tpill="' + k + '" title="' + esc(pd.desc) + '">' +
                esc(pd.name) + '<span class="kx" style="color:' + Q.color + '">' + Q.name + '×' + S.pills[k] + '</span></button>';
            }).join('') + '</div>';
        }
      }

      if (lastLines && lastLines.length) {
        body += '<div class="trib-log">' + lastLines.join('<br>') + '</div>';
      } else if (T.log.length) {
        body += '<div class="trib-log">' + T.log.slice(-8).join('<br>') + '</div>';
      }
      body += '</div>';

      var m = U.modal({
        title: '渡　劫', sub: XIAN.realmName(S.realm, S.stage) + ' → ' + XIAN.realmName(S.realm + 1, 0),
        closable: false, cls: '',
        body: body,
        foot: T.done ? '<button class="btn zhu" id="tbEnd">' + (T.result && T.result.survived ? '雷　息' : '……') + '</button>' : ''
      });

      $$('[data-to]', m).forEach(function (b) {
        XIAN.on(b, 'click', function () {
          if (b.hasAttribute('disabled')) return;
          var id = b.getAttribute('data-to');
          if (id === 'channel') return showElem(m);
          go(id, null);
        });
      });
      $$('[data-tpill]', m).forEach(function (b) {
        XIAN.on(b, 'click', function () {
          var r = T.usePill(b.getAttribute('data-tpill'));
          if (!r.ok) return XIAN.G.toast(r.reason, 'bad');
          XIAN.Art.floaty('丹', r.quality.color);
          paint(['<span class="trib-say">你于劫光间隙吞下「' + esc(r.pill.name) + '」。</span>'].concat(r.lines));
        });
      });
      var eb = m.querySelector('#tbEnd');
      if (eb) XIAN.on(eb, 'click', done);
    }

    function showElem(m) {
      var w = T.cur();
      var host = m.querySelector('#elemPick');
      host.innerHTML = '<div class="tiny" style="margin-top:6px">择一气引化之。' +
        (w.type.element !== 'none' ? '此劫属<b class="el-' + w.type.element + '">' + ELN(w.type.element) + '</b>，须以克之者应。' : '此劫无形，五行难着。') +
        '</div><div class="elem-picker">' +
        XIAN.Data.elementOrder.map(function (k) {
          var E = XIAN.Data.elements[k];
          var rel = XIAN.elemRelation(k, w.type.element);
          var hint = rel === 'ke' ? '克' : rel === 'keBy' ? '被克' : rel === 'gen' ? '生' : rel === 'genBy' ? '受生' : rel === 'same' ? '同' : '—';
          return '<button class="elem-pick el-' + k + '" data-el="' + k + '" ' +
            'style="background:' + XIAN.Art.rgba(E.color, .3) + ';color:' + E.deep + '" title="' + hint + '">' +
            '<span>' + E.name + '</span><span class="af">' + Math.round(S.aff[k]) + '</span></button>';
        }).join('') + '</div>';
      $$('[data-el]', host).forEach(function (b) {
        XIAN.on(b, 'click', function () { go('channel', b.getAttribute('data-el')); });
      });
    }

    function go(id, elem) {
      var w = T.cur();
      /* 视效 */
      var col = w ? w.type.color : '#dce8ff';
      if (w && (w.type.id === 'lei' || w.type.id === 'jin')) XIAN.Art.lightning(col, 3);
      else if (w && w.type.id === 'huo') { XIAN.Art.flash(0.5); XIAN.Art.rings('#e07a52', 2); }
      else if (w && w.type.id === 'feng') XIAN.Art.rings('#8fc49c', 2);
      else XIAN.Art.lightning(col, 1);

      var out = T.respond(id, elem);
      if (!out) return;
      XIAN.UI.log('〔' + T.meta.name + '·' + (w ? w.type.name : '') + '〕' + out.lines.join('　'), out.fatal ? 'bad' : '');
      if (T.done) {
        if (T.result && T.result.survived) {
          XIAN.Art.rings('#e0bd76', 4);
          XIAN.Art.flash(0.7);
          $('#breakVeil').classList.add('on');
          setTimeout(function () { $('#breakVeil').classList.remove('on'); }, 1400);
        }
        paint((out.lines || []).concat(T.result && T.result.lines ? T.result.lines : []));
      } else {
        paint(out.lines);
      }
    }

    function done() {
      $('#tribVeil').classList.remove('on');
      U.closeModal();
      XIAN.G.trib = null;
      var r = T.result || {};
      if (!r.survived) {
        XIAN.UI.log('劫云散去，云下已无人。', 'bad');
        return XIAN.G.die();
      }
      (r.lines || []).forEach(function (l) { XIAN.UI.log(l, 'gold'); });
      XIAN.UI.log('雷息云开。你已是 <b>' + XIAN.realmName(S.realm, S.stage) + '</b>。', 'big');
      XIAN.G.chronicle('渡' + T.meta.name + '，晋' + XIAN.realmName(S.realm, S.stage));
      if (S.ascended) { XIAN.G.ascend(); return; }
      if (onDone) onDone();
      XIAN.G.render();
      XIAN.G.save();
    }

    paint();
  };

  /* ============================================================
   * 五、丹炉火候
   * ========================================================== */
  U.openFurnace = function (pid) {
    var S = XIAN.G.S;
    var p = XIAN.byId(XIAN.Data.pills, pid);
    var stat = XIAN.Sys.recipeStatus(S, pid);
    if (!stat || !stat.ok) return XIAN.G.toast('尚不可炼', 'bad');
    var tol = XIAN.Sys.fireTolerance(S, p);
    var showZone = p.tier <= 3 || S.artifacts.indexOf('a_jiuzhuan_lu') >= 0;
    var speed = 0.9 + p.tier * 0.30 - Math.min(0.45, (S.aff.huo - 30) / 120);
    var locked = false, pos = 0, t0 = performance.now(), raf = 0;

    var m = U.modal({
      title: '开　炉', sub: p.name + ' · ' + ['凡', '灵', '宝', '仙', '神'][p.tier - 1] + '品',
      closable: false,
      body:
        '<div class="small" style="color:var(--ink-3)">' + esc(p.desc) + '</div>' +
        '<div class="card-q" style="text-align:left">「' + esc(p.lore) + '」</div>' +
        '<div class="furnace">' +
        '<div class="furnace-vis"><canvas id="furnaceCv"></canvas></div>' +
        '<div class="fire-bar" id="fireBar">' +
        '<div class="zone ' + (showZone ? '' : 'hidden') + '" style="left:' + ((p.fireIdeal - tol) * 100) + '%;width:' + (tol * 200) + '%"></div>' +
        '<div class="ideal" style="left:' + (p.fireIdeal * 100) + '%"></div>' +
        '<div class="needle" id="needle" style="left:0%"></div>' +
        '</div>' +
        '<div class="fire-scale"><span>文火</span><span>温火</span><span>中火</span><span>武火</span><span>烈火</span></div>' +
        '<div class="fire-tip" id="fireTip">火候之要，在「不及」与「太过」之间。<b>按「落　指」定火。</b></div>' +
        '</div>' +
        '<div class="metrics" style="grid-template-columns:1fr 1fr 1fr">' +
        '<div class="metric"><span class="k">理想火位</span><span class="v">' + Math.round(p.fireIdeal * 100) + '</span></div>' +
        '<div class="metric"><span class="k">容　差</span><span class="v">±' + Math.round(tol * 100) + '</span></div>' +
        '<div class="metric"><span class="k">火系亲和</span><span class="v">' + Math.round(S.aff.huo) + '</span></div>' +
        '</div>' +
        (showZone ? '' : '<div class="note warn" style="margin-top:8px">此丹品阶太高，容差之界不可见。唯有得「九转炉」者，方能洞见火候。</div>'),
      foot: '<button class="btn zhu" id="fbLock">落　指</button><button class="btn" id="fbQuit">撤　火</button>'
    });

    XIAN.Art.initFurnace($('#furnaceCv'));
    var needle = m.querySelector('#needle');
    var tip = m.querySelector('#fireTip');

    function loop(now) {
      if (locked) return;
      var t = (now - t0) / 1000;
      pos = (Math.sin(t * speed * 1.9) + 1) / 2;
      /* 加一点二次谐波，让节奏不可精确预测 */
      pos = XIAN.clamp(pos * 0.86 + (Math.sin(t * speed * 4.3) + 1) / 2 * 0.14, 0, 1);
      needle.style.left = (pos * 100) + '%';
      XIAN.Art.setHeat(pos);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    XIAN.on(m.querySelector('#fbQuit'), 'click', function () {
      locked = true; cancelAnimationFrame(raf);
      U.closeModal();
    });
    XIAN.on(m.querySelector('#fireBar'), 'click', function () { lock(); });
    XIAN.on(m.querySelector('#fbLock'), 'click', function () { lock(); });

    function lock() {
      if (locked) return;
      locked = true;
      cancelAnimationFrame(raf);
      needle.classList.add('lock');
      var r = XIAN.Sys.refinePill(S, pid, pos, XIAN.G.rng);
      if (!r.ok) { U.closeModal(); return XIAN.G.toast(r.reason, 'bad'); }
      var Q = r.quality;
      tip.innerHTML = '落指于 <b>' + Math.round(pos * 100) + '</b>，理想 <b>' + Math.round(p.fireIdeal * 100) +
        '</b>，误差 <b>' + Math.round(r.err * 100) + '</b>　→　<b style="color:' + Q.color + '">' + Q.name + '</b>';
      XIAN.Art.setHeat(p.fireIdeal);
      if (r.q >= 4) { XIAN.Art.rings('#e0bd76', 2); XIAN.Art.flash(0.35); }
      setTimeout(function () {
        U.modal({
          title: r.q === 0 ? '丹　毁' : '丹　成', sub: p.name,
          body:
            '<div class="center" style="padding:6px 0">' +
            '<div style="font-size:30px;letter-spacing:.24em;color:' + Q.color + '">' + Q.name + '</div>' +
            (r.q > 0 ? '<div style="font-size:15px">「' + p.name + '」× ' + r.count + '　药力 ×' + Q.mult.toFixed(2) + '</div>' : '') +
            '</div>' +
            '<div class="brush-hr"></div>' +
            '<div style="font-size:13.5px;line-height:2">' + r.lines.join('<br>') + '</div>' +
            '<div class="metrics" style="margin-top:8px;grid-template-columns:1fr 1fr 1fr">' +
            '<div class="metric"><span class="k">火候误差</span><span class="v">' + Math.round(r.err * 100) + ' / ±' + Math.round(r.tol * 100) + '</span></div>' +
            '<div class="metric"><span class="k">火候契合</span><span class="v">' + Math.round(r.acc * 100) + '%</span></div>' +
            '<div class="metric"><span class="k">总　评</span><span class="v">' + r.score + '</span></div>' +
            '</div>' +
            (r.q >= 3 ? '<div class="note dao" style="margin-top:8px">火候得宜，丹气凝而不散。此谓「文武得中」。</div>' : '') +
            (r.q === 0 ? '<div class="note warn" style="margin-top:8px">《丹经》云：火候差一分，丹去千里。药材已尽，且再采之。</div>' : ''),
          foot: '<button class="btn zhu" onclick="XIAN.UI.closeModal();XIAN.G.render()">收　炉</button>'
        });
        XIAN.UI.log('〔丹道〕' + r.lines.join('　'), r.q === 0 ? 'bad' : (r.q >= 4 ? 'gold' : 'good'));
        if (r.death) XIAN.G.die();
      }, 850);
    }
  };

  /* ============================================================
   * 六、突破 / 小境界
   * ========================================================== */
  U.showBreak = function (r, onTrib) {
    var S = XIAN.G.S;
    if (r.success && r.needTrib) {
      U.modal({
        title: '凝　神　已　成', sub: '劫云将至',
        closable: false,
        body: '<div class="ev-text">丹田之中，气机忽然一沉，又忽然一轻。你知道——成了。' +
          '<br><br>然而天穹之上，云色转墨。风停了。方圆百里的鸟兽，同时安静下来。</div>' +
          '<div class="note warn"><b>' + (XIAN.Data.realms[S.realm].tribulation || {}).name + '</b>　' +
          esc((XIAN.Data.realms[S.realm].tribulation || {}).desc || '') + '</div>' +
          '<div class="tiny dim">业障愈重，劫威愈盛；功德愈厚，天心愈宽。渡劫之法有五：硬抗、御宝、引化、顺受、遁避。</div>',
        foot: '<button class="btn zhu" id="toTrib">迎　劫</button>'
      });
      XIAN.Art.darken(0.4, 8000);
      XIAN.on($('#toTrib'), 'click', function () { U.closeModal(); onTrib(); });
      return;
    }
    if (r.success) {
      XIAN.Art.rings('#e0bd76', 3);
      $('#breakVeil').classList.add('on');
      setTimeout(function () { $('#breakVeil').classList.remove('on'); }, 1200);
      U.modal({
        title: '境　界　精　进', sub: XIAN.realmName(S.realm, S.stage),
        body: '<div class="center" style="padding:8px 0">' +
          '<div style="font-size:26px;letter-spacing:.28em;color:' + XIAN.Data.realms[S.realm].color + '">' +
          XIAN.realmName(S.realm, S.stage) + '</div>' +
          '<div class="tiny dim" style="margin-top:4px">道行归零，重新积累。三宝上限俱有增长。</div></div>',
        foot: '<button class="btn zhu" onclick="XIAN.UI.closeModal();XIAN.G.render()">善</button>'
      });
      return;
    }
    /* 失败 */
    U.modal({
      title: '冲　关　不　成', sub: '欲速则不达',
      body: '<div class="ev-text">真炁行至关隘，忽然溃散。你闷咳一声，掌中一片殷红。' +
        (r.dev ? '<br><br>' + esc(r.dev.dev.desc) : '') + '</div>' +
        '<div style="font-size:13.5px;line-height:2">' +
        '<em class="e-bad">道行 -' + num(r.lost || 0) + '　精元 -' + num(r.hurt || 0) + '</em>' +
        (r.dev ? '<br>' + r.dev.lines.join('　') : '') + '</div>' +
        '<div class="note">《道德经》：企者不立，跨者不行。宜先养道心、平躁进，而后再图。</div>',
      foot: '<button class="btn" onclick="XIAN.UI.closeModal();XIAN.G.render()">受　之</button>'
    });
  };

  /* ============================================================
   * 七、结局
   * ========================================================== */
  U.openEnding = function (kind) {
    var S = XIAN.G.S;
    var res = XIAN.settleLegacy(S);
    XIAN.clearSave();
    var win = kind === 'ascend';
    var body = '';

    if (win) {
      XIAN.Art.rings('#fff3cf', 6);
      XIAN.Art.flash(0.85);
      body =
        '<div class="ending-title win">飞　升</div>' +
        '<div class="ending-verse">' +
        '九重仙劫既尽，天门自开。<br>' +
        '你回头看了一眼——云海苍苍，昔日跋涉的山川，已如尘埃一点。<br>' +
        '那个十六岁的少年还站在青云山下，手里握着一撮温热的香灰。<br>' +
        '你向他微微一笑，转身踏入光中。<br><br>' +
        '<span style="color:#8a6a24">与道合真，不生不灭。</span>' +
        '</div>';
    } else {
      XIAN.Art.darken(0.7, 6000);
      var words = XIAN.Data.deathWords;
      body =
        '<div class="ending-title die">身　殒</div>' +
        '<div class="ending-verse">' +
        '<b>' + esc(S.causeOfDeath || '不详') + '</b><br><br>' +
        words.join('<br>') +
        '</div>';
    }

    body +=
      '<div class="brush-hr"></div>' +
      '<h3>此　生</h3>' +
      '<div class="metrics" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr))">' +
      mt('道　号', esc(S.hao)) + mt('姓　名', esc(S.name)) +
      mt('灵　根', esc(S.root.name)) + mt('命　格', esc(S.fate.name)) +
      mt('终至境界', XIAN.realmName(S.realm, S.stage)) +
      mt('享　年', Math.floor(S.age) + ' 载') +
      mt('功　德', num(S.merit)) + mt('业　障', num(S.karma)) +
      mt('经　脉', S.meridians.length + ' / 20') +
      mt('法　术', S.techs.length + ' 门') +
      mt('法　宝', S.artifacts.length + ' 件') +
      mt('传承计分', '<b class="e-gold">' + res.score + '</b>') +
      '</div>' +
      U.statGrid(S) +
      '<h3>轮　回　所　得</h3>' +
      '<div class="note dao">下一世将承：悟性 +' + (res.legacy.insight || 0) +
      '　灵石 +' + num(res.legacy.stone || 0) +
      '　寿元 +' + (res.legacy.lifespan || 0) + ' 载' +
      '　道心 +' + (res.legacy.daoxin || 0) +
      '　灵根缘 +' + (res.legacy.rootLuck || 0) +
      '　宿世丹方 ' + (res.legacy.recipes || []).length + ' 张' +
      (res.legacy.memoryTech ? '　宿慧《' + esc((XIAN.byId(XIAN.Data.techniques, res.legacy.memoryTech) || {}).name || '') + '》' : '') +
      '</div>' +
      '<p class="quote">' + (win
        ? '「上士闻道，勤而行之。」'
        : '「方生方死，方死方生。」') + '</p>';

    U.modal({
      title: win ? '太乙玄仙' : '轮　回', sub: '第' + XIAN.han(S.life) + '世 · 终',
      closable: false, cls: 'wide',
      body: body,
      foot: '<button class="btn" id="edLives">前世碑铭</button>' +
        '<button class="btn zhu" id="edAgain">转　世　重　修</button>'
    });
    XIAN.on($('#edLives'), 'click', function () { U.openLives(); });
    XIAN.on($('#edAgain'), 'click', function () { U.closeModal(); XIAN.G.newLife(); });

    function mt(k, v) { return '<div class="metric"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; }
  };

  /* ============================================================
   * 八、小窗：经脉详情 / 卦象详情
   * ========================================================== */
  U.openMeridianInfo = function (id) {
    var S = XIAN.G.S;
    var m = XIAN.byId(XIAN.Data.meridians, id);
    if (!m) return;
    var gate = XIAN.Sys.meridianGate(S, m);
    var c = XIAN.Sys.meridianCost(S, m);
    var ch = XIAN.Sys.meridianChance(S, m);
    var names = { maxJing: '精之上限', maxQi: '炁之上限', maxShen: '神之上限', atk: '法力', def: '护体', spd: '身法', crit: '机变', insight: '悟性', daoxin: '道心', lifespan: '寿元', balanceYin: '偏阴', balanceYang: '偏阳' };
    var bl = [];
    for (var k in (m.bonus || {})) bl.push(names[k] + ' +' + m.bonus[k]);
    U.modal({
      title: m.name, sub: m.group + ' · ' + ELN(m.element) + '属', cls: 'narrow',
      body: '<div class="ev-text" style="text-indent:0">' + esc(m.desc) + '</div>' +
        '<div class="note dao">贯通所得：' + bl.join('　') + '</div>' +
        (gate.open ? '<div class="note dao">此脉已通。</div>'
          : gate.ok
            ? '<div class="metrics"><div class="metric"><span class="k">成　算</span><span class="v">' + ch + '%</span></div>' +
            '<div class="metric"><span class="k">耗　炁</span><span class="v">' + num(c.qi) + '</span></div>' +
            '<div class="metric"><span class="k">耗　精</span><span class="v">' + num(c.jing) + '</span></div>' +
            '<div class="metric"><span class="k">耗　时</span><span class="v">' + U.fmtDays(c.days) + '</span></div></div>'
            : '<div class="note warn">' + esc(gate.reason) + '</div>'),
      foot: (gate.open || !gate.ok) ? '<button class="btn" onclick="XIAN.UI.closeModal()">退</button>'
        : '<button class="btn" onclick="XIAN.UI.closeModal()">退</button>' +
        '<button class="btn zhu" onclick="XIAN.UI.closeModal();XIAN.G.act(\'openmer\',\'' + id + '\')">冲　脉</button>'
    });
  };

  U.openHexInfo = function (n) {
    var h = XIAN.Data.hexagrams[n - 1];
    if (!h) return;
    var om = XIAN.Data.omenMeta[h.omen];
    U.modal({
      title: '第' + h.n + '卦 · ' + h.name, sub: h.full, cls: 'narrow',
      body: '<div class="hex-box"><div class="hex-lines">' + XIAN.Art.hexLinesHtml(h.lines, 0) + '</div>' +
        '<div class="hex-meta"><div class="hex-full">上' + h.upper + ' 下' + h.lower + '</div>' +
        '<div style="margin-top:4px"><span class="hex-omen" style="color:' + om.color + '">' + om.label + '　×' + om.mult.toFixed(2) + '</span></div></div></div>' +
        '<div class="hex-judge">彖曰：「' + esc(h.judgement) + '」</div>' +
        '<div class="hex-judge">象曰：「' + esc(h.image) + '」</div>' +
        '<div class="brush-hr"></div>' +
        '<div class="hex-advice">' + esc(h.advice) + '</div>' +
        '<div class="hex-guide">' + esc(h.guide) + '</div>',
      foot: '<button class="btn" onclick="XIAN.UI.closeModal()">合</button>'
    });
  };

  /* 占卜动画 */
  U.showDivine = function (r) {
    var S = XIAN.G.S;
    var bars = '';
    for (var i = 0; i < 50; i++) bars += '<i style="height:' + (18 + Math.random() * 22) + 'px;animation-delay:' + (Math.random() * .5) + 's"></i>';
    var m = U.modal({
      title: '问　卦', sub: '初筮告，再三渎', closable: false, cls: 'narrow',
      body: '<div class="center"><div class="yarrow">' + bars + '</div>' +
        '<div class="t-kai" style="margin-top:10px;color:var(--ink-3)">五十蓍草，去一不用，其四十九分而为二……</div></div>'
    });
    setTimeout(function () {
      var d = S.divine, om = XIAN.Data.omenMeta[d.omen];
      U.modal({
        title: '第' + d.n + '卦 · ' + d.name, sub: d.full, cls: 'narrow',
        body:
          '<div class="hex-box"><div class="hex-lines">' + XIAN.Art.hexLinesHtml(d.lines, d.moving) + '</div>' +
          '<div class="hex-meta">' +
          '<div class="hex-name">' + d.name + '　<span class="hex-omen" style="color:' + om.color + '">' + om.label + ' ×' + om.mult.toFixed(2) + '</span></div>' +
          '<div class="hex-full">' + d.full + '　' + XIAN.han(d.moving) + '爻动' +
          (d.target ? '，之「' + d.target.name + '」' : '') + '</div>' +
          '</div></div>' +
          '<div class="hex-judge">「' + esc(d.judgement) + '」</div>' +
          '<div class="brush-hr"></div>' +
          '<div class="hex-advice">' + esc(d.advice) + '</div>' +
          '<div class="hex-guide">' + esc(d.guide) + '</div>' +
          (r.lines && r.lines.length ? '<div class="note warn" style="margin-top:8px">' + r.lines.join('<br>') + '</div>' : '') +
          '<div class="tiny dim" style="margin-top:6px">此卦于本节气内有效，影响修行、采药与奇遇。神魂 -' + num(r.cost) + '</div>',
        foot: '<button class="btn zhu" onclick="XIAN.UI.closeModal();XIAN.G.render()">领　之</button>'
      });
      XIAN.UI.log('〔问卦〕得「' + d.name + '·' + d.full + '」' + om.label + '　' + esc(d.guide), 'gold');
    }, 1250);
  };

})(XIAN.UI);
