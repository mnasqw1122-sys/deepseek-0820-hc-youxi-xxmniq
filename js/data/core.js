/* ============================================================
 *  《太乙玄门 · 修仙模拟器》
 *  core.js — 天地根本数据：五行、境界、经脉、节气、干支、灵根、命格
 *  纯浏览器脚本（classic script），无模块依赖。
 * ============================================================ */
window.XIAN = window.XIAN || {};
XIAN.Data = XIAN.Data || {};

/* ------------------------------------------------------------
 * 一、五行 —— 相生相克
 *   生：木生火 火生土 土生金 金生水 水生木
 *   克：木克土 土克水 水克火 火克金 金克木
 * ---------------------------------------------------------- */
XIAN.Data.elements = {
  jin: {
    key: 'jin', name: '金', glyph: '金', pinyin: 'jīn',
    color: '#cfd3cf', deep: '#8f968f', glow: '#f2f5f0',
    gen: 'shui', overcome: 'mu', genBy: 'tu', overcomeBy: 'huo',
    organ: '肺', taste: '辛', dir: '西', season: '秋', beast: '白虎',
    virtue: '义', qi: '燥',
    desc: '金者，从革也。其性刚锐，主肃杀收敛。修金者，锋利决断，破坚摧刚，然易伤本元。'
  },
  mu: {
    key: 'mu', name: '木', glyph: '木', pinyin: 'mù',
    color: '#7fb489', deep: '#3f6b4c', glow: '#c9ecc9',
    gen: 'huo', overcome: 'tu', genBy: 'shui', overcomeBy: 'jin',
    organ: '肝', taste: '酸', dir: '东', season: '春', beast: '青龙',
    virtue: '仁', qi: '风',
    desc: '木者，曲直也。其性生发，主条达升腾。修木者，生机绵长，疗伤续命，然失于柔弱。'
  },
  shui: {
    key: 'shui', name: '水', glyph: '水', pinyin: 'shuǐ',
    color: '#6c9dc6', deep: '#26496e', glow: '#bcdcf2',
    gen: 'mu', overcome: 'huo', genBy: 'jin', overcomeBy: 'tu',
    organ: '肾', taste: '咸', dir: '北', season: '冬', beast: '玄武',
    virtue: '智', qi: '寒',
    desc: '水者，润下也。其性柔顺，主藏纳玄冥。修水者，善柔克刚，藏精蓄锐，然近于阴晦。'
  },
  huo: {
    key: 'huo', name: '火', glyph: '火', pinyin: 'huǒ',
    color: '#d4634a', deep: '#8f2d1d', glow: '#f7b79a',
    gen: 'tu', overcome: 'jin', genBy: 'mu', overcomeBy: 'shui',
    organ: '心', taste: '苦', dir: '南', season: '夏', beast: '朱雀',
    virtue: '礼', qi: '暑',
    desc: '火者，炎上也。其性炽烈，主光明化育。修火者，威能绝伦，炼丹第一，然极易躁进。'
  },
  tu: {
    key: 'tu', name: '土', glyph: '土', pinyin: 'tǔ',
    color: '#c2a067', deep: '#7d6234', glow: '#eddcb6',
    gen: 'jin', overcome: 'shui', genBy: 'huo', overcomeBy: 'mu',
    organ: '脾', taste: '甘', dir: '中', season: '长夏', beast: '黄麟',
    virtue: '信', qi: '湿',
    desc: '土者，稼穑也。其性厚载，主中和承负。修土者，根基如岳，百劫不摧，然进境迟缓。'
  }
};
XIAN.Data.elementOrder = ['jin', 'mu', 'shui', 'huo', 'tu'];

/* 五行关系查询：返回 'gen'(我生彼) 'genBy'(彼生我) 'ke'(我克彼) 'keBy'(彼克我) 'same' */
XIAN.elemRelation = function (a, b) {
  if (!a || !b || a === 'none' || b === 'none') return 'none';
  if (a === b) return 'same';
  var E = XIAN.Data.elements[a];
  if (!E) return 'none';
  if (E.gen === b) return 'gen';
  if (E.genBy === b) return 'genBy';
  if (E.overcome === b) return 'ke';
  if (E.overcomeBy === b) return 'keBy';
  return 'none';
};
/* 攻方 a 对守方 b 的伤害系数 */
XIAN.elemMult = function (a, b) {
  switch (XIAN.elemRelation(a, b)) {
    case 'ke': return 1.45;      // 我克彼：大胜
    case 'keBy': return 0.68;    // 彼克我：受制
    case 'gen': return 1.12;     // 我生彼：微利（泄气）
    case 'genBy': return 0.92;   // 彼生我：略滞
    case 'same': return 1.00;
    default: return 1.00;
  }
};
XIAN.elemRelationText = function (a, b) {
  var EA = XIAN.Data.elements[a], EB = XIAN.Data.elements[b];
  if (!EA || !EB) return '';
  switch (XIAN.elemRelation(a, b)) {
    case 'ke': return EA.name + '克' + EB.name;
    case 'keBy': return EB.name + '克' + EA.name;
    case 'gen': return EA.name + '生' + EB.name;
    case 'genBy': return EB.name + '生' + EA.name;
    case 'same': return EA.name + '气同源';
    default: return '';
  }
};

