/* ============================================================
 *  trib.js — 天劫：九重劫相、引化生克、顺受无为、道问
 * ============================================================ */
window.XIAN = window.XIAN || {};
XIAN.Sys = XIAN.Sys || {};

/* 道劫问答：答案高下之分，本于《道德经》《南华经》 */
XIAN.Data.daoQuestions = [
  {
    q: '天问：何者为道？',
    opts: [
      { t: '道可道，非常道。可言者，皆非道也。', grade: 3, say: '雷声一顿，似有默许。' },
      { t: '道者，万物之所由。生之，畜之，而不有之。', grade: 3, say: '劫云微散，露出一线天光。' },
      { t: '道即天理，循之则昌，逆之则亡。', grade: 2, say: '天雷稍缓，然未尽息。' },
      { t: '道即大力。力足则可为道。', grade: 0, say: '劫云暴涨——此答，天不许。' }
    ]
  },
  {
    q: '天问：汝修道千载，所求何物？',
    opts: [
      { t: '无所求。求则有待，有待则不自在。', grade: 3, say: '风止。天地静了一瞬。' },
      { t: '求全性命，尽其天年而已。', grade: 3, say: '劫雷改道，自你身侧掠过。' },
      { t: '求长生不死，与天地同寿。', grade: 1, say: '雷声转急——贪生者，天必试之。' },
      { t: '求登绝顶，令众生仰视。', grade: 0, say: '万雷齐鸣。你听见天在笑。' }
    ]
  },
  {
    q: '天问：强者当如何自处？',
    opts: [
      { t: '知其雄，守其雌。上善若水，处下不争。', grade: 3, say: '劫水自分，不没你顶。' },
      { t: '功成而不居，为而不恃。', grade: 3, say: '天光一收，一劫自消。' },
      { t: '当以力止乱，代天行罚。', grade: 1, say: '天以雷答：代天者，先受天诛。' },
      { t: '弱肉强食，本是天道。', grade: 0, say: '劫云化作巨口，向你合来。' }
    ]
  },
  {
    q: '天问：生死之际，汝作何解？',
    opts: [
      { t: '方生方死，方死方生。生死一条也。', grade: 3, say: '你身如虚，雷穿身而过。' },
      { t: '死生，命也。其有夜旦之常，天也。', grade: 3, say: '劫相凝住，久之乃散。' },
      { t: '生可喜，死可悲。此人情之常。', grade: 2, say: '天雷落下，却轻了几分。' },
      { t: '我不欲死。谁言死，我便斩之。', grade: 0, say: '天雷加倍。执念，正是劫之所生。' }
    ]
  }
];

XIAN.Sys.tribWaveCount = function (realm) {
  return [0, 3, 5, 6, 7, 7, 8, 8, 9][realm] || 5;
};

