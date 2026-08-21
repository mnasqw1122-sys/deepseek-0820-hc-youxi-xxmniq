/* ============================================================
 * tools/simulate.js — 无头模拟：跑通完整一生，检查逻辑与平衡
 * 用法：node tools/simulate.js [局数] [种子]
 * ============================================================ */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const FILES = [
  'js/data/core.js', 'js/core/util.js',
  'js/data/hexagrams.js', 'js/data/techniques.js', 'js/data/alchemy.js',
  'js/data/world.js', 'js/data/events.js',
  'js/state.js',
  'js/systems/effects.js', 'js/systems/craft.js', 'js/systems/cultivate.js',
  'js/systems/combat.js', 'js/systems/trib.js', 'js/systems/divine.js', 'js/systems/events.js'
];

function makeEnv() {
  const store = {};
  const sandbox = {
    console,
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; }
    },
    document: { createElement: () => ({ getContext: () => null, style: {} }), querySelector: () => null, querySelectorAll: () => [], addEventListener: () => {} },
    performance: { now: () => Date.now() },
    requestAnimationFrame: () => 0,
    cancelAnimationFrame: () => {},
    btoa: s => Buffer.from(s, 'binary').toString('base64'),
    atob: s => Buffer.from(s, 'base64').toString('binary'),
    Math, Date, JSON, setTimeout, clearTimeout, isNaN, parseInt, parseFloat, String, Number, Array, Object, Boolean, Error
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), sandbox, { filename: f });
  return sandbox;
}

const ENV = makeEnv();
const X = ENV.XIAN;
const D = X.Data;