/* ------------------------------------------------------------
 * 二、境界 —— 九重天阶
 *   炼精化炁 → 炼炁化神 → 炼神还虚 → 虚极返道
 *   lifespan : 踏入此境后的寿元上限（年）
 *   days     : 此境「深度修行」一次所耗天数（越高境界，一坐千年）
 *   dao      : 三个小阶（初期/中期/后期）各需道行
 * ---------------------------------------------------------- */
XIAN.Data.stageNames = ['初期', '中期', '后期'];
XIAN.Data.realms = [
  {
    idx: 0, name: '炼气', full: '炼气期', phase: '炼精化炁',
    lifespan: 120, days: 15, dao: [420, 760, 1240],
    jing: 120, qi: 100, shen: 60, atk: 12, def: 8, spd: 10,
    color: '#8f9a8f',
    desc: '引天地灵气入体，冲开窍穴，化后天浊气为先天真炁。此境之人，与凡俗无异，然已窥门径。',
    breakthrough: '筑基乃第一道关隘：须以真炁灌注四肢百骸，凝为道基。基不正者，终生难有寸进。',
    tribulation: null
  },
  {
    idx: 1, name: '筑基', full: '筑基期', phase: '炼精化炁',
    lifespan: 220, days: 60, dao: [2600, 4200, 6800],
    jing: 420, qi: 380, shen: 180, atk: 40, def: 28, spd: 16,
    color: '#7f9f8a',
    desc: '道基既成，真炁自行周天。可辟谷、可御物、可百日不食。寿元二百，已脱短生之厄。',
    breakthrough: '结丹乃生死大关：需凝真炁为液，液再成丹。丹成则长生有望，丹碎则道消身殒。',
    tribulation: { name: '风雷小劫', power: 1.0, desc: '三道天雷，一道风刃。此劫甚轻，然足以惩戒躁进之徒。' }
  },
  {
    idx: 2, name: '金丹', full: '金丹期', phase: '炼炁化神',
    lifespan: 500, days: 180, dao: [22000, 34000, 52000],
    jing: 1500, qi: 1400, shen: 700, atk: 140, def: 100, spd: 24,
    color: '#c2a067',
    desc: '一粒金丹吞入腹，始知我命不由天。丹田之中金丹旋转，昼夜自炼，五百春秋，指顾之间。',
    breakthrough: '化婴须碎丹：金丹自破，元婴自生。此谓「舍生取生」，无大毅力者不敢为。',
    tribulation: { name: '三九天劫', power: 1.9, desc: '二十七道紫雷循身而落，兼有心魔幻境相扰。' }
  },
  {
    idx: 3, name: '元婴', full: '元婴期', phase: '炼炁化神',
    lifespan: 1000, days: 360, dao: [150000, 230000, 340000],
    jing: 5200, qi: 5000, shen: 3000, atk: 480, def: 350, spd: 34,
    color: '#a88fc4',
    desc: '元婴出窍，可离体千里。肉身可弃而神魂不灭。一念千山，一息百年。世人称之为「老祖」。',
    breakthrough: '化神须斩三尸：斩去贪、嗔、痴三具尸魔，元婴方能化作法身。此为心性之劫，非力可破。',
    tribulation: { name: '六九天劫', power: 3.4, desc: '五十四道玄雷，另有三尸化形夺舍。神魂不固者，此劫必死。' }
  },
  {
    idx: 4, name: '化神', full: '化神期', phase: '炼神还虚',
    lifespan: 2000, days: 1080, dao: [900000, 1400000, 2100000],
    jing: 18000, qi: 17000, shen: 12000, atk: 1600, def: 1200, spd: 46,
    color: '#8fa8c4',
    desc: '神与炁合，法身如虚。举手可翻江倒海，投足可裂地分山。一域之内，已无敌手。',
    breakthrough: '炼虚者，炼「有」为「无」。须散尽法身，归于空寂，而后于空寂中重铸真形。',
    tribulation: { name: '九九天劫', power: 5.6, desc: '八十一道混沌神雷，天地共诛。此劫之下，十九不存。' }
  },
  {
    idx: 5, name: '炼虚', full: '炼虚期', phase: '炼神还虚',
    lifespan: 3500, days: 3600, dao: [5200000, 7800000, 11500000],
    jing: 60000, qi: 58000, shen: 45000, atk: 5200, def: 4200, spd: 60,
    color: '#b0b8c8',
    desc: '虚者，非无也，乃有之极。身处虚境者，可折空取物，可寸念千秋。世间万法，于我如观掌纹。',
    breakthrough: '合体者，合天地之体为我之体。须寻一处灵脉本源，与之相融，此谓「窃天」。',
    tribulation: { name: '虚空劫', power: 8.5, desc: '劫不在外而在内：虚境自崩，须于崩灭中守住一点真灵。' }
  },
  {
    idx: 6, name: '合体', full: '合体期', phase: '虚极返道',
    lifespan: 6000, days: 10800, dao: [28000000, 42000000, 62000000],
    jing: 200000, qi: 190000, shen: 160000, atk: 17000, def: 14000, spd: 76,
    color: '#c8b898',
    desc: '天人合一，山河即我血肉，风雷即我呼吸。一怒则赤地千里，一悯则枯木回春。',
    breakthrough: '大乘者，法尽而道显。须尽弃所学万法，独留一「道」。所谓「为学日益，为道日损」。',
    tribulation: { name: '天人五衰劫', power: 12.0, desc: '衣裳垢腻、头上华萎、身体臭秽、腋下汗流、不乐本座——五衰齐至。' }
  },
  {
    idx: 7, name: '大乘', full: '大乘期', phase: '虚极返道',
    lifespan: 10000, days: 36000, dao: [160000000, 240000000, 360000000],
    jing: 700000, qi: 680000, shen: 600000, atk: 58000, def: 48000, spd: 96,
    color: '#e0cf9c',
    desc: '万法归一，一亦不留。此境之人已近于「道」，然仍系于此界，故须渡劫飞升。',
    breakthrough: '飞升在望：须承九重仙劫，破界而出。此界容不得仙，故天地必尽全力诛之。',
    tribulation: { name: '寂灭劫', power: 17.0, desc: '万法俱寂，唯余本心。此劫诛「执」不诛身。' }
  },
  {
    idx: 8, name: '渡劫', full: '渡劫期', phase: '虚极返道',
    lifespan: 15000, days: 36000, dao: [900000000, 1400000000, 2000000000],
    jing: 2400000, qi: 2300000, shen: 2200000, atk: 200000, def: 170000, spd: 120,
    color: '#f0e0b0',
    desc: '劫云盘踞头顶三千年不散。此身已非此界所容，一步登天，一步成灰。',
    breakthrough: '九重仙劫已在眼前。渡之，则名列仙班；不渡，则形神俱灭，连轮回亦无。',
    tribulation: { name: '九重仙劫', power: 26.0, desc: '风、火、雷、水、金、心、业、寿、道——九劫连环，无一可避。' }
  },
  {
    idx: 9, name: '仙', full: '太乙玄仙', phase: '与道合真',
    lifespan: 999999, days: 36000, dao: [1e18, 1e18, 1e18],
    jing: 9999999, qi: 9999999, shen: 9999999, atk: 999999, def: 999999, spd: 200,
    color: '#fff3cf',
    desc: '与道合真，不生不灭。回首下望，云海苍苍，昔日山河已如尘埃一点。',
    breakthrough: '——',
    tribulation: null
  }
];