XIAN.Trib = function (S, rng) {
  this.S = S; this.rng = rng;
  var R = XIAN.Data.realms[S.realm];
  this.realm = S.realm;
  this.meta = R.tribulation || { name: '天劫', power: 1, desc: '' };
  this.total = XIAN.Sys.tribWaveCount(S.realm);
  this.idx = 0;
  this.done = false;
  this.result = null;
  this.fleeUsed = false;
  this.mercy = 0;        /* 顺受所积「天道垂怜」，削减后续劫威 */
  this.saved = false;
  this.log = [];
  this.tally = { jing: 0, qi: 0, shen: 0, life: 0, endure: 0, channel: 0, yield: 0, guard: 0, flee: 0 };

  /* 业障加劫、功德减劫、命格影响 */
  var fm = (S.fate && S.fate.mods) || {};
  this.karmaMult = 1 + Math.min(1.2, S.karma / 300) + (fm.tribPower || 0);
  this.meritMult = Math.max(0.72, 1 - Math.min(0.28, S.merit / 2600));
  /* 劫威归一：修士之三宝随境界暴涨，故劫力须以「相对之数」计。
     绝对劫威（1 → 26）折为相对劫威（1 → 3.1），方不至于一劫必死。 */
  this.absPower = this.meta.power;
  this.relPower = 1 + (this.meta.power - 1) * 0.085;
  /* 九重仙劫非寻常天劫：此界不容仙，故天必尽全力诛之 */
  if (S.realm >= 8) this.relPower *= 1.30;
  this.powerBase = this.relPower * this.karmaMult * this.meritMult;

  /* 生成劫相序列 */
  var types = XIAN.Data.tribTypes;
  this.waves = [];
  var used = {};
  /* 道劫者，天问也，唯大乘之后方有；业劫者，索债也，无债则不来；
     寿劫夺人岁月，非元婴以上不足承之。 */
  var pool0 = types.filter(function (t) {
    if (t.id === 'dao') return S.realm >= 7;
    if (t.id === 'ye') return S.karma >= 60;
    if (t.id === 'shou') return S.realm >= 3;
    return true;
  });
  if (pool0.length < 3) pool0 = types.slice();
  for (var i = 0; i < this.total; i++) {
    var t;
    if (S.realm >= 8) {
      /* 九重仙劫：风火雷水金心业寿道，依次而至 */
      t = types[i % types.length];
    } else {
      var pref = pool0.filter(function (tt) { return !used[tt.id]; });
      t = rng.pick(pref.length ? pref : pool0);
    }
    used[t.id] = true;
    /* 业障深重者，末二重必遇业劫 */
    if (i === this.total - 2 && S.karma > 150 && S.realm >= 2) t = XIAN.byId(types, 'ye');
    /* 大乘以上，末重必是天问 */
    if (i === this.total - 1 && S.realm >= 7) t = XIAN.byId(types, 'dao');
    this.waves.push({
      type: t,
      power: this.powerBase * (0.85 + i * 0.09),
      q: t.id === 'dao' ? rng.pick(XIAN.Data.daoQuestions) : null
    });
  }
};

XIAN.Trib.prototype.cur = function () { return this.waves[this.idx]; };

XIAN.Trib.prototype.options = function () {
  var S = this.S, st = XIAN.stats(S), w = this.cur();
  if (!w) return [];
  if (w.type.id === 'dao') {
    return w.q.opts.map(function (o, i) {
      return { id: 'dao' + i, label: o.t, kind: 'dao', gradeIdx: i, hint: '一言既出，天地为证' };
    });
  }
  var opts = [];
  opts.push({
    id: 'endure', label: '硬　抗', kind: 'endure',
    hint: '以肉身承之。伤重，然道心愈坚。'
  });
  var hasArt = S.equipped.main || S.equipped.robe;
  opts.push({
    id: 'guard', label: '御　宝', kind: 'guard',
    hint: hasArt ? ('以「' + (XIAN.byId(XIAN.Data.artifacts, S.equipped.robe || S.equipped.main) || {}).name + '」当之，耗炁三成，减伤六成半') : '无法宝可御',
    disabled: !hasArt || S.qi < st.maxQi * 0.3,
    reason: !hasArt ? '身无法宝' : (S.qi < st.maxQi * 0.3 ? '真炁不足三成' : '')
  });
  opts.push({
    id: 'channel', label: '引　化', kind: 'channel',
    hint: '以五行之力引而化之。得其克者大吉，遇其所克者大凶。耗炁两成二。',
    disabled: S.qi < st.maxQi * 0.22,
    reason: S.qi < st.maxQi * 0.22 ? '真炁不足二成' : '',
    elements: XIAN.Data.elementOrder.slice()
  });
  opts.push({
    id: 'yield', label: '顺　受', kind: 'yield',
    hint: '不抗不避，如枯木受雨。此劫加重两成半，然天道垂怜，后劫皆轻。'
  });
  opts.push({
    id: 'flee', label: '遁　避', kind: 'flee',
    hint: this.fleeUsed ? '遁法只可一用' : '折寿五分，避此一劫。业障随之。',
    disabled: this.fleeUsed, reason: this.fleeUsed ? '已用过' : ''
  });
  return opts;
};