/* ---------------- 一名「AI 修士」 ---------------- */
function playLife(seed, opts = {}) {
  const NAIVE = !!opts.naive;      /* 莽夫：只知苦修，不知调息，硬抗天劫 */
  const MID = !!opts.mid;          /* 中庸：略知门道，然不精算 —— 近于常人 */
  const S = X.newGame({ seed });
  const rng = new X.RNG(seed ^ 0x9e3779b9);
  const trace = [];
  const marks = {};
  let acts = 0;
  const MAXACT = opts.maxAct || 4000;
  let stuck = 0, lastDao = -1, lastRealm = -1;

  const note = (t) => { if (trace.length < 400) trace.push(`[${Math.floor(S.age)}岁 ${X.realmName(S.realm, S.stage)}] ${t}`); };

  function mark(k) { if (!marks[k]) marks[k] = { age: Math.floor(S.age), act: acts }; }

  while (!S.dead && !S.ascended && acts < MAXACT) {
    acts++;
    const st = X.stats(S);
    const L = X.byId(D.locations, S.loc);
    const bi = X.Sys.breakInfo(S);

    /* 1) 危险：道心过低 / 阴阳过偏 / 精元过低 → 调息 */
    if (!NAIVE && (S.daoxin < 30 || Math.abs(S.balance) > 62 || S.jing < st.maxJing * 0.30 || S.haste > 72)) {
      if (S.stance !== 'jingzuo') S.stance = 'jingzuo';
      const o = X.Sys.cultivate(S, rng);
      if (o.dev) mark('deviation');
      continue;
    }
    if (NAIVE) {
      /* 莽夫：一味苦修/夺天，从不调息、不占卜、不开脉、不炼丹 */
      S.stance = (S.realm >= 2 && rng.chance(0.5)) ? 'duotian' : 'kuxiu';
      if (bi.ready && !bi.blockers.length) {
        const br = X.Sys.attemptBreak(S, rng, false);
        if (br && br.ok && br.success && br.needTrib) {
          const T = new X.Trib(S, rng);
          let g2 = 0;
          while (!T.done && g2++ < 60) {
            const w = T.cur();
            T.respond(w.type.id === 'dao' ? 'dao3' : 'endure', null);
          }
          if (S.dead) note(`殒于${T.meta.name}`);
        }
        continue;
      }
      if (bi.ratio > 0.72 && rng.chance(0.25)) { X.Sys.attemptBreak(S, rng, true); continue; }
      const o = X.Sys.cultivate(S, rng);
      if (o.dev) mark('deviation');
      if (S.realm === lastRealm && S.dao === lastDao) stuck++; else stuck = 0;
      lastDao = S.dao; lastRealm = S.realm;
      if (stuck > 60) { note('道行停滞'); break; }
      continue;
    }

    /* 2) 突破：三宝未足者先静养 */
    if (bi.ready && bi.chance >= 55) {
      const needJing = bi.kind === 'realm' ? st.maxJing * 0.7 : 0;
      const needQi = bi.kind === 'realm' ? st.maxQi * 0.7 : 0;
      if (S.jing < needJing || S.qi < needQi) {
        /* 往灵泉或道观静养 */
        if (S.jing < needJing * 0.75 && rng.chance(0.3)) {
          const heal = D.locations.filter(l => X.Sys.travelInfo(S, l.id).ok &&
            ((l.features || []).includes('spring') || (l.features || []).includes('sect')));
          if (heal.length) { X.Sys.travel(S, heal[0].id, rng); mark('travel'); continue; }
        }
        X.Sys.rest(S, rng);
        mark('rest');
        continue;
      }
    }
    if (bi.ready && !bi.blockers.length && bi.chance >= 55) {
      const before = S.realm;
      const br = X.Sys.attemptBreak(S, rng, false);
      if (br && br.ok) {
        mark('break');
        if (br.success && br.needTrib) {
          const T = new X.Trib(S, rng);
          let guard = 0;
          while (!T.done && guard++ < 60) {
            const st2 = X.stats(S);
            /* 危时服丹 */
            if (S.jing < st2.maxJing * 0.34) {
              const keys = Object.keys(S.pills).filter(k => S.pills[k] > 0);
              const heal = keys.find(k => {
                const pp = X.Sys.pillParse(k), pd = X.byId(D.pills, pp.id);
                return pd && (pd.effects || []).some(e => e.k === 'jing' || e.k === 'healPct');
              });
              if (heal && (!MID || rng.chance(0.6))) { T.usePill(heal); continue; }
            }
            const w = T.cur();
            const opts2 = T.options();
            const can = id => { const o = opts2.find(x => x.id === id); return o && !o.disabled; };
            let pick = null, el = null;
            if (w.type.id === 'dao') {
              if (MID) {
                /* 中庸者未必答得最好 */
                pick = 'dao' + rng.int(0, w.q.opts.length - 1);
              } else {
                let best = -1, bi2 = 0;
                w.q.opts.forEach((o, i) => { if (o.grade > best) { best = o.grade; bi2 = i; } });
                pick = 'dao' + bi2;
              }
            } else if (w.type.element !== 'none' && can('channel')) {
              if (MID) {
                /* 中庸者常认错劫气：七成能识其克，三成瞎引 */
                const need = Object.keys(D.elements).find(k => D.elements[k].overcome === w.type.element);
                const guess = rng.chance(0.7) ? need : rng.pick(Object.keys(D.elements));
                if (guess) { pick = 'channel'; el = guess; }
              } else {
                const need = Object.keys(D.elements).find(k => D.elements[k].overcome === w.type.element);
                if (need && (S.aff[need] || 0) >= 24) { pick = 'channel'; el = need; }
              }
            }
            if (!pick && can('guard') && S.jing < st2.maxJing * 0.6) pick = 'guard';
            if (!pick) pick = can('yield') ? 'yield' : 'endure';
            T.respond(pick, el);
          }
          if (T.done && T.result && T.result.survived) { mark('trib' + before); note(`渡${T.meta.name}成功`); }
          else if (S.dead) { note(`殒于${T.meta.name}`); }
        } else if (br.success) {
          note(`晋 ${X.realmName(S.realm, S.stage)}`);
          if (S.realm !== before) mark('realm' + S.realm);
        }
      }
      continue;
    }

    /* 3) 占卜（每节气一次，吉则修行） */
    if (!X.Sys.divineActive(S) && S.shen >= st.maxShen * 0.3 && rng.chance(0.55)) {
      const r = X.Sys.divine(S, rng);
      if (r.ok) mark('divine');
      continue;
    }

    /* 4) 开脉 */
    const avail = D.meridians.filter(m => {
      const g = X.Sys.meridianGate(S, m);
      if (g.open || !g.ok) return false;
      const c = X.Sys.meridianCost(S, m);
      return S.qi >= c.qi && S.jing > c.jing * 1.6 && X.Sys.meridianChance(S, m) >= 55;
    });
    if (avail.length && rng.chance(0.7)) {
      const r = X.Sys.openMeridian(S, avail[0].id, rng);
      if (r.ok && r.success) mark('meridian');
      continue;
    }

    /* 5) 三宝转化 */
    for (const k of ['jq', 'qs', 'sv']) {
      const i = X.Sys.refineInfo(S, k);
      if (i.ok && ((k === 'sv' && S.shen >= st.maxShen * 0.85) || (k !== 'sv' && rng.chance(0.5)))) {
        X.Sys.refine(S, k, rng);
        mark('refine_' + k);
      }
    }

    /* 6) 丹道：有药即炼，有丹即服 */
    const canMake = S.recipes.map(id => X.Sys.recipeStatus(S, id)).filter(s => s && s.ok);
    if (canMake.length && rng.chance(0.5)) {
      const pick = canMake[canMake.length - 1];
      const p = pick.pill;
      /* 模拟落指：以悟性为准的抖动 */
      const err = rng.norm(0, X.Sys.fireTolerance(S, p) * 0.9);
      const r = X.Sys.refinePill(S, p.id, Math.max(0, Math.min(1, p.fireIdeal + err)), rng);
      if (r.ok) { mark('pill'); if (r.q >= 4) mark('pill_top'); }
      continue;
    }
    const pillKeys = Object.keys(S.pills).filter(k => S.pills[k] > 0);
    if (pillKeys.length && rng.chance(0.35)) {
      X.Sys.takePill(S, pillKeys[0], rng);
      mark('takepill');
      continue;
    }

    /* 7) 采药 / 行路 / 游历 / 斗法 */
    const roll = rng.next();
    if (roll < 0.20 && X.Sys.gatherInfo(S).ok) {
      const g = X.Sys.gather(S, rng);
      if (g.ambush) { doFight(); }
      mark('gather');
      continue;
    }
    if (roll < 0.30) {
      const w = X.Sys.wander(S, rng);
      if (w.event) {
        const ev = w.event;
        /* 选一个可用选项：偏好高胜算与正向因果 */
        let best = 0, bp = -1;
        ev.choices.forEach((ch, i) => {
          let sc = rng.float(0, 1);
          if (ch.check) sc += X.Sys.checkOdds(S, ch.check) * 2;
          else sc += 1;
          const br = ch.outcome || ch.success;
          (br && br.effects || []).forEach(e => {
            if (e.k === 'merit') sc += 0.4;
            if (e.k === 'karma' && e.v > 0) sc -= 0.5;
            if (e.k === 'artifact' || e.k === 'tech' || e.k === 'meridian') sc += 1.2;
          });
          const c = ch.cost || {};
          if (c.stone && S.stone < c.stone) sc = -99;
          if (c.qi && S.qi < c.qi * (1 + S.realm * 1.1)) sc = -99;
          if (c.jing && S.jing <= c.jing * (1 + S.realm * 1.1)) sc = -99;
          if (c.shen && S.shen < c.shen * (1 + S.realm * 1.1)) sc = -99;
          if (sc > best || bp < 0) { best = sc; bp = i; }
        });
        const r = X.Sys.resolveChoice(S, ev, bp < 0 ? 0 : bp, rng);
        if (r && r.ok) {
          mark('event');
          if (r.pending && r.pending.combat) doFight();
        }
      }
      continue;
    }
    if (roll < 0.40) {
      /* 需要坊市：缺丹方、缺法宝、灵石多 */
      const wantMarket = S.stone > 1500 && (S.recipes.length < 8 || S.artifacts.length < 2 || rng.chance(0.25));
      if (wantMarket && S.loc !== 'fuyao_cheng' && X.Sys.travelInfo(S, 'fuyao_cheng').ok) {
        X.Sys.travel(S, 'fuyao_cheng', rng);
        mark('travel');
        continue;
      }
      if (S.loc === 'fuyao_cheng') {
        const stock = X.Sys.marketStock(S, rng);
        stock.recipes.slice().forEach(e => { if (S.stone > e.price * 1.6) { X.Sys.buy(S, 'recipe', e, rng); mark('market'); } });
        stock.techs.slice().forEach(e => { if (S.stone > e.price * 1.6) { X.Sys.buy(S, 'tech', e, rng); mark('market'); } });
        stock.arts.slice().forEach(e => { if (S.stone > e.price * 1.6) { X.Sys.buy(S, 'art', e, rng); mark('market'); } });
        stock.herbs.forEach(e => { while (e.n > 0 && S.stone > e.price * 5) { X.Sys.buy(S, 'herb', e, rng); mark('market'); } });
        /* 买完就走 */
        const back = D.locations.filter(l => X.Sys.travelInfo(S, l.id).ok && (l.features || []).includes('cultivate'));
        back.sort((a, b) => b.spirit - a.spirit);
        if (back[0]) X.Sys.travel(S, back[0].id, rng);
        continue;
      }
      /* 行路：优先高灵气可打坐之地 */
      const cands = D.locations.filter(l => X.Sys.travelInfo(S, l.id).ok && (l.features || []).includes('cultivate'));
      cands.sort((a, b) => b.spirit - a.spirit);
      const want = cands[0];
      if (want && want.spirit > (L ? L.spirit : 1) * 1.12) { X.Sys.travel(S, want.id, rng); mark('travel'); continue; }
    }
    if (roll < 0.48 && S.jing > st.maxJing * 0.7) {
      doFight(rng.chance(0.2) ? { hard: true } : {});
      continue;
    }

    /* 8) 默认：按状态择心法打坐 */
    S.stance = pickStance();
    const o = X.Sys.cultivate(S, rng);
    if (o.dev) mark('deviation');

    /* 卡死检测 */
    if (S.realm === lastRealm && S.dao === lastDao) stuck++; else stuck = 0;
    lastDao = S.dao; lastRealm = S.realm;
    if (stuck > 60) { note('道行停滞，判为卡死'); break; }
  }

  function pickStance() {
    if (MID) {
      /* 中庸者：知道躁进不好，然不精算天时；偶尔贪快 */
      if (S.haste > 68 || S.daoxin < 38) return 'jingzuo';
      if (Math.abs(S.balance) > 58 && S.realm >= 1) return rng.chance(0.6) ? 'fanxu' : 'ziran';
      if (rng.chance(0.30)) return 'kuxiu';
      return rng.chance(0.5) ? 'tuna' : 'ziran';
    }
    if (S.haste > 55 || S.daoxin < 45) return 'jingzuo';
    if (Math.abs(S.balance) > 45 && S.realm >= 1) return 'fanxu';
    if (S.daoxin > 70 && S.haste < 30 && S.qi > X.stats(S).maxQi * 0.6) return 'kuxiu';
    if (S.qi > X.stats(S).maxQi * 0.5) return 'tuna';
    return 'ziran';
  }

  function doFight(fopts) {
    const foe = X.Sys.pickEnemy(S, rng, fopts || {});
    if (!foe) return;
    if (foe.boss) mark('bossfight');
    const cb = new X.Combat(S, foe, rng, {});
    let guard = 0;
    while (!cb.over && guard++ < 60) {
      const techs = cb.techList().filter(t => t.usable);
      const p = cb.player, f = cb.foe;
      let action;
      if (p.jing < p.maxJing * 0.22) {
        const keys = Object.keys(S.pills).filter(k => S.pills[k] > 0);
        const heal = keys.find(k => {
          const pp = X.Sys.pillParse(k), pd = X.byId(D.pills, pp.id);
          return pd && (pd.effects || []).some(e => e.k === 'jing' || e.k === 'healPct');
        });
        if (heal) action = { type: 'pill', id: heal };
        else if (f.jing / f.maxJing > 0.5) action = { type: 'flee' };
        else action = { type: 'guard' };
      } else if (!techs.length) {
        action = rng.chance(0.5) ? { type: 'wuwei' } : { type: 'guard' };
      } else {
        /* 择伤害最高者 */
        let best = techs[0], bs = -1;
        techs.forEach(t => {
          let s = 0;
          (t.t.effects || []).forEach(e => {
            if (e.k === 'damage') s += e.mult;
            if (e.k === 'multihit') s += e.mult * e.hits;
            if (e.k === 'execute') s += (f.jing / f.maxJing < (e.hpBelow || .3)) ? e.mult : e.mult * .4;
            if (e.k === 'drain') s += e.mult * 1.2;
            if (e.k === 'soul') s += e.mult * .6;
          });
          s *= X.elemMult(t.t.element === 'none' ? p.element : t.t.element, f.element);
          if (s > bs) { bs = s; best = t; }
        });
        action = { type: 'tech', id: best.t.id };
      }
      cb.playerTurn(action);
    }
    if (cb.result && cb.result.win) mark('battlewin');
  }

  return {
    seed, acts, dead: S.dead, ascended: S.ascended, cause: S.causeOfDeath,
    realm: S.realm, stage: S.stage, realmName: X.realmName(S.realm, S.stage),
    age: Math.floor(S.age), lifespan: S.lifespan,
    root: S.root.name, fate: S.fate.name,
    merit: S.merit, karma: Math.round(S.karma), daoxin: Math.round(S.daoxin),
    insight: S.insight, balance: Math.round(S.balance),
    meridians: S.meridians.length, techs: S.techs.length, arts: S.artifacts.length,
    stone: S.stone, stats: S.stats, marks, trace, S
  };
}