/* ------------------------------------------------------------
 * 三、经脉 —— 十二正经 + 奇经八脉
 * ---------------------------------------------------------- */
XIAN.Data.meridians = [
  { id: 'ren', name: '任脉', group: '奇经', order: 1, cost: 1, element: 'shui', bonus: { maxQi: 40, maxJing: 30 }, desc: '总任一身之阴，为「阴脉之海」。任脉通，则百阴自朝。' },
  { id: 'du', name: '督脉', group: '奇经', order: 2, cost: 1, element: 'huo', bonus: { maxQi: 40, atk: 10 }, desc: '总督一身之阳，为「阳脉之都纲」。督脉通，则真阳直贯顶门。' },
  { id: 'fei', name: '手太阴肺经', group: '正经', order: 3, cost: 1, element: 'jin', bonus: { maxQi: 25, spd: 3 }, desc: '肺主气，司呼吸。此经通则纳气如渊，吐纳倍速。' },
  { id: 'dachang', name: '手阳明大肠经', group: '正经', order: 4, cost: 1, element: 'jin', bonus: { maxJing: 30, def: 5 }, desc: '大肠主传导。此经通则浊气自去，体内清明。' },
  { id: 'wei', name: '足阳明胃经', group: '正经', order: 5, cost: 1, element: 'tu', bonus: { maxJing: 45 }, desc: '胃为水谷之海。此经通则辟谷不饥，精元自足。' },
  { id: 'pi', name: '足太阴脾经', group: '正经', order: 6, cost: 1, element: 'tu', bonus: { maxJing: 35, def: 6 }, desc: '脾主运化，为后天之本。此经通则气血充盈如春。' },
  { id: 'xin', name: '手少阴心经', group: '正经', order: 7, cost: 1, element: 'huo', bonus: { maxShen: 30, insight: 1 }, desc: '心藏神。此经通则神明自朗，悟性渐开。' },
  { id: 'xiaochang', name: '手太阳小肠经', group: '正经', order: 8, cost: 1, element: 'huo', bonus: { atk: 12 }, desc: '小肠主化物。此经通则真火炽盛，法力刚烈。' },
  { id: 'pangguang', name: '足太阳膀胱经', group: '正经', order: 9, cost: 1, element: 'shui', bonus: { def: 14, maxJing: 25 }, desc: '膀胱主气化。此经通则周身如覆玄甲。' },
  { id: 'shen', name: '足少阴肾经', group: '正经', order: 10, cost: 1, element: 'shui', bonus: { maxJing: 40, lifespan: 15 }, desc: '肾藏精，为先天之本。此经通则精不外泄，寿数自增。' },
  { id: 'xinbao', name: '手厥阴心包经', group: '正经', order: 11, cost: 1, element: 'huo', bonus: { maxShen: 25, daoxin: 4 }, desc: '心包护心。此经通则心魔难侵，道心自固。' },
  { id: 'sanjiao', name: '手少阳三焦经', group: '正经', order: 12, cost: 1, element: 'huo', bonus: { maxQi: 45 }, desc: '三焦通调水道。此经通则真炁行走无碍，如江河决堤。' },
  { id: 'dan', name: '足少阳胆经', group: '正经', order: 13, cost: 1, element: 'mu', bonus: { spd: 5, crit: 4 }, desc: '胆主决断。此经通则出手如电，无有迟疑。' },
  { id: 'gan', name: '足厥阴肝经', group: '正经', order: 14, cost: 1, element: 'mu', bonus: { maxJing: 40, insight: 1 }, desc: '肝藏血，主疏泄。此经通则生机绵绵，创伤自愈。' },
  { id: 'chong', name: '冲脉', group: '奇经', order: 15, cost: 2, element: 'tu', bonus: { maxQi: 70, maxJing: 60 }, desc: '为「十二经之海」。冲脉一通，诸经俱畅，真炁滔滔如海。' },
  { id: 'dai', name: '带脉', group: '奇经', order: 16, cost: 2, element: 'tu', bonus: { def: 30, daoxin: 5 }, desc: '约束诸经如束带。带脉通则根基不摇，泰山崩于前而色不变。' },
  { id: 'yinwei', name: '阴维脉', group: '奇经', order: 17, cost: 2, element: 'shui', bonus: { maxShen: 60, balanceYin: 6 }, desc: '维系诸阴。此脉通则玄阴内敛，神魂如深潭映月。' },
  { id: 'yangwei', name: '阳维脉', group: '奇经', order: 18, cost: 2, element: 'huo', bonus: { atk: 40, balanceYang: 6 }, desc: '维系诸阳。此脉通则真阳外发，法力如日中天。' },
  { id: 'yinqiao', name: '阴跷脉', group: '奇经', order: 19, cost: 3, element: 'shui', bonus: { spd: 12, maxShen: 70 }, desc: '主一身左右之阴。此脉通则身轻如影，来去无踪。' },
  { id: 'yangqiao', name: '阳跷脉', group: '奇经', order: 20, cost: 3, element: 'huo', bonus: { spd: 12, crit: 8 }, desc: '主一身左右之阳。此脉通则动若惊雷，快不可测。' }
];

