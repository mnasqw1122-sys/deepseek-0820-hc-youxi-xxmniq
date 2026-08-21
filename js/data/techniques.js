window.XIAN = window.XIAN || {};
XIAN.Data = XIAN.Data || {};

XIAN.Data.techniques = [
  // ===== 金（8）=====
  { id: 'jin_jinfeng', name: '金锋斩', kind: 'attack', element: 'jin', tier: 1, realm: 0, cost: 10, cd: 0, desc: '凝金气为锋刃，劈空斩出，锐不可当，对敌造成中量伤害。', quote: '金锋所向，无物不摧。', effects: [{ k: 'damage', mult: 1.2 }] },
  { id: 'jin_xuantie', name: '玄铁护身', kind: 'guard', element: 'jin', tier: 1, realm: 0, cost: 12, cd: 1, desc: '引金气凝为玄铁罡罩，护持己身，抵御外袭数个回合。', quote: '金气凝罡，坚不可摧。', effects: [{ k: 'shield', mult: 1.2, turns: 2 }] },
  { id: 'jin_liujin', name: '流金剑芒', kind: 'attack', element: 'jin', tier: 2, realm: 0, cost: 18, cd: 0, desc: '剑气如流金飞泻，连环三击，锋芒交错，令敌难以招架。', quote: '流金飞泻，剑气纵横。', effects: [{ k: 'multihit', mult: 0.5, hits: 3 }] },
  { id: 'jin_gengxin', name: '庚辛之气', kind: 'buff', element: 'jin', tier: 2, realm: 1, cost: 20, cd: 1, desc: '运转庚辛金气，锐意贯体，短时间内大幅提升自身攻击。', quote: '庚辛肃杀，锐不可挡。', effects: [{ k: 'buff', stat: 'atk', pct: 30, turns: 3 }] },
  { id: 'jin_zhanhun', name: '斩妖剑', kind: 'attack', element: 'jin', tier: 3, realm: 1, cost: 30, cd: 0, desc: '剑出如龙，直斩妖邪，既伤其躯，亦斩其神魂，令敌胆寒。', quote: '一剑斩妖，神形俱灭。', effects: [{ k: 'damage', mult: 1.6 }, { k: 'soul', mult: 0.8 }] },
  { id: 'jin_tiange', name: '天戈裂空', kind: 'attack', element: 'jin', tier: 3, realm: 2, cost: 36, cd: 0, desc: '金气化为天戈，自天而降，撕裂长空，重创前方之敌。', quote: '天戈所指，长空裂开。', effects: [{ k: 'damage', mult: 2.1 }] },
  { id: 'jin_wanjian', name: '万剑归宗', kind: 'attack', element: 'jin', tier: 4, realm: 2, cost: 50, cd: 0, desc: '万道剑光自四方而来，归于一心，齐射而出，剑雨遮天蔽日。', quote: '万剑朝宗，一剑破万法。', effects: [{ k: 'multihit', mult: 0.65, hits: 4 }] },
  { id: 't_gengjin_jianyu', name: '庚金剑雨阵', kind: 'attack', element: 'jin', tier: 5, realm: 6, cost: 90, cd: 1, desc: '以庚金布下无上剑阵，剑雨倾泻如天河倒卷，万剑穿心，毁天灭地。', quote: '庚金为骨，剑雨为牢，万劫不复。', effects: [{ k: 'multihit', mult: 0.7, hits: 5 }] },

  // ===== 木（8）=====
  { id: 'mu_qingteng', name: '青藤缚灵诀', kind: 'attack', element: 'mu', tier: 1, realm: 0, cost: 12, cd: 0, desc: '召青藤破土而出，缚住灵体与肉身，缠绕绞杀，令敌难以挣脱。', quote: '青藤缠身，灵躯难逃。', effects: [{ k: 'damage', mult: 1.15 }, { k: 'debuff', stat: 'spd', pct: 15, turns: 2 }] },
  { id: 'mu_muling', name: '木灵护体', kind: 'guard', element: 'mu', tier: 1, realm: 0, cost: 12, cd: 1, desc: '木灵缠绕周身，生生不息，化柔韧之盾，护持己身。', quote: '木灵护体，生生不息。', effects: [{ k: 'shield', mult: 1.1, turns: 2 }] },
  { id: 'mu_jingji', name: '荆棘缠绕', kind: 'attack', element: 'mu', tier: 2, realm: 0, cost: 18, cd: 0, desc: '荆棘自地底疯长，缠绕刺扎，令敌举步维艰，持续受创。', quote: '荆棘丛生，困兽犹斗。', effects: [{ k: 'damage', mult: 1.3 }, { k: 'debuff', stat: 'spd', pct: 20, turns: 3 }] },
  { id: 'mu_changchun', name: '长春功', kind: 'heal', element: 'mu', tier: 2, realm: 1, cost: 22, cd: 1, desc: '运转长春之气，滋养脏腑，缓缓回复自身精元，疗伤续命。', quote: '春回大地，枯木逢春。', effects: [{ k: 'heal', mult: 1.3 }] },
  { id: 'mu_yimu', name: '乙木神雷', kind: 'attack', element: 'mu', tier: 3, realm: 1, cost: 32, cd: 0, desc: '乙木之气生发为雷，青雷轰顶，木雷相生，威力倍增。', quote: '青木生雷，震彻九霄。', effects: [{ k: 'damage', mult: 1.9 }, { k: 'stun', turns: 1, chance: 0.25 }] },
  { id: 'mu_tengluo', name: '藤萝天罗', kind: 'debuff', element: 'mu', tier: 3, realm: 2, cost: 34, cd: 0, desc: '藤萝如天罗地网，笼罩四方，束缚敌躯，使其迟缓难行。', quote: '天罗地网，插翅难飞。', effects: [{ k: 'debuff', stat: 'spd', pct: 30, turns: 3 }, { k: 'stun', turns: 1, chance: 0.35 }] },
  { id: 'mu_wanmu', name: '万木朝宗', kind: 'attack', element: 'mu', tier: 4, realm: 2, cost: 52, cd: 0, desc: '万木精气汇聚朝宗，化为参天巨木轰然压下，威势惊天地。', quote: '万木朝宗，一木擎天。', effects: [{ k: 'damage', mult: 2.5 }] },
  { id: 't_qingmu_changsheng', name: '青木长生法', kind: 'heal', element: 'mu', tier: 5, realm: 5, cost: 85, cd: 1, desc: '青木长生之气贯通全身，断肢重生，枯骨生肌，回元续命，几近不死。', quote: '青木参天，长生久视。', effects: [{ k: 'heal', mult: 2.2 }, { k: 'restoreQi', amount: 40 }] },

  // ===== 水（8）=====
  { id: 'shui_hanbing', name: '寒冰掌', kind: 'attack', element: 'shui', tier: 1, realm: 0, cost: 10, cd: 0, desc: '掌心凝寒冰之气，一掌拍出，寒气透骨，冻伤敌躯。', quote: '寒冰彻骨，一掌凝霜。', effects: [{ k: 'damage', mult: 1.2 }] },
  { id: 'shui_shuijing', name: '水镜术', kind: 'guard', element: 'shui', tier: 1, realm: 0, cost: 12, cd: 1, desc: '水气凝为镜面，映照来袭，反弹部分伤害于敌。', quote: '水镜无波，映照万物。', effects: [{ k: 'reflect', pct: 30, turns: 2 }] },
  { id: 'shui_xuanshui', name: '玄水剑诀', kind: 'attack', element: 'shui', tier: 2, realm: 0, cost: 18, cd: 0, desc: '玄水凝剑，剑走轻灵，如水流不息，连绵斩向敌人。', quote: '玄水为剑，绵绵不绝。', effects: [{ k: 'multihit', mult: 0.5, hits: 3 }] },
  { id: 'shui_hantan', name: '寒潭疗伤', kind: 'heal', element: 'shui', tier: 2, realm: 1, cost: 22, cd: 1, desc: '引寒潭灵泉之气，涤荡伤痕，抚平创伤，回复自身精元。', quote: '寒潭清冽，洗尽铅华。', effects: [{ k: 'heal', mult: 1.3 }] },
  { id: 'shui_ruoshui', name: '弱水沉魂', kind: 'soul', element: 'shui', tier: 3, realm: 1, cost: 32, cd: 0, desc: '弱水三千，鹅毛不浮，沉魂溺魄，直伤敌方神魂。', quote: '弱水无形，沉魂没魄。', effects: [{ k: 'soul', mult: 1.6 }, { k: 'debuff', stat: 'spd', pct: 20, turns: 3 }] },
  { id: 'shui_bingfeng', name: '冰封千里', kind: 'debuff', element: 'shui', tier: 3, realm: 2, cost: 36, cd: 1, desc: '寒气席卷千里，冰封万物，冻住敌躯，令其无法动弹。', quote: '千里冰封，万里雪飘。', effects: [{ k: 'stun', turns: 1, chance: 0.5 }, { k: 'debuff', stat: 'spd', pct: 25, turns: 3 }] },
  { id: 'shui_tianhe', name: '天河倒卷', kind: 'attack', element: 'shui', tier: 4, realm: 2, cost: 52, cd: 0, desc: '天河之水倒卷而下，如银河倾泻，淹没冲刷，势不可挡。', quote: '天河倒卷，银河倾泻。', effects: [{ k: 'damage', mult: 2.5 }] },
  { id: 't_beiming_zhenshui', name: '北冥真水诀', kind: 'attack', element: 'shui', tier: 5, realm: 6, cost: 90, cd: 1, desc: '北冥真水自极寒深渊涌出，吞天噬地，冰封寰宇，万物皆寂。', quote: '北冥真水，至寒至深。', effects: [{ k: 'damage', mult: 3.0 }, { k: 'debuff', stat: 'spd', pct: 35, turns: 3 }] },

  // ===== 火（8）=====
  { id: 'huo_huoqiu', name: '火球术', kind: 'attack', element: 'huo', tier: 1, realm: 0, cost: 10, cd: 0, desc: '凝聚真火为炽热火球，呼啸而出，轰然炸裂，灼伤敌人。', quote: '火起微末，燎原之势。', effects: [{ k: 'damage', mult: 1.2 }] },
  { id: 'huo_lieyan', name: '烈焰掌', kind: 'attack', element: 'huo', tier: 1, realm: 0, cost: 12, cd: 0, desc: '掌中烈焰翻腾，一掌拍出，火焰缠身，灼烧不熄。', quote: '烈焰焚身，灰飞烟灭。', effects: [{ k: 'damage', mult: 1.1 }, { k: 'dot', mult: 0.3, turns: 2 }] },
  { id: 'huo_chiyan', name: '赤炎护体', kind: 'guard', element: 'huo', tier: 2, realm: 0, cost: 18, cd: 1, desc: '赤炎环绕周身，灼退来袭，化火焰之盾，护持己身。', quote: '赤炎绕体，外邪难侵。', effects: [{ k: 'shield', mult: 1.3, turns: 2 }] },
  { id: 'huo_sanmei', name: '三昧真火', kind: 'attack', element: 'huo', tier: 2, realm: 1, cost: 22, cd: 0, desc: '引三昧真火，焚尽万物，火焰附骨，持续灼烧敌人。', quote: '三昧真火，焚天煮海。', effects: [{ k: 'damage', mult: 1.3 }, { k: 'dot', mult: 0.4, turns: 3 }] },
  { id: 'huo_yehuo', name: '业火炼魂', kind: 'soul', element: 'huo', tier: 3, realm: 1, cost: 32, cd: 0, desc: '业火自因果而生，焚身灼魂，直烧敌方神魂，难以扑灭。', quote: '业火焚心，善恶自明。', effects: [{ k: 'soul', mult: 1.6 }, { k: 'dot', mult: 0.4, turns: 3 }] },
  { id: 'huo_lihuo', name: '离火焚天', kind: 'attack', element: 'huo', tier: 3, realm: 2, cost: 36, cd: 0, desc: '离火燎原，焚天煮海，火光冲天，重创敌躯。', quote: '离火燎原，天穹尽赤。', effects: [{ k: 'damage', mult: 2.1 }] },
  { id: 'huo_dari', name: '大日金乌', kind: 'attack', element: 'huo', tier: 4, realm: 2, cost: 52, cd: 0, desc: '化大日金乌之形，烈焰如阳，普照之下，万邪俱焚。', quote: '金乌负日，普照大千。', effects: [{ k: 'damage', mult: 2.5 }] },
  { id: 't_liyan_fenkong', name: '离焰焚空印', kind: 'attack', element: 'huo', tier: 5, realm: 6, cost: 95, cd: 1, desc: '结离焰焚空印，火印盖天，焚尽虚空，万物化为飞灰。', quote: '离焰焚空，虚空成灰。', effects: [{ k: 'damage', mult: 3.2 }, { k: 'dot', mult: 0.4, turns: 3 }] },

  // ===== 土（8）=====
  { id: 'tu_tuqiang', name: '土墙术', kind: 'guard', element: 'tu', tier: 1, realm: 0, cost: 10, cd: 0, desc: '引厚土之气，凝为土墙，阻挡来袭，护持己身。', quote: '厚土为墙，岿然不动。', effects: [{ k: 'shield', mult: 1.1, turns: 2 }] },
  { id: 'tu_liedi', name: '裂地斩', kind: 'attack', element: 'tu', tier: 1, realm: 0, cost: 12, cd: 0, desc: '拳击大地，土石迸裂，裂痕如刀，直袭敌人。', quote: '一拳裂地，土崩石开。', effects: [{ k: 'damage', mult: 1.2 }] },
  { id: 'tu_wutu', name: '戊土护身', kind: 'guard', element: 'tu', tier: 2, realm: 0, cost: 18, cd: 1, desc: '戊土之气凝为磐石之铠，覆于周身，坚不可摧。', quote: '戊土为甲，磐石之坚。', effects: [{ k: 'shield', mult: 1.4, turns: 2 }] },
  { id: 'tu_luoyan', name: '落岩术', kind: 'attack', element: 'tu', tier: 2, realm: 1, cost: 20, cd: 0, desc: '召落岩巨石，自天而降，轰然砸下，重创敌人。', quote: '巨石崩落，天塌地陷。', effects: [{ k: 'damage', mult: 1.5 }] },
  { id: 'tu_didong', name: '地动山摇', kind: 'attack', element: 'tu', tier: 3, realm: 1, cost: 32, cd: 0, desc: '引动地脉，山摇地动，大地震颤，令敌站立不稳，受创不轻。', quote: '地动山摇，天崩地裂。', effects: [{ k: 'damage', mult: 1.9 }, { k: 'stun', turns: 1, chance: 0.3 }] },
  { id: 'tu_houtuqu', name: '厚土之躯', kind: 'buff', element: 'tu', tier: 3, realm: 2, cost: 34, cd: 1, desc: '厚土精气灌注全身，肌肤如石，体魄如山，防御大增。', quote: '厚土载物，无疆无界。', effects: [{ k: 'buff', stat: 'def', pct: 35, turns: 3 }] },
  { id: 'tu_shanyue', name: '山岳镇魂', kind: 'soul', element: 'tu', tier: 4, realm: 2, cost: 50, cd: 0, desc: '山岳之力化为无形镇压，镇敌之魂，压敌之躯，令其胆裂。', quote: '山岳巍巍，镇压乾坤。', effects: [{ k: 'soul', mult: 1.9 }, { k: 'stun', turns: 1, chance: 0.35 }] },
  { id: 't_houtu_zhenyue', name: '后土镇岳诀', kind: 'attack', element: 'tu', tier: 5, realm: 5, cost: 88, cd: 1, desc: '借后土皇地祇之力，镇八荒，压九岳，山岳之力尽数压向敌人。', quote: '后土之德，载物无疆。', effects: [{ k: 'damage', mult: 2.7 }, { k: 'stun', turns: 1, chance: 0.4 }] },

  // ===== 玄门无属性（7）=====
  { id: 't_taiyi_wuji', name: '太乙无极经', kind: 'buff', element: 'none', tier: 5, realm: 5, cost: 90, cd: 1, desc: '太乙无极，万法归一，无极化太极，全面提升自身攻防速与炁。', quote: '无极生太极，万法自归一。', effects: [{ k: 'buff', stat: 'atk', pct: 35, turns: 3 }, { k: 'buff', stat: 'def', pct: 35, turns: 3 }, { k: 'buff', stat: 'spd', pct: 30, turns: 3 }] },
  { id: 't_ziwei_leifa', name: '紫微天雷法', kind: 'attack', element: 'none', tier: 5, realm: 6, cost: 92, cd: 1, desc: '引紫微帝星之雷，天雷降世，雷光万道，超脱五行，威力无俦。', quote: '紫微垂象，天雷正法。', effects: [{ k: 'damage', mult: 3.2 }, { k: 'stun', turns: 1, chance: 0.3 }] },
  { id: 't_wuwei_zhenjing', name: '无为真经', kind: 'special', element: 'none', tier: 5, realm: 6, cost: 100, cd: 2, desc: '无为而无不为，不攻而自守，反伤来敌，清心明性，回炁御风。', quote: '大道无为，万物自化。', effects: [{ k: 'reflect', pct: 60, turns: 2 }, { k: 'cleanse' }, { k: 'restoreQi', amount: 50 }, { k: 'evade', chance: 0.4, turns: 1 }] },
  { id: 'none_xuanguang', name: '玄光护体', kind: 'guard', element: 'none', tier: 1, realm: 0, cost: 12, cd: 1, desc: '玄门罡气凝为玄光，护住周身，抵御外邪侵袭，护体保命。', quote: '玄光护体，万邪不侵。', effects: [{ k: 'shield', mult: 1.3, turns: 2 }] },
  { id: 'none_ganlin', name: '甘霖回春', kind: 'heal', element: 'none', tier: 2, realm: 1, cost: 24, cd: 1, desc: '普降甘霖，润泽万物，甘霖入体，回春续命，回复精元。', quote: '甘霖普降，枯木回春。', effects: [{ k: 'heal', mult: 1.5 }, { k: 'cleanse' }] },
  { id: 'none_qingxin', name: '清心咒', kind: 'special', element: 'none', tier: 1, realm: 0, cost: 10, cd: 0, desc: '诵清心咒，涤荡心神，清除杂念与负面状态，回复自身炁。', quote: '清心寡欲，神自清明。', effects: [{ k: 'cleanse' }, { k: 'restoreQi', amount: 25 }] },
  { id: 'none_quxie', name: '驱邪咒', kind: 'soul', element: 'none', tier: 2, realm: 1, cost: 20, cd: 0, desc: '诵驱邪神咒，正气凛然，驱散敌方增益，直镇其神魂。', quote: '正气存内，邪不可干。', effects: [{ k: 'purge' }, { k: 'soul', mult: 1.2 }] },

  // ===== 妖魔法术（15）=====
  { id: 'm_claw', name: '裂空爪', kind: 'attack', element: 'jin', tier: 1, realm: 0, cost: 8, cd: 0, desc: '妖爪如钩，撕裂虚空，爪风所过，皮开肉绽。', quote: '利爪裂空，血肉横飞。', effects: [{ k: 'damage', mult: 1.2 }] },
  { id: 'm_bite', name: '噬魂啮', kind: 'soul', element: 'none', tier: 1, realm: 0, cost: 10, cd: 0, desc: '妖口獠牙直噬神魂，撕咬之下，神魂俱损，痛彻心扉。', quote: '獠牙噬魂，痛入骨髓。', effects: [{ k: 'soul', mult: 1.0 }] },
  { id: 'm_tail', name: '横扫尾', kind: 'attack', element: 'tu', tier: 1, realm: 0, cost: 8, cd: 0, desc: '巨尾横扫，力拔千钧，扫过之处，尽皆摧折。', quote: '一尾横扫，横扫千军。', effects: [{ k: 'damage', mult: 1.15 }] },
  { id: 'm_roar', name: '慑心吼', kind: 'debuff', element: 'none', tier: 1, realm: 0, cost: 12, cd: 1, desc: '仰天咆哮，妖威慑心，令敌胆寒，攻击受挫。', quote: '妖吼慑心，闻者丧胆。', effects: [{ k: 'debuff', stat: 'atk', pct: 25, turns: 3 }] },
  { id: 'm_venom', name: '蚀骨毒雾', kind: 'attack', element: 'mu', tier: 2, realm: 0, cost: 18, cd: 0, desc: '喷吐蚀骨毒雾，毒气弥漫，腐蚀肌肤，持续侵蚀敌躯。', quote: '毒雾蚀骨，腐肌销魂。', effects: [{ k: 'damage', mult: 1.0 }, { k: 'dot', mult: 0.5, turns: 3 }] },
  { id: 'm_flame', name: '焚天炎', kind: 'attack', element: 'huo', tier: 2, realm: 0, cost: 20, cd: 0, desc: '喷吐焚天妖炎，火光滔天，焚山煮海，灼烧敌人。', quote: '妖炎焚天，赤地千里。', effects: [{ k: 'damage', mult: 1.4 }, { k: 'dot', mult: 0.3, turns: 2 }] },
  { id: 'm_frost', name: '玄冰锥', kind: 'attack', element: 'shui', tier: 2, realm: 0, cost: 18, cd: 0, desc: '凝玄冰为锥，疾射而出，寒气逼人，冻伤敌人。', quote: '玄冰化锥，寒气彻骨。', effects: [{ k: 'damage', mult: 1.4 }, { k: 'debuff', stat: 'spd', pct: 15, turns: 2 }] },
  { id: 'm_stone', name: '落石崩', kind: 'attack', element: 'tu', tier: 2, realm: 0, cost: 16, cd: 0, desc: '召落巨石，轰然崩落，砸向敌人，土石飞溅。', quote: '落石崩落，地裂天崩。', effects: [{ k: 'damage', mult: 1.5 }] },
  { id: 'm_gale', name: '罡风刃', kind: 'attack', element: 'jin', tier: 2, realm: 0, cost: 20, cd: 0, desc: '妖风化为罡风之刃，呼啸而出，削铁如泥。', quote: '罡风如刃，无坚不摧。', effects: [{ k: 'multihit', mult: 0.5, hits: 3 }] },
  { id: 'm_thunder', name: '惊雷击', kind: 'attack', element: 'jin', tier: 3, realm: 0, cost: 28, cd: 0, desc: '引天雷轰顶，惊雷炸响，电光裂空，重创敌人。', quote: '惊雷炸响，电裂长空。', effects: [{ k: 'damage', mult: 1.9 }, { k: 'stun', turns: 1, chance: 0.3 }] },
  { id: 'm_soulcry', name: '幽冥哭嚎', kind: 'soul', element: 'none', tier: 3, realm: 0, cost: 30, cd: 0, desc: '幽冥鬼哭，凄厉嚎叫，直击神魂，令人魂飞魄散。', quote: '幽冥鬼哭，魂飞魄散。', effects: [{ k: 'soul', mult: 1.5 }, { k: 'debuff', stat: 'atk', pct: 20, turns: 3 }] },
  { id: 'm_drain', name: '吸元术', kind: 'soul', element: 'none', tier: 3, realm: 0, cost: 32, cd: 1, desc: '妖法吸元，攫取敌方神魂精炁，补益自身，损人利己。', quote: '吸元夺精，损人利己。', effects: [{ k: 'soul', mult: 1.2 }, { k: 'restoreQi', amount: 30 }] },
  { id: 'm_shell', name: '铁甲护身', kind: 'guard', element: 'tu', tier: 3, realm: 0, cost: 26, cd: 1, desc: '妖躯凝铁甲，坚如磐石，抵御外袭，刀枪难入。', quote: '铁甲披身，刀枪不入。', effects: [{ k: 'shield', mult: 1.5, turns: 2 }] },
  { id: 'm_regen', name: '血肉重生', kind: 'heal', element: 'mu', tier: 4, realm: 0, cost: 36, cd: 1, desc: '妖力催动血肉，断肢重生，伤口愈合，回复大量精元。', quote: '血肉重生，死灰复燃。', effects: [{ k: 'heal', mult: 1.8 }] },
  { id: 'm_curse', name: '诅咒印', kind: 'debuff', element: 'none', tier: 4, realm: 0, cost: 40, cd: 1, desc: '结诅咒之印，诅咒加身，令敌气运衰败，攻防皆损。', quote: '诅咒加身，气运衰微。', effects: [{ k: 'debuff', stat: 'atk', pct: 30, turns: 3 }, { k: 'debuff', stat: 'def', pct: 30, turns: 3 }] }
];

