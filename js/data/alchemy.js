window.XIAN = window.XIAN || {};
XIAN.Data = XIAN.Data || {};

XIAN.Data.herbs = [
  {
    id: 'h_qingling_cao',
    name: '青灵草',
    element: 'mu',
    nature: 'yang',
    tier: 1,
    potency: 8,
    taste: '甘',
    desc: '茎青如翠玉，叶含晨露，生于青云山阴，味甘性平，善引气归元，久服轻身。',
    habitat: ['qingyun_shan', 'wanyao_gu']
  },
  {
    id: 'h_zizhi_cao',
    name: '紫芝草',
    element: 'mu',
    nature: 'yin',
    tier: 1,
    potency: 7,
    taste: '酸',
    desc: '色紫如漆，气香若兰，产于迷魂林幽暗处，味酸性阴，安神定魄，辟除秽气。',
    habitat: ['mihun_lin', 'qingyun_shan']
  },
  {
    id: 'h_baihe_hua',
    name: '白鹤花',
    element: 'jin',
    nature: 'ping',
    tier: 1,
    potency: 7,
    taste: '辛',
    desc: '花开六瓣，洁白如鹤羽，生于青云绝壁，味辛性平，清利头目，去风明目。',
    habitat: ['qingyun_shan', 'taixu_guan']
  },
  {
    id: 'h_yinhua_teng',
    name: '银花藤',
    element: 'jin',
    nature: 'yin',
    tier: 1,
    potency: 6,
    taste: '咸',
    desc: '藤蔓如银丝，攀石而生，花小色白，味咸性阴，能清热解毒，通络利水。',
    habitat: ['hanyu_gu', 'qingyun_shan']
  },
  {
    id: 'h_hanyu_zhi',
    name: '寒玉芝',
    element: 'shui',
    nature: 'yin',
    tier: 1,
    potency: 9,
    taste: '咸',
    desc: '形如寒玉，触手冰凉，生于寒玉谷深潭，味咸性阴，善镇心宁神，久服耐寒。',
    habitat: ['hanyu_gu']
  },
  {
    id: 'h_shuixian_cao',
    name: '水仙草',
    element: 'shui',
    nature: 'ping',
    tier: 1,
    potency: 7,
    taste: '咸',
    desc: '叶似兰而细，花色淡白，生于寒潭浅渚，味咸性平，能利水渗湿，清心除烦。',
    habitat: ['hanyu_gu', 'wanyao_gu']
  },
  {
    id: 'h_liehuo_cao',
    name: '烈火草',
    element: 'huo',
    nature: 'yang',
    tier: 1,
    potency: 10,
    taste: '辛',
    desc: '茎赤如炭，叶尖生芒，生于烈火原焦土，味辛性热，助阳通络，祛寒止痛。',
    habitat: ['liehuo_yuan']
  },
  {
    id: 'h_chiling_shen',
    name: '赤灵参',
    element: 'huo',
    nature: 'yang',
    tier: 1,
    potency: 11,
    taste: '苦',
    desc: '根似人形，皮赤肉白，产于万药谷药圃，味苦性温，大补元气，温养脏腑。',
    habitat: ['liehuo_yuan', 'wanyao_gu']
  },
  {
    id: 'h_huangsha_gen',
    name: '黄沙根',
    element: 'tu',
    nature: 'ping',
    tier: 1,
    potency: 8,
    taste: '甘',
    desc: '根深九尺，色黄质坚，生于黄沙岭风蚀地，味甘性平，健脾益肺，固本培元。',
    habitat: ['huangsha_ling']
  },
  {
    id: 'h_cangzhu',
    name: '苍术',
    element: 'tu',
    nature: 'ping',
    tier: 1,
    potency: 8,
    taste: '苦',
    desc: '根茎粗壮，气烈而香，生于青云山沃土，味苦性平，燥湿健脾，驱散瘴气。',
    habitat: ['qingyun_shan', 'wanyao_gu']
  },
  {
    id: 'h_qingmu_lingzhi',
    name: '青木灵芝',
    element: 'mu',
    nature: 'yang',
    tier: 2,
    potency: 15,
    taste: '酸',
    desc: '芝盖青碧，纹如年轮，生于古木之根，味酸性温，补肝益血，生发元气。',
    habitat: ['qingyun_shan', 'wanyao_gu']
  },
  {
    id: 'h_yueyin_cao',
    name: '月阴草',
    element: 'mu',
    nature: 'yin',
    tier: 2,
    potency: 16,
    taste: '苦',
    desc: '叶如弯月，夜放微光，生于迷魂林阴湿处，味苦性阴，滋阴降火，宁神定志。',
    habitat: ['mihun_lin', 'hanyu_gu']
  },
  {
    id: 'h_gengjin_teng',
    name: '庚金藤',
    element: 'jin',
    nature: 'yang',
    tier: 2,
    potency: 17,
    taste: '辛',
    desc: '藤色如金，坚逾铁石，生于金石洞崖隙，味辛性温，强筋健骨，化坚破积。',
    habitat: ['jinshi_dong', 'gulong_xu']
  },
  {
    id: 'h_xuanci_hua',
    name: '玄磁花',
    element: 'jin',
    nature: 'yin',
    tier: 2,
    potency: 17,
    taste: '咸',
    desc: '花分五瓣，色黑而润，生于金石洞磁矿上，味咸性阴，镇惊安神，摄气归元。',
    habitat: ['jinshi_dong']
  },
  {
    id: 'h_xuanbing_sui',
    name: '玄冰髓',
    element: 'shui',
    nature: 'yin',
    tier: 2,
    potency: 20,
    taste: '咸',
    desc: '石髓凝冰，通体莹澈，出于寒玉谷冰窟，味咸性寒，大补真阴，降伏心火。',
    habitat: ['hanyu_gu', 'beiming_hai']
  },
  {
    id: 'h_longxian_tai',
    name: '龙涎苔',
    element: 'shui',
    nature: 'yin',
    tier: 2,
    potency: 18,
    taste: '咸',
    desc: '苔生礁石，气若龙涎，产于北冥深海之畔，味咸性阴，益精填髓，通利百脉。',
    habitat: ['beiming_hai', 'jiuyou_yuan']
  },
  {
    id: 'h_zhuyang_hua',
    name: '朱阳花',
    element: 'huo',
    nature: 'yang',
    tier: 2,
    potency: 18,
    taste: '甘',
    desc: '花赤如朱，向阳而开，生于烈火原炎谷，味甘性热，补火助阳，温通经脉。',
    habitat: ['liehuo_yuan', 'tianzhu_feng']
  },
  {
    id: 'h_chiyan_shen',
    name: '赤炎参',
    element: 'huo',
    nature: 'yang',
    tier: 2,
    potency: 19,
    taste: '苦',
    desc: '根赤似火，灼手而温，生于烈火原地脉，味苦性热，大补元阳，回阳救逆。',
    habitat: ['liehuo_yuan']
  },
  {
    id: 'h_xirang_tu',
    name: '息壤土',
    element: 'tu',
    nature: 'ping',
    tier: 2,
    potency: 16,
    taste: '甘',
    desc: '土性自生，取之不尽，出于古龙墟遗迹，味甘性平，培土固本，生化万物。',
    habitat: ['huangsha_ling', 'gulong_xu']
  },
  {
    id: 'h_tianlei_teng',
    name: '天雷藤',
    element: 'mu',
    nature: 'yang',
    tier: 3,
    potency: 35,
    taste: '苦',
    desc: '藤含雷纹，触之麻酥，生于天柱峰雷击木，味苦性温，通经活络，破除瘀滞。',
    habitat: ['tianzhu_feng', 'qingyun_shan']
  },
  {
    id: 'h_baihu_jinshi',
    name: '白虎金石',
    element: 'jin',
    nature: 'yang',
    tier: 3,
    potency: 34,
    taste: '辛',
    desc: '石质莹白，锋锐如金，生于金石洞矿脉，味辛性温，锐利攻伐，破结消积。',
    habitat: ['jinshi_dong', 'gulong_xu']
  },
  {
    id: 'h_hanbing_lian',
    name: '寒冰莲',
    element: 'shui',
    nature: 'yin',
    tier: 3,
    potency: 36,
    taste: '咸',
    desc: '莲生寒潭，千年一开，出于寒玉谷冻湖，味咸性寒，清心凉血，涤荡邪热。',
    habitat: ['hanyu_gu', 'beiming_hai']
  },
  {
    id: 'h_youming_cao',
    name: '幽冥草',
    element: 'shui',
    nature: 'yin',
    tier: 3,
    potency: 37,
    taste: '苦',
    desc: '色黑如墨，生于九幽阴地，气冷而幽，味苦性阴，通幽导滞，镇摄阴魂。',
    habitat: ['jiuyou_yuan', 'mihun_lin']
  },
  {
    id: 'h_diyan_lian',
    name: '地炎莲',
    element: 'huo',
    nature: 'yang',
    tier: 3,
    potency: 38,
    taste: '辛',
    desc: '莲生地火，瓣赤如焰，出于烈火原熔窟，味辛性热，温阳散寒，化除阴凝。',
    habitat: ['liehuo_yuan', 'gulong_xu']
  },
  {
    id: 'h_yusui_lingzhi',
    name: '玉髓灵芝',
    element: 'tu',
    nature: 'ping',
    tier: 3,
    potency: 33,
    taste: '甘',
    desc: '芝质如玉，温润有光，生于万药谷灵圃，味甘性平，补中益气，滋养五脏。',
    habitat: ['huangsha_ling', 'wanyao_gu']
  },
  {
    id: 'h_huangjing_shen',
    name: '黄精参',
    element: 'tu',
    nature: 'ping',
    tier: 3,
    potency: 32,
    taste: '甘',
    desc: '根似黄精，肥润甘美，生于黄沙岭沃壤，味甘性平，益气养阴，延年耐老。',
    habitat: ['huangsha_ling', 'qingyun_shan']
  },
  {
    id: 'h_xianling_cao',
    name: '仙灵草',
    element: 'mu',
    nature: 'yang',
    tier: 4,
    potency: 60,
    taste: '甘',
    desc: '叶泛流光，异香满谷，生于天柱峰绝顶，味甘性温，通仙达灵，增智开慧。',
    habitat: ['tianzhu_feng', 'taixu_guan']
  },
  {
    id: 'h_taiyi_jinlian',
    name: '太乙金莲',
    element: 'jin',
    nature: 'ping',
    tier: 4,
    potency: 65,
    taste: '辛',
    desc: '金莲九瓣，光照三丈，出于太虚观丹圃，味辛性平，调和百药，凝气成丹。',
    habitat: ['taixu_guan', 'tianzhu_feng']
  },
  {
    id: 'h_xuanwu_guijia',
    name: '玄武龟甲',
    element: 'shui',
    nature: 'yin',
    tier: 4,
    potency: 62,
    taste: '咸',
    desc: '龟甲玄黑，纹分八卦，出于北冥深海，味咸性阴，坚阴固本，镇水藏精。',
    habitat: ['beiming_hai', 'hanyu_gu']
  },
  {
    id: 'h_chilong_sui',
    name: '赤龙髓',
    element: 'huo',
    nature: 'yang',
    tier: 4,
    potency: 68,
    taste: '苦',
    desc: '龙髓赤红，凝而不散，出于古龙墟龙骨，味苦性热，壮阳补髓，强固根本。',
    habitat: ['gulong_xu', 'liehuo_yuan']
  },
  {
    id: 'h_qilin_zhi',
    name: '麒麟芝',
    element: 'tu',
    nature: 'yang',
    tier: 4,
    potency: 63,
    taste: '甘',
    desc: '芝如麒麟，五彩流光，生于古龙墟灵土，味甘性温，培元固本，调和水火。',
    habitat: ['gulong_xu', 'huangsha_ling']
  },
  {
    id: 'h_tianzhu_shenzhi',
    name: '天柱神芝',
    element: 'mu',
    nature: 'yang',
    tier: 5,
    potency: 140,
    taste: '甘',
    desc: '芝生天柱，吸日月精华，万年方熟，味甘性温，夺造化之功，服之通神。',
    habitat: ['tianzhu_feng']
  },
  {
    id: 'h_taiyin_yuehua',
    name: '太阴月华草',
    element: 'jin',
    nature: 'yin',
    tier: 5,
    potency: 135,
    taste: '甘',
    desc: '草承月华，夜放清辉，产于北冥之畔，味甘性阴，纯阴至柔，滋阴益精。',
    habitat: ['beiming_hai', 'tianzhu_feng']
  },
  {
    id: 'h_jiuyou_lan',
    name: '九幽兰',
    element: 'shui',
    nature: 'yin',
    tier: 5,
    potency: 120,
    taste: '苦',
    desc: '兰生九幽，色暗如夜，香冷彻骨，味苦性阴，通幽入微，涤荡神魂。',
    habitat: ['jiuyou_yuan']
  }
];