/* ------------------------------------------------------------
 * 四、二十四节气 —— 天时
 *   element : 当令之气（四季末十八日属土）
 *   yang    : 阳气潮位 -100..100（冬至极阴，夏至极阳）
 * ---------------------------------------------------------- */
XIAN.Data.solarTerms = [
  { name: '立春', element: 'mu', yang: -87, poem: '东风解冻，蛰虫始振' },
  { name: '雨水', element: 'mu', yang: -71, poem: '獱祭鱼，鸿雁来' },
  { name: '惊蛰', element: 'mu', yang: -50, poem: '桃始华，仓庚鸣' },
  { name: '春分', element: 'mu', yang: -26, poem: '玄鸟至，雷乃发声' },
  { name: '清明', element: 'mu', yang: 0, poem: '桐始华，虹始见' },
  { name: '谷雨', element: 'tu', yang: 26, poem: '萍始生，戴胜降桑' },
  { name: '立夏', element: 'huo', yang: 50, poem: '蝼蝈鸣，蚯蚓出' },
  { name: '小满', element: 'huo', yang: 71, poem: '苦菜秀，靡草死' },
  { name: '芒种', element: 'huo', yang: 87, poem: '螳螂生，鶗鸲鸣' },
  { name: '夏至', element: 'huo', yang: 100, poem: '鹿角解，蝉始鸣' },
  { name: '小暑', element: 'huo', yang: 96, poem: '温风至，蟋蟀居壁' },
  { name: '大暑', element: 'tu', yang: 87, poem: '腐草为萤，土润溽暑' },
  { name: '立秋', element: 'jin', yang: 71, poem: '凉风至，白露降' },
  { name: '处暑', element: 'jin', yang: 50, poem: '鹰乃祭鸟，天地始肃' },
  { name: '白露', element: 'jin', yang: 26, poem: '鸿雁来，玄鸟归' },
  { name: '秋分', element: 'jin', yang: 0, poem: '雷始收声，蛰虫坏户' },
  { name: '寒露', element: 'jin', yang: -26, poem: '鸿雁来宾，菊有黄华' },
  { name: '霜降', element: 'tu', yang: -50, poem: '豺乃祭兽，草木黄落' },
  { name: '立冬', element: 'shui', yang: -71, poem: '水始冰，地始冻' },
  { name: '小雪', element: 'shui', yang: -87, poem: '虹藏不见，天气上腾' },
  { name: '大雪', element: 'shui', yang: -96, poem: '鹃鸥不鸣，虎始交' },
  { name: '冬至', element: 'shui', yang: -100, poem: '蚯蚓结，一阳来复' },
  { name: '小寒', element: 'shui', yang: -96, poem: '雁北乡，鹊始巢' },
  { name: '大寒', element: 'tu', yang: -87, poem: '鸡始乳，鹰隼厉疾' }
];