/* 劫中服丹：不消耗劫数 */
XIAN.Trib.prototype.usePill = function (key) {
  var r = XIAN.Sys.takePill(this.S, key, this.rng);
  if (!r.ok) return r;
  this.pillsUsed = (this.pillsUsed || 0) + 1;
  this.log.push('<span class="trib-say">你于劫光间隙吞下「' + r.pill.name + '」。</span>' + r.lines.join('　'));
  return r;
};

XIAN.Trib.prototype.respond = function (optId, element) {
  if (this.done) return null;
  var S = this.S, rng = this.rng, st = XIAN.stats(S), w = this.cur();
  var out = { lines: [], wave: w, idx: this.idx };
  var mult = 1;
  var extra = [];

  if (optId.indexOf('dao') === 0 && w.type.id === 'dao') {
    var gi = parseInt(optId.slice(3), 10);
    var o = w.q.opts[gi];
    out.answer = o;
    out.lines.push('<span class="trib-say">' + o.say + '</span>');
    mult = [2.2, 1.4, 0.85, 0.30][3 - o.grade];
    if (o.grade === 3) { S.daoxin = XIAN.clamp(S.daoxin + 10, 0, 100); S.insight += 1; extra.push('道心 +10　悟性 +1'); }
    else if (o.grade === 0) { S.daoxin = XIAN.clamp(S.daoxin - 10, 0, 100); S.karma += 20; extra.push('道心 -10　业障 +20'); }
    this.tally.endure++;
  } else if (optId === 'endure') {
    mult = 1;
    S.daoxin = XIAN.clamp(S.daoxin + 2, 0, 100);
    out.lines.push('<span class="trib-say">你不闪不避，抬头看着那道劫光落下。</span>');
    this.tally.endure++;
  } else if (optId === 'guard') {
    var cost = Math.round(st.maxQi * 0.30);
    S.qi = Math.max(0, S.qi - cost);
    var art = XIAN.byId(XIAN.Data.artifacts, S.equipped.robe || S.equipped.main);
    /* 法宝品阶愈高，所御愈坚 */
    mult = XIAN.clamp(0.58 - (art ? art.tier : 1) * 0.055, 0.28, 0.58);
    out.lines.push('<span class="trib-say">「' + (art ? art.name : '法宝') + '」腾空而起，光华大盛。</span>');
    extra.push('炁 -' + XIAN.num(cost) + '　减伤 ' + Math.round((1 - mult) * 100) + '%');
    this.tally.guard++;
  } else if (optId === 'channel') {
    var cost2 = Math.round(st.maxQi * 0.22);
    S.qi = Math.max(0, S.qi - cost2);
    var rel = XIAN.elemRelation(element, w.type.element);
    var affRaw = S.aff[element] || 0;
    /* 引化之效，全在亲和之深浅。杂而不精者，虽得其克，亦难尽化。 */
    var keMult = XIAN.clamp(0.62 - (affRaw / 100) * 0.52, 0.14, 0.62);
    if (w.type.element === 'none') {
      mult = 0.88;
      out.lines.push('<span class="trib-say">此劫无形无相，五行之力难以着落。</span>');
    } else if (rel === 'ke') {
      mult = keMult;
      out.lines.push('<span class="trib-say">' + XIAN.Data.elements[element].name + '气一起，' + w.type.name +
        (keMult < 0.25 ? '应手而散。' : keMult < 0.45 ? '为之一敛。' : '稍缓其势，然未能尽化。') + '</span>');
      S.aff[element] = XIAN.clamp(S.aff[element] + 2, 0, 120);
      extra.push(XIAN.Data.elements[element].name + '之亲和 +2');
    } else if (rel === 'gen') {
      mult = XIAN.clamp(keMult + 0.30, 0.4, 0.95);
      out.lines.push('<span class="trib-say">你以' + XIAN.Data.elements[element].name + '气相生，劫势为之一缓。</span>');
    } else if (rel === 'same') {
      mult = XIAN.clamp(keMult + 0.42, 0.5, 1.0);
      out.lines.push('<span class="trib-say">同气相求，劫力自你身中穿过，不甚为患。</span>');
    } else if (rel === 'genBy') {
      mult = 1.18; out.lines.push('<span class="trib-say">劫气反为你所引之力所养，愈发炽盛。</span>');
    } else {
      mult = 1.58; out.lines.push('<span class="trib-say">你引错了气——' + w.type.name + '正克此气，劫威暴涨！</span>');
    }
    extra.push('炁 -' + XIAN.num(cost2));
    this.tally.channel++;
  } else if (optId === 'yield') {
    mult = 1.25;
    this.mercy += 0.17;
    S.daoxin = XIAN.clamp(S.daoxin + 8, 0, 100);
    S.merit += 5;
    S.haste = XIAN.clamp(S.haste - 8, 0, 100);
    out.lines.push('<span class="trib-say">你收了法，散了罡气，垂手立在劫下。天地忽然安静。</span>');
    extra.push('道心 +8　功德 +5　天道垂怜 +17%');
    this.tally.yield++;
  } else if (optId === 'flee') {
    if (this.fleeUsed) return null;
    this.fleeUsed = true;
    var life = Math.round(XIAN.Data.realms[S.realm].lifespan * 0.05);
    S.bonus.lifespan -= life;
    S.karma += 8 + S.realm * 2;
    S.daoxin = XIAN.clamp(S.daoxin - 6, 0, 100);
    XIAN.recalcLifespan(S);
    out.lines.push('<span class="trib-say">你以遁法破空而去，劫光落在你方才立处，将岩石熔成琉璃。</span>');
    out.lines.push('<em class="e-bad">寿元 -' + life + '载　业障 +' + (8 + S.realm * 2) + '　道心 -6</em>');
    this.tally.flee++;
    this.tally.life += life;
    return this.next(out);
  }

  /* 天道垂怜削减 */
  mult *= Math.max(0.40, 1 - this.mercy);

  /* 结算伤害 */
  var power = w.power * mult;
  var target = w.type.target;
  var dmg = 0;
  if (target === 'jing') {
    dmg = Math.round(st.maxJing * XIAN.clamp(power * 0.105, 0.012, 2.0));
    S.jing -= dmg; this.tally.jing += dmg;
    out.lines.push('<em class="e-bad">精元 -' + XIAN.num(dmg) + '</em>' + (extra.length ? '　' + extra.join('　') : ''));
  } else if (target === 'qi') {
    dmg = Math.round(st.maxQi * XIAN.clamp(power * 0.138, 0.012, 2.0));
    S.qi -= dmg; this.tally.qi += dmg;
    var spill = 0;
    if (S.qi < 0) { spill = Math.round(-S.qi * 0.7); S.qi = 0; S.jing -= spill; this.tally.jing += spill; }
    out.lines.push('<em class="e-bad">真炁 -' + XIAN.num(dmg) + (spill ? '，溢伤精元 -' + XIAN.num(spill) : '') + '</em>' + (extra.length ? '　' + extra.join('　') : ''));
  } else if (target === 'shen') {
    dmg = Math.round(st.maxShen * XIAN.clamp(power * 0.124, 0.012, 2.0));
    S.shen -= dmg; this.tally.shen += dmg;
    var spill2 = 0;
    if (S.shen < 0) { spill2 = Math.round(-S.shen * 0.8); S.shen = 0; S.jing -= spill2; this.tally.jing += spill2; }
    out.lines.push('<em class="e-bad">神魂 -' + XIAN.num(dmg) + (spill2 ? '，识海崩裂，精元 -' + XIAN.num(spill2) : '') + '</em>' + (extra.length ? '　' + extra.join('　') : ''));
    if (w.type.id === 'xin') S.daoxin = XIAN.clamp(S.daoxin - 4, 0, 100);
  } else if (target === 'lifespan') {
    var ly = Math.max(1, Math.round(XIAN.Data.realms[S.realm].lifespan * XIAN.clamp(power * 0.018, 0.002, 0.18)));
    S.bonus.lifespan -= ly; this.tally.life += ly;
    XIAN.recalcLifespan(S);
    out.lines.push('<em class="e-bad">寿元 -' + ly + '载</em>' + (extra.length ? '　' + extra.join('　') : ''));
  }

  /* 劫气激荡，天地灵气反为我用：每承一劫，真炁略复 */
  var back = Math.round(st.maxQi * 0.10);
  if (back > 0 && S.qi < st.maxQi) {
    S.qi = XIAN.clamp(S.qi + back, 0, st.maxQi);
    out.lines.push('<em class="e-good">劫气激荡，引之入体　炁 +' + XIAN.num(back) + '</em>');
  }

  /* 功德化甲：一劫可救一次 */
  if (S.jing <= 0 && !this.saved && S.merit >= 150) {
    this.saved = true;
    S.jing = Math.max(1, Math.round(st.maxJing * 0.12));
    S.merit = Math.max(0, S.merit - 100);
    out.lines.push('<em class="e-gold">生平功德化作金甲，替你受了这一劫。（功德 -100）</em>');
  }
  return this.next(out);
};