/* ---------------- 跑批 ---------------- */
const N = parseInt(process.argv[2] || '24', 10);
const SEED0 = parseInt(process.argv[3] || '1000', 10);
const NAIVE = process.argv.includes('--naive');
const MID = process.argv.includes('--mid');
const results = [];
let errors = 0;
console.log(`模拟 ${N} 局${NAIVE ? '（莽夫：只知苦修，硬抗天劫）' : MID ? '（中庸：略知门道，不精算 —— 近于常人）' : '（老手：择时调息，引化渡劫）'}……\n`);
for (let i = 0; i < N; i++) {
  try {
    const r = playLife(SEED0 + i * 7919, { naive: NAIVE, mid: MID });
    results.push(r);
  } catch (e) {
    errors++;
    console.log(`✗ 第 ${i} 局崩溃 (seed=${SEED0 + i * 7919}): ${e.message}`);
    console.log(String(e.stack).split('\n').slice(0, 6).join('\n'));
  }
}

console.log('局数  境界            寿终   享年   灵根        命格        功德/业障   经脉 法术 宝  行动  死因');
console.log('─'.repeat(118));
results.forEach((r, i) => {
  console.log(
    String(i).padEnd(5) +
    r.realmName.padEnd(16) +
    String(r.lifespan).padEnd(7) +
    String(r.age).padEnd(7) +
    r.root.padEnd(12) +
    r.fate.padEnd(12) +
    (r.merit + '/' + r.karma).padEnd(12) +
    String(r.meridians).padEnd(5) +
    String(r.techs).padEnd(5) +
    String(r.arts).padEnd(4) +
    String(r.acts).padEnd(6) +
    (r.ascended ? '★飞升' : r.cause || '(停)')
  );
});