/* 天干地支 */
XIAN.Data.tiangan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
XIAN.Data.dizhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
XIAN.Data.ganElement = { 甲: 'mu', 乙: 'mu', 丙: 'huo', 丁: 'huo', 戊: 'tu', 己: 'tu', 庚: 'jin', 辛: 'jin', 壬: 'shui', 癸: 'shui' };
XIAN.Data.zhiElement = { 子: 'shui', 丑: 'tu', 寅: 'mu', 卯: 'mu', 辰: 'tu', 巳: 'huo', 午: 'huo', 未: 'tu', 申: 'jin', 酉: 'jin', 戌: 'tu', 亥: 'shui' };
XIAN.Data.zhiBeast = { 子: '鼠', 丑: '牛', 寅: '虎', 卯: '兔', 辰: '龙', 巳: '蛇', 午: '马', 未: '羊', 申: '猴', 酉: '鸡', 戌: '狗', 亥: '猪' };

/* ------------------------------------------------------------
 * 五、灵根 —— 出身天赋
 *   affinity 总和恒为 150，分配方式决定路数
 * ---------------------------------------------------------- */
XIAN.Data.spiritRoots = [
  {
    id: 'tian', name: '天灵根', rarity: 3, weight: 4, grade: '上上',
    title: '一元独尊', speed: 1.55, daoxin: -8, insight: 4,
    make: function (rng) {
      var e = rng.pick(XIAN.Data.elementOrder), a = {};
      XIAN.Data.elementOrder.forEach(function (k) { a[k] = 10; });
      a[e] = 110;
      return { aff: a, main: e };
    },
    desc: '五行独钟一气，纯而不杂。修行之速冠绝同辈，然过刚则折，阴阳最易失衡。'
  },
  {
    id: 'shuang', name: '双灵根', rarity: 2, weight: 14, grade: '上',
    title: '两仪相济', speed: 1.28, daoxin: -2, insight: 2,
    make: function (rng) {
      var es = rng.shuffle(XIAN.Data.elementOrder.slice()), a = {};
      XIAN.Data.elementOrder.forEach(function (k) { a[k] = 10; });
      a[es[0]] = 60; a[es[1]] = 50;
      return { aff: a, main: es[0] };
    },
    desc: '二气相生，进退有据。若两系相生则如虎添翼，若两系相克则终身受其苦。'
  },
  {
    id: 'san', name: '三灵根', rarity: 1, weight: 26, grade: '中上',
    title: '三才具备', speed: 1.10, daoxin: 2, insight: 1,
    make: function (rng) {
      var es = rng.shuffle(XIAN.Data.elementOrder.slice()), a = {};
      XIAN.Data.elementOrder.forEach(function (k) { a[k] = 10; });
      a[es[0]] = 45; a[es[1]] = 38; a[es[2]] = 27;
      return { aff: a, main: es[0] };
    },
    desc: '三气并行，法门宽广。虽无天灵根之锐，却胜在无所不通。'
  },
  {
    id: 'si', name: '四灵根', rarity: 0, weight: 26, grade: '中',
    title: '四象周流', speed: 0.94, daoxin: 5, insight: 1,
    make: function (rng) {
      var es = rng.shuffle(XIAN.Data.elementOrder.slice()), a = {};
      XIAN.Data.elementOrder.forEach(function (k) { a[k] = 8; });
      a[es[0]] = 36; a[es[1]] = 32; a[es[2]] = 28; a[es[3]] = 26;
      return { aff: a, main: es[0] };
    },
    desc: '四气驳杂，进境迟缓。然驳杂者亦厚重，历劫之时反不易溃。'
  },
  {
    id: 'wu', name: '五灵杂根', rarity: 0, weight: 22, grade: '下',
    title: '五气纷驰', speed: 0.80, daoxin: 8, insight: 0,
    make: function (rng) {
      var a = {}, es = XIAN.Data.elementOrder;
      es.forEach(function (k) { a[k] = 26 + rng.int(0, 6); });
      var m = es[0];
      es.forEach(function (k) { if (a[k] > a[m]) m = k; });
      return { aff: a, main: m };
    },
    desc: '世人谓之伪灵根，讥为「废材」。然《道德经》云：大器晚成。五气若能调和，反可直窥太和之境。'
  },
  {
    id: 'taihe', name: '太和之体', rarity: 4, weight: 3, grade: '奇',
    title: '五气朝元', speed: 0.92, daoxin: 20, insight: 5,
    make: function () {
      var a = {};
      XIAN.Data.elementOrder.forEach(function (k) { a[k] = 30; });
      return { aff: a, main: 'tu', taihe: true };
    },
    desc: '五行绝均，不偏不倚，万世难逢。此体修行虽不迅疾，然阴阳自守、天劫自轻，且独可修「无为」一脉。'
  },
  {
    id: 'xuanyin', name: '玄阴之体', rarity: 3, weight: 5, grade: '偏',
    title: '至阴凝魄', speed: 1.34, daoxin: -12, insight: 3,
    make: function (rng) {
      var a = { jin: 14, mu: 14, shui: 82, huo: 6, tu: 34 };
      return { aff: a, main: 'shui', bias: -35 };
    },
    desc: '生而阴气充盈，玄冥自守。神魂之力远超同辈，然阳气先天不足，易堕魔道，天劫尤重。'
  },
  {
    id: 'chunyang', name: '纯阳之体', rarity: 3, weight: 5, grade: '偏',
    title: '烈日焚天', speed: 1.34, daoxin: -12, insight: 2,
    make: function () {
      var a = { jin: 30, mu: 34, shui: 6, huo: 76, tu: 4 };
      return { aff: a, main: 'huo', bias: 35 };
    },
    desc: '生而真阳鼎盛，百邪不侵。法力刚猛无匹，然火烈易焚己，走火入魔之危常伴。'
  }
];