XIAN.Trib.prototype.next = function (out) {
  var S = this.S;
  this.log = this.log.concat(out.lines);
  if (S.jing <= 0) {
    this.done = true;
    S.dead = true;
    S.causeOfDeath = '殒于' + this.meta.name;
    S.stats.tribFails++;
    this.result = { survived: false, dead: true, tally: this.tally };
    out.fatal = true;
    out.result = this.result;
    return out;
  }
  this.idx++;
  if (this.idx >= this.total) {
    this.done = true;
    this.result = this.reward();
    out.result = this.result;
  }
  return out;
};

XIAN.Trib.prototype.reward = function () {
  var S = this.S, rng = this.rng;
  S.stats.tribulations++;
  var fm = (S.fate && S.fate.mods) || {};
  var boost = 1 + (fm.tribReward || 0);

  /* 天劫洗礼：根骨为之一新 */
  var st = XIAN.stats(S);
  var r = {
    survived: true, tally: this.tally, lines: [],
    yieldCount: this.tally.yield
  };
  var mj = Math.round(st.maxJing * 0.10 * boost);
  var mq = Math.round(st.maxQi * 0.10 * boost);
  var ms = Math.round(st.maxShen * 0.10 * boost);
  S.bonus.maxJing += mj; S.bonus.maxQi += mq; S.bonus.maxShen += ms;
  S.daoxin = XIAN.clamp(S.daoxin + 6 + this.tally.yield * 2, 0, 100);
  S.insight += 1 + (this.realm >= 4 ? 1 : 0);
  S.haste = XIAN.clamp(S.haste - 25, 0, 100);
  S.karma = Math.max(0, S.karma - 30);
  r.lines.push('雷洗其身，火炼其骨。<em class="e-gold">精上限 +' + XIAN.num(mj) + '　炁上限 +' + XIAN.num(mq) + '　神上限 +' + XIAN.num(ms) + '</em>');
  r.lines.push('<em class="e-good">道心 +' + (6 + this.tally.yield * 2) + '　悟性 +' + (1 + (this.realm >= 4 ? 1 : 0)) + '　业障 -30　躁进 -25</em>');
  if (this.tally.yield >= 3) {
    S.merit += 30;
    r.lines.push('<em class="e-gold">通劫皆以顺受，天道以为「知命」。功德 +30</em>');
  }
  /* 高阶天劫赠法宝或法术 */
  if (this.realm >= 3 && rng.chance(0.35 + (fm.tribReward || 0))) {
    var g = XIAN.Sys.grantRandomTech(S, null, Math.min(5, 3 + Math.floor(this.realm / 3)), rng);
    if (g) r.lines.push('<em class="e-gold">劫火之中，你忽然明白了一门法术：《' + g.tech.name + '》</em>');
  }
  XIAN.Sys.promote(S, true, rng);
  XIAN.recalcLifespan(S);
  var st2 = XIAN.stats(S);
  S.jing = Math.round(st2.maxJing * 0.55);
  S.qi = Math.round(st2.maxQi * 0.5);
  return r;
};