const realmDist = {};
results.forEach(r => { realmDist[r.realmName.slice(0, 2)] = (realmDist[r.realmName.slice(0, 2)] || 0) + 1; });
const avg = k => (results.reduce((s, r) => s + (typeof k === 'function' ? k(r) : r[k]), 0) / results.length).toFixed(1);
console.log('\n── 汇总 ──');
console.log('终境分布：' + JSON.stringify(realmDist));
console.log('飞升数：' + results.filter(r => r.ascended).length + ' / ' + results.length);
console.log('平均：境界 ' + avg('realm') + '　享年 ' + avg('age') + '　行动 ' + avg('acts') +
  '　经脉 ' + avg('meridians') + '　法术 ' + avg('techs') + '　功德 ' + avg('merit') + '　业障 ' + avg('karma'));
console.log('平均：走火 ' + avg(r => r.stats.deviations) + '　斗法 ' + avg(r => r.stats.battles) +
  '（胜 ' + avg(r => r.stats.wins) + '）　成丹 ' + avg(r => r.stats.pillsMade) +
  '　废丹 ' + avg(r => r.stats.pillsFailed) + '　奇遇 ' + avg(r => r.stats.eventsMet) +
  '　渡劫 ' + avg(r => r.stats.tribulations) + '（败 ' + avg(r => r.stats.tribFails) + '）');