/* ------------------------------------------------------------
 * 六、命格 —— 生辰所定之数
 * ---------------------------------------------------------- */
XIAN.Data.fates = [
  { id: 'ziwei', name: '紫微星临', weight: 5, good: true, desc: '紫微垣主星照命，气运绵长。奇遇多，凶事少。', mods: { luck: 25, repute: 15 } },
  { id: 'fude', name: '福德深厚', weight: 8, good: true, desc: '前世积德，今生受报。功德易得，业障难缠。', mods: { luck: 12, meritRate: 0.4, karmaRate: -0.3 } },
  { id: 'wenqu', name: '文曲附体', weight: 7, good: true, desc: '生具慧根，一点即透。悟性大增，然体魄偏弱。', mods: { insight: 6, maxJing: -40 } },
  { id: 'jiangxing', name: '将星之命', weight: 7, good: true, desc: '生于杀伐之辰，斗法无惧。攻伐强横，道心易躁。', mods: { atkPct: 18, daoxin: -8 } },
  { id: 'changsheng', name: '长生入命', weight: 5, good: true, desc: '寿星垂顾，天赐岁月。寿元加增，然进境略缓。', mods: { lifespanPct: 25, speed: -0.06 } },
  { id: 'jinyu', name: '金玉满堂', weight: 7, good: true, desc: '生于富室，不缺资财。开局灵石丰厚，坊市多有折扣。', mods: { stone: 900, tradeDiscount: 0.2 } },
  { id: 'tiansha', name: '天煞孤星', weight: 6, good: false, desc: '六亲缘薄，孤身向道。人情事件收益减半，然独修之效倍增。', mods: { soloBonus: 0.25, peopleRate: -0.5 } },
  { id: 'jiepo', name: '劫破之命', weight: 5, good: false, desc: '生逢劫煞，天雷偏爱。天劫威能加重，然渡劫后所得亦厚。', mods: { tribPower: 0.3, tribReward: 0.5 } },
  { id: 'bingti', name: '病骨残躯', weight: 5, good: false, desc: '娘胎带弱，精元难固。上限受损，然多病者多知惜命。', mods: { maxJingPct: -20, daoxin: 10, insight: 2 } },
  { id: 'xuanming', name: '玄冥缠身', weight: 4, good: false, desc: '幽冥之气附于命宫。阴气自增，神魂强而心魔多。', mods: { balance: -20, maxShenPct: 25, daoxin: -10 } },
  { id: 'pingfan', name: '凡庸之命', weight: 14, good: null, desc: '无甚特异，亦无甚亏欠。所谓「平常」二字，最是难得。', mods: { daoxin: 6, luck: 4 } },
  { id: 'yizhi', name: '异志逆天', weight: 6, good: null, desc: '生具反骨，不信天命。强行突破成功率提升，然业障积累加速。', mods: { forceBonus: 0.18, karmaRate: 0.35 } },
  { id: 'chidao', name: '赤道赋形', weight: 5, good: null, desc: '生于大暑正午，火性炎上。丹道天赋卓绝，火候易掌。', mods: { alchemy: 0.3, balance: 12 } },
  { id: 'yueying', name: '月映寒潭', weight: 5, good: null, desc: '生于子夜望月，水性至柔。占卜灵验，气运随卦而转。', mods: { divine: 0.35, balance: -10 } }
];

