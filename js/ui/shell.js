/* ============================================================
 *  ui-shell.js — 外壳：顶栏、左右侧栏、叙事日志
 * ============================================================ */
window.XIAN = window.XIAN || {};
XIAN.UI = XIAN.UI || {};

(function (U) {
  var $ = XIAN.$, esc = XIAN.esc, num = XIAN.num;

  /* ---------------- 骨架 ---------------- */
  U.buildShell = function () {
    $('#topbar').innerHTML =
      '<div class="tb-brand">' + XIAN.Art.logoSvg() +
      '<div class="tt"><div class="t1">太乙玄门</div><div class="t2">修 仙 模 拟 器</div></div></div>' +
      '<div id="tbInfo" style="display:flex;flex:1 1 auto;min-width:0;overflow:hidden"></div>' +
      '<div class="tb-actions" id="tbActions"></div>';

    $('#colC').innerHTML =
      '<div class="scroll" id="logWrap">' +
      '<div class="sc-head"><span class="ttl">纪　事</span><span class="sub" id="logSub"></span>' +
      '<button class="btn xs" id="btnClearLog" style="margin-left:8px">清</button></div>' +
      '<div id="log"></div>' +
      '<div id="logGrip" title="拖动调整纪事高度"></div></div>' +
      '<div id="tabs"></div>' +
      '<div class="scroll" id="mainStage"><div id="panelWrap"><div class="panel" id="panel"></div></div></div>';

    XIAN.on($('#btnClearLog'), 'click', function () {
      XIAN.G.S.log = [];
      $('#log').innerHTML = '';
    });

    /* 纪事高度可拖拽调整 */
    var wrap = $('#logWrap');
    var grip = $('#logGrip');
    XIAN.on(grip, 'mousedown', function (ev) {
      ev.preventDefault();
      var startY = ev.clientY;
      var startH = wrap.getBoundingClientRect().height;
      var center = wrap.closest('#colC').getBoundingClientRect().height;
      function move(e) {
        var dh = startY - e.clientY;          /* 上拖增大 */
        var h = XIAN.clamp(startH + dh, 150, center * 0.68);
        wrap.style.setProperty('--log-h', h + 'px');
        wrap.style.height = h + 'px';
      }
      function up() {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
        wrap.classList.remove('resizing');
        try { localStorage.setItem('xian_log_h', String(Math.round(wrap.getBoundingClientRect().height))); } catch (e) { }
      }
      wrap.classList.add('resizing');
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });
    try {
      var savedH = parseInt(localStorage.getItem('xian_log_h'), 10);
      if (savedH >= 150) { wrap.style.setProperty('--log-h', savedH + 'px'); wrap.style.height = savedH + 'px'; }
    } catch (e) { }

    $('#tbActions').innerHTML =
      '<button class="btn sm" id="btnSave" title="存入此界（本地）">存</button>' +
      '<button class="btn sm" id="btnHelp" title="玄门要旨">要旨</button>' +
      '<button class="btn sm" id="btnMore" title="更多">…</button>';
    XIAN.on($('#btnSave'), 'click', function () {
      if (XIAN.save(XIAN.G.S)) XIAN.G.toast('命簿已存', 'good');
      else XIAN.G.toast('存档失败', 'bad');
    });
    XIAN.on($('#btnHelp'), 'click', function () { U.openHelp(); });
    XIAN.on($('#btnMore'), 'click', function () { U.openMore(); });
  };

  /* ---------------- 顶栏 ---------------- */
  U.renderTop = function () {
    var S = XIAN.G.S, c = XIAN.Cal.parse(S.day, S.baseYear);
    var R = XIAN.Data.realms[S.realm];
    var lifePct = XIAN.pct(S.age, S.lifespan);
    var lifeCls = lifePct > 88 ? 'style="color:#a8261f"' : (lifePct > 70 ? 'style="color:#9c6a24"' : '');
    $('#tbInfo').innerHTML =
      cell('道　号', '<b>' + esc(S.hao) + '</b>　' + esc(S.name), '') +
      cell('境　界', '<b style="color:' + R.color + ';text-shadow:0 0 8px ' + R.color + '66">' + XIAN.realmName(S.realm, S.stage) + '</b>', '') +
      cell('天　时', c.ganzhi + '年 · <b>' + c.term.name + '</b> · ' + XIAN.han(c.dayInTerm + 1) + '日', 'hide-sm') +
      cell('寿　元', '<span ' + lifeCls + '>' + Math.floor(S.age) + ' / ' + num(S.lifespan) + ' 载</span>', '') +
      cell('灵　石', num(S.stone), 'hide-sm') +
      cell('第几世', '第 ' + XIAN.han(S.life) + ' 世', 'hide-sm') +
      '<div class="tb-spacer"></div>';
    function cell(k, v, cls) {
      return '<div class="tb-cell ' + cls + '"><div class="k">' + k + '</div><div class="v">' + v + '</div></div>';
    }
  };

  /* ---------------- 左栏 ---------------- */
  U.renderLeft = function () {
    var S = XIAN.G.S, st = XIAN.stats(S);
    var need = XIAN.daoNeed(S);
    var L = $('#colL');

    /* 保持滚动位置 */
    var sc = L.scrollTop;

    /* —— 人物立绘 —— */
    var states = [];
    if (S.dead) states.push('<i class="bad">已　殒</i>');
    else if (S.ascended) states.push('<i class="good">飞　升</i>');
    else {
      if (S.jing < st.maxJing * 0.36) states.push('<i class="bad">伤　重</i>');
      if (S.daoxin < 35) states.push('<i class="bad">心　魔</i>');
      if (S.haste > 60) states.push('<i class="warn">躁　动</i>');
      if (Math.abs(S.balance) > 60) states.push('<i class="warn">' + (S.balance > 0 ? '阳　亢' : '阴　凝') + '</i>');
      if (!states.length) states.push('<i class="good">清　静</i>');
    }
    var R = XIAN.Data.realms[S.realm];
    var art = S.equipped && S.equipped.main ? XIAN.byId(XIAN.Data.artifacts, S.equipped.main) : null;
    var avatarBox =
      '<div class="scroll" style="overflow:hidden"><div class="sc-head"><span class="ttl">神　形</span>' +
      '<span class="sub">' + esc(S.root.name) + ' · 第 ' + XIAN.han(S.life) + ' 世</span></div>' +
      '<div class="sc-body tight"><div class="avatar-frame">' +
      '<div class="avatar-tag"><span class="seal">' + (S.meridians.indexOf('ren') >= 0 && S.meridians.indexOf('du') >= 0 ? '小周天' : '初窥门径') + '</span></div>' +
      '<div class="avatar-state">' + states.join('') + '</div>' +
      '<canvas id="avatar"></canvas>' +
      '<div class="avatar-cap">' +
      '<span class="an">' + esc(S.hao) + '</span>' +
      '<span class="ar" style="color:' + R.color + '">' + XIAN.realmName(S.realm, S.stage) + '</span>' +
      (art ? '<span class="ax" title="本命法宝">佩 · ' + esc(art.name) + '</span>' : '') +
      '</div></div></div></div>';

    L.innerHTML =
      avatarBox +
      /* —— 三宝 —— */
      box('三　宝', '精 · 炁 · 神',
        '<div class="bars">' +
        bar('bar-jing', '精', '精元', S.jing, st.maxJing) +
        bar('bar-qi', '炁', '真炁', S.qi, st.maxQi) +
        bar('bar-shen', '神', '神魂', S.shen, st.maxShen) +
        '<div class="brush-hr" style="margin:4px 0"></div>' +
        bar('bar-dao', '道', '道行', S.dao, need, true) +
        '</div>'
      ) +
      /* —— 本命 —— */
      box('本　命', '灵根 · 命格',
        '<div class="metrics">' +
        met('灵　根', S.root.name, 'hi') +
        met('主　气', XIAN.Data.elements[S.root.main].name, '') +
        met('命　格', S.fate.name, S.fate.good === false ? 'hi' : (S.fate.good ? 'go' : '')) +
        met('年　岁', Math.floor(S.age) + ' 载', '') +
        '</div>' +
        '<div class="small dim" style="margin-top:6px;line-height:1.7">' + esc(S.root.desc) + '</div>'
      ) +
      /* —— 太极 —— */
      box('太　极', '阴阳消息',
        '<div class="taiji-wrap">' +
        '<div class="taiji-holder"><canvas id="taiji"></canvas>' +
        '<div class="taiji-ring"></div>' +
        '<div class="bagua-ring">' + XIAN.Art.baguaRing() + '</div></div>' +
        '<div class="balance-scale" style="margin-top:16px">' +
        '<u></u><i style="left:calc(' + ((S.balance + 100) / 2) + '% - 1px)"></i></div>' +
        '<div class="balance-read">' + balanceText(S.balance) + '</div>' +
        '</div>'
      ) +
      /* —— 五行 —— */
      box('五　行', '生克制化',
        '<div class="wuxing-holder"><canvas id="wuxing"></canvas></div>' +
        '<div class="wx-legend"><span class="g"><i></i>相生</span><span class="k"><i></i>相克</span></div>'
      ) +
      /* —— 心性 —— */
      box('心　性', '',
        '<div class="metrics">' +
        met('悟　性', num(st.insight), 'go') +
        met('道　心', Math.round(S.daoxin) + ' / 100', S.daoxin < 35 ? 'hi' : 'go') +
        met('躁　进', Math.round(S.haste) + ' / 100', S.haste > 60 ? 'hi' : '') +
        met('名　望', num(S.repute), '') +
        met('法　力', num(st.atk), '') +
        met('护　体', num(st.def), '') +
        met('身　法', num(st.spd), '') +
        met('机　变', st.crit + '%', '') +
        '</div>' +
        '<div class="brush-hr" style="margin:6px 0 2px"></div>' +
        '<div class="metrics">' +
        met('功　德', num(S.merit), 'go') +
        met('业　障', num(S.karma), S.karma > 60 ? 'hi' : '') +
        '</div>' +
        karmaScale(S) +
        '<div class="tiny dim center" style="margin-top:2px">' + karmaText(S) + '</div>' +
        (deviationHint(S) || '')
      );

    L.scrollTop = sc;
    XIAN.Art.initTaiji($('#taiji'));
    XIAN.Art.setBalance(S.balance);
    XIAN.Art.drawWuxing($('#wuxing'), S.aff, S.root.main);
    /* 立绘挂载 */
    var av = $('#avatar');
    if (av) XIAN.Avatar.mount(av, function () {
      return XIAN.Avatar.describePlayer(XIAN.G.S, { pose: 'sit' });
    });
  };

  function box(title, sub, body) {
    return '<div class="scroll"><div class="sc-head"><span class="ttl">' + title + '</span>' +
      (sub ? '<span class="sub">' + esc(sub) + '</span>' : '') + '</div>' +
      '<div class="sc-body tight">' + body + '</div></div>';
  }
  function met(k, v, cls) {
    return '<div class="metric"><span class="k">' + k + '</span><span class="v ' + cls + '">' + v + '</span></div>';
  }
  function bar(cls, glyph, name, v, max, isDao) {
    var p = XIAN.pct(v, max);
    var ticks = '';
    if (isDao) ticks = '<div class="ticks"><i style="left:25%"></i><i style="left:50%"></i><i style="left:75%"></i></div>';
    return '<div class="bar-row ' + cls + '">' +
      '<div class="bar-top"><span class="bar-glyph">' + glyph + '</span>' +
      '<span class="bar-name">' + name + '</span>' +
      '<span class="bar-val">' + num(Math.floor(v)) + ' / ' + num(Math.round(max)) + '</span></div>' +
      '<div class="bar-track">' + ticks + '<div class="bar-fill" style="width:' + p + '%"></div></div></div>';
  }
  function balanceText(b) {
    var a = Math.abs(b);
    var t;
    if (a <= 15) t = '<b class="harm">太极中和</b>　阴阳相济，万法皆宜';
    else if (b > 0) t = '<b class="e-yang">偏阳 ' + Math.round(a) + '</b>　' + (a >= 80 ? '真火焚身，走火在即' : a >= 55 ? '阳气过盛，宜静宜阴' : '阳气渐旺');
    else t = '<b class="e-yin">偏阴 ' + Math.round(a) + '</b>　' + (a >= 80 ? '阴煞侵心，入魔可虞' : a >= 55 ? '阴气过重，宜动宜阳' : '阴气渐凝');
    return t;
  }
  function karmaScale(S) {
    var m = Math.min(100, S.merit / 5), k = Math.min(100, S.karma / 5);
    return '<div class="karma-scale"><div class="tr"></div>' +
      '<div class="m" style="width:' + (m / 2) + '%"></div>' +
      '<div class="k" style="width:' + (k / 2) + '%"></div>' +
      '<div class="c"></div></div>';
  }
  function karmaText(S) {
    var d = S.merit - S.karma;
    if (S.karma > 200) return '业障如山，天劫必重';
    if (d > 200) return '功德深厚，天道垂青';
    if (d > 60) return '福缘渐厚';
    if (d < -100) return '孽债缠身，宜早涤除';
    if (d < -30) return '略有亏欠';
    return '功过相抵';
  }
  function deviationHint(S) {
    var r = XIAN.Sys.deviationRisk(S);
    if (r < 0.06) return '';
    var cls = r > 0.28 ? 'warn' : '';
    return '<div class="note ' + cls + '" style="margin:7px 0 0;font-size:11.5px;line-height:1.6">' +
      '走火入魔之危：<b>' + Math.round(r * 100) + '%</b>　' +
      (r > 0.28 ? '宜静坐调息，或往道观清修' : '尚在可控之数') + '</div>';
  }

  /* ---------------- 右栏 ---------------- */
  U.renderRight = function () {
    var S = XIAN.G.S, c = XIAN.Cal.parse(S.day, S.baseYear);
    var L = XIAN.byId(XIAN.Data.locations, S.loc);
    var R = $('#colR');
    var sc = R.scrollTop;

    /* 节气条 */
    var strip = '';
    XIAN.Data.solarTerms.forEach(function (t, i) {
      var E = XIAN.Data.elements[t.element];
      strip += '<i class="' + (i === c.termIdx ? 'cur' : '') + '" title="' + t.name + '（' + E.name + '）" ' +
        'style="background:' + XIAN.Art.rgba(E.color, i === c.termIdx ? 1 : .5) + '"></i>';
    });
    var tm = XIAN.Cal.timeMult(S.day, S.root.main);
    var tmTxt = tm >= 1.25 ? '<span class="e-good">当令 ×' + tm.toFixed(2) + '</span>'
      : tm >= 1.05 ? '<span class="e-good">得助 ×' + tm.toFixed(2) + '</span>'
        : tm < 0.9 ? '<span class="e-bad">受制 ×' + tm.toFixed(2) + '</span>' : '×' + tm.toFixed(2);
    var TE = XIAN.Data.elements[c.term.element];

    R.innerHTML =
      box('天　时', c.ganzhi + '年',
        '<div class="term-info"><span class="tn">' + c.term.name + '</span>' +
        '<span class="te el-' + c.term.element + '">' + TE.name + '</span>' +
        '<span class="ty">' + (c.term.yang > 0 ? '阳' : '阴') + '气 ' + Math.abs(c.term.yang) + '</span></div>' +
        '<div class="term-poem">' + c.term.poem + '</div>' +
        '<div class="term-strip">' + strip + '</div>' +
        '<div class="tiny dim" style="margin-top:6px">' + c.season + '令 · ' + c.beast + '年 · 本命' +
        XIAN.Data.elements[S.root.main].name + '气 ' + tmTxt + '</div>'
      ) +
      box('卦　象', XIAN.Sys.divineActive(S) ? '本节气有效' : '未卜',
        hexBox(S)
      ) +
      box('所　在', L ? ('危 ' + dangerDots(L.danger)) : '',
        L ? locBox(L) : '<div class="dim small">不知身在何处</div>'
      ) +
      box('经　脉', (S.meridians.length) + ' / ' + XIAN.Data.meridians.length,
        '<div class="bar-row bar-life"><div class="bar-track thin">' +
        '<div class="bar-fill" style="width:' + XIAN.pct(S.meridians.length, XIAN.Data.meridians.length) + '%"></div></div></div>' +
        '<div class="tiny" style="margin-top:5px">' +
        (S.meridians.indexOf('ren') >= 0 && S.meridians.indexOf('du') >= 0
          ? '<span class="e-gold">小周天已通，真炁自行周流</span>'
          : '<span class="dim">任督未贯，真炁行走尚滞</span>') + '</div>' +
        '<button class="btn sm wide" style="margin-top:7px" onclick="XIAN.G.goTab(\'meridian\')">观　内　景</button>'
      );

    R.scrollTop = sc;
  };

  function hexBox(S) {
    if (!S.divine) {
      return '<div class="hex-empty">未曾问卦。<br><span class="dim tiny">《易》曰：不占而已矣。然人之惑，终须一问。</span></div>' +
        '<button class="btn sm wide zhu" style="margin-top:6px" onclick="XIAN.G.doDivine()">卜　一　卦</button>';
    }
    var d = S.divine, om = XIAN.Data.omenMeta[d.omen];
    var active = XIAN.Sys.divineActive(S);
    return '<div class="hex-box">' +
      '<div class="hex-lines">' + XIAN.Art.hexLinesHtml(d.lines, d.moving) + '</div>' +
      '<div class="hex-meta">' +
      '<div class="hex-name"><span class="no">第' + d.n + '卦</span>' + d.name + '</div>' +
      '<div class="hex-full">' + d.full + '</div>' +
      '<div style="margin-top:3px"><span class="hex-omen" style="color:' + om.color + '">' + om.label +
      '　×' + om.mult.toFixed(2) + '</span></div>' +
      '</div></div>' +
      '<div class="hex-judge">「' + d.judgement + '」</div>' +
      '<div class="hex-advice">' + esc(d.advice) + '</div>' +
      '<div class="hex-guide">' + esc(d.guide) + (d.target ? '　变卦：' + d.target.name : '') + '</div>' +
      (active ? '' : '<div class="tiny e-bad" style="margin-top:4px">节气已易，此卦失效</div>') +
      '<button class="btn sm wide" style="margin-top:7px" onclick="XIAN.G.doDivine()">' +
      (active ? '再　卜（渎）' : '重　卜　一　卦') + '</button>';
  }
  function dangerDots(d) {
    var s = '<span class="danger-dots">';
    for (var i = 0; i < 5; i++) s += '<i class="' + (i < d ? '' : 'off') + '"></i>';
    return s + '</span>';
  }
  function locBox(L) {
    var FEAT = { gather: '采药', cultivate: '打坐', market: '坊市', sect: '道观', altar: '祭坛', ruin: '遗迹', forge: '炉鼎', spring: '灵泉', trial: '试炼', tribulation: '渡劫台' };
    var f = (L.features || []).map(function (x) { return '<span class="chip">' + (FEAT[x] || x) + '</span>'; }).join('');
    var E = XIAN.Data.elements[L.element];
    return '<div style="font-size:16px;letter-spacing:.12em">' + L.name +
      (E ? ' <span class="tiny el-' + L.element + '">' + E.name + '气</span>' : '') + '</div>' +
      '<div class="t-kai small" style="color:var(--ink-3)">' + L.subtitle + '</div>' +
      '<div class="tiny" style="margin-top:4px">灵气浓度 <b>×' + L.spirit.toFixed(2) + '</b></div>' +
      '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:5px">' + f + '</div>' +
      '<div class="small dim" style="margin-top:6px;line-height:1.7">' + esc(L.omenText || '') + '</div>';
  }

  /* ---------------- 日志 ---------------- */
  /* 纪事条目按内容配以标记：传 = 叙事 / 战 = 斗法 / 修 = 修行 / 丹 = 丹道 / 卜 = 问卦 / 劫 = 天劫 / 行 = 行路 */
  function logGlyph(h, cls) {
    var m = h.match(/^〔([^〕]+)〕/);
    if (!m) return '';
    var tag = m[1];
    if (/游历|采药/.test(tag)) return '游';
    if (/斗法|寻敌|试炼|胜|败于|自「/.test(tag)) return '战';
    if (/深修|静养|突破|冲脉|温养|服丹|静养/.test(tag) || /深修/.test(h)) return '修';
    if (/丹道|丹成|服丹/.test(tag)) return '丹';
    if (/问卦/.test(tag)) return '卜';
    if (/天劫|渡劫/.test(tag)) return '劫';
    if (/行路|布施|苦行|坊市/.test(tag)) return '行';
    if (/炼精|炼炁|炼神/.test(tag)) return '炼';
    return '';
  }
  U.log = function (html, cls) {
    var S = XIAN.G.S;
    S.log.push({ h: html, c: cls || '' });
    if (S.log.length > 400) S.log.splice(0, S.log.length - 400);
    var el = $('#log');
    if (!el) return;
    var g = logGlyph(html, cls);
    var d = XIAN.el('div', 'logline ' + (cls || ''), html);
    if (g) d.setAttribute('data-g', g);
    el.appendChild(d);
    while (el.children.length > 400) el.removeChild(el.firstChild);
    el.scrollTop = el.scrollHeight;
  };
  U.renderLog = function () {
    var el = $('#log');
    if (!el) return;
    el.innerHTML = (XIAN.G.S.log || []).map(function (l) {
      var g = logGlyph(l.h, l.c);
      return '<div class="logline ' + l.c + '"' + (g ? ' data-g="' + g + '"' : '') + '>' + l.h + '</div>';
    }).join('');
    el.scrollTop = el.scrollHeight;
    var S = XIAN.G.S;
    $('#logSub').textContent = XIAN.Cal.format(S.day, S.baseYear);
  };

  /* ---------------- 标签 ---------------- */
  U.TABS = [
    { id: 'cultivate', name: '修　行' },
    { id: 'alchemy', name: '丹　道' },
    { id: 'meridian', name: '经　脉' },
    { id: 'bag', name: '囊　中' },
    { id: 'world', name: '寰　宇' },
    { id: 'market', name: '坊　市' },
    { id: 'lore', name: '玄　览' }
  ];
  U.renderTabs = function () {
    var S = XIAN.G.S;
    var bi = XIAN.Sys.breakInfo(S);
    $('#tabs').innerHTML = U.TABS.map(function (t) {
      var dot = '';
      if (t.id === 'cultivate' && bi.ready && !bi.blockers.length) dot = '<span class="dot"></span>';
      return '<button class="tab ' + (XIAN.G.tab === t.id ? 'on' : '') + '" data-tab="' + t.id + '">' + t.name + dot + '</button>';
    }).join('');
    XIAN.$$('#tabs .tab').forEach(function (b) {
      XIAN.on(b, 'click', function () { XIAN.G.goTab(b.getAttribute('data-tab')); });
    });
  };

  /* ---------------- 提示 ---------------- */
  U.toast = function (msg, cls) {
    var t = XIAN.el('div', 'toast ' + (cls || ''), esc(msg));
    $('#toast').appendChild(t);
    setTimeout(function () {
      t.style.transition = 'opacity .4s'; t.style.opacity = '0';
      setTimeout(function () { t.remove(); }, 420);
    }, 1900);
  };

  /* ---------------- 弹窗基座 ---------------- */
  U.modal = function (opts) {
    var root = $('#modalRoot');
    var m = XIAN.el('div', 'modal ' + (opts.cls || ''));
    m.innerHTML =
      '<div class="md-head"><span class="ttl">' + (opts.title || '') + '</span>' +
      (opts.sub ? '<span class="sub">' + opts.sub + '</span>' : '') +
      (opts.closable === false ? '' : '<button class="x" data-x>×</button>') +
      '</div>' +
      '<div class="md-body">' + (opts.body || '') + '</div>' +
      (opts.foot ? '<div class="md-foot">' + opts.foot + '</div>' : '');
    root.innerHTML = '';
    root.appendChild(m);
    root.classList.add('on');
    var xb = m.querySelector('[data-x]');
    if (xb) XIAN.on(xb, 'click', function () { U.closeModal(); if (opts.onClose) opts.onClose(); });
    if (opts.onBuild) opts.onBuild(m);
    return m;
  };
  U.closeModal = function () {
    var root = $('#modalRoot');
    root.classList.remove('on');
    root.innerHTML = '';
    XIAN.Art.stopFurnace();
  };
  U.modalOpen = function () { return $('#modalRoot').classList.contains('on'); };

  /* ---------------- 要旨 / 更多 ---------------- */
  U.openHelp = function () {
    U.modal({
      title: '玄门要旨', sub: '道之所在，不在文字，然文字可指其所在',
      cls: 'wide',
      body:
        '<h3>三　宝</h3>' +
        '<p><b>精</b>者，形之本，亦即性命所系。精尽则身死。<b>炁</b>者，法之源，施法、御宝、开脉皆赖之。<b>神</b>者，识之主，占卜、悟道、抗心魔用之。</p>' +
        '<p>三宝可以相化，此即丹道正脉：<b>炼精化炁</b> → <b>炼炁化神</b> → <b>炼神还虚</b>。「还虚」者，以神魂直换道行，乃高境界进境之要门。见「修行」页。</p>' +
        '<h3>五　行</h3>' +
        '<p>相生：木生火，火生土，土生金，金生水，水生木。相克：木克土，土克水，水克火，火克金，金克木。</p>' +
        '<p>斗法时，以我克彼者伤害 ×1.45，被彼所克者仅 ×0.68。渡劫「引化」时，须以能克该劫之气应之。</p>' +
        '<h3>阴　阳</h3>' +
        '<p>阴阳值 −100（极阴）至 +100（极阳）。<b>|阴阳| ≤ 15 时得「太极中和」</b>，修行、攻防、突破皆有加成。</p>' +
        '<p>偏阳过甚则「走火」，偏阴过甚则「入魔」。<b>节气</b>会牵引阴阳：夏至前后阳气盛，冬至前后阴气重。<b>静坐</b>与<b>返虚</b>可收摄归中。此即「顺天而调」。</p>' +
        '<h3>天　时</h3>' +
        '<p>一年三百六十日，二十四节气，六十甲子。当令之气与本命五行相生则修行倍速，相克则事倍功半。<b>择时而修，是修士第一等本事。</b></p>' +
        '<h3>无　为</h3>' +
        '<p>心法有六：自然、静坐、吐纳、苦修、返虚、夺天。苦修与夺天进境极速，然躁进积、道心损、走火之危陡增。</p>' +
        '<p><b>静坐</b>道行所得甚微，却能尽消躁进、复还道心、且必不走火。斗法中亦有「无为」一项：不攻不守，回炁最多，且有几率令敌自乱。</p>' +
        '<p class="quote">「为学日益，为道日损。」</p>' +
        '<h3>因　果</h3>' +
        '<p>功德延寿、轻劫、佑事；业障折寿、重劫、招灾。业障逾一百五十者，天劫中必现「业劫」。功德满一百五十，天劫中可化金甲，替你受一击。</p>' +
        '<h3>天　劫</h3>' +
        '<p>大境界突破须渡天劫。每一重劫相可择五法应之：<b>硬抗</b>（全伤，增道心）、<b>御宝</b>（耗炁四成，减伤六成半）、<b>引化</b>（择五行相克者，可减至两成）、<b>顺受</b>（此劫加重三成，然「天道垂怜」使后劫皆轻，且增道心功德）、<b>遁避</b>（一劫一次，折寿五分）。</p>' +
        '<p>末重若为<b>道劫</b>，天将有问。答语高下，关乎生死——所答须合于道，非合于力。</p>' +
        '<h3>丹　道</h3>' +
        '<p>丹方讲<b>君臣佐使</b>：一君为主，臣以辅之，佐以制之，使以引之。炼制时须掌<b>火候</b>：指针游走，于理想火位落指，误差越小，丹品越高（废丹 / 下品 / 中品 / 上品 / 极品 / 仙品）。</p>' +
        '<p>火系亲和、悟性、九转炉、赤道命格皆可放宽容差。同一丹连服逾三枚，药力递减，此谓「是药三分毒」。</p>' +
        '<h3>寿　元　与　轮　回</h3>' +
        '<p>年岁至寿元则身死。每进一境，寿元大增；然高境界一次深修动辄数十年至百年，故<b>大乘、渡劫之境，时间才是真正的敌人</b>。</p>' +
        '<p>身死则转世。境界、功德、悟性、经脉皆折为传承，下一世得赠悟性、灵石、寿元、宿世丹方与一门「宿慧」法术，且更易得上品灵根。</p>' +
        '<p class="quote">「死生，命也。其有夜旦之常，天也。」</p>',
      foot: '<button class="btn" onclick="XIAN.UI.closeModal()">已　知</button>'
    });
  };

  U.openMore = function () {
    var S = XIAN.G.S;
    U.modal({
      title: '别　事', cls: 'narrow',
      body:
        '<div class="btn-grid">' +
        '<button class="btn" id="mmSave">存　档</button>' +
        '<button class="btn" id="mmLoad">读　档</button>' +
        '<button class="btn" id="mmExport">导出文本</button>' +
        '<button class="btn" id="mmImport">导入文本</button>' +
        '<button class="btn" id="mmChron">生平纪年</button>' +
        '<button class="btn" id="mmLives">前世碑铭</button>' +
        '<button class="btn zhu" id="mmRestart">重开一世</button>' +
        '</div>' +
        '<div class="note" style="margin-top:12px">存档保存在此浏览器本地。清理浏览器数据会一并清除。' +
        '「导出文本」可将命簿抄为一段字符，另存他处。</div>' +
        '<div id="mmOut" style="margin-top:10px"></div>',
      onBuild: function (m) {
        XIAN.on(m.querySelector('#mmSave'), 'click', function () {
          XIAN.G.toast(XIAN.save(S) ? '命簿已存' : '存档失败', XIAN.save(S) ? 'good' : 'bad');
        });
        XIAN.on(m.querySelector('#mmLoad'), 'click', function () {
          var L = XIAN.load();
          if (!L) return XIAN.G.toast('未见存档', 'bad');
          U.closeModal(); XIAN.G.adopt(L); XIAN.G.toast('已读取命簿', 'good');
        });
        XIAN.on(m.querySelector('#mmExport'), 'click', function () {
          var t = XIAN.exportSave(S);
          m.querySelector('#mmOut').innerHTML =
            '<textarea readonly style="width:100%;height:110px;font-size:11px;font-family:monospace">' + t + '</textarea>';
          m.querySelector('#mmOut textarea').select();
        });
        XIAN.on(m.querySelector('#mmImport'), 'click', function () {
          m.querySelector('#mmOut').innerHTML =
            '<textarea id="impTa" placeholder="粘贴命簿文本" style="width:100%;height:110px;font-size:11px;font-family:monospace"></textarea>' +
            '<button class="btn zhu sm" id="impGo" style="margin-top:6px">读　入</button>';
          XIAN.on(m.querySelector('#impGo'), 'click', function () {
            var v = m.querySelector('#impTa').value;
            var s = XIAN.importSave(v);
            if (!s) return XIAN.G.toast('文本无效', 'bad');
            U.closeModal(); XIAN.G.adopt(s); XIAN.G.toast('已读入命簿', 'good');
          });
        });
        XIAN.on(m.querySelector('#mmChron'), 'click', function () { U.closeModal(); U.openChronicle(); });
        XIAN.on(m.querySelector('#mmLives'), 'click', function () { U.closeModal(); U.openLives(); });
        XIAN.on(m.querySelector('#mmRestart'), 'click', function () {
          if (!confirm('弃此一世，另投一胎？（当前进度将不可复原）')) return;
          U.closeModal();
          XIAN.settleLegacy(S);
          XIAN.clearSave();
          XIAN.G.newLife();
        });
      },
      foot: '<button class="btn" onclick="XIAN.UI.closeModal()">退</button>'
    });
  };

  U.openChronicle = function () {
    var S = XIAN.G.S;
    var rows = (S.chronicle || []).slice().reverse().map(function (c) {
      return '<div class="epitaph"><span class="lf">' + c.when + '</span>' +
        '<span class="nm">' + c.text + '</span></div>';
    }).join('') || '<div class="dim center">生平尚无可纪之事。</div>';
    U.modal({
      title: '生平纪年', sub: S.hao + ' · 第' + XIAN.han(S.life) + '世',
      body: '<div style="max-height:52vh;overflow-y:auto">' + rows + '</div>' +
        '<h3>统　计</h3>' + statGrid(S),
      foot: '<button class="btn" onclick="XIAN.UI.closeModal()">合　卷</button>'
    });
  };

  function statGrid(S) {
    var t = S.stats;
    var pairs = [
      ['行动次数', t.actions], ['深修次数', t.cultivations], ['走火入魔', t.deviations],
      ['斗法次数', t.battles], ['胜　负', t.wins + ' / ' + (t.battles - t.wins)],
      ['诛杀妖魔', t.kills], ['斩　魁', t.bosses],
      ['成丹枚数', t.pillsMade], ['废丹次数', t.pillsFailed],
      ['采药株数', t.herbsGathered], ['奇遇次数', t.eventsMet],
      ['占卜次数', t.divinations], ['贯通经脉', t.meridiansOpened],
      ['突破次数', t.breakthroughs], ['渡劫次数', t.tribulations],
      ['在世日数', num(t.daysLived)], ['历经春秋', Math.floor(S.age - S.born) + ' 载']
    ];
    return '<div class="stat-grid">' + pairs.map(function (p) {
      return '<div><span>' + p[0] + '</span><span>' + p[1] + '</span></div>';
    }).join('') + '</div>';
  }
  U.statGrid = statGrid;

  U.openLives = function () {
    var lg = XIAN.loadLegacy();
    var rows = (lg.epitaphs || []).map(function (e) {
      return '<div class="epitaph">' +
        '<span class="lf">第' + XIAN.han(e.life) + '世</span>' +
        '<span class="nm">' + esc(e.name) + '</span>' +
        '<span class="dim tiny">' + esc(e.root) + '</span>' +
        '<span class="rl">' + esc(e.realm) + '</span>' +
        '<span class="cs">' + Math.floor(e.age) + '载 · ' + esc(e.cause) + '</span></div>';
    }).join('') || '<div class="dim center">此界初开，尚无前世。</div>';
    U.modal({
      title: '前世碑铭', sub: '共历 ' + (lg.lives || 0) + ' 世' + (lg.ascensions ? ' · 飞升 ' + lg.ascensions + ' 次' : ''),
      body:
        '<div style="max-height:44vh;overflow-y:auto">' + rows + '</div>' +
        '<h3>宿　世　所　积</h3>' +
        '<div class="metrics">' +
        met('赠悟性', '+' + (lg.insight || 0), 'go') +
        met('赠灵石', '+' + num(lg.stone || 0), 'go') +
        met('赠寿元', '+' + (lg.lifespan || 0) + ' 载', 'go') +
        met('赠道心', '+' + (lg.daoxin || 0), 'go') +
        met('灵根缘', '+' + (lg.rootLuck || 0), 'go') +
        met('宿世方', (lg.recipes || []).length + ' 张', '') +
        '</div>' +
        (lg.memoryTech ? '<div class="note dao" style="margin-top:8px">宿慧：《' +
          esc((XIAN.byId(XIAN.Data.techniques, lg.memoryTech) || {}).name || '') + '》——此法你一生下来便会。</div>' : '') +
        '<p class="quote" style="margin-top:10px">「其生若浮，其死若休。」</p>',
      foot: '<button class="btn" onclick="XIAN.UI.closeModal()">合　卷</button>'
    });
  };

})(XIAN.UI);