const causes = {};
results.forEach(r => { const c = r.ascended ? '飞升' : (r.cause || '停滞'); causes[c] = (causes[c] || 0) + 1; });
console.log('结局：' + JSON.stringify(causes));

/* 里程碑覆盖 */
const allMarks = {};
results.forEach(r => Object.keys(r.marks).forEach(k => { allMarks[k] = (allMarks[k] || 0) + 1; }));
console.log('\n── 系统覆盖（多少局触发过）──');
const want = ['break', 'deviation', 'divine', 'meridian', 'refine_jq', 'refine_qs', 'refine_sv',
  'pill', 'pill_top', 'takepill', 'gather', 'event', 'travel', 'market', 'battlewin',
  'trib1', 'trib2', 'trib3', 'trib4', 'trib5', 'trib6', 'trib7', 'trib8'];
const missing = [];
want.forEach(k => {
  const n = allMarks[k] || 0;
  if (!n) missing.push(k);
  console.log('  ' + k.padEnd(14) + (n ? n + ' 局' : '✗ 从未触发'));
});

/* 抽一局详细轨迹 */
const showcase = results.slice().sort((a, b) => b.realm - a.realm || b.merit - a.merit)[0];
if (showcase) {
  console.log('\n── 最佳一局轨迹（seed=' + showcase.seed + '）──');
  showcase.trace.slice(0, 40).forEach(t => console.log('  ' + t));
}

console.log('');
if (errors) { console.log('✗ 崩溃 ' + errors + ' 局'); process.exit(1); }
if (missing.length) { console.log('⚠ 未覆盖：' + missing.join(', ')); }
console.log('✓ 模拟完成，无崩溃');