/* ------------------------------------------------------------
 * 七、走火入魔 —— 心魔与偏差
 * ---------------------------------------------------------- */
XIAN.Data.deviations = [
  { id: 'zouhuo', name: '走火', side: 'yang', desc: '真炁逆冲，经脉如焚。你口鼻溢烟，五脏俱伤。', effects: [{ k: 'hurtPct', v: 28 }, { k: 'daoxin', v: -12 }, { k: 'qi', v: -9999 }] },
  { id: 'rumo', name: '入魔', side: 'yin', desc: '阴煞入窍，识海翻覆。你在幻境中挥剑，醒来时手上有血。', effects: [{ k: 'hurtPct', v: 14 }, { k: 'daoxin', v: -18 }, { k: 'karma', v: 30 }, { k: 'balance', v: -12 }] },
  { id: 'jingsan', name: '精散', side: 'any', desc: '固元不谨，精元自泄。你照见镜中人，鬓角已生白发。', effects: [{ k: 'maxJing', v: -14 }, { k: 'lifespan', v: -6 }, { k: 'daoxin', v: -6 }] },
  { id: 'shenhun', name: '神昏', side: 'any', desc: '神魂受损，昼夜难辨。你忘了自己昨日在做什么，也忘了为何修道。', effects: [{ k: 'shen', v: -9999 }, { k: 'insight', v: -1 }, { k: 'daoxin', v: -10 }] },
  { id: 'daoji', name: '道基裂', side: 'any', desc: '躁进太甚，道基生隙。修为倒退，如登山失足。', effects: [{ k: 'dao', v: -0.35 }, { k: 'daoxin', v: -8 }] },
  { id: 'xinmo', name: '心魔现', side: 'any', desc: '一具与你一般模样之物，自识海深处睁开眼来。它说：你所求，我皆可与。', effects: [{ k: 'daoxin', v: -22 }, { k: 'karma', v: 20 }, { k: 'haste', v: 25 }] }
];

/* ------------------------------------------------------------
 * 八、修行姿势 —— 无为 / 有为
 * ---------------------------------------------------------- */
XIAN.Data.stances = [
  {
    id: 'ziran', name: '自然', glyph: '　', motto: '道法自然',
    daoMult: 1.00, qiCost: 1.00, hasteAdd: 2, daoxinAdd: 0, risk: 0.02,
    desc: '不疾不徐，随天时而动。中庸之道，无功无过。'
  },
  {
    id: 'jingzuo', name: '静坐', glyph: '　', motto: '致虚极，守静笃',
    daoMult: 0.52, qiCost: 0.25, hasteAdd: -22, daoxinAdd: 8, risk: 0.00,
    desc: '不求进境，唯求心安。道行所得甚微，然躁进尽消、道心自复，且必不走火。'
  },
  {
    id: 'tuna', name: '吐纳', glyph: '　', motto: '专气致柔',
    daoMult: 1.22, qiCost: 1.25, hasteAdd: 6, daoxinAdd: -2, risk: 0.05,
    desc: '深长呼吸，引气归元。所得颇丰，耗炁亦多。'
  },
  {
    id: 'kuxiu', name: '苦修', glyph: '　', motto: '朝闻道，夕死可矣',
    daoMult: 1.68, qiCost: 1.75, hasteAdd: 20, daoxinAdd: -9, risk: 0.16,
    desc: '不眠不休，以命换道。进境极速，然道心大损，走火之危陡增。'
  },
  {
    id: 'fanxu', name: '返虚', glyph: '　', motto: '涤除玄览，能无疵乎',
    daoMult: 0.86, qiCost: 0.55, hasteAdd: -10, daoxinAdd: 4, risk: 0.01,
    desc: '内观己身，不著于相。道行略缓，然悟性偶增、阴阳自调，为长久之计。',
    minRealm: 1
  },
  {
    id: 'duotian', name: '夺天', glyph: '　', motto: '我命由我不由天',
    daoMult: 2.35, qiCost: 2.4, hasteAdd: 34, daoxinAdd: -18, risk: 0.34,
    desc: '强抽地脉，逆夺天机。所得冠绝诸法，然业障骤积、天怒随之，非大凶之人不敢用。',
    minRealm: 2, karma: 18
  }
];

