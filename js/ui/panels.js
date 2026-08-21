/* ============================================================
 *  ui-panels.js — 修行 / 丹道 / 经脉 / 囊中 / 寰宇 / 坊市 / 玄览
 * ============================================================ */
window.XIAN = window.XIAN || {};
XIAN.UI = XIAN.UI || {};

(function (U) {
  var $ = XIAN.$, $$ = XIAN.$$, esc = XIAN.esc, num = XIAN.num;
  var ELN = function (k) { var e = XIAN.Data.elements[k]; return e ? e.name : '玄'; };

  U.renderPanel = function () {
    var p = $('#panel');
    if (!p) return;
    var sc = p.scrollTop;
    var fn = U.panels[XIAN.G.tab] || U.panels.cultivate;
    p.innerHTML = fn(XIAN.G.S);
    U.bindPanel(p);
    p.scrollTop = XIAN.G._keepScroll ? sc : 0;
    XIAN.G._keepScroll = false;
  };

  /* 统一事件绑定：data-act / data-arg */
  U.bindPanel = function (root) {
    $$('[data-act]', root).forEach(function (b) {
      XIAN.on(b, 'click', function (e) {
        if (b.hasAttribute('disabled')) return;
        var act = b.getAttribute('data-act');
        var arg = b.getAttribute('data-arg');
        var arg2 = b.getAttribute('data-arg2');
        XIAN.G.act(act, arg, arg2, b);
      });
    });
  };

  U.panels = {};

  /* ============================================================
   * 修　行
   * ========================================================== */
  U.panels.cultivate = function (S) {
    var R = XIAN.Data.realms[S.realm];
    var F = XIAN.cultivateFactor(S);
    var st = XIAN.stats(S);
    var gain = Math.round(XIAN.baseDaoGain(S) * F.mult);
    var need = XIAN.daoNeed(S);
    var left = Math.max(0, need - S.dao);
    var turns = gain > 0 ? Math.ceil(left / gain) : 999;
    var risk = XIAN.Sys.deviationRisk(S);
    var bi = XIAN.Sys.breakInfo(S);
    var L = XIAN.byId(XIAN.Data.locations, S.loc);
    var canCult = L && (L.features || []).indexOf('cultivate') >= 0;

    var html = '';

    /* —— 境界 —— */
    html += '<h3>境　界<span class="r">' + R.phase + '</span></h3>';
    html += '<div class="note dao" style="margin:0 0 8px">' +
      '<b style="font-size:16px;letter-spacing:.14em;color:' + R.color + '">' + XIAN.realmName(S.realm, S.stage) + '</b>　' +
      '<span class="tiny">寿元上限 ' + num(R.lifespan) + ' 载 · 一次深修 ' + fmtDays(R.days) + '</span>' +
      '<div class="small" style="margin-top:4px;color:var(--ink-3)">' + esc(R.desc) + '</div></div>';

    /* —— 心法 —— */
    if (risk > 0.28 || S.daoxin < 32 || S.haste > 68 || Math.abs(S.balance) > 62) {
      var why = [];
      if (S.daoxin < 32) why.push('道心已损（' + Math.round(S.daoxin) + '）');
      if (S.haste > 68) why.push('躁进过甚（' + Math.round(S.haste) + '）');
      if (Math.abs(S.balance) > 62) why.push('阴阳大偏（' + Math.round(S.balance) + '）');
      if (S.jing < st.maxJing * 0.3) why.push('精元将竭');
      html += '<div class="note warn" style="margin:0 0 10px;font-size:13.5px">' +
        '<b>危：走火入魔之数已达 ' + Math.round(risk * 100) + '%</b>　' + why.join('，') + '。<br>' +
        '<span class="small">此时当改用 <b>静坐</b>（尽消躁进、复还道心，必不走火）或 <b>静养调息</b>；' +
        '若身在太虚观，可行「苦行」涤除业障。切忌一味苦修——<span class="t-kai">「揠苗助长，其苗必枯。」</span></span>' +
        '<div class="btn-row" style="margin-top:6px">' +
        '<button class="btn sm zhu" data-act="stance" data-arg="jingzuo">改用静坐</button>' +
        '<button class="btn sm" data-act="rest">静养调息</button>' +
        '</div></div>';
    }
    html += '<h3>心　法<span class="r">进境之疾徐，全在此一念</span></h3>';
    html += '<div class="stance-grid">';
    XIAN.Data.stances.forEach(function (s) {
      var lock = s.minRealm !== undefined && S.realm < s.minRealm;
      html += '<button class="stance ' + (S.stance === s.id ? 'on' : '') + '" ' +
        (lock ? 'disabled title="须' + XIAN.Data.realms[s.minRealm].name + '之境"' : '') +
        ' data-act="stance" data-arg="' + s.id + '">' +
        '<div class="sn">' + s.name + '</div>' +
        '<div class="sm">' + s.motto + '</div>' +
        '<div class="sd">' + esc(s.desc) + '</div>' +
        '<div class="sr">' +
        sr('道行', s.daoMult, 'x') +
        sr('躁进', s.hasteAdd, '+') +
        sr('道心', s.daoxinAdd, '+') +
        '<span class="' + (s.risk > 0.1 ? 'dn' : '') + '">险 ' + Math.round(s.risk * 100) + '%</span>' +
        (s.karma ? '<span class="dn">业 +' + s.karma + '</span>' : '') +
        '</div></button>';
    });
    html += '</div>';

    /* —— 本次深修预览 —— */
    html += '<h3>本　次　深　修<span class="r">' + (canCult ? '此地可以打坐' : '此地不宜打坐（效力大减）') + '</span></h3>';
    html += '<div class="metrics" style="grid-template-columns:1fr 1fr 1fr">' +
      m2('预计道行', '<b class="e-gold">+' + num(gain) + '</b>') +
      m2('所需次数', left <= 0 ? '<b class="e-good">已足</b>' : '约 ' + turns + ' 次') +
      m2('耗　时', fmtDays(R.days)) +
      m2('总系数', '<b>×' + F.mult.toFixed(2) + '</b>') +
      m2('走火之危', '<span class="' + (risk > .25 ? 'e-bad' : risk > .1 ? 'e-yang' : 'e-good') + '">' + Math.round(risk * 100) + '%</span>') +
      m2('折　寿', Math.round(R.days / XIAN.DAYS_PER_YEAR * 10) / 10 + ' 载') +
      '</div>';

    html += '<div class="factor-list" style="margin-top:8px">' +
      F.detail.map(function (d) {
        var up = d.mult > 1;
        return '<span class="factor"><span class="fl">' + esc(d.label) + '</span>' +
          '<span class="fv ' + (up ? 'up' : 'dn') + '">×' + d.mult.toFixed(2) + '</span></span>';
      }).join('　') + '</div>';

    html += '<div class="btn-row" style="margin-top:10px">' +
      '<button class="btn zhu" data-act="cultivate">打　坐　深　修</button>' +
      '<button class="btn" data-act="rest">静　养　调　息</button>' +
      '<button class="btn" data-act="wander">出　外　游　历</button>' +
      '<button class="btn" data-act="hunt">寻　敌　斗　法</button>' +
      '</div>';

    /* —— 三宝转化 —— */
    html += '<h3>三　宝　转　化<span class="r">炼精化炁 · 炼炁化神 · 炼神还虚</span></h3>';
    html += '<div class="list">';
    ['jq', 'qs', 'sv'].forEach(function (k) {
      var i = XIAN.Sys.refineInfo(S, k);
      html += '<div class="card ' + (i.ok ? '' : 'off') + '">' +
        '<div class="card-h"><span class="n">' + i.name + '</span>' +
        '<span class="t t-kai">' + i.motto + '</span>' +
        '<span class="r">' + i.from + ' −' + num(i.spend) + ' → ' + i.to + ' +' + num(i.gain) + '</span></div>' +
        '<div style="display:flex;align-items:center;gap:8px;margin-top:4px">' +
        '<button class="btn xs ' + (i.ok ? 'gold' : '') + '" ' + (i.ok ? '' : 'disabled') +
        ' data-act="refine" data-arg="' + k + '">行　之</button>' +
        '<span class="tiny dim">' + (i.ok ? '耗时 ' + fmtDays(i.days) + '　一节气之内可行一次' : esc(i.reason)) + '</span></div>' +
        '</div>';
    });
    html += '</div>';

    /* —— 突破 —— */
    if (bi.ascended) {
      html += '<h3>境　界<span class="r">更无可破</span></h3>' +
        '<div class="note dao" style="line-height:2">你已与道合真，不生不灭。' +
        '<br><span class="t-kai">「上士闻道，勤而行之。」此后再无关隘，唯余长久。</span></div>';
      return html;
    }
    html += '<h3>突　破<span class="r">' + (bi.kind === 'realm' ? '大境界 · 须渡天劫' : '小境界') + '</span></h3>';
    var pct = Math.min(100, Math.round(bi.ratio * 100));
    html += '<div class="note ' + (bi.ready ? 'dao' : '') + '" style="margin:0 0 8px">' +
      '道行 <b>' + num(S.dao) + ' / ' + num(need) + '</b>（' + pct + '%）　→　<b style="color:var(--zhu)">' + bi.nextName + '</b>' +
      '<div class="bar-track thin" style="margin-top:5px"><div class="bar-fill" style="width:' + pct + '%;background-image:linear-gradient(90deg,#7a5c1e,#b8925a,#e6c87e)"></div></div>' +
      '</div>';
    if (bi.note) html += '<div class="small t-kai" style="color:var(--ink-3);margin-bottom:6px">' + esc(bi.note) + '</div>';
    if (bi.trib) html += '<div class="note warn" style="margin:0 0 8px"><b>' + bi.trib.name + '</b>　' + esc(bi.trib.desc) + '</div>';
    html += '<div class="metrics" style="grid-template-columns:1fr 1fr 1fr">' +
      m2('成功之数', '<b class="' + (bi.chance > 70 ? 'e-good' : bi.chance > 40 ? 'e-yang' : 'e-bad') + '">' + bi.chance + '%</b>') +
      m2('道心须达', bi.daoxinNeed + '（今 ' + Math.round(S.daoxin) + '）') +
      m2('厚积之利', '+' + Math.min(24, Math.round(Math.max(0, bi.ratio - 1) * 42)) + '%') +
      '</div>';
    if (bi.blockers.length) {
      html += '<div class="note warn" style="margin-top:8px">未足者：' + bi.blockers.map(esc).join('；') + '</div>';
    }
    html += '<div class="btn-row" style="margin-top:9px">' +
      '<button class="btn ' + (bi.blockers.length ? '' : 'gold') + '" ' + (bi.blockers.length ? 'disabled' : '') +
      ' data-act="break">凝　神　突　破</button>' +
      '<button class="btn ink" data-act="forcebreak" title="道行不足亦可强冲，然凶险倍增">强　行　冲　关</button>' +
      '</div>';
    html += '<div class="tiny dim" style="margin-top:5px">强行冲关：成功率 −26%，业障骤积，失败则道行大损、寿元有亏。所谓「揠苗助长」。</div>';

    return html;

    function sr(n, v, kind) {
      if (kind === 'x') {
        var up = v > 1;
        return '<span class="' + (up ? 'up' : 'dn') + '">' + n + ' ×' + v.toFixed(2) + '</span>';
      }
      if (!v) return '';
      var good = (n === '道心') ? v > 0 : v < 0;
      return '<span class="' + (good ? 'up' : 'dn') + '">' + n + ' ' + (v > 0 ? '+' : '') + v + '</span>';
    }
  };

  function m2(k, v) { return '<div class="metric"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; }
  function fmtDays(d) {
    if (d < 30) return d + ' 日';
    if (d < 360) return (Math.round(d / 30 * 10) / 10) + ' 月';
    var y = d / XIAN.DAYS_PER_YEAR;
    return (y >= 10 ? Math.round(y) : Math.round(y * 10) / 10) + ' 载';
  }
  U.fmtDays = fmtDays;

  /* ============================================================
   * 丹　道
   * ========================================================== */
  U.panels.alchemy = function (S) {
    var g = XIAN.Sys.gatherInfo(S);
    var html = '';

    html += '<h3>采　药<span class="r">' + (g.ok ? '耗时 ' + fmtDays(g.days) : '此地不产灵药') + '</span></h3>';
    if (g.ok) {
      var L = g.loc;
      var local = (XIAN.Data.herbs || []).filter(function (h) { return (h.habitat || []).indexOf(S.loc) >= 0; });
      html += '<div class="small" style="color:var(--ink-3)">此地所产：' +
        local.map(function (h) {
          return '<span class="chip">' + h.name + ' <span class="tier t' + h.tier + '">' + h.tier + '</span></span>';
        }).join(' ') + '</div>';
      html += '<div class="btn-row" style="margin-top:8px"><button class="btn zhu" data-act="gather">入　山　采　药</button>' +
        (L.danger >= 3 ? '<span class="tiny e-bad" style="align-self:center">此地凶险，采药或遇妖魔</span>' : '') + '</div>';
    } else {
      html += '<div class="note">灵药生于灵脉所钟之处。往「寰宇」择一可采之地。</div>';
    }

    /* —— 丹方 —— */
    html += '<h3>丹　方<span class="r">已得 ' + S.recipes.length + ' / ' + XIAN.Data.pills.length + ' 张</span></h3>';
    var known = (S.recipes || []).map(function (id) { return XIAN.byId(XIAN.Data.pills, id); }).filter(Boolean);
    known.sort(function (a, b) { return a.tier - b.tier; });
    if (!known.length) html += '<div class="dim small">尚无丹方。可于坊市购之，或于奇遇中得之。</div>';
    html += '<div class="list">';
    known.forEach(function (p) {
      var st = XIAN.Sys.recipeStatus(S, p.id);
      var tol = XIAN.Sys.fireTolerance(S, p);
      html += '<div class="card">' +
        '<div class="card-h"><span class="n">' + p.name + '</span>' +
        '<span class="tier t' + p.tier + '">' + ['凡', '灵', '宝', '仙', '神'][p.tier - 1] + '品</span>' +
        '<span class="t">宜' + XIAN.Data.realms[p.realm].name + '以上</span>' +
        '<span class="r">' + XIAN.describeEffects(p.effects) + '</span></div>' +
        '<div class="card-d">' + esc(p.desc) + '</div>' +
        '<div class="card-q">「' + esc(p.lore) + '」</div>' +
        '<div class="recipe-roles" style="margin-top:6px">' +
        st.need.map(function (n) {
          var RR = XIAN.Data.herbRoles[n.role];
          return '<div class="role-row">' +
            '<span class="role-badge role-' + n.role + '" title="' + RR.full + '：' + RR.desc + '">' + RR.name + '</span>' +
            '<span>' + (n.herb ? n.herb.name : n.id) + '</span>' +
            (n.herb ? '<span class="tiny el-' + n.herb.element + '">' + ELN(n.herb.element) + '·' + n.herb.taste + '</span>' : '') +
            '<span class="qn ' + (n.enough ? 'ok' : 'no') + '">' + n.have + ' / ' + n.qty + '</span></div>';
        }).join('') +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;margin-top:6px;flex-wrap:wrap">' +
        '<button class="btn xs ' + (st.ok ? 'zhu' : '') + '" ' + (st.ok ? '' : 'disabled') +
        ' data-act="furnace" data-arg="' + p.id + '">开　炉</button>' +
        '<span class="tiny dim">火候 ' + Math.round(p.fireIdeal * 100) + '　容差 ±' + Math.round(tol * 100) +
        '　耗炁 ' + num(st.qiCost) + '　耗时 ' + fmtDays(st.days) + '</span>' +
        (st.ok ? '' : '<span class="tiny e-bad">' + (!st.herbsOk ? '药材不足' : !st.qiOk ? '真炁不足' : '') + '</span>') +
        '</div></div>';
    });
    html += '</div>';

    /* —— 丹囊 —— */
    html += '<h3>丹　囊<span class="r">服丹逾三，药力递减</span></h3>';
    html += pillList(S, true);
    return html;
  };

  function pillList(S, withUse) {
    var keys = Object.keys(S.pills || {}).filter(function (k) { return S.pills[k] > 0; });
    if (!keys.length) return '<div class="dim small">丹囊空空。</div>';
    keys.sort();
    var html = '<div class="list">';
    keys.forEach(function (k) {
      var pp = XIAN.Sys.pillParse(k);
      var p = XIAN.byId(XIAN.Data.pills, pp.id);
      if (!p) return;
      var Q = XIAN.Data.pillQuality[pp.q];
      var taken = (S.pillCount && S.pillCount[pp.id]) || 0;
      html += '<div class="card"><div class="card-h">' +
        '<span class="n">' + p.name + '</span>' +
        '<span class="t" style="color:' + Q.color + '">' + Q.name + ' ×' + Q.mult.toFixed(2) + '</span>' +
        '<span class="t">×' + S.pills[k] + '</span>' +
        '<span class="r">' + XIAN.describeEffects(p.effects) + '</span></div>' +
        '<div class="card-d">' + esc(p.desc) + (taken > 2 ? ' <span class="e-bad">（已服 ' + taken + ' 枚，丹毒渐积）</span>' : '') + '</div>' +
        (withUse ? '<div class="btn-row" style="margin-top:5px">' +
          '<button class="btn xs" data-act="takepill" data-arg="' + k + '">服　用</button>' +
          '<button class="btn xs" data-act="sellpill" data-arg="' + k + '">售（' + num(Math.round(XIAN.Sys.pillPrice(p, pp.q) * 0.6)) + '）</button>' +
          '</div>' : '') +
        '</div>';
    });
    return html + '</div>';
  }

  /* ============================================================
   * 经　脉
   * ========================================================== */
  U.panels.meridian = function (S) {
    var open = {}; (S.meridians || []).forEach(function (id) { open[id] = 1; });
    var html = '<h3>内　景<span class="r">' + S.meridians.length + ' / ' + XIAN.Data.meridians.length + ' 已通</span></h3>';
    html += '<div class="note dao" style="margin:0 0 10px">' +
      '经脉者，真炁之道路也。任督二脉为诸经之先；十二正经通六，可开冲带；通八，可开维跷。' +
      '<b>任督俱通即成小周天</b>，真炁自行周流，无须导引。</div>';
    html += '<div class="mer-holder">' + XIAN.Art.meridianSvg(S) + '<div class="mer-list">';
    XIAN.Data.meridians.forEach(function (m) {
      var gate = XIAN.Sys.meridianGate(S, m);
      var cls = gate.open ? 'open' : (gate.ok ? 'avail' : 'locked');
      html += '<div class="mer-item ' + cls + '" data-act="merinfo" data-arg="' + m.id + '" title="' + esc(m.name) + '">' +
        '<span class="pt"></span><span class="nm">' + m.name + '</span></div>';
    });
    html += '</div></div>';

    html += '<h3>可　开　之　脉</h3>';
    var avail = XIAN.Data.meridians.filter(function (m) {
      var g = XIAN.Sys.meridianGate(S, m);
      return !g.open && g.ok;
    });
    if (!avail.length) {
      var next = XIAN.Data.meridians.filter(function (m) { return open[m.id] !== 1; })[0];
      html += '<div class="note warn">' + (next ? esc(XIAN.Sys.meridianGate(S, next).reason || '暂无可开之脉') : '二十经脉俱已贯通，真炁如江海奔流。') + '</div>';
    }
    html += '<div class="list">';
    avail.forEach(function (m) {
      var c = XIAN.Sys.meridianCost(S, m);
      var ch = XIAN.Sys.meridianChance(S, m);
      var canQi = S.qi >= c.qi, canJ = S.jing > c.jing;
      var bl = [];
      var names = { maxJing: '精上限', maxQi: '炁上限', maxShen: '神上限', atk: '法力', def: '护体', spd: '身法', crit: '机变', insight: '悟性', daoxin: '道心', lifespan: '寿元', balanceYin: '偏阴', balanceYang: '偏阳' };
      for (var k in (m.bonus || {})) bl.push(names[k] + ' +' + m.bonus[k]);
      html += '<div class="card"><div class="card-h">' +
        '<span class="n">' + m.name + '</span>' +
        '<span class="t">' + m.group + ' · ' + ELN(m.element) + '</span>' +
        '<span class="r e-good">' + bl.join('　') + '</span></div>' +
        '<div class="card-d">' + esc(m.desc) + '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;margin-top:5px;flex-wrap:wrap">' +
        '<button class="btn xs ' + (canQi && canJ ? 'zhu' : '') + '" ' + (canQi && canJ ? '' : 'disabled') +
        ' data-act="openmer" data-arg="' + m.id + '">冲　脉</button>' +
        '<span class="tiny">成算 <b class="' + (ch > 70 ? 'e-good' : ch > 45 ? 'e-yang' : 'e-bad') + '">' + ch + '%</b>' +
        '　耗炁 <span class="' + (canQi ? '' : 'e-bad') + '">' + num(c.qi) + '</span>' +
        '　耗精 <span class="' + (canJ ? '' : 'e-bad') + '">' + num(c.jing) + '</span>' +
        '　耗时 ' + fmtDays(c.days) + '</span></div>' +
        '<div class="tiny dim" style="margin-top:2px">失败则精元受损、道心动摇，或致走火。' +
        ELN(m.element) + '之亲和越高，成算越大（今 ' + Math.round(S.aff[m.element]) + '）。</div>' +
        '</div>';
    });
    html += '</div>';
    return html;
  };

  /* ============================================================
   * 囊　中
   * ========================================================== */
  U.panels.bag = function (S) {
    var html = '';
    var st = XIAN.stats(S);

    /* 法宝 */
    html += '<h3>法　宝<span class="r">本命 · 护身 · 佩饰　各佩其一</span></h3>';
    var SLOT = { main: '本命法宝', robe: '护身法衣', talisman: '随身佩饰' };
    html += '<div class="list">';
    ['main', 'robe', 'talisman'].forEach(function (slot) {
      var eqId = S.equipped[slot];
      var eq = eqId ? XIAN.byId(XIAN.Data.artifacts, eqId) : null;
      html += '<div class="card ' + (eq ? 'on' : '') + '">' +
        '<div class="card-h"><span class="t">' + SLOT[slot] + '</span>' +
        '<span class="n">' + (eq ? eq.name : '——') + '</span>' +
        (eq ? '<span class="tier t' + eq.tier + '">' + eq.tier + '阶</span>' : '') +
        (eq ? '<span class="r">' + statText(eq.stats) + '</span>' : '') + '</div>' +
        (eq ? '<div class="card-d">' + esc(eq.desc) + '</div><div class="card-q">「' + esc(eq.lore) + '」</div>' : '') +
        (eq ? '<div class="btn-row" style="margin-top:5px"><button class="btn xs" data-act="unequip" data-arg="' + slot + '">卸　下</button></div>' : '') +
        '</div>';
    });
    html += '</div>';

    var owned = (S.artifacts || []).map(function (id) { return XIAN.byId(XIAN.Data.artifacts, id); }).filter(Boolean);
    if (owned.length) {
      html += '<h3>库　藏<span class="r">' + owned.length + ' 件</span></h3><div class="list">';
      owned.sort(function (a, b) { return b.tier - a.tier; });
      owned.forEach(function (a) {
        var on = S.equipped[a.slot] === a.id;
        html += '<div class="card ' + (on ? 'on' : '') + '"><div class="card-h">' +
          '<span class="n">' + a.name + '</span>' +
          '<span class="tier t' + a.tier + '">' + a.tier + '阶</span>' +
          '<span class="t">' + SLOT[a.slot] + (a.element !== 'none' ? ' · ' + ELN(a.element) : '') + '</span>' +
          '<span class="r">' + statText(a.stats) + '</span></div>' +
          '<div class="card-d">' + esc(a.desc) + '</div>' +
          '<div class="card-q">「' + esc(a.lore) + '」</div>' +
          '<div class="btn-row" style="margin-top:5px">' +
          (on ? '<span class="chip on">已　佩</span>'
            : '<button class="btn xs" data-act="equip" data-arg="' + a.id + '">佩　之</button>') +
          '</div></div>';
      });
      html += '</div>';
    }

    /* 法术 */
    html += '<h3>法　术<span class="r">' + S.techs.length + ' 门</span></h3>';
    var techs = (S.techs || []).map(function (id) { return XIAN.byId(XIAN.Data.techniques, id); }).filter(Boolean);
    techs.sort(function (a, b) { return b.tier - a.tier || a.element.localeCompare(b.element); });
    html += '<div class="list">';
    techs.forEach(function (t) {
      html += '<div class="card"><div class="card-h">' +
        '<span class="n el-' + t.element + '">' + t.name + '</span>' +
        '<span class="tier t' + t.tier + '">' + t.tier + '阶</span>' +
        '<span class="t">' + ELN(t.element) + ' · ' + KIND(t.kind) + '</span>' +
        '<span class="r tiny">耗炁 ' + t.cost + (t.cd ? '　冷 ' + t.cd : '') + '</span></div>' +
        '<div class="card-d">' + esc(t.desc) + '</div>' +
        '<div class="card-q">「' + esc(t.quote) + '」</div></div>';
    });
    html += '</div>';

    /* 灵药 */
    html += '<h3>灵　药<span class="r">' + Object.keys(S.herbs || {}).length + ' 味</span></h3>';
    html += herbList(S);

    /* 丹药 */
    html += '<h3>丹　药</h3>' + pillList(S, true);
    return html;

    function statText(s) {
      var names = { atk: '法力', def: '护体', spd: '身法', crit: '机变', maxQi: '炁', maxJing: '精', maxShen: '神', insight: '悟性', daoxin: '道心' };
      var o = [];
      for (var k in (s || {})) if (s[k]) o.push(names[k] + ' +' + s[k]);
      return '<span class="e-good tiny">' + o.join('　') + '</span>';
    }
  };
  function KIND(k) {
    return { attack: '攻伐', guard: '护体', heal: '疗伤', buff: '增益', debuff: '削弱', soul: '神魂', special: '玄奇' }[k] || k;
  }

  function herbList(S) {
    var keys = Object.keys(S.herbs || {}).filter(function (k) { return S.herbs[k] > 0; });
    if (!keys.length) return '<div class="dim small">药篓空空。</div>';
    var items = keys.map(function (k) { return { h: XIAN.byId(XIAN.Data.herbs, k), n: S.herbs[k] }; })
      .filter(function (x) { return x.h; });
    items.sort(function (a, b) { return b.h.tier - a.h.tier || a.h.element.localeCompare(b.h.element); });
    var html = '<div class="list">';
    items.forEach(function (x) {
      var h = x.h;
      html += '<div class="card"><div class="card-h">' +
        '<span class="n el-' + h.element + '">' + h.name + '</span>' +
        '<span class="tier t' + h.tier + '">' + h.tier + '</span>' +
        '<span class="t">' + ELN(h.element) + ' · ' + h.taste + ' · ' +
        ({ yang: '阳', yin: '阴', ping: '平' }[h.nature]) + '</span>' +
        '<span class="r">×' + x.n + '　药力 ' + h.potency + '</span></div>' +
        '<div class="card-d">' + esc(h.desc) + '</div>' +
        '<div class="btn-row" style="margin-top:4px">' +
        '<button class="btn xs" data-act="sellherb" data-arg="' + h.id + '">售 1（' + num(Math.round(XIAN.Sys.herbPrice(h) * .55)) + '）</button>' +
        (x.n > 1 ? '<button class="btn xs" data-act="sellherball" data-arg="' + h.id + '">全售（' + num(Math.round(XIAN.Sys.herbPrice(h) * .55 * x.n)) + '）</button>' : '') +
        '</div></div>';
    });
    return html + '</div>';
  }

  /* ============================================================
   * 寰　宇
   * ========================================================== */
  U.panels.world = function (S) {
    var html = '<h3>寰　宇<span class="r">行路耗时 ' + fmtDays(Math.max(3, Math.round(XIAN.Data.realms[S.realm].days * 0.45))) + '</span></h3>';
    html += '<div class="map-grid">';
    XIAN.Data.locations.forEach(function (L) {
      var info = XIAN.Sys.travelInfo(S, L.id);
      var here = L.id === S.loc;
      var lock = !info.ok && !here;
      var FEAT = { gather: '采药', cultivate: '打坐', market: '坊市', sect: '道观', altar: '祭坛', ruin: '遗迹', forge: '炉鼎', spring: '灵泉', trial: '试炼', tribulation: '渡劫台' };
      var bg = 'linear-gradient(160deg,' + L.sky[0] + ',' + L.sky[1] + ' 45%,' + L.ink + ')';
      html += '<button class="loc-card ' + (here ? 'here' : '') + '" ' +
        (lock ? 'disabled' : '') + ' data-act="travel" data-arg="' + L.id + '">' +
        '<div class="bgw" style="background:' + bg + ';opacity:.22"></div>' +
        '<div class="ln1">' + L.name +
        (L.element !== 'none' ? ' <span class="tiny el-' + L.element + '">' + ELN(L.element) + '</span>' : '') +
        (here ? ' <span class="seal" style="font-size:10px">此地</span>' : '') + '</div>' +
        '<div class="ls">' + L.subtitle + '</div>' +
        '<div class="ld">灵气 ×' + L.spirit.toFixed(2) + '　危 ' +
        (function () { var s = '<span class="danger-dots">'; for (var i = 0; i < 5; i++) s += '<i class="' + (i < L.danger ? '' : 'off') + '"></i>'; return s + '</span>'; })() +
        '</div>' +
        '<div class="lf">' + (L.features || []).map(function (f) { return '<span class="chip">' + FEAT[f] + '</span>'; }).join('') + '</div>' +
        (lock ? '<div class="tiny e-bad" style="margin-top:3px">' + esc(info.reason) + '</div>' : '') +
        '</button>';
    });
    html += '</div>';

    var L = XIAN.byId(XIAN.Data.locations, S.loc);
    if (L) {
      html += '<h3>此　地<span class="r">' + L.name + '</span></h3>';
      html += '<div class="note" style="line-height:1.95">' + esc(L.desc) + '</div>';
      html += '<div class="btn-row" style="margin-top:8px">' +
        '<button class="btn zhu" data-act="wander">游　历（寻奇遇）</button>' +
        '<button class="btn" data-act="hunt">寻　敌　斗　法</button>';
      if ((L.features || []).indexOf('altar') >= 0) html += '<button class="btn" data-act="divine">祭　坛　问　卦</button>';
      if ((L.features || []).indexOf('trial') >= 0) html += '<button class="btn ink" data-act="trial">入　试　炼（寻强敌）</button>';
      if ((L.features || []).indexOf('spring') >= 0 || (L.features || []).indexOf('sect') >= 0)
        html += '<button class="btn" data-act="rest">静　养（此地宜养）</button>';
      html += '</div>';

      if ((L.features || []).indexOf('forge') >= 0) {
        html += '<h3>炉　鼎　温　养<span class="r">积微成著</span></h3><div class="list">';
        XIAN.Data.forgeOps.forEach(function (op) {
          var c = XIAN.Sys.forgeCost(S, op);
          var ok = S.stone >= c.stone && S.qi >= c.qi;
          html += '<div class="card"><div class="card-h"><span class="n">' + op.name + '</span>' +
            '<span class="t">已行 ' + c.n + ' 次</span>' +
            '<span class="r e-good">' + op.label + ' +' + num(c.gain) + '</span></div>' +
            '<div class="card-d">' + esc(op.desc) + '</div>' +
            '<div style="display:flex;gap:8px;align-items:center;margin-top:4px">' +
            '<button class="btn xs ' + (ok ? '' : '') + '" ' + (ok ? '' : 'disabled') + ' data-act="forge" data-arg="' + op.id + '">行　之</button>' +
            '<span class="tiny">灵石 ' + num(c.stone) + '　炁 ' + num(c.qi) + '　耗时 ' + fmtDays(c.days) + '</span></div></div>';
        });
        html += '</div><div class="tiny dim">同一工序行之愈多，所得递减。此谓「有余不足」。</div>';
      }

      if ((L.features || []).indexOf('sect') >= 0) {
        html += '<h3>道　观<span class="r">清修涤业</span></h3>';
        var cost = Math.round(200 * Math.pow(2.4, S.realm));
        html += '<div class="btn-row">' +
          '<button class="btn" data-act="donate" data-arg="' + cost + '">布　施（灵石 ' + num(cost) + ' → 功德）</button>' +
          '<button class="btn" data-act="penance">苦　行（耗时涤业障）</button>' +
          '</div><div class="tiny dim" style="margin-top:4px">布施得功德，苦行消业障。然功德不可买尽——所谓「上德不德」。</div>';
      }

      if (L.enemies && L.enemies.length) {
        html += '<h3>此　地　妖　魔</h3><div class="list">';
        L.enemies.forEach(function (id) {
          var e = XIAN.byId(XIAN.Data.enemies, id);
          if (!e) return;
          var known = S.flags['met_' + id];
          var ns = XIAN.Sys.enemyStats(e);
          html += '<div class="card"><div class="card-h">' +
            '<span class="n">' + (e.title || '') + e.name + '</span>' +
            (e.boss ? '<span class="seal" style="font-size:10px">魁</span>' : '') +
            '<span class="t">' + XIAN.Data.realms[e.realm].name + ' · ' + ELN(e.element) + ' · ' + KINDE(e.kind) + '</span>' +
            '<span class="r tiny">' + (known ? '精 ' + num(ns.jing) + '　攻 ' + num(ns.atk) + '　护 ' + num(ns.def) + '　速 ' + ns.spd : '未曾照面') + '</span></div>' +
            '<div class="card-d">' + esc(e.desc) + '</div></div>';
        });
        html += '</div>';
      }
    }
    return html;
  };
  function KINDE(k) { return { beast: '妖兽', demon: '魔物', ghost: '幽魂', human: '修士', spirit: '精怪', dragon: '龙属' }[k] || k; }

  /* ============================================================
   * 坊　市
   * ========================================================== */
  U.panels.market = function (S) {
    var L = XIAN.byId(XIAN.Data.locations, S.loc);
    if (!L || (L.features || []).indexOf('market') < 0) {
      return '<h3>坊　市</h3><div class="note warn">此地无市。<b>浮曜城</b>百业辐辏，可往一观。</div>' +
        '<div class="btn-row"><button class="btn zhu" data-act="travel" data-arg="fuyao_cheng">往　浮　曜　城</button></div>' +
        '<h3>囊　中　可　售</h3>' + herbList(S) + pillList(S, true);
    }
    var stock = XIAN.Sys.marketStock(S, XIAN.G.rng);
    var disc = XIAN.Sys.discount(S);
    var html = '<h3>坊　市<span class="r">灵石 ' + num(S.stone) + '　折扣 ' + Math.round((1 - disc) * 100) + '%（名望所致）</span></h3>';
    html += '<div class="tiny dim">市货每逢节气更易。名望愈高，价愈相宜。</div>';

    html += '<h3>灵　药</h3><div class="list">';
    stock.herbs.forEach(function (it, i) {
      var h = XIAN.byId(XIAN.Data.herbs, it.id);
      var pr = Math.round(it.price * disc);
      html += row(h.name, '<span class="tier t' + h.tier + '">' + h.tier + '</span> <span class="tiny el-' + h.element + '">' + ELN(h.element) + '</span>',
        esc(h.desc), pr, it.n, 'buyherb', i, S.stone >= pr && it.n > 0);
    });
    html += '</div>';

    if (stock.pills.length) {
      html += '<h3>成　丹</h3><div class="list">';
      stock.pills.forEach(function (it, i) {
        var p = XIAN.byId(XIAN.Data.pills, it.id);
        var Q = XIAN.Data.pillQuality[it.q];
        var pr = Math.round(it.price * disc);
        html += row(p.name, '<span style="color:' + Q.color + '" class="tiny">' + Q.name + '</span>',
          esc(p.desc) + '　<span class="e-good tiny">' + XIAN.describeEffects(p.effects) + '</span>', pr, it.n, 'buypill', i, S.stone >= pr && it.n > 0);
      });
      html += '</div>';
    }
    if (stock.recipes.length) {
      html += '<h3>丹　方</h3><div class="list">';
      stock.recipes.forEach(function (it, i) {
        var p = XIAN.byId(XIAN.Data.pills, it.id);
        var pr = Math.round(it.price * disc);
        html += row('《' + p.name + '方》', '<span class="tier t' + p.tier + '">' + p.tier + '</span>',
          esc(p.desc), pr, undefined, 'buyrecipe', i, S.stone >= pr);
      });
      html += '</div>';
    }
    if (stock.techs.length) {
      html += '<h3>法　术</h3><div class="list">';
      stock.techs.forEach(function (it, i) {
        var t = XIAN.byId(XIAN.Data.techniques, it.id);
        var pr = Math.round(it.price * disc);
        html += row(t.name, '<span class="tier t' + t.tier + '">' + t.tier + '</span> <span class="tiny el-' + t.element + '">' + ELN(t.element) + '</span>',
          esc(t.desc), pr, undefined, 'buytech', i, S.stone >= pr);
      });
      html += '</div>';
    }
    if (stock.arts.length) {
      html += '<h3>法　宝</h3><div class="list">';
      stock.arts.forEach(function (it, i) {
        var a = XIAN.byId(XIAN.Data.artifacts, it.id);
        var pr = Math.round(it.price * disc);
        html += row(a.name, '<span class="tier t' + a.tier + '">' + a.tier + '</span>',
          esc(a.desc), pr, undefined, 'buyart', i, S.stone >= pr);
      });
      html += '</div>';
    }

    html += '<h3>售　与　贩　夫</h3>' + herbList(S) + pillList(S, true);
    return html;

    function row(name, meta, desc, price, n, act, i, can) {
      return '<div class="card"><div class="card-h"><span class="n">' + name + '</span>' + meta +
        (n !== undefined ? '<span class="t">存 ' + n + '</span>' : '') +
        '<span class="r">灵石 <b class="' + (can ? '' : 'e-bad') + '">' + num(price) + '</b></span></div>' +
        '<div class="card-d">' + desc + '</div>' +
        '<div class="btn-row" style="margin-top:4px"><button class="btn xs ' + (can ? 'zhu' : '') + '" ' +
        (can ? '' : 'disabled') + ' data-act="' + act + '" data-arg="' + i + '">买</button></div></div>';
    }
  };

  /* ============================================================
   * 玄　览（图鉴）
   * ========================================================== */
  U.panels.lore = function (S) {
    var sub = XIAN.G.loreTab || 'realm';
    var TAB = [['realm', '境界'], ['hex', '六十四卦'], ['wuxing', '五行'], ['tech', '法术'], ['herb', '本草'], ['enemy', '妖魔']];
    var html = '<div class="btn-row" style="margin-bottom:10px">' +
      TAB.map(function (t) {
        return '<button class="btn sm ' + (sub === t[0] ? 'zhu' : '') + '" data-act="loretab" data-arg="' + t[0] + '">' + t[1] + '</button>';
      }).join('') + '</div>';

    if (sub === 'realm') {
      html += '<h3>九　重　天　阶</h3><table class="tb"><tr><th>境界</th><th>阶段</th><th class="n">寿元</th><th class="n">一次深修</th><th>天劫</th></tr>';
      XIAN.Data.realms.forEach(function (R, i) {
        var cur = i === S.realm;
        html += '<tr' + (cur ? ' style="background:rgba(168,38,31,.07)"' : '') + '>' +
          '<td><b style="color:' + R.color + '">' + R.name + '</b>' + (cur ? ' <span class="seal" style="font-size:9px">今</span>' : '') + '</td>' +
          '<td class="tiny">' + R.phase + '</td>' +
          '<td class="n">' + num(R.lifespan) + '</td>' +
          '<td class="n">' + fmtDays(R.days) + '</td>' +
          '<td class="tiny">' + (R.tribulation ? R.tribulation.name : '——') + '</td></tr>';
        if (cur) html += '<tr><td colspan="5" class="tiny" style="color:var(--ink-3);padding-left:14px">' + esc(R.desc) + '</td></tr>';
      });
      html += '</table>';
      html += '<h3>劫　相　九　种</h3><div class="list">';
      XIAN.Data.tribTypes.forEach(function (t) {
        html += '<div class="card"><div class="card-h"><span class="n" style="color:' + t.color + '">' + t.name + '</span>' +
          '<span class="t">' + (t.element === 'none' ? '无形' : ELN(t.element) + '属') + '</span>' +
          '<span class="r tiny">伤 ' + ({ jing: '精元', qi: '真炁', shen: '神魂', lifespan: '寿元' }[t.target]) + '</span></div>' +
          '<div class="card-d t-kai">' + esc(t.desc) + '</div></div>';
      });
      html += '</div>';
    } else if (sub === 'hex') {
      html += '<h3>周　易　六　十　四　卦</h3>';
      html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:5px">';
      XIAN.Data.hexagrams.forEach(function (h) {
        var om = XIAN.Data.omenMeta[h.omen];
        var cur = S.divine && S.divine.n === h.n;
        html += '<div class="card click ' + (cur ? 'on' : '') + '" data-act="hexinfo" data-arg="' + h.n + '" style="padding:5px 7px">' +
          '<div style="display:flex;gap:6px;align-items:center">' +
          '<div class="hex-lines" style="gap:2px">' +
          h.lines.split('').map(function (b) {
            return '<div class="ln' + (b === '1' ? '' : ' yin') + '" style="width:22px;height:3px;gap:3px">' +
              (b === '1' ? '<i></i>' : '<i></i><i></i>') + '</div>';
          }).join('') + '</div>' +
          '<div style="min-width:0"><div style="font-size:13px">' + h.n + '. ' + h.name + '</div>' +
          '<div class="tiny" style="color:' + om.color + '">' + h.full + ' · ' + om.label + '</div></div>' +
          '</div></div>';
      });
      html += '</div>';
    } else if (sub === 'wuxing') {
      html += '<h3>五　行　详　解</h3><div class="list">';
      XIAN.Data.elementOrder.forEach(function (k) {
        var E = XIAN.Data.elements[k];
        var v = S.aff[k];
        html += '<div class="card"><div class="card-h">' +
          '<span class="n el-' + k + '" style="font-size:19px">' + E.name + '</span>' +
          '<span class="t">' + E.dir + ' · ' + E.season + ' · ' + E.beast + ' · ' + E.organ + ' · ' + E.taste + ' · ' + E.virtue + '</span>' +
          '<span class="r">本命亲和 <b>' + Math.round(v) + '</b></span></div>' +
          '<div class="card-d">' + esc(E.desc) + '</div>' +
          '<div class="tiny" style="margin-top:3px">' +
          '<span class="e-good">' + E.name + '生' + ELN(E.gen) + '</span>　' +
          '<span class="e-bad">' + E.name + '克' + ELN(E.overcome) + '</span>　' +
          '<span class="dim">' + ELN(E.genBy) + '生' + E.name + '　' + ELN(E.overcomeBy) + '克' + E.name + '</span></div>' +
          '<div class="bar-track thin" style="margin-top:5px"><div class="bar-fill" style="width:' +
          Math.min(100, v) + '%;background:' + E.color + '"></div></div></div>';
      });
      html += '</div>';
      html += '<h3>八　卦</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:5px">';
      (XIAN.Data.bagua || []).forEach(function (b) {
        html += '<div class="card" style="text-align:center;padding:7px"><div style="font-size:26px;line-height:1.1">' + b.symbol + '</div>' +
          '<div style="font-size:15px">' + b.name + '</div>' +
          '<div class="tiny el-' + b.element + '">' + b.nature + ' · ' + ELN(b.element) + ' · ' + b.dir + '</div>' +
          '<div class="tiny dim">' + esc(b.desc) + '</div></div>';
      });
      html += '</div>';
    } else if (sub === 'tech') {
      html += '<h3>法　术　图　鉴<span class="r">已得 ' + S.techs.length + ' / ' + XIAN.Data.techniques.filter(function (t) { return t.id.indexOf('m_') !== 0; }).length + '</span></h3>';
      html += '<div class="list">';
      var ts = XIAN.Data.techniques.filter(function (t) { return t.id.indexOf('m_') !== 0; });
      ts.sort(function (a, b) { return a.tier - b.tier || a.element.localeCompare(b.element); });
      ts.forEach(function (t) {
        var has = S.techs.indexOf(t.id) >= 0;
        html += '<div class="card ' + (has ? '' : 'off') + '"><div class="card-h">' +
          '<span class="n el-' + t.element + '">' + (has ? t.name : '？？？') + '</span>' +
          '<span class="tier t' + t.tier + '">' + t.tier + '阶</span>' +
          '<span class="t">' + ELN(t.element) + ' · ' + KIND(t.kind) + ' · ' + XIAN.Data.realms[t.realm].name + '</span>' +
          '<span class="r tiny">' + t.cost + ' 炁</span></div>' +
          (has ? '<div class="card-d">' + esc(t.desc) + '</div><div class="card-q">「' + esc(t.quote) + '」</div>' : '') +
          '</div>';
      });
      html += '</div>';
    } else if (sub === 'herb') {
      html += '<h3>灵　药　本　草<span class="r">' + XIAN.Data.herbs.length + ' 味</span></h3><div class="list">';
      var hs = XIAN.Data.herbs.slice().sort(function (a, b) { return a.tier - b.tier; });
      hs.forEach(function (h) {
        var have = S.herbs[h.id] || 0;
        html += '<div class="card"><div class="card-h">' +
          '<span class="n el-' + h.element + '">' + h.name + '</span>' +
          '<span class="tier t' + h.tier + '">' + h.tier + '</span>' +
          '<span class="t">' + ELN(h.element) + ' · ' + h.taste + ' · ' + ({ yang: '阳', yin: '阴', ping: '平' }[h.nature]) + ' · 药力 ' + h.potency + '</span>' +
          '<span class="r">' + (have ? '囊中 ×' + have : '<span class="dim">未有</span>') + '</span></div>' +
          '<div class="card-d">' + esc(h.desc) + '</div>' +
          '<div class="tiny dim">产于：' + (h.habitat || []).map(function (l) {
            var LL = XIAN.byId(XIAN.Data.locations, l); return LL ? LL.name : l;
          }).join('、') + '</div></div>';
      });
      html += '</div>';
    } else {
      html += '<h3>妖　魔　录<span class="r">曾遇 ' + Object.keys(S.flags).filter(function (k) { return k.indexOf('met_') === 0; }).length + ' 种</span></h3><div class="list">';
      var es = XIAN.Data.enemies.slice().sort(function (a, b) { return a.realm - b.realm; });
      es.forEach(function (e) {
        var known = S.flags['met_' + e.id];
        var ns = XIAN.Sys.enemyStats(e);
        html += '<div class="card ' + (known ? '' : 'off') + '"><div class="card-h">' +
          '<span class="n">' + (known ? (e.title || '') + e.name : '？？？') + '</span>' +
          (e.boss ? '<span class="seal" style="font-size:9px">魁</span>' : '') +
          '<span class="t">' + XIAN.Data.realms[e.realm].name + ' · ' + ELN(e.element) + ' · ' + KINDE(e.kind) + '</span>' +
          '<span class="r tiny">' + (known ? '精 ' + num(ns.jing) + '　攻 ' + num(ns.atk) : '') + '</span></div>' +
          (known ? '<div class="card-d">' + esc(e.desc) + '</div><div class="card-q">「' + esc(e.taunt) + '」</div>' : '') +
          '</div>';
      });
      html += '</div>';
    }
    return html;
  };

})(XIAN.UI);