XIAN.Data.pills = [
  {
    id: 'p_juqi_dan',
    name: '聚气丹',
    tier: 1,
    realm: 0,
    fireIdeal: 0.42,
    fireTol: 0.16,
    recipe: [
      { herb: 'h_qingling_cao', qty: 3, role: 'jun' },
      { herb: 'h_chiling_shen', qty: 2, role: 'chen' },
      { herb: 'h_shuixian_cao', qty: 1, role: 'zuo' }
    ],
    desc: '采青灵之气，合参草之精，炼成黄白小丸，服之丹田生暖，气机流转。',
    lore: '气者，生之元也，聚之则存。',
    effects: [
      { k: 'qi', v: 40 },
      { k: 'jing', v: 30 }
    ]
  },
  {
    id: 'p_huichun_dan',
    name: '回春丹',
    tier: 1,
    realm: 0,
    fireIdeal: 0.50,
    fireTol: 0.17,
    recipe: [
      { herb: 'h_qingling_cao', qty: 2, role: 'jun' },
      { herb: 'h_zizhi_cao', qty: 2, role: 'chen' },
      { herb: 'h_huangsha_gen', qty: 1, role: 'zuo' }
    ],
    desc: '色碧味甘，专治内外之伤，服之伤口生肌，气血回暖，如沐春风。',
    lore: '春气至而百草生，元气复而百病除。',
    effects: [
      { k: 'healPct', v: 25 },
      { k: 'jing', v: 30 }
    ]
  },
  {
    id: 'p_qingxin_dan',
    name: '清心丹',
    tier: 1,
    realm: 0,
    fireIdeal: 0.38,
    fireTol: 0.17,
    recipe: [
      { herb: 'h_zizhi_cao', qty: 2, role: 'jun' },
      { herb: 'h_shuixian_cao', qty: 2, role: 'chen' },
      { herb: 'h_yinhua_teng', qty: 1, role: 'zuo' }
    ],
    desc: '其性清凉，入心经，服之烦热尽去，神识清明，杂念不生。',
    lore: '心如明镜台，勿使惹尘埃。',
    effects: [
      { k: 'shen', v: 20 },
      { k: 'daoxin', v: 8 }
    ]
  },
  {
    id: 'p_dingshen_dan',
    name: '定神丹',
    tier: 1,
    realm: 0,
    fireIdeal: 0.44,
    fireTol: 0.16,
    recipe: [
      { herb: 'h_hanyu_zhi', qty: 2, role: 'jun' },
      { herb: 'h_zizhi_cao', qty: 2, role: 'chen' },
      { herb: 'h_cangzhu', qty: 1, role: 'shi' }
    ],
    desc: '色白如雪，镇心安神，服之神魂安定，夜梦不起，躁气自平。',
    lore: '神定则气聚，气聚则形安。',
    effects: [
      { k: 'shen', v: 20 },
      { k: 'haste', v: -12 }
    ]
  },
  {
    id: 'p_peiyuan_dan',
    name: '培元丹',
    tier: 1,
    realm: 0,
    fireIdeal: 0.46,
    fireTol: 0.16,
    recipe: [
      { herb: 'h_chiling_shen', qty: 3, role: 'jun' },
      { herb: 'h_huangsha_gen', qty: 2, role: 'chen' },
      { herb: 'h_cangzhu', qty: 1, role: 'zuo' }
    ],
    desc: '培补元气之要药，色黄质润，服之丹田充盈，根基渐固。',
    lore: '元气者，一身之根本，培之则固。',
    effects: [
      { k: 'maxJing', v: 15 },
      { k: 'jing', v: 30 }
    ]
  },
  {
    id: 'p_tongmai_san',
    name: '通脉散',
    tier: 1,
    realm: 0,
    fireIdeal: 0.40,
    fireTol: 0.17,
    recipe: [
      { herb: 'h_liehuo_cao', qty: 2, role: 'jun' },
      { herb: 'h_qingling_cao', qty: 2, role: 'chen' },
      { herb: 'h_baihe_hua', qty: 1, role: 'zuo' },
      { herb: 'h_yinhua_teng', qty: 1, role: 'shi' }
    ],
    desc: '辛温走窜，散而不滞，服之气血畅行，微有经脉开阖之感。',
    lore: '脉通则气顺，气顺则身轻。',
    effects: [
      { k: 'qi', v: 40 },
      { k: 'breakthrough', v: 8 }
    ]
  },
  {
    id: 'p_lianqi_san',
    name: '炼气散',
    tier: 1,
    realm: 0,
    fireIdeal: 0.36,
    fireTol: 0.18,
    recipe: [
      { herb: 'h_qingling_cao', qty: 2, role: 'jun' },
      { herb: 'h_shuixian_cao', qty: 1, role: 'chen' },
      { herb: 'h_liehuo_cao', qty: 1, role: 'zuo' },
      { herb: 'h_huangsha_gen', qty: 1, role: 'shi' }
    ],
    desc: '以烈火煅炼草木精气，服之口舌生津，气行周天，略增修为。',
    lore: '炼精化气，气满自溢。',
    effects: [
      { k: 'qi', v: 40 },
      { k: 'jing', v: 20 }
    ]
  },
  {
    id: 'p_xisui_dan',
    name: '洗髓丹',
    tier: 2,
    realm: 1,
    fireIdeal: 0.52,
    fireTol: 0.14,
    recipe: [
      { herb: 'h_gengjin_teng', qty: 2, role: 'jun' },
      { herb: 'h_xuanbing_sui', qty: 2, role: 'chen' },
      { herb: 'h_xirang_tu', qty: 1, role: 'zuo' }
    ],
    desc: '伐毛洗髓，脱胎换骨之剂，服之髓海清凉，杂质尽去。',
    lore: '髓者，精之所藏，洗之则清。',
    effects: [
      { k: 'maxJing', v: 30 },
      { k: 'maxQi', v: 30 },
      { k: 'dao', v: 400 }
    ]
  },
  {
    id: 'p_ningyuan_dan',
    name: '凝元丹',
    tier: 2,
    realm: 1,
    fireIdeal: 0.48,
    fireTol: 0.14,
    recipe: [
      { herb: 'h_qingmu_lingzhi', qty: 3, role: 'jun' },
      { herb: 'h_xirang_tu', qty: 2, role: 'chen' },
      { herb: 'h_xuanci_hua', qty: 1, role: 'zuo' }
    ],
    desc: '凝炼元气，结成真种，服之丹田如珠，气聚不散。',
    lore: '元气涣则神疲，凝之则聚。',
    effects: [
      { k: 'qi', v: 80 },
      { k: 'maxQi', v: 30 }
    ]
  },
  {
    id: 'p_kaimai_dan',
    name: '开脉丹',
    tier: 2,
    realm: 2,
    fireIdeal: 0.55,
    fireTol: 0.13,
    recipe: [
      { herb: 'h_gengjin_teng', qty: 2, role: 'jun' },
      { herb: 'h_zhuyang_hua', qty: 2, role: 'chen' },
      { herb: 'h_qingling_cao', qty: 1, role: 'zuo' }
    ],
    desc: '以金火之锐，凿开闭塞经脉，服之百脉震动，气血如潮。',
    lore: '经脉闭塞，如江河之壅，开之则通。',
    effects: [
      { k: 'qi', v: 80 },
      { k: 'breakthrough', v: 15 }
    ]
  },
  {
    id: 'p_pozhang_dan',
    name: '破障丹',
    tier: 2,
    realm: 2,
    fireIdeal: 0.58,
    fireTol: 0.13,
    recipe: [
      { herb: 'h_yueyin_cao', qty: 2, role: 'jun' },
      { herb: 'h_longxian_tai', qty: 2, role: 'chen' },
      { herb: 'h_xuanci_hua', qty: 1, role: 'zuo' }
    ],
    desc: '涤荡业障，破除执念，服之如拨云见日，心境豁然。',
    lore: '障者，心之所蔽，破之则明。',
    effects: [
      { k: 'karma', v: -40 },
      { k: 'daoxin', v: 15 }
    ]
  },
  {
    id: 'p_diye_dan',
    name: '涤业丹',
    tier: 2,
    realm: 2,
    fireIdeal: 0.60,
    fireTol: 0.12,
    recipe: [
      { herb: 'h_xuanbing_sui', qty: 2, role: 'jun' },
      { herb: 'h_yueyin_cao', qty: 2, role: 'chen' },
      { herb: 'h_yinhua_teng', qty: 1, role: 'shi' }
    ],
    desc: '以清净之药，洗刷业垢，服之善念滋生，恶业渐消。',
    lore: '善积则业消，心净则障除。',
    effects: [
      { k: 'karma', v: -40 },
      { k: 'merit', v: 20 }
    ]
  },
  {
    id: 'p_longhu_dan',
    name: '龙虎丹',
    tier: 2,
    realm: 2,
    fireIdeal: 0.62,
    fireTol: 0.12,
    recipe: [
      { herb: 'h_zhuyang_hua', qty: 2, role: 'jun' },
      { herb: 'h_xuanbing_sui', qty: 2, role: 'chen' },
      { herb: 'h_chiyan_shen', qty: 1, role: 'zuo' },
      { herb: 'h_longxian_tai', qty: 1, role: 'shi' }
    ],
    desc: '龙虎交媾，阴阳双补，服之一身寒热自调，精神俱旺。',
    lore: '龙从火里出，虎向水中生。',
    effects: [
      { k: 'balance', v: 12 },
      { k: 'jing', v: 60 },
      { k: 'qi', v: 80 }
    ]
  },
  {
    id: 'p_wuxing_diaoyuan_dan',
    name: '五行调元丹',
    tier: 2,
    realm: 2,
    fireIdeal: 0.50,
    fireTol: 0.13,
    recipe: [
      { herb: 'h_qingmu_lingzhi', qty: 2, role: 'jun' },
      { herb: 'h_gengjin_teng', qty: 1, role: 'chen' },
      { herb: 'h_xuanbing_sui', qty: 1, role: 'chen' },
      { herb: 'h_zhuyang_hua', qty: 1, role: 'zuo' },
      { herb: 'h_xirang_tu', qty: 1, role: 'shi' }
    ],
    desc: '取五行之精，相生相济，服之五脏调和，气机圆融无碍。',
    lore: '五行相生，运转而不息。',
    effects: [
      { k: 'qi', v: 80 },
      { k: 'balance', v: 12 }
    ]
  },
  {
    id: 'p_zhuji_dan',
    name: '筑基丹',
    tier: 3,
    realm: 3,
    fireIdeal: 0.55,
    fireTol: 0.10,
    recipe: [
      { herb: 'h_tianlei_teng', qty: 3, role: 'jun' },
      { herb: 'h_yusui_lingzhi', qty: 2, role: 'chen' },
      { herb: 'h_baihu_jinshi', qty: 1, role: 'zuo' },
      { herb: 'h_xirang_tu', qty: 1, role: 'shi' }
    ],
    desc: '筑就道基，成就法体，服之丹田如城，道基稳固难摧。',
    lore: '九层之台，起于累土筑基。',
    effects: [
      { k: 'maxJing', v: 60 },
      { k: 'maxQi', v: 60 },
      { k: 'dao', v: 800 }
    ]
  },
  {
    id: 'p_chunyang_dan',
    name: '纯阳丹',
    tier: 3,
    realm: 4,
    fireIdeal: 0.60,
    fireTol: 0.10,
    recipe: [
      { herb: 'h_diyan_lian', qty: 3, role: 'jun' },
      { herb: 'h_zhuyang_hua', qty: 2, role: 'chen' },
      { herb: 'h_chiyan_shen', qty: 1, role: 'zuo' },
      { herb: 'h_tianlei_teng', qty: 1, role: 'shi' }
    ],
    desc: '纯阳无阴，服之阳火自生，遍体如烘，阴邪不侵。',
    lore: '阳者，天之道也，纯而不杂。',
    effects: [
      { k: 'balance', v: 24 },
      { k: 'maxQi', v: 60 },
      { k: 'qi', v: 160 }
    ]
  },
  {
    id: 'p_taiyin_dan',
    name: '太阴丹',
    tier: 3,
    realm: 4,
    fireIdeal: 0.42,
    fireTol: 0.10,
    recipe: [
      { herb: 'h_hanbing_lian', qty: 3, role: 'jun' },
      { herb: 'h_xuanbing_sui', qty: 2, role: 'chen' },
      { herb: 'h_youming_cao', qty: 1, role: 'zuo' },
      { herb: 'h_yueyin_cao', qty: 1, role: 'shi' }
    ],
    desc: '纯阴至寒，服之清泉贯顶，神意澄澈，虚火自降。',
    lore: '阴者，地之道也，静而能生。',
    effects: [
      { k: 'balance', v: -24 },
      { k: 'shen', v: 80 },
      { k: 'maxShen', v: 40 }
    ]
  },
  {
    id: 'p_powang_dan',
    name: '破妄丹',
    tier: 3,
    realm: 4,
    fireIdeal: 0.47,
    fireTol: 0.10,
    recipe: [
      { herb: 'h_youming_cao', qty: 2, role: 'jun' },
      { herb: 'h_baihu_jinshi', qty: 2, role: 'chen' },
      { herb: 'h_yueyin_cao', qty: 1, role: 'zuo' },
      { herb: 'h_hanbing_lian', qty: 1, role: 'shi' }
    ],
    desc: '破除虚妄，照见真我，服之幻象尽碎，灵台一片光明。',
    lore: '凡所有相，皆是虚妄，破之即真。',
    effects: [
      { k: 'insight', v: 4 },
      { k: 'daoxin', v: 30 },
      { k: 'shen', v: 80 }
    ]
  },
  {
    id: 'p_wudao_dan',
    name: '悟道丹',
    tier: 3,
    realm: 4,
    fireIdeal: 0.53,
    fireTol: 0.09,
    recipe: [
      { herb: 'h_yusui_lingzhi', qty: 3, role: 'jun' },
      { herb: 'h_huangjing_shen', qty: 2, role: 'chen' },
      { herb: 'h_tianlei_teng', qty: 1, role: 'zuo' }
    ],
    desc: '服之如入灵境，天地至理若在眼前，一时豁然贯通。',
    lore: '道可道，非常道，悟者自得。',
    effects: [
      { k: 'insight', v: 4 },
      { k: 'dao', v: 800 },
      { k: 'daoxin', v: 30 }
    ]
  },
  {
    id: 'p_huamo_dan',
    name: '化魔丹',
    tier: 4,
    realm: 5,
    fireIdeal: 0.60,
    fireTol: 0.08,
    recipe: [
      { herb: 'h_chilong_sui', qty: 3, role: 'jun' },
      { herb: 'h_xuanwu_guijia', qty: 2, role: 'chen' },
      { herb: 'h_qilin_zhi', qty: 1, role: 'zuo' },
      { herb: 'h_xianling_cao', qty: 1, role: 'shi' }
    ],
    desc: '化魔为道，转恶为善，服之内魔瓦解，心魔尽化。',
    lore: '魔由心生，亦由心灭，心净魔消。',
    effects: [
      { k: 'karma', v: -160 },
      { k: 'daoxin', v: 60 },
      { k: 'shen', v: 160 }
    ]
  },
  {
    id: 'p_duotian_dan',
    name: '夺天丹',
    tier: 4,
    realm: 6,
    fireIdeal: 0.68,
    fireTol: 0.07,
    recipe: [
      { herb: 'h_xianling_cao', qty: 3, role: 'jun' },
      { herb: 'h_taiyi_jinlian', qty: 2, role: 'chen' },
      { herb: 'h_chilong_sui', qty: 1, role: 'zuo' },
      { herb: 'h_tianzhu_shenzhi', qty: 1, role: 'shi' }
    ],
    desc: '夺天地之造化，补自身之不足，服之筋骨重塑，资质大进。',
    lore: '逆天改命，夺造化之功。',
    effects: [
      { k: 'maxJing', v: 120 },
      { k: 'maxQi', v: 120 },
      { k: 'maxShen', v: 80 }
    ]
  },
  {
    id: 'p_guyuan_dan',
    name: '固元丹',
    tier: 4,
    realm: 5,
    fireIdeal: 0.55,
    fireTol: 0.08,
    recipe: [
      { herb: 'h_qilin_zhi', qty: 3, role: 'jun' },
      { herb: 'h_xuanwu_guijia', qty: 2, role: 'chen' },
      { herb: 'h_yusui_lingzhi', qty: 1, role: 'zuo' },
      { herb: 'h_xirang_tu', qty: 1, role: 'shi' }
    ],
    desc: '固本培元，锁精不泄，服之元气凝实，根基牢不可破。',
    lore: '元者，身之本也，固之则安。',
    effects: [
      { k: 'maxJing', v: 120 },
      { k: 'maxQi', v: 120 },
      { k: 'jing', v: 240 }
    ]
  },
  {
    id: 'p_yanshou_dan',
    name: '延寿丹',
    tier: 4,
    realm: 6,
    fireIdeal: 0.50,
    fireTol: 0.08,
    recipe: [
      { herb: 'h_xianling_cao', qty: 2, role: 'jun' },
      { herb: 'h_taiyi_jinlian', qty: 2, role: 'chen' },
      { herb: 'h_huangjing_shen', qty: 2, role: 'zuo' },
      { herb: 'h_qilin_zhi', qty: 1, role: 'shi' }
    ],
    desc: '添油续命，益寿延年，服之白发转黑，容颜渐复青春。',
    lore: '寿者，命之数也，续之则长。',
    effects: [
      { k: 'lifespan', v: 120 },
      { k: 'maxJing', v: 120 }
    ]
  },
  {
    id: 'p_jiuzhuan_jindan',
    name: '九转金丹',
    tier: 5,
    realm: 7,
    fireIdeal: 0.70,
    fireTol: 0.05,
    recipe: [
      { herb: 'h_tianzhu_shenzhi', qty: 3, role: 'jun' },
      { herb: 'h_taiyin_yuehua', qty: 2, role: 'chen' },
      { herb: 'h_jiuyou_lan', qty: 1, role: 'zuo' },
      { herb: 'h_taiyi_jinlian', qty: 1, role: 'shi' }
    ],
    desc: '九转而金丹大成，服之脱胎换骨，直窥长生门径，凡人可证仙途。',
    lore: '一粒金丹吞入腹，始知我命不由天。',
    effects: [
      { k: 'dao', v: 3200 },
      { k: 'maxJing', v: 240 },
      { k: 'maxShen', v: 160 }
    ]
  },
  {
    id: 'p_taiyi_dujie_dan',
    name: '太乙渡劫丹',
    tier: 5,
    realm: 8,
    fireIdeal: 0.75,
    fireTol: 0.05,
    recipe: [
      { herb: 'h_taiyin_yuehua', qty: 2, role: 'jun' },
      { herb: 'h_tianzhu_shenzhi', qty: 2, role: 'chen' },
      { herb: 'h_jiuyou_lan', qty: 1, role: 'zuo' },
      { herb: 'h_xuanwu_guijia', qty: 1, role: 'shi' }
    ],
    desc: '太乙护持，天雷难伤，服之劫数临头而道体不损，安然飞升。',
    lore: '雷劫虽险，太乙护我周全。',
    effects: [
      { k: 'breakthrough', v: 120 },
      { k: 'daoxin', v: 100 },
      { k: 'maxShen', v: 160 }
    ]
  },
  {
    id: 'p_daluo_yanshou_dan',
    name: '大罗延寿丹',
    tier: 5,
    realm: 8,
    fireIdeal: 0.68,
    fireTol: 0.06,
    recipe: [
      { herb: 'h_taiyin_yuehua', qty: 2, role: 'jun' },
      { herb: 'h_tianzhu_shenzhi', qty: 2, role: 'chen' },
      { herb: 'h_jiuyou_lan', qty: 1, role: 'zuo' },
      { herb: 'h_xianling_cao', qty: 1, role: 'shi' }
    ],
    desc: '大罗之药，夺寿于天，服之增寿数百载，容颜永驻如仙。',
    lore: '与天地齐寿，与日月同光。',
    effects: [
      { k: 'lifespan', v: 240 },
      { k: 'maxJing', v: 240 },
      { k: 'maxQi', v: 240 }
    ]
  }
];