/* ------------------------------------------------------------
 * 九、天劫九种劫相
 * ---------------------------------------------------------- */
XIAN.Data.tribTypes = [
  { id: 'feng', name: '风劫', element: 'mu', color: '#8fc49c', desc: '罡风如刀，剥皮削骨。', target: 'jing' },
  { id: 'huo', name: '火劫', element: 'huo', color: '#e07a52', desc: '业火焚身，先烧皮肉后烧心。', target: 'jing' },
  { id: 'lei', name: '雷劫', element: 'jin', color: '#c8d8f0', desc: '天雷循身，专诛不臣。', target: 'jing' },
  { id: 'shui', name: '水劫', element: 'shui', color: '#6c9dc6', desc: '玄冥之水没顶，溺人于无声。', target: 'qi' },
  { id: 'jin', name: '金劫', element: 'jin', color: '#dfe3df', desc: '万千金刃自虚空生，斩尽护体罡气。', target: 'jing' },
  { id: 'xin', name: '心劫', element: 'none', color: '#a88fc4', desc: '幻境中你已成道千年，忽有人问：此可是真？', target: 'shen' },
  { id: 'ye', name: '业劫', element: 'none', color: '#8f6b6b', desc: '生平所欠，一一化形索还。', target: 'shen' },
  { id: 'shou', name: '寿劫', element: 'tu', color: '#c2a067', desc: '天欲收你岁月。每一息，皆有百年自你身上剥落。', target: 'lifespan' },
  { id: 'dao', name: '道劫', element: 'none', color: '#f0e0b0', desc: '天问：何为道？答错，则前功尽弃。', target: 'shen' }
];

/* ------------------------------------------------------------
 * 十、道号生成
 * ---------------------------------------------------------- */
XIAN.Data.nameParts = {
  xing: ['李', '陈', '苏', '慕', '叶', '萧', '云', '玄', '秦', '姜', '洛', '独孤', '上官', '轩辕', '南宫', '沈', '楚', '白', '墨', '青'],
  ming: ['清', '玄', '尘', '衡', '澈', '真', '寂', '虚', '朴', '素', '冲', '渊', '钧', '晏', '和', '简', '默', '恒', '甯', '若'],
  ming2: ['之', '', '', '', ''],
  hao1: ['太虚', '青玄', '一元', '守拙', '抱朴', '冲和', '知白', '涵虚', '澹然', '归元', '无为', '玄同', '希夷', '常清', '坐忘', '朝真'],
  hao2: ['子', '道人', '真人', '散人', '居士', '上人']
};

/* ------------------------------------------------------------
 * 十一、开局师门赠礼 / 引导语
 * ---------------------------------------------------------- */
XIAN.Data.openings = [
  '你自记事起，便住在青云山下。山中有观，观中有老道，老道无名。',
  '那年你十六。老道于晨钟未响时唤你至檀前，指案上三物：一卷《太乙玄门录》，一枚青铜罗盘，一撮尚温的香灰。',
  '他说：「道无形，然可循。你若信天，便日日焚香；你若信己，便夜夜打坐。二者皆通，二者皆险。」',
  '他又说：「记住三件事——精不可泄，气不可浊，神不可乱。此谓三宝。三宝全，则长生可期。」',
  '说完这句，老道便坐在蒲团上不动了。三日后，其身化作一撮白灰，随风散入松林。',
  '你收了罗盘，背起药篓，独自下了山门。此后千载春秋，皆自今日始。'
];

XIAN.Data.deathWords = [
  '风止。松涛止。你听见自己最后一次心跳，声音很远。',
  '识海如退潮，露出光洁的河床。你想起十六岁那年的香灰，还是温的。',
  '一缕真灵自天灵飞出，被无形之手接住，投入下一场轮回。'
];