XIAN.Data.artifacts = [
  // ===== 指定顶级法宝（10，tier 5）=====
  { id: 'a_taiji_tu', name: '太极图', slot: 'main', element: 'none', tier: 5, desc: '阴阳二气流转，太极化生，调和万法，威能无穷无尽。', lore: '老子出关，紫气东来，太极图镇天地阴阳。', stats: { atk: 18, def: 18, spd: 10, crit: 10, maxQi: 35, maxJing: 25, maxShen: 25, insight: 12, daoxin: 12 } },
  { id: 'a_luoshu_pan', name: '洛书盘', slot: 'talisman', element: 'none', tier: 5, desc: '洛书九宫之数，推演天机，助悟道法，趋吉避凶。', lore: '河出图，洛出书，圣人则之，洛书定九宫。', stats: { spd: 20, crit: 15, maxQi: 40, maxShen: 50, insight: 20, daoxin: 15 } },
  { id: 'a_zhuque_ling', name: '朱雀翎', slot: 'main', element: 'huo', tier: 5, desc: '朱雀神羽，烈焰流转，执之攻伐，火威滔天焚尽敌。', lore: '南方朱雀，七宿之灵，浴火而生，焚尽不祥。', stats: { atk: 60, spd: 30, crit: 20, maxQi: 30, maxShen: 20 } },
  { id: 'a_xuanwu_jia', name: '玄武甲', slot: 'robe', element: 'shui', tier: 5, desc: '玄武神甲，龟蛇盘踞，覆身如岳，万法难侵，御守极坚。', lore: '北方玄武，龟蛇合体，镇水之灵，御守极坚。', stats: { def: 60, maxJing: 40, maxShen: 30, maxQi: 30 } },
  { id: 'a_qinglong_jiao', name: '青龙角', slot: 'main', element: 'mu', tier: 5, desc: '青龙之角，木德凝聚，执之生机勃发，攻伐凌厉无双。', lore: '东方青龙，甲乙之木，角抵苍天，主生发之德。', stats: { atk: 55, spd: 25, crit: 15, maxJing: 35, maxQi: 30 } },
  { id: 'a_baihu_po', name: '白虎魄', slot: 'main', element: 'jin', tier: 5, desc: '白虎精魄，庚金肃杀，执之锋锐无匹，主杀伐，威慑八荒。', lore: '西方白虎，庚辛之金，主兵主杀，威慑八荒。', stats: { atk: 65, crit: 25, spd: 20, maxQi: 25, maxJing: 25 } },
  { id: 'a_hetu_bi', name: '河图璧', slot: 'talisman', element: 'none', tier: 5, desc: '河图神璧，藏先天之数，悟之可通阴阳，明造化之理。', lore: '河图出河，龙马负图，伏羲画卦，以通神明。', stats: { insight: 20, daoxin: 15, maxQi: 45, maxShen: 45, maxJing: 35 } },
  { id: 'a_wuji_zhong', name: '无极钟', slot: 'main', element: 'none', tier: 5, desc: '无极之钟，钟声一响，万籁俱寂，镇魂定魄，诸邪退避。', lore: '混沌未分，无极之始，钟声一震，宇宙初开。', stats: { atk: 38, def: 38, maxShen: 40, maxQi: 22, maxJing: 22 } },
  { id: 'a_jiuzhuan_lu', name: '九转炉', slot: 'talisman', element: 'huo', tier: 5, desc: '九转丹炉，纳天地灵药，炼九转金丹，增功固本，脱胎换骨。', lore: '太上老君，八卦炉中，九转金丹，服之成仙。', stats: { maxQi: 50, maxJing: 50, maxShen: 30, insight: 15, daoxin: 15 } },
  { id: 'a_zhaoyao_jing', name: '照妖镜', slot: 'talisman', element: 'none', tier: 5, desc: '照妖宝镜，镜光所至，妖邪现形，无所遁逃，镇魔辟邪。', lore: '轩辕之镜，照彻幽冥，妖魔鬼怪，现其原形。', stats: { atk: 30, crit: 15, maxQi: 40, maxShen: 40, insight: 20, daoxin: 15 } },

  // ===== 自创法宝（16，tier 1-4）=====
  { id: 'a_taomu_jian', name: '桃木剑', slot: 'main', element: 'mu', tier: 1, desc: '桃木削成之剑，虽无锋刃，却有辟邪除祟之奇效。', lore: '桃木辟邪，古已有之，驱鬼镇宅之良器。', stats: { atk: 5, daoxin: 5 } },
  { id: 'a_xuangui_ke', name: '玄龟壳', slot: 'robe', element: 'shui', tier: 1, desc: '玄龟蜕下之壳，坚硬古朴，可挡刀兵，护持己身。', lore: '玄龟负洛书而出，其壳乃天地灵物。', stats: { def: 7, maxJing: 3 } },
  { id: 'a_qingtong_fuling', name: '青铜符牌', slot: 'talisman', element: 'jin', tier: 1, desc: '青铜铸就之符牌，铭刻云篆，蕴含一丝先天灵气。', lore: '青铜为体，云篆为文，护身辟邪之古符。', stats: { maxQi: 8, insight: 2 } },
  { id: 'a_han_tie_jian', name: '寒铁剑', slot: 'main', element: 'shui', tier: 2, desc: '寒铁铸剑，剑身幽寒，锋芒凛冽，切金断玉。', lore: '寒铁产于北海，历千年寒气，锋锐异常。', stats: { atk: 18, crit: 7 } },
  { id: 'a_jinsha_pao', name: '金砂袍', slot: 'robe', element: 'tu', tier: 2, desc: '金砂织就之袍，流光溢彩，柔韧坚固，护身御敌。', lore: '金砂沉于河底，采而织袍，华美且坚固。', stats: { def: 18, maxJing: 7 } },
  { id: 'a_wulei_ling', name: '五雷令', slot: 'talisman', element: 'jin', tier: 2, desc: '五雷令牌，可召五方神雷，辟邪除魔，威能不凡。', lore: '雷部正法，五雷号令，邪祟闻之胆裂。', stats: { atk: 15, crit: 10 } },
  { id: 'a_bichen_zhu', name: '避尘珠', slot: 'talisman', element: 'tu', tier: 2, desc: '避尘宝珠，尘埃不染，清心明目，助人静心悟道。', lore: '珠蕴清光，尘埃自避，心镜常明。', stats: { insight: 12, maxShen: 13 } },
  { id: 'a_lihuo_dao', name: '离火刀', slot: 'main', element: 'huo', tier: 3, desc: '离火锻造之刀，刀身赤红，挥动间烈焰翻腾，焚金煮铁。', lore: '离火炼刀，百炼成钢，出鞘即焚。', stats: { atk: 30, crit: 12, maxQi: 8 } },
  { id: 'a_bingcan_yi', name: '冰蚕衣', slot: 'robe', element: 'shui', tier: 3, desc: '冰蚕吐丝织成之衣，寒而不侵，水火难伤，轻若无物。', lore: '冰蚕生于极寒，其丝千年不腐，织衣护体。', stats: { def: 32, maxShen: 10, maxJing: 8 } },
  { id: 'a_hun_tian_ling', name: '混天绫', slot: 'robe', element: 'huo', tier: 3, desc: '混天红绫，可长可短，缠缚敌人，柔中带刚，护身攻敌。', lore: '混天绫出，翻江倒海，束妖缚魔，变化无穷。', stats: { def: 20, spd: 15, atk: 15 } },
  { id: 'a_dingfeng_zhu', name: '定风珠', slot: 'talisman', element: 'none', tier: 3, desc: '定风神珠，风不能动，尘埃不扬，安神定魄，趋避凶险。', lore: '珠定狂风，止水不波，心神随之而安。', stats: { spd: 20, insight: 15, maxQi: 15 } },
  { id: 'a_zhen_lei_chui', name: '镇雷锤', slot: 'main', element: 'jin', tier: 4, desc: '镇雷之锤，锤落惊雷，声震九霄，重若千钧，无可抵挡。', lore: '雷神之锤，一锤镇世，万雷俯首。', stats: { atk: 55, crit: 15, maxQi: 20 } },
  { id: 'a_zhan_yao_jian', name: '斩妖剑', slot: 'main', element: 'jin', tier: 4, desc: '斩妖除魔之剑，剑出无回，正气凛然，妖邪授首。', lore: '剑铭斩妖，出则饮血，除魔卫道，浩气长存。', stats: { atk: 50, maxJing: 25, daoxin: 15 } },
  { id: 'a_wuxing_doupeng', name: '五行斗篷', slot: 'robe', element: 'none', tier: 4, desc: '五行之气织就之斗篷，五行流转，护身御敌，妙用无穷。', lore: '采五行精气，织就斗篷，五行相生，护体不破。', stats: { def: 50, maxQi: 20, maxShen: 20 } },
  { id: 'a_tiancan_jiayi', name: '天蚕甲衣', slot: 'robe', element: 'mu', tier: 4, desc: '天蚕吐丝织成之甲衣，轻若无物，坚逾精钢，护身至宝。', lore: '天蚕九变，吐丝成甲，刀枪不入，水火不侵。', stats: { def: 55, maxJing: 25, maxQi: 10 } },
  { id: 'a_taiyi_pao', name: '太乙袍', slot: 'robe', element: 'none', tier: 4, desc: '太乙仙袍，紫气东来，着之飘然若仙，万法不沾。', lore: '太乙真人遗袍，紫气护体，邪魔退避。', stats: { def: 45, maxShen: 20, insight: 10, daoxin: 15 } }
];
