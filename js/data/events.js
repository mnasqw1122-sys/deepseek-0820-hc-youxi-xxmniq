window.XIAN = window.XIAN || {};
XIAN.Data = XIAN.Data || {};

XIAN.Data.events = [
  // ===================== 机缘 chance（12） =====================
  {
    id: 'ev_lingquan',
    title: '灵泉',
    weight: 12,
    once: false,
    tag: 'chance',
    cond: { loc: ['hanyu_gu'], features: ['spring'] },
    text: '山径尽头，一泓冷泉自青石间渗出，清澈见底。水汽氤氲如雾，有鹤影掠过水面，惊起几圈涟漪。泉底似有微光浮动，细看又如空无。你在石畔驻足，衣袂沾了凉意，心头那点尘劳仿佛也被洗去一分。风过时，松针簌簌落入泉中，随水打着旋儿，许久才沉。你忽然觉得，能在此刻停下，也是一种难得的机缘。',
    choices: [
      {
        label: '掬饮灵泉',
        hint: '清泉入腹，涤尘疗伤',
        outcome: {
          text: '你俯身掬饮，泉水清冽入喉，一股凉意自丹田升起，游走百骸，旧伤暗疾竟随之消散几分。饮罢只觉通体轻透，如洗去一层积年的尘。',
          effects: [{ k: 'healPct', v: 30 }, { k: 'qi', v: 60 }]
        }
      },
      {
        label: '静观泉源',
        hint: '考验：悟性',
        check: { stat: 'insight', dc: 14 },
        success: {
          text: '你静观泉眼，见水自石隙无声涌出，不争不溢，涓滴不绝，忽悟柔能克刚、静能生慧之理，一时通明。',
          effects: [{ k: 'dao', v: 300 }, { k: 'insight', v: 1 }]
        },
        fail: {
          text: '你凝神良久，却只看出满眼水光，越看越觉心浮，什么也没参透，只得怅然起身，掸了掸衣上草屑。',
          effects: [{ k: 'dao', v: 30 }]
        }
      },
      {
        label: '盛水备途',
        hint: '取水储用，以备不虞',
        outcome: {
          text: '你以葫芦盛满泉水，背在身上。山风拂过，葫芦里水声轻响，如揣了一壶凉月。往后行路，亦有一口清冽可润喉。',
          effects: [{ k: 'jing', v: 40 }]
        }
      }
    ]
  },

  {
    id: 'ev_dimai',
    title: '地脉',
    weight: 10,
    once: false,
    tag: 'chance',
    cond: { features: ['gather', 'cultivate'] },
    text: '你触到一处温热的土层，扒开一看，地下有暗流般的灵气缓缓涌动，如大地的血脉。此脉细弱，若强行引取，或可增益一时，却也可能惊动地气，惹来山石倾覆之兆。夜色渐浓，四周静得只听见你自己的呼吸，与那地脉极轻的搏动。你把手掌贴上去，掌心暖得像捂着一颗温驯的心脏。',
    choices: [
      {
        label: '引脉淬体',
        hint: '强取地气，恐遭反噬',
        outcome: {
          text: '你以炁为引，强取地脉灵气，热流猛冲经脉，带来一阵燥热与晕眩。山石簌簌滚落，脚下土地微微震颤，似有不满。',
          effects: [{ k: 'qi', v: 120 }, { k: 'hurtPct', v: 18 }]
        }
      },
      {
        label: '反哺地脉',
        hint: '耗精温养，护此一方',
        cost: { jing: 40 },
        outcome: {
          text: '你反将自身精气渡入地脉，那暗流渐暖，如得你抚慰。山野间草木似乎都绿了一分，连空气都清润起来。',
          effects: [{ k: 'merit', v: 25 }, { k: 'karma', v: -10 }, { k: 'dao', v: 150 }]
        }
      },
      {
        label: '默记脉位',
        hint: '不强取，留待日后',
        outcome: {
          text: '你默记此脉方位，以石土覆好，转身离去。不取，不贪，心中反觉安然，脚步也轻快了些。',
          effects: [{ k: 'flag', id: 'dimai' }, { k: 'dao', v: 100 }]
        }
      }
    ]
  },

  {
    id: 'ev_yiguo',
    title: '异果',
    weight: 14,
    once: false,
    tag: 'chance',
    cond: { features: ['gather'] },
    text: '悬崖藤蔓间悬着一枚朱果，红得透亮，如凝了一滴晚霞。果香若有若无，引来蜂蝶绕而不落。果下有蛇蜕，似有灵物守护。你伸手可摘，却也惊觉此果成熟未满，若强摘，药性恐折。暮色里，那朱果隐隐发亮，像在与你无声对望。山鸟归林，一声声啼得悠长。',
    choices: [
      {
        label: '摘而食之',
        hint: '未熟强摘，药性驳杂',
        outcome: {
          text: '你摘下朱果囫囵吞下，果肉酸涩，一股驳杂药力在腹中乱窜，虽涨了精气，却也闹得腹中翻腾，半晌才缓过来。',
          effects: [{ k: 'jing', v: 50 }, { k: 'hurtPct', v: 10 }]
        }
      },
      {
        label: '静候三日',
        hint: '待其熟透再采',
        cost: { days: 3 },
        outcome: {
          text: '你于崖下结草而居，静候三日。第三夜子时，果香大盛，你采而食之，满口生津，精元浑厚，如得大补。',
          effects: [{ k: 'jing', v: 120 }, { k: 'herb', id: 'random', v: 1 }]
        }
      },
      {
        label: '留与灵物',
        hint: '不夺造化，积下善缘',
        outcome: {
          text: '你收回手，将熟果留给守在此处的灵物。离去时，似有一道感激的目光送你下山，山风都温和了许多。',
          effects: [{ k: 'merit', v: 20 }, { k: 'flag', id: 'leave_yiguo' }]
        }
      }
    ]
  },

  {
    id: 'ev_gubei',
    title: '古碑',
    weight: 8,
    once: false,
    tag: 'chance',
    cond: { loc: ['gulong_xu'], features: ['ruin'] },
    text: '荒草深处，一截古碑半没土中，碑文被岁月磨蚀，只剩几行隐约可辨。字体非篆非隶，如云行水上，看久了，竟似在眼前流动。碑侧青苔深碧，一只壁虎静伏其上，与你对视。夕阳把碑影拉得老长，风声过处，草浪翻涌，仿佛在低诵什么久远的经文。你蹲下身，指尖几乎要触到那冰凉的碑面。',
    choices: [
      {
        label: '凝神参悟',
        hint: '考验：悟性',
        check: { stat: 'insight', dc: 18 },
        success: {
          text: '你心神沉入碑文，那些流转的字迹化作道韵，直入识海，如得先人隔世相授。再睁眼时，天已向晚，你心中却一片通明。',
          effects: [{ k: 'dao', v: 600 }, { k: 'insight', v: 1 }]
        },
        fail: {
          text: '你强读碑文，那些字迹却如乱云翻涌，反噬心神，一阵头痛欲裂。你扶碑而立，良久才缓过神来。',
          effects: [{ k: 'shen', v: -30 }]
        }
      },
      {
        label: '拓印带走',
        hint: '留待日后细参',
        outcome: {
          text: '你取纸拓下碑文，墨香混着青苔气。虽一时不解，却已将那几行道韵收进行囊，留待日后细参。',
          effects: [{ k: 'dao', v: 120 }, { k: 'flag', id: 'gubei_ta' }]
        }
      },
      {
        label: '焚香一拜',
        hint: '敬先贤，不贪不取',
        outcome: {
          text: '你于碑前焚香一拜，青烟袅袅，直上青冥。碑身微震，似有先贤之灵隔世与你颔首，心中顿生肃穆。',
          effects: [{ k: 'merit', v: 15 }, { k: 'daoxin', v: 5 }]
        }
      }
    ]
  },

  {
    id: 'ev_lingyu',
    title: '灵雨',
    weight: 3,
    once: true,
    tag: 'chance',
    cond: {},
    text: '晴空忽起云霓，一场细雨无端落下，雨丝如银，沾衣不湿。雨中有极淡的草木清气，泥土、松针、石苔都被洗得发亮。你站在雨中，只觉百骸俱暖，如沐春风。天地仿佛在此时屏息，这一场雨，似专为你一人而落。远处山峦在雨雾里淡成一抹青，近处草叶上的水珠，滚圆透亮。',
    choices: [
      {
        label: '静立受雨',
        hint: '承接天恩，洗髓延寿',
        outcome: {
          text: '你摊开双臂，任灵雨浇透全身。雨丝渗入肌骨，如无形的手抚平旧伤，寿元亦似绵长了一线。雨停时，浑身轻暖。',
          effects: [{ k: 'healPct', v: 50 }, { k: 'qi', v: 100 }, { k: 'lifespan', v: 10 }]
        }
      },
      {
        label: '以雨炼神',
        hint: '考验：神',
        check: { stat: 'shen', dc: 15 },
        success: {
          text: '你引灵雨入识海，洗炼神魂，只觉心神愈发清透，似能照见更远处的事物，神台如镜，纤尘不染。',
          effects: [{ k: 'shen', v: 60 }, { k: 'maxShen', v: 10 }]
        },
        fail: {
          text: '你贪引雨势，反被天威所慑，心神一阵恍惚。待回过神来，雨已停了，只余满身微凉的湿意。',
          effects: [{ k: 'shen', v: -20 }]
        }
      },
      {
        label: '引雨润众',
        hint: '分润天地，积大功德',
        outcome: {
          text: '你引灵雨偏落荒田与枯井，雨过处草木回青。你所得甚少，却觉胸中坦荡，似有暖意久久不散。',
          effects: [{ k: 'merit', v: 40 }, { k: 'repute', v: 10 }]
        }
      }
    ]
  },

  {
    id: 'ev_lingshou',
    title: '灵兽献宝',
    weight: 2,
    once: true,
    tag: 'chance',
    cond: { realmMin: 3 },
    text: '一只白鹿自林间踏雾而来，口衔一物，放于你脚边，又退开数步，静静望着你。那物件以旧帛包裹，隐有宝光。白鹿目如秋水，似通人性，似有所求——它左后腿血肉模糊，是被什么咬穿的。林间鸟鸣忽止，万籁俱寂，仿佛都在等你的回应。',
    choices: [
      {
        label: '纳宝入怀',
        hint: '取其所献，不问其伤',
        outcome: {
          text: '你拾起旧帛，展开是一方流转黑白的古图。白鹿见你受下，静静看了你一眼，拖着那条断腿，一步一步没入雾中。你没有回头。宝在怀中，却有些沉。',
          effects: [{ k: 'artifact', id: 'a_taiji_tu' }, { k: 'karma', v: 25 }, { k: 'daoxin', v: -6 }]
        }
      },
      {
        label: '先疗其伤',
        hint: '耗精疗之，而后再言',
        cost: { jing: 80 },
        outcome: {
          text: '你不看那旧帛，先以真炁封住鹿腿的血脉，又敷了草药。白鹿舐你手背，眼中似有泪光。良久，它将旧帛推向你，又衔来一枚灵果，方缓缓离去。',
          effects: [{ k: 'artifact', id: 'a_taiji_tu' }, { k: 'merit', v: 40 }, { k: 'lifespan', v: 12 }, { k: 'flag', id: 'met_lingshou' }]
        }
      },
      {
        label: '躬身婉拒',
        hint: '不贪外物，守心自持',
        outcome: {
          text: '你躬身一礼，将旧帛推回，只替它敷了药。白鹿驻立良久，似是一叹，转身而去，风里仿佛有铃音渐远。一时之间，天地都显得格外安静。',
          effects: [{ k: 'daoxin', v: 14 }, { k: 'merit', v: 30 }]
        }
      }
    ]
  },

  {
    id: 'ev_wusese',
    title: '五色石',
    weight: 10,
    once: false,
    tag: 'chance',
    cond: { loc: ['huangsha_ling'], features: ['gather'] },
    text: '溪涧石滩上，一枚石子五色斑驳，金木水火土之纹宛然天成，握之温润，仿佛能听见五行的低语。此物或是女娲遗石的一角，落在凡尘，静候有缘。日光照下，那五色流转不定，如一条缩小的虹。你将它托在掌心，那五色便在指缝间明明灭灭，像活了过来。',
    choices: [
      {
        label: '温养炼化',
        hint: '考验：炁',
        check: { stat: 'qi', dc: 16 },
        success: {
          text: '你以炁温养五色石，石中五行之气缓缓化入丹田，炁海竟随之拓宽，那股温润久久不散。山风掠过，带来一阵草木清气。',
          effects: [{ k: 'maxQi', v: 15 }, { k: 'affinity', element: 'tu', v: 3 }]
        },
        fail: {
          text: '你急于炼化，五行之气在体内相冲，腹中剧痛，只得吐出一口浊气，那石子也黯淡了下去。',
          effects: [{ k: 'hurtPct', v: 12 }]
        }
      },
      {
        label: '藏入行囊',
        hint: '待价而沽，或失机缘',
        outcome: {
          text: '你收起石子，寻了坊市换作灵石。银货两讫的瞬间，那五彩似在掌心暗了一分，你却说不上哪里怅然。',
          effects: [{ k: 'stone', v: 150 }]
        }
      },
      {
        label: '拂袖而去',
        hint: '不贪外物，守心自持',
        outcome: {
          text: '你将石子放回滩上，任流水再洗百年。转身时，心中无挂无碍，只觉天地都宽了一分。你心头起伏，久久未能平息。',
          effects: [{ k: 'dao', v: 120 }, { k: 'daoxin', v: 8 }]
        }
      }
    ]
  },

  {
    id: 'ev_yuehua',
    title: '月华',
    weight: 14,
    once: false,
    tag: 'chance',
    cond: {},
    text: '中天一轮满月，清辉如洗。你于静处打坐，忽觉月华如有实质，丝丝缕缕浸入眉心，凉而不寒。识海之中，似有一片银白的湖缓缓铺开，照见本心。夜露悄然凝结，你的影子被月光拉得又长又静。远处有钟声隐隐传来，一下一下，敲在月光里。',
    choices: [
      {
        label: '吞月入神',
        hint: '考验：神',
        check: { stat: 'shen', dc: 15 },
        success: {
          text: '你引月华入识海，银湖渐盈，神魂如被月光洗净，愈发凝实清透，眉心一点清凉久久不散。',
          effects: [{ k: 'shen', v: 80 }, { k: 'maxShen', v: 10 }]
        },
        fail: {
          text: '你贪吞月华，识海不堪其重，一阵天旋地转，头疼欲裂。你扶额坐下，半晌才恢复清明。此事过后，那余韵仍久久不散。',
          effects: [{ k: 'shen', v: -20 }]
        }
      },
      {
        label: '顺其自然',
        hint: '不引不拒，任其自入',
        outcome: {
          text: '你只静坐，不引不拒。月华丝丝入体，如露润物，待你睁眼，已是月过中天，只觉神清气爽。',
          effects: [{ k: 'shen', v: 40 }, { k: 'daoxin', v: 5 }]
        }
      },
      {
        label: '观月忘我',
        hint: '舍神求道，忘我入静',
        outcome: {
          text: '你望月出神，不觉忘了自己，也忘了求取。待回神，月光已在心头种下一片清辉，凉而明澈。',
          effects: [{ k: 'daoxin', v: 8 }, { k: 'dao', v: 200 }]
        }
      }
    ]
  },

  {
    id: 'ev_leichi',
    title: '雷池',
    weight: 6,
    once: false,
    tag: 'chance',
    cond: { loc: ['tianzhu_feng'], features: ['trial'] },
    text: '山巅有池，池水不存，唯见雷光在石凹中游走如蛇，噼啪有声。相传此池乃天雷劈落千载所成，池心一点雷精，可淬炼筋骨，亦能毁人肉身。你立于池边，须发皆被静电激得微微竖起，空气里尽是焦灼的气味。那雷光忽明忽暗，把整片崖壁照得雪亮。',
    choices: [
      {
        label: '入池淬体',
        hint: '考验：精',
        check: { stat: 'jing', dc: 16 },
        success: {
          text: '你咬牙踏入雷池，雷光如鞭抽打百骸，剧痛过后，筋骨却如被锻打百遍，愈发坚韧，浑身似有电弧游走。',
          effects: [{ k: 'maxJing', v: 15 }, { k: 'jing', v: 60 }]
        },
        fail: {
          text: '雷光轰然入体，你浑身焦黑，皮开肉绽，踉跄退出池来，只觉每一寸皮肉都在叫嚣。你把这番际遇，悄悄记在了心底。',
          effects: [{ k: 'hurtPct', v: 25 }]
        }
      },
      {
        label: '以炁摄雷',
        hint: '考验：炁',
        check: { stat: 'qi', dc: 15 },
        success: {
          text: '你以炁为网，摄得一丝雷精入体，只觉一股暴烈阳刚之气在经脉奔涌，如饮烈酒，周身发烫。',
          effects: [{ k: 'qi', v: 100 }, { k: 'balance', v: 15 }]
        },
        fail: {
          text: '雷精不受你缚，反噬而来，你半边身子一麻，几乎栽倒，指尖仍有细小的电弧噼啪。四下里静极，只余风声与你。',
          effects: [{ k: 'hurtPct', v: 18 }]
        }
      },
      {
        label: '远观不近',
        hint: '不涉险地，留得此身',
        outcome: {
          text: '你退开数步，看雷光在池中生生灭灭，如观一场天地演法。不取，也就无失，心中反得安宁。',
          effects: [{ k: 'daoxin', v: 6 }, { k: 'dao', v: 100 }]
        }
      }
    ]
  },

  {
    id: 'ev_dongtian',
    title: '洞天残图',
    weight: 2,
    once: true,
    tag: 'chance',
    cond: { realmMin: 2 },
    text: '你在旧书摊与废墟残卷之间，得见半张泛黄的图，所绘山川如活，隐有洞天福地之貌。图角有朱砂批注，言此图所载乃上古隐仙的洞府入口，只缺另一半。你攥着残图，指尖微烫，那图上的山水似在缓缓流动。翻动纸页时，仿佛能听见山泉在纸面之下潺潺。',
    choices: [
      {
        label: '参悟残图',
        hint: '考验：悟性',
        check: { stat: 'insight', dc: 20 },
        success: {
          text: '你闭目推演，残图山水在识海中补全，洞府方位豁然开朗，并悟得一卷洛书之数，如获至宝。',
          effects: [{ k: 'dao', v: 800 }, { k: 'artifact', id: 'a_luoshu_pan' }]
        },
        fail: {
          text: '你强推其理，只觉山河颠倒，心神被卷入其中，久久不能平复。待你睁眼，指尖那点微烫也凉了。',
          effects: [{ k: 'shen', v: -30 }]
        }
      },
      {
        label: '细究批注',
        hint: '记下线索，留待日后',
        outcome: {
          text: '你抄下批注，将残图贴身收好。此图残缺，机缘未至，且待他日再续，心中留着一线念想。',
          effects: [{ k: 'dao', v: 200 }, { k: 'flag', id: 'dongtian_tu' }]
        }
      },
      {
        label: '转手出售',
        hint: '换作灵石，或失大缘',
        outcome: {
          text: '你携图至坊市，换得一笔不菲的灵石。银货两讫时，指尖那点微烫悄然凉了，似有什么就此错过。',
          effects: [{ k: 'stone', v: 400 }]
        }
      }
    ]
  },

  {
    id: 'ev_laoshu',
    title: '老树赠籽',
    weight: 3,
    once: true,
    tag: 'chance',
    cond: { loc: ['qingyun_shan'], features: ['gather'] },
    text: '一株老松虬枝如龙，树身有脸，慈眉善目。它缓缓开口，声如风吹松涛，说见你心性尚可，愿赠一枚灵籽，种于气海，可生生不息。又说，草木有灵，望你他日莫忘今日这一份善缘。四下松涛阵阵，如万人低和。你抬头看它，那满树松针在风里翻涌，如一片青色的海。',
    choices: [
      {
        label: '敬领灵籽',
        hint: '种籽气海，生生不息',
        outcome: {
          text: '你双手接过灵籽，纳入气海。籽落处，一股木灵之气缓缓萌发，与你共生，如体内多了一株小小的青苗。',
          effects: [{ k: 'herb', id: 'random', v: 2 }, { k: 'affinity', element: 'mu', v: 4 }, { k: 'dao', v: 300 }]
        }
      },
      {
        label: '谢而不受',
        hint: '不贪其惠，自守其道',
        outcome: {
          text: '你躬身谢过，却不受其籽。老树抚须而笑，说你这孩子，心性难得，倒让老朽刮目相看。你定了定神，复又恢复了从容。',
          effects: [{ k: 'merit', v: 25 }, { k: 'daoxin', v: 10 }]
        }
      },
      {
        label: '问其所求',
        hint: '愿损三年寿，换此善缘',
        outcome: {
          text: '你问老树有何所求。它叹此山灵气渐枯，愿借你三年阳寿润此一方水土。你应了，老树垂泪赠籽，松针如雨而落。',
          effects: [{ k: 'lifespan', v: -3 }, { k: 'affinity', element: 'mu', v: 6 }, { k: 'herb', id: 'random', v: 3 }, { k: 'merit', v: 40 }]
        }
      }
    ]
  },

  {
    id: 'ev_danjing',
    title: '半卷丹经',
    weight: 2,
    once: true,
    tag: 'chance',
    cond: { loc: ['jinshi_dong'], features: ['forge', 'ruin'] },
    text: '山道旁一只破旧的葫芦半埋土中，旁有散落的丹方残页，字迹工整，皆言草木金石之性。此乃半卷丹经，缺了火候一节，若强行照方炼丹，或有炸炉之险，亦可能出得真丹。山雨欲来，纸页在风里轻轻翻动，几片残页打着旋儿飘起。',
    choices: [
      {
        label: '通读全卷',
        hint: '考验：悟性',
        check: { stat: 'insight', dc: 18 },
        success: {
          text: '你细读全卷，缺处竟自丹理中推演补全，青木长生之道，自此得入门径。合卷时，雨已停了，天边正晴。',
          effects: [{ k: 'tech', id: 't_qingmu_changsheng' }, { k: 'dao', v: 400 }]
        },
        fail: {
          text: '你只觉字字晦涩，强记之下头昏脑胀，唯记得几味散乱的药名，余者皆如过眼云烟。暮色渐合，山影也淡了下去。',
          effects: [{ k: 'shen', v: -20 }, { k: 'flag', id: 'danjing_ban' }]
        }
      },
      {
        label: '先记药方',
        hint: '舍火候，先记诸方',
        outcome: {
          text: '你舍了火候一节，只将诸药之性一一记下。丹道虽未成，却认得不少灵草，也算不虚此行。',
          effects: [{ k: 'herb', id: 'random', v: 2 }, { k: 'dao', v: 200 }, { k: 'flag', id: 'danjing_ban' }]
        }
      },
      {
        label: '弃之而去',
        hint: '疑是陷阱，谨慎为上',
        outcome: {
          text: '你恐此物来路不明，是他人设局，遂不取片纸，飘然离去。山雨落下时，你已在数里之外。',
          effects: [{ k: 'daoxin', v: 5 }]
        }
      }
    ]
  },

  // ===================== 悟道 dao（12） =====================
  {
    id: 'ev_guanshui',
    title: '观水',
    weight: 12,
    once: false,
    tag: 'dao',
    cond: {},
    text: '涧水穿石，日夜不止，遇石则绕，遇壑则注，柔若无骨，却将顽石磨得圆润。你在水边独坐，看一片枯叶顺流而下，不争不抢，自在而去。日光透过林叶，在水面洒下碎金，恍惚间分不清是水在流，还是时光在走。你伸手探入水中，那凉意顺着指尖，一路漫到心口。',
    choices: [
      {
        label: '随水而静',
        hint: '无为而观，养心降躁',
        outcome: {
          text: '你放空心神，随那水流而去。水不争，故天下莫能与之争，此理悄然落入你心，浮躁也随之流远。',
          effects: [{ k: 'daoxin', v: 8 }, { k: 'haste', v: -10 }, { k: 'dao', v: 300 }]
        }
      },
      {
        label: '以炁御水',
        hint: '有为而试，或有所得',
        check: { stat: 'qi', dc: 14 },
        success: {
          text: '你以炁引水，水随炁走，悬而成球。御水小成，你对炁的掌控又精进一分，掌心似托着一轮水月。',
          effects: [{ k: 'dao', v: 400 }, { k: 'qi', v: 60 }]
        },
        fail: {
          text: '你强催炁劲，水花四溅，泼了一身，心神也被搅得散乱，半晌才重新静下来。这其中的滋味，只有你自己知晓。',
          effects: [{ k: 'shen', v: -20 }]
        }
      },
      {
        label: '击水逆流',
        hint: '逆势强为，反增躁气',
        outcome: {
          text: '你跃入涧中，逆流挥拳，溅起漫天水花。一时痛快，心头却添了几分争胜的躁气，久久难平。',
          effects: [{ k: 'dao', v: 150 }, { k: 'haste', v: 15 }, { k: 'jing', v: 30 }]
        }
      }
    ]
  },

  {
    id: 'ev_jianmu',
    title: '见木',
    weight: 12,
    once: false,
    tag: 'dao',
    cond: {},
    text: '断崖之上，一株小松自石缝中挣出，根如铁线，叶似青针，迎着长风舒展。它并不抱怨石薄土瘠，只是向着光，慢慢长。山风浩荡，它却站得极稳，仿佛天地间只此一株，也足够它活成千秋。你走近细看，那松根上还沾着几粒昨夜的新土。',
    choices: [
      {
        label: '静观其生',
        hint: '无为而观，见生生之理',
        outcome: {
          text: '你静观那株小松，见它于贫瘠中从容生长，一股生生的道意流入你心，如春风入怀，久久不去。',
          effects: [{ k: 'dao', v: 350 }, { k: 'daoxin', v: 8 }, { k: 'haste', v: -8 }]
        }
      },
      {
        label: '助其培土',
        hint: '耗精相助，护此新芽',
        cost: { jing: 20 },
        outcome: {
          text: '你取来沃土，轻轻覆于松根。小松在风中轻摇，似向你致意。你亦觉心头多了一分柔软的牵挂。',
          effects: [{ k: 'merit', v: 15 }, { k: 'affinity', element: 'mu', v: 3 }, { k: 'dao', v: 200 }]
        }
      },
      {
        label: '折枝炼灵',
        hint: '取木灵炼化，有伤天和',
        outcome: {
          text: '你折下一枝，抽炼其中木灵之气。得了一丝清凉，却见断口渗出松脂，如一滴泪，缓缓滑落。',
          effects: [{ k: 'affinity', element: 'mu', v: 2 }, { k: 'qi', v: 40 }, { k: 'karma', v: 10 }]
        }
      }
    ]
  },

  {
    id: 'ev_linyuan',
    title: '临渊',
    weight: 8,
    once: false,
    tag: 'dao',
    cond: { loc: ['tianzhu_feng'] },
    text: '深谷绝壁，下有寒潭如镜，照见你影。你俯身下望，见另一个自己在渊底，随水波明明灭灭，似在问你：所求为何，所执为何？山风自谷底卷上，衣袂猎猎，你与渊底之影四目相对，一时无语。有鹰唳破空而来，在谷中荡开，又渐渐沉下去。',
    choices: [
      {
        label: '闭目内观',
        hint: '不向外求，反观自心',
        outcome: {
          text: '你闭目内观，任渊影明灭。尘念渐息，心底那点浮躁也沉了下去，如浊水澄清，照见本心。',
          effects: [{ k: 'daoxin', v: 10 }, { k: 'haste', v: -15 }, { k: 'dao', v: 250 }]
        }
      },
      {
        label: '对影自省',
        hint: '考验：道心',
        check: { stat: 'daoxin', dc: 16 },
        success: {
          text: '你直视渊底之影，一一省过所执所惑，忽而释然，道心愈坚，神台愈明，如拨云见月。你回首望了一眼，复又向前行去。',
          effects: [{ k: 'daoxin', v: 15 }, { k: 'insight', v: 1 }, { k: 'dao', v: 400 }]
        },
        fail: {
          text: '你盯着渊底之影，越看越觉面目可憎，心魔趁虚而起，乱了心神，只得踉跄退开。一时之间，你也说不清是喜是怅。',
          effects: [{ k: 'daoxin', v: -8 }, { k: 'shen', v: -30 }]
        }
      },
      {
        label: '掷石破影',
        hint: '抗拒本心，反增躁气',
        outcome: {
          text: '你拾石掷入潭中，击碎那影子。水波荡开，又缓缓聚合，影子终究还在，你心头却更乱了几分。',
          effects: [{ k: 'dao', v: 100 }, { k: 'haste', v: 10 }, { k: 'daoxin', v: -5 }]
        }
      }
    ]
  },

  {
    id: 'ev_songfeng',
    title: '松风',
    weight: 12,
    once: false,
    tag: 'dao',
    cond: { loc: ['qingyun_shan'] },
    text: '松林深处，风过如涛，千松齐啸，又归于寂。你背靠老松坐下，听风声在耳畔起落，如呼吸，如潮汐，如太古之前的寂静。松影在你衣上明灭，天地之间，仿佛只剩下这一阵风，与一个听风的你。一片松针落在你肩上，轻得没有声音。',
    choices: [
      {
        label: '听而无听',
        hint: '无为而听，神静养心',
        outcome: {
          text: '你只是听着，不去分辨，风声便如潮水般漫过心头，又无声退去，留下一片清明与宁定。钟声渺渺，似从极远处传来。',
          effects: [{ k: 'daoxin', v: 8 }, { k: 'haste', v: -12 }, { k: 'shen', v: 30 }, { k: 'dao', v: 200 }]
        }
      },
      {
        label: '循声辨气',
        hint: '考验：神',
        check: { stat: 'shen', dc: 15 },
        success: {
          text: '你凝神细听，竟从松涛里辨出一缕极淡的道韵，如万松在一同吐纳，天地与共，妙不可言。',
          effects: [{ k: 'dao', v: 500 }, { k: 'insight', v: 1 }]
        },
        fail: {
          text: '你强辨其声，风声愈乱，心神被搅作一团，只得作罢，耳畔仍嗡嗡作响。一时之间，天地都显得格外安静。',
          effects: [{ k: 'shen', v: -25 }]
        }
      },
      {
        label: '以风炼耳',
        hint: '有为强练，稍显躁进',
        outcome: {
          text: '你刻意去捕捉每一缕风声，耳力虽进，心头却如绷紧的弦，久久难松，反倒失了几分天然。',
          effects: [{ k: 'shen', v: 40 }, { k: 'haste', v: 8 }]
        }
      }
    ]
  },

  {
    id: 'ev_guanque',
    title: '齐物',
    weight: 10,
    once: false,
    tag: 'dao',
    cond: {},
    text: '一只蚂蚁负着比它大数倍的草籽，在石阶上跋涉。另一只空手而行的蚁与它相遇，触角相碰，各自去了。日影西斜，蚁阵归穴，不知疲倦，亦不知悲喜。你看得久了，竟忘了自己是谁，是蚁，还是那个看蚁的人。阶旁野花静开，落下一瓣，遮住了一队行蚁。',
    choices: [
      {
        label: '泯然一笑',
        hint: '齐物观之，万物一体',
        outcome: {
          text: '你看蚁如人，看人如蚁，忽觉众生皆在道上，无一可轻。心头那点分别心，淡了下去，如烟散尽。',
          effects: [{ k: 'daoxin', v: 12 }, { k: 'haste', v: -10 }, { k: 'dao', v: 350 }]
        }
      },
      {
        label: '助蚁负籽',
        hint: '耗精相帮，结一善缘',
        cost: { jing: 10 },
        outcome: {
          text: '你轻轻将那草籽移到蚁背更稳处。蚁群似有所感，列队绕你三匝而去，如一场无声的答谢。',
          effects: [{ k: 'merit', v: 10 }, { k: 'dao', v: 150 }]
        }
      },
      {
        label: '观蚁悟竞',
        hint: '见其争竞，心生求胜',
        outcome: {
          text: '你见蚁群为食相争，忽悟万物竞存、不进则退之理，眼中多了一分锐气，心头也紧了几分。',
          effects: [{ k: 'insight', v: 1 }, { k: 'dao', v: 300 }, { k: 'haste', v: 8 }]
        }
      }
    ]
  },

  {
    id: 'ev_kurong',
    title: '枯荣',
    weight: 10,
    once: false,
    tag: 'dao',
    cond: {},
    text: '一株老树，半枯半荣：东枝枯槁，西枝新芽。暮色里，枯枝与新芽在风中轻轻相触，似生与死彼此点头。你立于树下，见落叶归根，新叶含苞，不觉痴了。残阳如血，照得枯枝发亮，也照得新芽透青。一只寒鸦落在枯枝上，叫了一声，又飞入暮云。',
    choices: [
      {
        label: '观枯荣一体',
        hint: '无生无死，道在其中',
        outcome: {
          text: '你看那枯枝托着新芽，落叶护着根土，方知生死本是一体，荣枯原无分别。此念一起，心静如潭。',
          effects: [{ k: 'daoxin', v: 10 }, { k: 'dao', v: 350 }, { k: 'haste', v: -10 }]
        }
      },
      {
        label: '折枝参悟',
        hint: '取枯枝细察，稍伤天和',
        outcome: {
          text: '你折下枯枝细看其纹路，悟得一分向死而生之理，却也在树身留下折痕，如一道浅浅的伤。',
          effects: [{ k: 'insight', v: 1 }, { k: 'dao', v: 250 }, { k: 'karma', v: 5 }]
        }
      },
      {
        label: '以炁催芽',
        hint: '逆天强催，反失自然',
        cost: { qi: 40 },
        outcome: {
          text: '你以炁催那新芽速长。芽是抽了，却细弱无力，风一吹便折，反违了生发之时，如揠苗助长。',
          effects: [{ k: 'affinity', element: 'mu', v: 3 }, { k: 'dao', v: 200 }, { k: 'haste', v: 10 }]
        }
      }
    ]
  },

  {
    id: 'ev_zuowang',
    title: '坐忘',
    weight: 8,
    once: false,
    tag: 'dao',
    cond: {},
    text: '你盘膝而坐，先忘形体，再忘呼吸，终忘天地。不知过了多久，一滴露从鬓角滑落，你睁开眼，见叶上露珠里，映着整个青山。风不吹，鸟不鸣，唯有那滴露，悬而未落，如时间停在此刻。你忽然分不清，此刻究竟过了三息，还是过了三个春秋。',
    choices: [
      {
        label: '忘而忘之',
        hint: '无为之忘，自然入静',
        outcome: {
          text: '你什么也不想，连“忘”也一并忘去。再睁眼时，只觉身心俱空，尘劳尽洗，天地都清透如新。',
          effects: [{ k: 'daoxin', v: 15 }, { k: 'haste', v: -20 }, { k: 'shen', v: 40 }, { k: 'dao', v: 400 }]
        }
      },
      {
        label: '强求坐忘',
        hint: '考验：道心',
        check: { stat: 'daoxin', dc: 16 },
        success: {
          text: '你念念在“忘”，反倒更深地沉入定境，一时间物我两忘，道行精进，如舟行水上，不着一痕。',
          effects: [{ k: 'dao', v: 600 }, { k: 'insight', v: 1 }]
        },
        fail: {
          text: '你越是求忘，杂念越是纷至沓来，如按不住的浮瓢，心头烦躁更甚，索性睁眼作罢。山风掠过，带来一阵草木清气。',
          effects: [{ k: 'haste', v: 15 }, { k: 'shen', v: -20 }]
        }
      },
      {
        label: '半途起身',
        hint: '坐不住，起身而去',
        outcome: {
          text: '你坐了片刻便觉腿麻心烦，索性起身去了。定境未入，只沾了一身山风与草屑，倒也无妨。',
          effects: [{ k: 'haste', v: 5 }]
        }
      }
    ]
  },

  {
    id: 'ev_xinzhai',
    title: '心斋',
    weight: 8,
    once: false,
    tag: 'dao',
    cond: {},
    text: '斋戒之后，你独处静室，一灯如豆。窗外雨声淅沥，如万蚕食叶。你问自己：心可曾空？可还有放不下的功过、恩怨、得失？灯花忽爆，一声轻响，你的影子在墙上晃了晃，又复归于静。那盏灯，照着你，也照着你心里那些还没放下的东西。',
    choices: [
      {
        label: '虚心以待',
        hint: '无为之斋，虚心纳道',
        outcome: {
          text: '你不作答，只让那雨声一点一点，洗去心头积尘。心空处，道自入，如灯自明，不假外求。',
          effects: [{ k: 'daoxin', v: 12 }, { k: 'haste', v: -15 }, { k: 'dao', v: 300 }]
        }
      },
      {
        label: '自问自答',
        hint: '考验：悟性',
        check: { stat: 'insight', dc: 15 },
        success: {
          text: '你逐条自问，又逐条放下，一念勘破，顿觉身心俱轻，如卸重负，连呼吸都畅快了几分。你心头起伏，久久未能平息。',
          effects: [{ k: 'dao', v: 450 }, { k: 'insight', v: 1 }]
        },
        fail: {
          text: '你越问越多，牵出一堆旧账新愁，纠缠不清，心头更乱，只得以掌按额，长叹一声。此事过后，那余韵仍久久不散。',
          effects: [{ k: 'haste', v: 10 }]
        }
      },
      {
        label: '焚香净念',
        hint: '以香为仪，稍安其神',
        cost: { stone: 30 },
        outcome: {
          text: '你焚起一炉好香，青烟袅袅，心神随之渐渐安稳。仪轨虽在外，亦能摄心，自有一番庄重。',
          effects: [{ k: 'merit', v: 10 }, { k: 'daoxin', v: 6 }]
        }
      }
    ]
  },

  {
    id: 'ev_mengdie',
    title: '梦蝶',
    weight: 4,
    once: true,
    tag: 'dao',
    cond: {},
    text: '你于松下小憩，忽梦己身为蝶，栩栩然穿花过柳，不知有己。俄而惊醒，见掌心落着一片蝶翼，还微微颤着。一时分不清：是我梦蝶，还是蝶梦我？松荫斑驳，落满你身，如一场未散尽的梦。你望着那蝶翼，久久不敢合掌，怕一动，梦就散了。',
    choices: [
      {
        label: '恍然一笑',
        hint: '齐物而笑，安于所化',
        outcome: {
          text: '你捏着那片蝶翼，笑了。蝶也好，我也罢，不过造化一梦，何须分得那般清。心也随之松了下来。',
          effects: [{ k: 'daoxin', v: 15 }, { k: 'dao', v: 500 }, { k: 'haste', v: -20 }]
        }
      },
      {
        label: '追蝶而去',
        hint: '考验：气运',
        check: { stat: 'luck', dc: 16 },
        success: {
          text: '你循那蝶影追入花林，竟在林深处寻得几枚异果，如蝶所指引，也算一段奇缘。你把这番际遇，悄悄记在了心底。',
          effects: [{ k: 'herb', id: 'random', v: 2 }, { k: 'dao', v: 300 }]
        },
        fail: {
          text: '你追蝶入林，转来转去迷了路，待出得林时，已是日暮，衣上尽是苍耳与草籽。四下里静极，只余风声与你。',
          effects: [{ k: 'shen', v: -20 }, { k: 'haste', v: 8 }]
        }
      },
      {
        label: '勘辨真幻',
        hint: '考验：悟性',
        check: { stat: 'insight', dc: 18 },
        success: {
          text: '你定心细辨，幻中取真，竟窥见梦境与道境一线之隔，悟性大涨，如烛照暗室。你定了定神，复又恢复了从容。',
          effects: [{ k: 'insight', v: 2 }, { k: 'dao', v: 600 }]
        },
        fail: {
          text: '你越辨越乱，真假莫分，心神堕入恍惚，久久不能自拔，只得倚松而歇。暮色渐合，山影也淡了下去。',
          effects: [{ k: 'daoxin', v: -6 }, { k: 'shen', v: -25 }]
        }
      }
    ]
  },

  {
    id: 'ev_baopu',
    title: '抱朴',
    weight: 10,
    once: false,
    tag: 'dao',
    cond: { loc: ['fuyao_cheng'], features: ['market'] },
    text: '市井喧嚣，众人争相炫耀机巧：能言者逞口舌，多谋者炫心计。唯你袖手而立，如一块未琢的顽石，安静得几乎被人遗忘。叫卖声、争辩声、算盘声混成一片，你置身其中，却像隔着一层水。那水渐渐静了，热闹都浮在水面，而你沉在底里。',
    choices: [
      {
        label: '守拙不争',
        hint: '抱朴守拙，不与人较',
        outcome: {
          text: '你不辩不炫，由他们去争。日暮人散，唯你心头清明，如顽石历风，不损分毫，反多了几分沉稳。',
          effects: [{ k: 'daoxin', v: 12 }, { k: 'haste', v: -12 }, { k: 'dao', v: 300 }]
        }
      },
      {
        label: '一展才学',
        hint: '考验：悟性',
        check: { stat: 'insight', dc: 15 },
        success: {
          text: '你出口成章，折服众人，一时名满坊市，得了不少赏识与谢礼，只是心头那点清静，也淡了些。',
          effects: [{ k: 'repute', v: 15 }, { k: 'stone', v: 100 }, { k: 'dao', v: 150 }]
        },
        fail: {
          text: '你才学未逮，反被人诘问得哑口无言，惹来一阵哄笑，只觉面上发热，无地自容。这其中的滋味，只有你自己知晓。',
          effects: [{ k: 'repute', v: -10 }, { k: 'daoxin', v: -5 }]
        }
      },
      {
        label: '以拙胜巧',
        hint: '大巧若拙，反得真味',
        outcome: {
          text: '你以一句极拙的话，点破众人机巧的空处。满座皆静，似有所悟，你亦从中得一分真味。你回首望了一眼，复又向前行去。',
          effects: [{ k: 'daoxin', v: 8 }, { k: 'dao', v: 350 }, { k: 'insight', v: 1 }]
        }
      }
    ]
  },

  {
    id: 'ev_shangshan',
    title: '上善若水',
    weight: 10,
    once: false,
    tag: 'dao',
    cond: {},
    text: '大旱之年，山泉也瘦成一线。你却见它仍不肯停，一滴一滴，渗入最深的土里，滋养着石缝里那株不肯死的草。水，处众人之所恶，故几于道。日头毒辣，泉声渐弱，那株草却仍倔强地绿着。你蹲下来，看那水珠如何从石上滴落，又如何在土里消失。',
    choices: [
      {
        label: '效水之德',
        hint: '无为而润，几近于道',
        outcome: {
          text: '你效那泉水，不争不抢，只默默尽己一分。此念一起，胸中自有一股清流，如得大道垂青。',
          effects: [{ k: 'daoxin', v: 12 }, { k: 'merit', v: 10 }, { k: 'dao', v: 350 }, { k: 'haste', v: -10 }]
        }
      },
      {
        label: '以水润己',
        hint: '抢水自润，有伤天和',
        outcome: {
          text: '你趁泉未干，抢先汲取多存。清凉入腹，却见那株草又蔫了一分，心头忽地有些发虚。一时之间，你也说不清是喜是怅。',
          effects: [{ k: 'jing', v: 40 }, { k: 'qi', v: 40 }, { k: 'karma', v: 8 }]
        }
      },
      {
        label: '引水灌田',
        hint: '耗精引水，泽被一方',
        cost: { jing: 30 },
        outcome: {
          text: '你以自身精气导引，将所余泉水引入山脚荒田。禾苗渐青，乡民望你如望甘霖，你亦觉值得。',
          effects: [{ k: 'merit', v: 30 }, { k: 'repute', v: 10 }, { k: 'dao', v: 200 }]
        }
      }
    ]
  },

  {
    id: 'ev_dichu',
    title: '涤除玄览',
    weight: 8,
    once: false,
    tag: 'dao',
    cond: {},
    text: '你以清泉浣衣，也以清泉洗心。那些名利、恩怨、得失的垢，一层层从心头剥落，沉入水底。水面渐渐清了，照见云，照见天，照见一个澄澈的自己。你俯身去看，水里的那个人，也在静静看着你。一滴水从你指尖滑落，惊碎了自己，又慢慢聚拢。',
    choices: [
      {
        label: '涤心忘尘',
        hint: '无为之涤，尘尽道生',
        outcome: {
          text: '你只让那水静静洗着，心上尘垢随波而逝。待水清时，你也清透如新，如脱胎换骨一般。钟声渺渺，似从极远处传来。',
          effects: [{ k: 'daoxin', v: 14 }, { k: 'haste', v: -18 }, { k: 'dao', v: 350 }]
        }
      },
      {
        label: '借水涤神',
        hint: '考验：神',
        check: { stat: 'shen', dc: 15 },
        success: {
          text: '你引清泉入识海，涤去神思中的杂垢，只觉神台朗照，如明月当空，纤毫毕现，无一处不分明。',
          effects: [{ k: 'shen', v: 60 }, { k: 'maxShen', v: 8 }, { k: 'dao', v: 250 }]
        },
        fail: {
          text: '你引水入神，反被那股清寒所侵，打了几个寒噤，神思愈发昏沉，只得匆匆收功。一时之间，天地都显得格外安静。',
          effects: [{ k: 'shen', v: -25 }, { k: 'hurtPct', v: 10 }]
        }
      },
      {
        label: '只浣衣冠',
        hint: '净其表，不净其心',
        outcome: {
          text: '你将衣冠洗得干净，穿戴齐整，倒也有几分仙风道骨，只是心里那点尘，还在那里。山风掠过，带来一阵草木清气。',
          effects: [{ k: 'repute', v: 5 }, { k: 'dao', v: 50 }]
        }
      }
    ]
  },

  // ===================== 因果 karma（10） =====================
  {
    id: 'ev_niitong',
    title: '救溺童',
    weight: 10,
    once: false,
    tag: 'karma',
    cond: {},
    text: '溪边忽闻惊呼，一个总角小童失足落水，在水中扑腾，眼看要没顶。水势湍急，下接深潭。你水性平平，若要施救，恐有性命之虞；若迟疑，童命顷刻。那童儿的哭喊，一声声拍在溪石上，也拍在你心上。溪边的妇人瘫倒在地，哭得撕心裂肺。',
    choices: [
      {
        label: '跃入救人',
        hint: '考验：精',
        check: { stat: 'jing', dc: 15 },
        success: {
          text: '你跃入激流，几经沉浮，终将那童儿托上岸。村人聚来，千恩万谢，那童儿伏地磕头。你心头起伏，久久未能平息。',
          effects: [{ k: 'merit', v: 40 }, { k: 'repute', v: 15 }]
        },
        fail: {
          text: '你拼死救起童儿，自己却被暗流卷入，呛了满腹寒水，几欲不支，幸得村人相救才脱险。此事过后，那余韵仍久久不散。',
          effects: [{ k: 'merit', v: 30 }, { k: 'hurtPct', v: 35 }]
        }
      },
      {
        label: '抛绳相救',
        hint: '以藤为绳，稳妥施救',
        cost: { jing: 15 },
        outcome: {
          text: '你抛下长藤，那童儿死死抓住，你将他一寸寸拖上岸。有惊无险，两相周全，你亦松一口气。',
          effects: [{ k: 'merit', v: 30 }, { k: 'repute', v: 8 }]
        }
      },
      {
        label: '袖手离去',
        hint: '保身为上，良心难安',
        outcome: {
          text: '你转身离去，身后惊呼渐弱。此后多日，耳畔总似有那童儿的哭声，夜夜扰你清梦。你把这番际遇，悄悄记在了心底。',
          effects: [{ k: 'karma', v: 25 }, { k: 'daoxin', v: -10 }]
        }
      }
    ]
  },

  {
    id: 'ev_shiliang',
    title: '饥荒施粮',
    weight: 10,
    once: false,
    tag: 'karma',
    cond: { loc: ['fuyao_cheng'], features: ['market'] },
    text: '荒年，路边有瘦骨嶙峋的流民，妇人抱着饿得发昏的婴孩，眼巴巴望着你。你行囊里还有几块干粮与一些灵石。给了，你路上便要挨饿；不给，这母子未必熬得过今夜。那婴孩的哭声细如游丝，断断续续。暮色里，几双眼睛在暗处望着你，亮得吓人。',
    choices: [
      {
        label: '倾囊施粮',
        hint: '尽舍所有，救人危难',
        cost: { stone: 100 },
        outcome: {
          text: '你将干粮灵石尽数分给流民，那妇人抱着婴孩伏地而泣。你腹中空空，心头却满，如有所依。',
          effects: [{ k: 'merit', v: 40 }, { k: 'karma', v: -10 }, { k: 'repute', v: 5 }]
        }
      },
      {
        label: '分其一半',
        hint: '量力而施，两全其美',
        cost: { stone: 40 },
        outcome: {
          text: '你分出一半干粮，妇人千恩万谢。你留得路上口粮，也算心安，两不相欠，各自赶路。四下里静极，只余风声与你。',
          effects: [{ k: 'merit', v: 20 }]
        }
      },
      {
        label: '掉头走开',
        hint: '自顾赶路，心有愧怍',
        outcome: {
          text: '你狠下心掉头走开，行囊沉甸甸的，心却轻得发慌。走出老远，那哭声似仍追着你。你定了定神，复又恢复了从容。',
          effects: [{ k: 'karma', v: 30 }, { k: 'daoxin', v: -8 }]
        }
      }
    ]
  },

  {
    id: 'ev_fangsheng',
    title: '放生',
    weight: 10,
    once: false,
    tag: 'karma',
    cond: { loc: ['qingyun_shan'], features: ['gather'] },
    text: '你本欲猎一只山兔果腹，箭在弦上，却见它瘸着一条腿，腹下竟有幼崽蠕动，正惊恐地回头望你。这一箭下去，便是几条命。弓弦越绷越紧，那山兔浑身发抖，却仍把幼崽护在身下。林间有风穿过，吹得你箭尖上的羽毛微微颤动，如也在犹豫。',
    choices: [
      {
        label: '收弓放生',
        hint: '挨一时之饥，全数命',
        cost: { jing: 20 },
        outcome: {
          text: '你收了弓，那山兔定定望你一眼，方领幼崽隐入草丛。你腹中虽饥，却觉释然，如放下一块石头。',
          effects: [{ k: 'merit', v: 25 }, { k: 'karma', v: -10 }]
        }
      },
      {
        label: '一箭射之',
        hint: '猎兔果腹，结下杀业',
        outcome: {
          text: '你一箭射出，血染草丛。兔肉果腹，暖意却盖不住心底那点寒意，似有什么随箭而去。暮色渐合，山影也淡了下去。',
          effects: [{ k: 'jing', v: 60 }, { k: 'karma', v: 20 }, { k: 'daoxin', v: -6 }]
        }
      },
      {
        label: '疗伤后放',
        hint: '耗精疗伤，慈心更甚',
        cost: { jing: 30 },
        outcome: {
          text: '你折草为药，为那瘸腿山兔敷上，又留它母子半块饼。山兔似记下你的样子，频频回望。这其中的滋味，只有你自己知晓。',
          effects: [{ k: 'merit', v: 45 }, { k: 'flag', id: 'fang_tu' }]
        }
      }
    ]
  },

  {
    id: 'ev_yibao',
    title: '还遗宝',
    weight: 8,
    once: false,
    tag: 'karma',
    cond: {},
    text: '你在路边捡到一只锦囊，内有三枚上品灵石与一块刻着名讳的玉佩，想来是哪位修士遗落。四下无人，据为己有，无人知晓；原地等候，不知要耽搁几日。那玉佩触手生温，名讳刻得极深，似有故事。你翻来覆去地看，指腹在那名讳上反复摩挲。',
    choices: [
      {
        label: '原地等候',
        hint: '守候半日，物归原主',
        cost: { days: 1 },
        outcome: {
          text: '你于原地候了半日，果见一修士匆匆寻来。物归原主，他取灵石相谢，还记下你一份人情。',
          effects: [{ k: 'merit', v: 30 }, { k: 'repute', v: 10 }, { k: 'stone', v: 50 }]
        }
      },
      {
        label: '循佩寻主',
        hint: '费心寻找，善莫大焉',
        cost: { days: 2 },
        outcome: {
          text: '你循玉佩名讳寻访两日，终将锦囊送还。失主感念，执意厚谢，并留你一份交情，如获故知。',
          effects: [{ k: 'merit', v: 45 }, { k: 'repute', v: 15 }, { k: 'stone', v: 100 }]
        }
      },
      {
        label: '纳为己有',
        hint: '无人知晓，唯有天知',
        outcome: {
          text: '你将锦囊收入怀中。四下无人，心头却似悬了块石头，总也放不下，夜里更觉那玉佩发烫。',
          effects: [{ k: 'stone', v: 300 }, { k: 'karma', v: 25 }, { k: 'daoxin', v: -6 }]
        }
      }
    ]
  },

  {
    id: 'ev_liaoshang',
    title: '妖兽疗伤',
    weight: 8,
    once: false,
    tag: 'karma',
    cond: { loc: ['wanyao_gu'] },
    text: '草丛里卧着一只受了伤的赤狐，后腿箭伤溃烂，见你便龇牙，眼中却满是求生的光。妖物常有狡诈，救它，它或反噬；不救，它熬不过这几日。暮色压下来，那赤狐的喘息一声急过一声，如风中残烛。它盯着你，爪子在泥土里刨出几道浅痕。',
    choices: [
      {
        label: '取药疗伤',
        hint: '耗精救治，狐或有报',
        cost: { jing: 25 },
        outcome: {
          text: '你敷药裹伤，赤狐渐渐安静下来，临走前深深望你一眼，似要把你记住。那眼神，不像畜牲。',
          effects: [{ k: 'merit', v: 35 }, { k: 'karma', v: -12 }, { k: 'flag', id: 'jiu_hu' }]
        }
      },
      {
        label: '取皮而去',
        hint: '杀狐取皮，结下杀业',
        outcome: {
          text: '你补了一剑，剥下狐皮。那狐眼中最后的光，成了你心头一根刺，此后多日都拔不掉。你回首望了一眼，复又向前行去。',
          effects: [{ k: 'stone', v: 80 }, { k: 'karma', v: 25 }, { k: 'daoxin', v: -8 }]
        }
      },
      {
        label: '转身不管',
        hint: '见死不救，良心不安',
        outcome: {
          text: '你转身走了。身后那狐的低鸣，在风里拖得很长很长，如一根细线，勒着你往前走。一时之间，你也说不清是喜是怅。',
          effects: [{ k: 'karma', v: 12 }, { k: 'daoxin', v: -4 }]
        }
      }
    ]
  },

  {
    id: 'ev_jiefa',
    title: '揭发邪修',
    weight: 8,
    once: false,
    tag: 'karma',
    cond: { loc: ['fuyao_cheng'], features: ['market', 'sect'] },
    text: '你在坊市中察觉一人袖底藏符，符上怨气森然，分明是以生人血祭炼的邪物。此人伪作和善，正与摊主攀谈，似要寻下一个目标。揭发他，或招来杀身之祸；不揭发，又不知谁家儿女要遭殃。他笑得温文，你却觉背脊发凉，仿佛有只冰冷的手，正搭上你的肩。',
    choices: [
      {
        label: '当众揭发',
        hint: '考验：攻',
        check: { stat: 'atk', dc: 15 },
        success: {
          text: '你当众喝破，众人合力将邪修擒下。那藏符之恶大白于天下，人人称快，你亦觉痛快。钟声渺渺，似从极远处传来。',
          effects: [{ k: 'merit', v: 40 }, { k: 'repute', v: 20 }]
        },
        fail: {
          text: '邪修暴起伤人，虽终被惊走，你肩上却挨了一记，血流如注。此后他记恨于你，恐有后患。',
          effects: [{ k: 'merit', v: 20 }, { k: 'hurtPct', v: 20 }, { k: 'flag', id: 'jie_xie_ji' }]
        }
      },
      {
        label: '密报宗门',
        hint: '稳妥行事，借势除害',
        cost: { days: 1 },
        outcome: {
          text: '你密报宗门，执法长老循迹而去，将那邪修连窝端了。你不露面，也积了阴功，心中安稳。',
          effects: [{ k: 'merit', v: 30 }, { k: 'repute', v: 10 }]
        }
      },
      {
        label: '明哲保身',
        hint: '置身事外，心有余悸',
        outcome: {
          text: '你低下头，匆匆离开。身后摊主的笑，让你一夜难眠，那邪修的眼神，总在眼前晃。一时之间，天地都显得格外安静。',
          effects: [{ k: 'karma', v: 20 }, { k: 'daoxin', v: -6 }]
        }
      }
    ]
  },

  {
    id: 'ev_shoufa',
    title: '代人受罚',
    weight: 8,
    once: false,
    tag: 'karma',
    cond: { loc: ['taixu_guan'], features: ['sect'] },
    text: '山门之下，一名小道士打翻了祖师案前的长明灯，火苗烧了经卷一角。执事盛怒，要杖责四十、逐出山门。小道士浑身发抖，那灯却本是你匆忙离去时忘了添油，他不过替你受过。你站在人群里，手心渗出汗来，那杖影一下下，都像要落在你心上。',
    choices: [
      {
        label: '挺身认罪',
        hint: '承认己过，受杖无悔',
        outcome: {
          text: '你上前认下疏漏，执事杖下留情。那小道士泪眼望你，如望兄长，你只觉这一杖挨得值。山风掠过，带来一阵草木清气。',
          effects: [{ k: 'repute', v: 10 }, { k: 'merit', v: 25 }, { k: 'hurtPct', v: 15 }, { k: 'daoxin', v: 8 }]
        }
      },
      {
        label: '替他受过',
        hint: '隐下实情，代人受杖',
        outcome: {
          text: '你不提添油之事，只道是那灯烛走火。四十杖落在背上，火辣辣地疼，你却站得笔直，一言不发。',
          effects: [{ k: 'merit', v: 35 }, { k: 'repute', v: 15 }, { k: 'hurtPct', v: 20 }, { k: 'daoxin', v: 10 }]
        }
      },
      {
        label: '默不作声',
        hint: '保全自身，于心难安',
        outcome: {
          text: '你低头不语，任那小道士被拖去受罚。此后每见长明灯，都觉火光灼眼，如针在刺。你心头起伏，久久未能平息。',
          effects: [{ k: 'karma', v: 30 }, { k: 'daoxin', v: -10 }]
        }
      }
    ]
  },

  {
    id: 'ev_jusha',
    title: '拒杀求生',
    weight: 8,
    once: false,
    tag: 'karma',
    cond: {},
    text: '荒郊遇一散修，身负重伤，血染衣襟，倒伏道旁，尚存一息。他身上鼓鼓囊囊，或有些许灵石法宝。四下无人，杀之取其财物，神不知鬼不觉；救之，则要耗费丹药灵力，还恐惹上仇家。他喉头嗬嗬有声，似在唤人，一只染血的手，正朝着你的方向伸着。',
    choices: [
      {
        label: '施药相救',
        hint: '耗炁救人，积下善缘',
        cost: { qi: 30 },
        outcome: {
          text: '你渡炁喂药，那散修悠悠转醒，记下你的名姓，言道日后必报。你扶他起身，目送他远去。',
          effects: [{ k: 'merit', v: 40 }, { k: 'karma', v: -10 }, { k: 'flag', id: 'jiu_xiushi' }, { k: 'repute', v: 10 }]
        }
      },
      {
        label: '取财而去',
        hint: '不害其命，盗其财物',
        outcome: {
          text: '你解下他的行囊，将灵石法宝尽数取了。他尚有气，你尚有愧，走出老远，仍不敢回头。此事过后，那余韵仍久久不散。',
          effects: [{ k: 'stone', v: 200 }, { k: 'karma', v: 35 }, { k: 'daoxin', v: -10 }]
        }
      },
      {
        label: '补刀夺财',
        hint: '杀人越货，罪业滔天',
        outcome: {
          text: '你狠下杀手，取尽财物。四下无人，却觉背脊生凉，仿佛有眼在暗处望着你，森森然。你把这番际遇，悄悄记在了心底。',
          effects: [{ k: 'stone', v: 300 }, { k: 'karma', v: 60 }, { k: 'daoxin', v: -20 }, { k: 'balance', v: -20 }]
        }
      }
    ]
  },

  {
    id: 'ev_shiwen',
    title: '瘟疫施药',
    weight: 5,
    once: true,
    tag: 'karma',
    cond: { loc: ['fuyao_cheng'], features: ['market'] },
    text: '城中瘟疫横行，户户闭门，街头焚艾的烟遮蔽天光。一位老郎中说，还差一味主药，他年迈无力，愿以祖传丹方相赠，只求有人愿冒险入山采那株百年药草。此行凶险，或染疫气，或遇毒瘴。老人说完，深深一揖，如托付生死。你看见他袖口，还沾着煎药时的药渣。',
    choices: [
      {
        label: '入山采药',
        hint: '考验：精',
        check: { stat: 'jing', dc: 16 },
        success: {
          text: '你入山涉险，终将那百年药草采回。汤药熬成，瘟疫渐息，满城香火为你而燃，恩泽一方。',
          effects: [{ k: 'merit', v: 60 }, { k: 'repute', v: 25 }, { k: 'flag', id: 'danfang_yi' }]
        },
        fail: {
          text: '你在山中染了疫气，咳得几乎脱力，却仍把药草背回了城。城门口，你终于撑不住倒下。四下里静极，只余风声与你。',
          effects: [{ k: 'merit', v: 40 }, { k: 'hurtPct', v: 25 }]
        }
      },
      {
        label: '施财购药',
        hint: '破财购药，免入险地',
        cost: { stone: 300 },
        outcome: {
          text: '你取出灵石，高价购来百年药草。老郎中连夜配药，救下一城百姓，你也算尽了心力。你定了定神，复又恢复了从容。',
          effects: [{ k: 'merit', v: 40 }, { k: 'repute', v: 15 }]
        }
      },
      {
        label: '避疫远走',
        hint: '自保为上，心有愧怍',
        outcome: {
          text: '你连夜出城，把满城的艾烟与呻吟抛在身后。夜路很长，风声里似有人唤你，久久不散。暮色渐合，山影也淡了下去。',
          effects: [{ k: 'karma', v: 40 }, { k: 'daoxin', v: -10 }]
        }
      }
    ]
  },

  {
    id: 'ev_maizang',
    title: '埋骨',
    weight: 9,
    once: true,
    tag: 'karma',
    cond: { loc: ['huangsha_ling'], features: ['ruin'] },
    text: '风沙之中，一具白骨半掩，衣衫已朽，唯颈间一枚铁符刻着个“归”字。或战死，或病殁，客死异乡。你若不管，风沙自会将它彻底掩埋；若敛骨安葬，须耗一日，且要亲手挖坑立石。那“归”字在风里，一笔一画都写着不甘。黄沙扑在骨上，沙沙地响。',
    choices: [
      {
        label: '敛骨安葬',
        hint: '费时费力，送他归土',
        cost: { days: 1 },
        outcome: {
          text: '你挖坑立石，将那白骨葬了，又于墓前念了一段安魂咒。铁符你收下，作个信物，也算送他最后一程。',
          effects: [{ k: 'merit', v: 35 }, { k: 'karma', v: -10 }, { k: 'daoxin', v: 6 }, { k: 'flag', id: 'tie_fu' }]
        }
      },
      {
        label: '念咒超度',
        hint: '诵咒相送，聊尽心意',
        outcome: {
          text: '你不葬不埋，只合掌诵了一段往生咒。愿那客死之人，魂兮归来，不再漂泊于风沙之中。这其中的滋味，只有你自己知晓。',
          effects: [{ k: 'merit', v: 15 }, { k: 'daoxin', v: 5 }]
        }
      },
      {
        label: '径直赶路',
        hint: '不愿耽搁，任沙掩埋',
        outcome: {
          text: '你紧了紧行囊，径直赶路。风沙很快将白骨与那“归”字一同掩去，如从未有过。你回首望了一眼，复又向前行去。',
          effects: [{ k: 'karma', v: 10 }]
        }
      }
    ]
  },

  // ===================== 人情 people（8） =====================
  {
    id: 'ev_xiangyao',
    title: '同门相邀',
    weight: 12,
    once: false,
    tag: 'people',
    cond: { loc: ['taixu_guan'], features: ['sect'] },
    text: '一位同门师弟寻来，说后山发现一株奇异灵草，只是有只守护妖兽，邀你同去采摘，言明所得对半。他神色恳切，眼中却有掩不住的急切。山风穿堂而过，吹得他的衣袖一荡一荡，似也催着你快些应下。你看着他，心里飞快地盘算着此行的凶险。',
    choices: [
      {
        label: '欣然同往',
        hint: '考验：气运',
        check: { stat: 'luck', dc: 13 },
        success: {
          text: '你二人合力采得灵草，分了收获，交情又近一分。师弟笑得开怀，直说下次还找你。一时之间，你也说不清是喜是怅。',
          effects: [{ k: 'herb', id: 'random', v: 2 }, { k: 'stone', v: 100 }, { k: 'repute', v: 8 }]
        },
        fail: {
          text: '你二人惊动了守护妖兽，那畜牲扑将上来，你被利爪扫中，狼狈而逃，空手而回。钟声渺渺，似从极远处传来。',
          effects: [{ k: 'hurtPct', v: 15 }]
        }
      },
      {
        label: '婉言谢绝',
        hint: '独善其身，不涉此险',
        outcome: {
          text: '你婉言谢绝。师弟有些失望，独自去了。你在山门打坐，倒也清净，只是心头略觉空落。一时之间，天地都显得格外安静。',
          effects: [{ k: 'dao', v: 100 }]
        }
      },
      {
        label: '劝他勿去',
        hint: '劝其莫贪，或得善名',
        outcome: {
          text: '你劝他莫为灵草涉险。他踌躇再三，终是听劝，事后对你愈加敬重，视你如师。山风掠过，带来一阵草木清气。',
          effects: [{ k: 'merit', v: 10 }, { k: 'repute', v: 8 }, { k: 'daoxin', v: 5 }]
        }
      }
    ]
  },

  {
    id: 'ev_guyou',
    title: '故友求助',
    weight: 10,
    once: false,
    tag: 'people',
    cond: {},
    text: '多年未见的故友忽来投帖，说修行出了岔子，急需一味药草与几十灵石渡劫，言辞恳切，几近泣血。你记得他昔年曾帮过你，却也曾因小事与你反目。那字迹犹是你认得的，只是笔锋里，多了几分狼狈。你捏着那帖子，一时竟不知该不该信他。',
    choices: [
      {
        label: '倾囊相助',
        hint: '重情重义，倾力相帮',
        cost: { stone: 80 },
        outcome: {
          text: '你倾囊相助。故友渡劫得脱，涕泪交加，指天立誓：此恩必报。你只一笑，拍他肩头。你心头起伏，久久未能平息。',
          effects: [{ k: 'repute', v: 10 }, { k: 'merit', v: 15 }, { k: 'flag', id: 'guyou_bao' }]
        }
      },
      {
        label: '借半而助',
        hint: '量力相助，情分留半',
        cost: { stone: 40 },
        outcome: {
          text: '你借他一半，帮得渡劫，也留了后路。故友谢过，情分未薄也未厚，彼此都留了体面。此事过后，那余韵仍久久不散。',
          effects: [{ k: 'merit', v: 8 }, { k: 'repute', v: 5 }]
        }
      },
      {
        label: '婉言拒绝',
        hint: '护财要紧，旧情转冷',
        outcome: {
          text: '你婉言拒绝。故友默然半晌，转身去了，那背影让你心里空落落的，如失了什么。你把这番际遇，悄悄记在了心底。',
          effects: [{ k: 'daoxin', v: -4 }, { k: 'repute', v: -5 }]
        }
      }
    ]
  },

  {
    id: 'ev_kaowen',
    title: '师尊考问',
    weight: 10,
    once: false,
    tag: 'people',
    cond: { loc: ['taixu_guan'], features: ['sect'] },
    text: '师尊唤你入室，考问修行进境，问得极细，最后抛出一问：“道在何处？” 你知此问无定论，答得妙则得指点，答得谬则遭斥，答得圆滑则失本心。香炉里的烟，袅袅地升着，满室静得能听见你的心跳。师尊半阖着眼，似在等你，也似已看透你。',
    choices: [
      {
        label: '直陈本心',
        hint: '考验：道心',
        check: { stat: 'daoxin', dc: 14 },
        success: {
          text: '你直言道在日用寻常处。师尊抚须而笑，说你未走偏，亲授了几句心法，你受用不尽。四下里静极，只余风声与你。',
          effects: [{ k: 'dao', v: 400 }, { k: 'daoxin', v: 8 }]
        },
        fail: {
          text: '你答得含混，师尊摇头，斥你修行如隔靴搔痒，你面红耳赤，久久抬不起头。你定了定神，复又恢复了从容。',
          effects: [{ k: 'daoxin', v: -5 }, { k: 'dao', v: 50 }]
        }
      },
      {
        label: '引经据典',
        hint: '考验：悟性',
        check: { stat: 'insight', dc: 15 },
        success: {
          text: '你旁征博引，师尊颔首，说你读书已入骨，只差火候，再点拨你几句，你茅塞顿开。暮色渐合，山影也淡了下去。',
          effects: [{ k: 'dao', v: 350 }, { k: 'insight', v: 1 }]
        },
        fail: {
          text: '你引典失当，被师尊点破死读书三字，闹了个红脸，只恨不能寻个地缝钻进去。这其中的滋味，只有你自己知晓。',
          effects: [{ k: 'dao', v: 50 }, { k: 'daoxin', v: -3 }]
        }
      },
      {
        label: '默然不语',
        hint: '不妄言，以默作答',
        outcome: {
          text: '你合掌不语。师尊凝视你良久，叹道：默处，也见道心。那目光里，似有赞许，也似有叹息。',
          effects: [{ k: 'dao', v: 100 }, { k: 'daoxin', v: 5 }]
        }
      }
    ]
  },

  {
    id: 'ev_wenda',
    title: '女修问道',
    weight: 10,
    once: false,
    tag: 'people',
    cond: {},
    text: '一位白衣女修拦住去路，盈盈一礼，说久闻你之名，特来请教“阴阳双修”之理。她言辞恳切，眼波却流转不定。此问若答得实，恐露己之浅；若虚与委蛇，又恐坠了名头。山花簌簌落在她肩头，她也不拂，只望着你，像要把你看穿。',
    choices: [
      {
        label: '据实相告',
        hint: '知之为知，不知为不知',
        outcome: {
          text: '你据实而答，不藏不炫。女修敛衽一礼，说如今肯说实话的人不多了，眼中似有几分敬意。',
          effects: [{ k: 'repute', v: 8 }, { k: 'dao', v: 200 }]
        }
      },
      {
        label: '虚言吹嘘',
        hint: '考验：气运',
        check: { stat: 'luck', dc: 13 },
        success: {
          text: '你半真半假说了一通，竟将她唬住，临去还赠你几枚灵石作谢。你捏着灵石，倒有几分心虚。',
          effects: [{ k: 'repute', v: 10 }, { k: 'stone', v: 60 }]
        },
        fail: {
          text: '她听出破绽，掩口一笑，转身去了，留你讪讪立在原地，只觉面上无光。你回首望了一眼，复又向前行去。',
          effects: [{ k: 'repute', v: -10 }, { k: 'daoxin', v: -5 }]
        }
      },
      {
        label: '反问她道',
        hint: '以问代答，反客为主',
        outcome: {
          text: '你不答反问，句句叩其本心。女修怔住，似有所悟，郑重一拜而去，留你在原地回味。一时之间，你也说不清是喜是怅。',
          effects: [{ k: 'insight', v: 1 }, { k: 'dao', v: 250 }]
        }
      }
    ]
  },

  {
    id: 'ev_taojia',
    title: '坊市讨价',
    weight: 12,
    once: false,
    tag: 'people',
    cond: { loc: ['fuyao_cheng'], features: ['market'] },
    text: '坊市喧嚷，你看中一株百年黄精，摊主开价三百灵石，分毫不让。你细看那黄精，年份或有虚报，至多六十年。争，恐伤和气；不争，白吃暗亏。那黄精摆在粗布上，根须上还沾着新土，散发着一股土腥气。摊主斜睨着你，指尖在算盘上轻点。',
    choices: [
      {
        label: '据理还价',
        hint: '考验：悟性',
        check: { stat: 'insight', dc: 14 },
        success: {
          text: '你点破那黄精不过六十年，摊主讪讪，终以两百灵石成交，还夸你眼力毒，算是不打不相识。',
          effects: [{ k: 'herb', id: 'random', v: 1 }, { k: 'repute', v: 5 }]
        },
        fail: {
          text: '你争得面红耳赤，摊主却寸步不让，买卖谈崩，你空手而去，身后还传来几句冷言。钟声渺渺，似从极远处传来。',
          effects: [{ k: 'repute', v: -5 }]
        }
      },
      {
        label: '照价买下',
        hint: '不较锱铢，结个善缘',
        cost: { stone: 300 },
        outcome: {
          text: '你照价买下，摊主笑逐颜开，悄悄多包了一味药引相送。多花的灵石，权当买份交情。一时之间，天地都显得格外安静。',
          effects: [{ k: 'herb', id: 'random', v: 1 }, { k: 'repute', v: 5 }]
        }
      },
      {
        label: '拂袖而去',
        hint: '不买省心，稍损名声',
        outcome: {
          text: '你嫌贵转身就走，身后传来摊主一声冷笑，说你气量小。你只当没听见，径自去了。山风掠过，带来一阵草木清气。',
          effects: [{ k: 'repute', v: -3 }]
        }
      }
    ]
  },

  {
    id: 'ev_zhaolan',
    title: '宗门招揽',
    weight: 6,
    once: true,
    tag: 'people',
    cond: { features: ['sect'] },
    text: '一家大宗门的长老携礼来访，许你内门弟子之位，灵石月俸、上乘功法，只等你点头。唯有一条：须立誓脱离如今门庭，改拜其宗。你一时心旌摇荡，那礼单上的字，一个个都烫得晃眼。长老抚须而坐，笑吟吟地望着你，等你一个答复。',
    choices: [
      {
        label: '应允入宗',
        hint: '背弃旧门，换得前程',
        outcome: {
          text: '你签下名帖，改投新宗。月俸灵石到手，只是旧日同门的眼神，总在梦里挥之不去，如芒在背。',
          effects: [{ k: 'repute', v: 15 }, { k: 'stone', v: 200 }, { k: 'daoxin', v: -12 }, { k: 'karma', v: 15 }]
        }
      },
      {
        label: '婉拒留山',
        hint: '不忘师恩，守此门庭',
        outcome: {
          text: '你婉言谢绝。旧门上下闻知，对你愈发敬重，师尊亦暗中授你心法，你只觉此心安处是吾乡。',
          effects: [{ k: 'repute', v: 10 }, { k: 'daoxin', v: 10 }, { k: 'merit', v: 10 }]
        }
      },
      {
        label: '两方周旋',
        hint: '考验：气运',
        check: { stat: 'luck', dc: 15 },
        success: {
          text: '你八面玲珑，两方都不得罪，竟左右逢源，还得了份不菲的谢礼。只是夜深时，也觉这样活着累。',
          effects: [{ k: 'stone', v: 150 }, { k: 'repute', v: 10 }]
        },
        fail: {
          text: '你两头含糊，结果两宗皆恼，落了个骑墙之名，灰头土脸，两处都不讨好。你心头起伏，久久未能平息。',
          effects: [{ k: 'repute', v: -15 }, { k: 'daoxin', v: -5 }]
        }
      }
    ]
  },

  {
    id: 'ev_shuoshuren',
    title: '盲眼说书',
    weight: 9,
    once: false,
    tag: 'people',
    cond: { loc: ['fuyao_cheng'], features: ['market'] },
    text: '茶馆一角，盲眼老者抚着醒木，说一段上古仙人斩妖的旧事。满堂茶客听得入神，唯有你听出那故事里，藏着一句被说书人反复吟咏的口诀，似真似假。茶香氤氲，那醒木每拍一下，口诀便如露珠般滚过一遍。老者双目虽盲，说到关键处，却总朝你的方向偏了偏头。',
    choices: [
      {
        label: '掷钱打赏',
        hint: '慷慨打赏，或有真传',
        cost: { stone: 50 },
        outcome: {
          text: '你掷钱打赏。老者侧耳一笑，散场后附耳授你一句真诀，你如醍醐灌顶，方知其中大有文章。',
          effects: [{ k: 'dao', v: 300 }, { k: 'insight', v: 1 }]
        }
      },
      {
        label: '静听细悟',
        hint: '考验：悟性',
        check: { stat: 'insight', dc: 16 },
        success: {
          text: '你闭目细听，将那口诀反复咀嚼，忽而悟通其中关窍，道行大涨，如暗室中骤见天光。此事过后，那余韵仍久久不散。',
          effects: [{ k: 'dao', v: 500 }, { k: 'techRandom', tier: 2 }]
        },
        fail: {
          text: '你只听了个热闹，待到醒木一拍，才知漏了最要紧的一句，再想追忆，已了无痕迹。你把这番际遇，悄悄记在了心底。',
          effects: [{ k: 'dao', v: 100 }]
        }
      },
      {
        label: '当众点破',
        hint: '点破虚妄，扬名一时',
        outcome: {
          text: '你当众点破那口诀是假。众人哗然，你出了风头，却见老者脸上笑意全无，隐隐有些落寞。',
          effects: [{ k: 'repute', v: 10 }, { k: 'karma', v: 5 }]
        }
      }
    ]
  },

  {
    id: 'ev_jiudi',
    title: '旧敌相逢',
    weight: 6,
    once: true,
    tag: 'people',
    cond: {},
    text: '狭路相逢，正是当年与你结怨之人，曾毁你一件法器，你也曾坏他一桩机缘。他按住剑柄，你握住拳，山风在两人之间打转。仇人相见，分外眼红，脚下的石子都似在屏息。四目相对，旧事如潮，一句“别来无恙”谁也没有说出口。',
    choices: [
      {
        label: '拔剑相向',
        hint: '有仇报仇，一战了之',
        outcome: {
          text: '你拔剑而起，旧怨新仇，尽付此一战。剑光起处，山风也凝了一瞬，杀机四伏。四下里静极，只余风声与你。',
          effects: [{ k: 'combat', enemy: 'auto' }]
        }
      },
      {
        label: '拱手让路',
        hint: '退一步，海阔天空',
        outcome: {
          text: '你压下怒火，侧身让路。他怔了怔，冷哼一声去了。你心头那根刺，似松动了一分，却也有些发苦。',
          effects: [{ k: 'daoxin', v: 10 }, { k: 'haste', v: -10 }, { k: 'merit', v: 10 }, { k: 'repute', v: -5 }]
        }
      },
      {
        label: '言语化仇',
        hint: '考验：悟性',
        check: { stat: 'insight', dc: 15 },
        success: {
          text: '你以言语化解，说到当年彼此皆非，二人竟相视一笑，冰释前嫌。那剑柄，也缓缓松了。你定了定神，复又恢复了从容。',
          effects: [{ k: 'merit', v: 20 }, { k: 'daoxin', v: 8 }, { k: 'repute', v: 8 }]
        },
        fail: {
          text: '你越说越僵，他怒喝一声，拔剑斩来。多说无益，唯有手上见真章。暮色渐合，山影也淡了下去。',
          effects: [{ k: 'combat', enemy: 'auto' }]
        }
      }
    ]
  },

  // ===================== 遗宝 relic（8） =====================
  {
    id: 'ev_gumu',
    title: '古墓',
    weight: 3,
    once: true,
    tag: 'relic',
    cond: { realmMin: 3, loc: ['gulong_xu'], features: ['ruin'] },
    text: '你在一处塌陷的山体后，见到一座被藤蔓掩蔽的古墓，石门半开，内有阴风如泣，也有极淡的宝光自门缝透出。墓道幽深，不知埋着怎样的主人，亦不知还有何等机关。藤影在风里摇晃，如无数只手，向你轻轻招着。你屏息听去，那阴风里，似还夹着极轻的钟鸣。',
    choices: [
      {
        label: '深入探墓',
        hint: '考验：气运',
        check: { stat: 'luck', dc: 16 },
        success: {
          text: '你破开机关，直入主室，得前朝遗宝一箱，其中那口古钟尤为不凡，钟身隐隐有云纹流转。',
          effects: [{ k: 'stone', v: 400 }, { k: 'artifact', id: 'a_wuji_zhong' }]
        },
        fail: {
          text: '你触动翻板，跌得七荤八素，只抢得几枚散落的灵石，狼狈逃出，一身尘土。这其中的滋味，只有你自己知晓。',
          effects: [{ k: 'stone', v: 150 }, { k: 'hurtPct', v: 30 }]
        }
      },
      {
        label: '焚香祭拜',
        hint: '敬墓主，不惊亡灵',
        outcome: {
          text: '你于墓前焚香祭拜。阴风渐止，似有墓主之灵于梦中谢你，授你一段道法，醒来犹在心头。',
          effects: [{ k: 'merit', v: 20 }, { k: 'daoxin', v: 6 }, { k: 'dao', v: 300 }]
        }
      },
      {
        label: '封门而去',
        hint: '不取不义，守心自持',
        outcome: {
          text: '你搬石掩住门缝，不取一物。离去的路上，心头如释重负，只觉这山风都格外清爽。你回首望了一眼，复又向前行去。',
          effects: [{ k: 'daoxin', v: 8 }, { k: 'dao', v: 150 }]
        }
      }
    ]
  },

  {
    id: 'ev_jianzhong',
    title: '剑冢',
    weight: 3,
    once: true,
    tag: 'relic',
    cond: { realmMin: 4, loc: ['jinshi_dong'], features: ['ruin'] },
    text: '万剑插地，锈迹斑斑，如一片倒插的寒林。风过时，千剑齐鸣，声如鬼哭。传说这里埋着一柄曾斩龙的古剑，剑灵不灭，专候有缘。亦有剑，专斩贪心之人。你甫一靠近，便觉无数剑意如芒在背。那锈剑上的风霜，一望便知都是故事。',
    choices: [
      {
        label: '以血引剑',
        hint: '考验：攻',
        check: { stat: 'atk', dc: 17 },
        success: {
          text: '你割指滴血，一柄古剑嗡鸣出鞘，剑光如雪。白虎之魄，自此认你为主，剑鸣久久不绝。一时之间，你也说不清是喜是怅。',
          effects: [{ k: 'artifact', id: 'a_baihu_po' }]
        },
        fail: {
          text: '剑未认主，反噬而来，剑光掠过你的手臂，血洒剑林。千剑齐震，似在嘲笑你的不自量力。',
          effects: [{ k: 'hurtPct', v: 25 }, { k: 'daoxin', v: -5 }]
        }
      },
      {
        label: '拜剑不取',
        hint: '敬剑之灵，不夺其主',
        outcome: {
          text: '你对着剑林躬身三拜。千剑齐鸣，声如送别，一道剑气入你识海，化作一段剑意，锋锐内敛。',
          effects: [{ k: 'merit', v: 15 }, { k: 'daoxin', v: 8 }, { k: 'dao', v: 400 }]
        }
      },
      {
        label: '取一凡剑',
        hint: '不求神兵，但求合用',
        outcome: {
          text: '你择了一柄尚存锋锐的旧剑，佩在腰间。虽非神兵，却也趁手，剑鞘上锈迹如花。钟声渺渺，似从极远处传来。',
          effects: [{ k: 'stone', v: 100 }, { k: 'dao', v: 50 }]
        }
      }
    ]
  },

  {
    id: 'ev_danshi',
    title: '丹室残炉',
    weight: 3,
    once: true,
    tag: 'relic',
    cond: { realmMin: 3, loc: ['liehuo_yuan'], features: ['forge'] },
    text: '山腹中藏着一间丹室，丹炉已冷，四壁药架倾颓，唯炉底还压着半张丹方，字迹是某位前辈的绝笔。炉中余灰里，似有未炼成的丹胚，微微放光。壁上还挂着几味干枯的草药，一碰便碎成齑粉。你吹去丹方上的浮灰，那字迹在昏暗中愈发清晰。',
    choices: [
      {
        label: '参研丹方',
        hint: '考验：悟性',
        check: { stat: 'insight', dc: 17 },
        success: {
          text: '你细读绝笔，丹道至理自字间流出，直入你心。太乙无极，返先天之秘，得窥门径，如获传承。',
          effects: [{ k: 'tech', id: 't_taiyi_wuji' }, { k: 'dao', v: 500 }]
        },
        fail: {
          text: '你依方试炼，炉中轰然炸开，你被气浪掀翻，只抢得一枚丹胚，满面焦黑，狼狈不堪。一时之间，天地都显得格外安静。',
          effects: [{ k: 'herb', id: 'random', v: 1 }, { k: 'hurtPct', v: 20 }]
        }
      },
      {
        label: '取走丹胚',
        hint: '取丹胚，不贪丹方',
        outcome: {
          text: '你取走炉中丹胚，又将丹方原样压好，留给后来人。得之有限，心却安然，也算不贪。山风掠过，带来一阵草木清气。',
          effects: [{ k: 'herb', id: 'random', v: 2 }, { k: 'dao', v: 100 }]
        }
      },
      {
        label: '封存丹室',
        hint: '不取不留，封存以待',
        outcome: {
          text: '你退出丹室，搬石封门。那半张绝笔，且待有缘再来。你拍了拍衣上尘土，飘然远去。你心头起伏，久久未能平息。',
          effects: [{ k: 'flag', id: 'danshi' }, { k: 'dao', v: 150 }]
        }
      }
    ]
  },

  {
    id: 'ev_fengmobei',
    title: '封魔碑',
    weight: 3,
    once: true,
    tag: 'relic',
    cond: { realmMin: 4, loc: ['jiuyou_yuan'], features: ['ruin'] },
    text: '一块通体漆黑的巨碑立在荒原，碑上刻满镇魔符文，如无数锁链缠住碑体。碑下压着的东西，隔着碑石也能感到一股暴戾的呼吸。碑角缺了一小块，符文似有松动之象。你尚未走近，便觉那呼吸一沉，似在暗中盯着你。荒草在碑根疯长，独独绕开了那一圈焦土。',
    choices: [
      {
        label: '修补碑文',
        hint: '耗精补碑，镇此魔物',
        cost: { jing: 40 },
        outcome: {
          text: '你咬破指尖，以精血补全那缺损的符文。碑下呼吸渐弱，一缕正气渡入你身，如沐暖阳，通体舒泰。',
          effects: [{ k: 'merit', v: 50 }, { k: 'karma', v: -15 }, { k: 'daoxin', v: 10 }, { k: 'dao', v: 400 }]
        }
      },
      {
        label: '借碑悟符',
        hint: '考验：悟性',
        check: { stat: 'insight', dc: 18 },
        success: {
          text: '你参那镇魔符文，悟得厚土镇岳之要，以己身为碑，可镇诸邪。那些符文，如刻进了你的血脉。',
          effects: [{ k: 'tech', id: 't_houtu_zhenyue' }, { k: 'dao', v: 500 }]
        },
        fail: {
          text: '符文反噬，碑下魔气趁隙侵神，你只觉心魔大炽，头痛欲裂，踉跄退避，久久不能平静。此事过后，那余韵仍久久不散。',
          effects: [{ k: 'daoxin', v: -10 }, { k: 'shen', v: -30 }]
        }
      },
      {
        label: '挖开一角',
        hint: '贪图魔宝，自招祸殃',
        outcome: {
          text: '你撬开碑角，取那被压之物。魔气冲天，你被扫出老远，只攥得一块幽黑残铁，周身俱痛。',
          effects: [{ k: 'stone', v: 300 }, { k: 'hurtPct', v: 30 }, { k: 'karma', v: 40 }]
        }
      }
    ]
  },

  {
    id: 'ev_longhai',
    title: '龙骸',
    weight: 2,
    once: true,
    tag: 'relic',
    cond: { realmMin: 5, loc: ['beiming_hai'] },
    text: '北冥之滨，潮水退去，露出半截巨大的龙骨，白森森如一道长堤。龙虽死，威犹在，龙鳞间有残余的雷霆与海气游走。传说龙骸有灵，取其精血可壮体魄，辱其骸骨则遭海怒。海风裹着咸腥，如龙的叹息。你踩在湿沙上，每走一步，都听得见浪的回响。',
    choices: [
      {
        label: '取髓炼体',
        hint: '考验：精',
        check: { stat: 'jing', dc: 18 },
        success: {
          text: '你破开龙骨，取髓炼体。龙力入体，筋骨暴涨，竟还冲开一条经脉，如江河改道，气象一新。',
          effects: [{ k: 'maxJing', v: 20 }, { k: 'jing', v: 100 }, { k: 'meridian', v: 1 }]
        },
        fail: {
          text: '龙威反噬，如万钧海潮压顶，你口喷鲜血，倒飞出去，在沙滩上砸出一个浅坑。你把这番际遇，悄悄记在了心底。',
          effects: [{ k: 'hurtPct', v: 30 }, { k: 'daoxin', v: -5 }]
        }
      },
      {
        label: '拜祭龙骸',
        hint: '敬其残灵，不辱遗骨',
        outcome: {
          text: '你于龙骸前焚香拜祭。海风骤起，一缕龙魂眷顾，水灵之气浸入你身，如海纳百川，温润悠长。',
          effects: [{ k: 'affinity', element: 'shui', v: 4 }, { k: 'merit', v: 20 }, { k: 'dao', v: 300 }]
        }
      },
      {
        label: '刮鳞取宝',
        hint: '贪图龙鳞，海怒将至',
        outcome: {
          text: '你刮下几片龙鳞。霎时乌云压海，巨浪打来，你被拍得七荤八素，怀里的龙鳞也掉了几片。',
          effects: [{ k: 'stone', v: 400 }, { k: 'hurtPct', v: 15 }, { k: 'karma', v: 30 }]
        }
      }
    ]
  },

  {
    id: 'ev_chenchuan',
    title: '沉船',
    weight: 3,
    once: true,
    tag: 'relic',
    cond: { realmMin: 3, loc: ['beiming_hai'] },
    text: '海面之下，隐约可见一艘沉船，桅杆斜指苍穹，船身爬满海藻与藤壶。相传百年前一艘运宝船在此触礁，满船灵石法宝尽没海底。水幽而冷，深处似有阴影游过。浪花一遍遍拍着礁石，如重复着百年前的沉没。你立在崖边，海风把水汽吹了你一脸。',
    choices: [
      {
        label: '潜水寻宝',
        hint: '考验：炁',
        check: { stat: 'qi', dc: 16 },
        success: {
          text: '你闭气下潜，破开舱门，竟得一箱重宝，其中那方古璧尤为温润，出水时还带着幽蓝的光。',
          effects: [{ k: 'stone', v: 600 }, { k: 'artifact', id: 'a_hetu_bi' }]
        },
        fail: {
          text: '海底暗流一卷，你被礁石划得满身是伤，只捞得一把散碎灵石，呛着水浮上来。四下里静极，只余风声与你。',
          effects: [{ k: 'stone', v: 100 }, { k: 'hurtPct', v: 25 }]
        }
      },
      {
        label: '以炁避水',
        hint: '耗炁护体，只取浅处',
        cost: { qi: 40 },
        outcome: {
          text: '你以炁避水，只探得船缘浅处，取回些许灵石，见好就收。那幽深的海，你终未去碰。你定了定神，复又恢复了从容。',
          effects: [{ k: 'stone', v: 200 }]
        }
      },
      {
        label: '望海兴叹',
        hint: '不涉险地，留得此身',
        outcome: {
          text: '你望了望那幽深海水，转身而去。有些财，不取也罢。海风送你一程，衣袂猎猎。暮色渐合，山影也淡了下去。',
          effects: [{ k: 'dao', v: 100 }, { k: 'daoxin', v: 5 }]
        }
      }
    ]
  },

  {
    id: 'ev_zuohua',
    title: '坐化洞',
    weight: 2,
    once: true,
    tag: 'relic',
    cond: { realmMin: 4, loc: ['tianzhu_feng'], features: ['altar', 'ruin'] },
    text: '绝顶有一处天然石洞，洞中端坐着一位道尊的遗蜕，肉身不腐，面带微笑，如入定千年。他身前蒲团下压着一卷道书，石壁上刻着四个字：“得者勿贪。” 洞外云海翻涌，仿佛天地也在守护这一坐。你放轻脚步，如怕惊扰千年清梦。那遗蜕的衣角，已结了薄薄的霜。',
    choices: [
      {
        label: '叩首求道',
        hint: '三拜九叩，诚心求法',
        outcome: {
          text: '你三拜九叩，礼数周全。遗蜕眉心忽射出一缕清光，没入你顶，无为真经，自此相传，寿元亦增。',
          effects: [{ k: 'tech', id: 't_wuwei_zhenjing' }, { k: 'dao', v: 800 }, { k: 'daoxin', v: 12 }, { k: 'lifespan', v: 20 }]
        }
      },
      {
        label: '直取道书',
        hint: '贪快取书，惊动禁制',
        outcome: {
          text: '你上前直取道书，洞内禁制轰然发动，你被击退，却仍抢得半卷残经，只是心头一阵发虚。',
          effects: [{ k: 'tech', id: 't_taiyi_wuji' }, { k: 'hurtPct', v: 30 }, { k: 'karma', v: 10 }]
        }
      },
      {
        label: '坐其对面',
        hint: '考验：悟性',
        check: { stat: 'insight', dc: 18 },
        success: {
          text: '你坐于遗蜕对面，闭目神交。千年道韵滚滚而来，你如醍醐灌顶，周身似有云霞流转。这其中的滋味，只有你自己知晓。',
          effects: [{ k: 'dao', v: 900 }, { k: 'insight', v: 2 }]
        },
        fail: {
          text: '你强与之神交，却被千年道韵震得神魂俱颤，口鼻渗血，只得伏地调息良久。你回首望了一眼，复又向前行去。',
          effects: [{ k: 'shen', v: -30 }, { k: 'daoxin', v: -5 }]
        }
      }
    ]
  },

  {
    id: 'ev_wuzi',
    title: '无字玉简',
    weight: 2,
    once: true,
    tag: 'relic',
    cond: { realmMin: 3 },
    text: '你于山溪中拾得一枚玉简，触手温凉，展开却无半个字。对光而照，似有云气在玉中流动。有人说无字者，乃大道无言；也有人说，此简非有缘者不能读。溪水在你脚边潺潺，似也在低语这玉简的来历。你把它对着天光，那云气便聚了又散。',
    choices: [
      {
        label: '静坐读简',
        hint: '考验：悟性',
        check: { stat: 'insight', dc: 20 },
        success: {
          text: '你静坐读简，以心印心。玉中云气化道，直入识海，无字处竟悟得真经，如大音希声，大象无形。',
          effects: [{ k: 'techRandom', tier: 4 }, { k: 'dao', v: 1000 }, { k: 'insight', v: 2 }]
        },
        fail: {
          text: '你读到日暮，玉简上仍无一字，只当是块寻常玉石，只得收起，暗自怅然。一时之间，你也说不清是喜是怅。',
          effects: [{ k: 'dao', v: 50 }]
        }
      },
      {
        label: '滴血认主',
        hint: '考验：气运',
        check: { stat: 'luck', dc: 16 },
        success: {
          text: '你滴血其上，玉简血光大盛，云气化字，认你为主。那些字如活物，钻入你的识海。钟声渺渺，似从极远处传来。',
          effects: [{ k: 'techRandom', tier: 3 }, { k: 'dao', v: 500 }]
        },
        fail: {
          text: '血珠滚落，玉简纹丝不动。你白费了一滴心头血，只余指尖一点刺痛。一时之间，天地都显得格外安静。',
          effects: [{ k: 'jing', v: -30 }]
        }
      },
      {
        label: '留简于溪',
        hint: '不取不贪，任其自去',
        outcome: {
          text: '你将玉简放回溪中，任流水带走。无字之简，或该归于无字之处，你心中反得一份从容。山风掠过，带来一阵草木清气。',
          effects: [{ k: 'dao', v: 200 }, { k: 'daoxin', v: 10 }]
        }
      }
    ]
  },

  // ===================== 凶险 danger（6） =====================
  {
    id: 'ev_dihuo',
    title: '地火喷发',
    weight: 6,
    once: false,
    tag: 'danger',
    cond: { loc: ['liehuo_yuan'] },
    text: '脚下忽然发烫，山体深处传来滚雷般的闷响，石缝间喷出硫磺气息。这是地火将喷的前兆。往西是开阔的石滩，往东是狭窄的山道，往北尚可寻一株古树攀附。热浪阵阵，蒸得空气都扭曲起来，脚下的小石子开始不安地跳动。',
    choices: [
      {
        label: '奔向石滩',
        hint: '避其锋锐，先保性命',
        outcome: {
          text: '你向西疾奔，地火喷涌，热浪灼背，你终究还是逃了出来，只被燎伤几处，衣角也焦了。你心头起伏，久久未能平息。',
          effects: [{ k: 'hurtPct', v: 10 }, { k: 'jing', v: -10 }]
        }
      },
      {
        label: '逆冲地火',
        hint: '考验：炁',
        check: { stat: 'qi', dc: 16 },
        success: {
          text: '你竟逆势冲入地火边缘，以火淬体。烈焰灼身，筋骨却愈发坚实，如百炼成钢，浴火重生。',
          effects: [{ k: 'maxJing', v: 10 }, { k: 'jing', v: 60 }]
        },
        fail: {
          text: '你低估了地火之威，烈焰卷来，你浑身焦黑，痛彻心扉，连滚带爬才逃出火海。此事过后，那余韵仍久久不散。',
          effects: [{ k: 'hurtPct', v: 30 }]
        }
      },
      {
        label: '僵立不动',
        hint: '惊惧失神，其祸最烈',
        outcome: {
          text: '你一时惊得动弹不得，地火轰然喷发，将你卷飞出去，只觉天地倒转，灼痛彻骨。你把这番际遇，悄悄记在了心底。',
          effects: [{ k: 'hurtPct', v: 40 }, { k: 'daoxin', v: -8 }]
        }
      }
    ]
  },

  {
    id: 'ev_xinmo',
    title: '心魔幻境',
    weight: 6,
    once: false,
    tag: 'danger',
    cond: { features: ['cultivate'] },
    text: '入定之中，眼前忽现幻境：故人、仇人、所失、所得，如走马灯般涌来，每一个都牵动你最深的执念。你知这是心魔，可那声音句句都说到你心坎里。幻境里烛影摇红，那些面孔，一个比一个真切。他们围着你，说着你放不下，也躲不开的话。',
    choices: [
      {
        label: '守心不随',
        hint: '考验：道心',
        check: { stat: 'daoxin', dc: 15 },
        success: {
          text: '你任那幻境明灭，如看他人故事。心魔无隙可入，只得悻悻退去，你心神愈定，如磐石不移。',
          effects: [{ k: 'daoxin', v: 10 }, { k: 'shen', v: 40 }, { k: 'dao', v: 300 }]
        },
        fail: {
          text: '你终究还是动了念，心魔趁虚而入，撕扯你的心神，幻境中那些人影，都向你扑来。四下里静极，只余风声与你。',
          effects: [{ k: 'daoxin', v: -10 }, { k: 'shen', v: -40 }]
        }
      },
      {
        label: '顺境而行',
        hint: '随幻而行，或悟其幻',
        outcome: {
          text: '你索性顺着幻境走一遭。醒来虽神思疲惫，却也因此看清了几分执念之幻，如大梦初醒。你定了定神，复又恢复了从容。',
          effects: [{ k: 'shen', v: -30 }, { k: 'haste', v: 15 }, { k: 'insight', v: 1 }]
        }
      },
      {
        label: '强行破境',
        hint: '强破幻境，两败俱伤',
        outcome: {
          text: '你强催神魂破境。幻境碎了，你也被反震得气血翻涌，跌出定中，一时半晌动弹不得。暮色渐合，山影也淡了下去。',
          effects: [{ k: 'daoxin', v: -5 }, { k: 'hurtPct', v: 15 }, { k: 'shen', v: -20 }]
        }
      }
    ]
  },

  {
    id: 'ev_zhangqi',
    title: '瘴气',
    weight: 8,
    once: false,
    tag: 'danger',
    cond: { loc: ['mihun_lin'] },
    text: '密林深处，瘴气如青灰色的纱，贴着地面缓缓流动，腐叶之下有细小的气泡翻涌。瘴气入体，轻则昏聩，重则蚀骨。你只觉太阳穴突突直跳，胸口发闷。林间鸟兽绝迹，静得能听见瘴气漫过的沙沙声。一片叶子在瘴气里迅速卷曲、发黑。',
    choices: [
      {
        label: '以炁护体',
        hint: '耗炁屏息，稳稳穿林',
        cost: { qi: 40 },
        outcome: {
          text: '你以炁护住口鼻，屏息穿林。瘴气虽浓，未能侵你分毫，只是走得出林时，略觉气短。这其中的滋味，只有你自己知晓。',
          effects: [{ k: 'jing', v: -10 }]
        }
      },
      {
        label: '屏息疾奔',
        hint: '考验：精',
        check: { stat: 'jing', dc: 15 },
        success: {
          text: '你深吸一口气，拔足疾奔，竟在瘴气合拢之前冲出了林，回望身后，青雾翻涌如沸。你回首望了一眼，复又向前行去。',
          effects: [{ k: 'dao', v: 50 }]
        },
        fail: {
          text: '你奔到半途，气力不济，一口瘴气呛入肺腑，咳得弓了腰，只觉天旋地转。一时之间，你也说不清是喜是怅。',
          effects: [{ k: 'hurtPct', v: 25 }, { k: 'daoxin', v: -3 }]
        }
      },
      {
        label: '采瘴炼丹',
        hint: '考验：悟性',
        check: { stat: 'insight', dc: 17 },
        success: {
          text: '你以瓶收取瘴气，欲炼一味偏门丹药。虽染了些毒，却也得了一份奇材，算是险中求财。钟声渺渺，似从极远处传来。',
          effects: [{ k: 'herb', id: 'random', v: 1 }, { k: 'dao', v: 200 }, { k: 'hurtPct', v: 10 }]
        },
        fail: {
          text: '你未及收瓶，瘴气扑面而来，你只觉天旋地转，头重脚轻，踉跄着跌出林外。一时之间，天地都显得格外安静。',
          effects: [{ k: 'hurtPct', v: 30 }]
        }
      }
    ]
  },

  {
    id: 'ev_xuebeng',
    title: '雪崩',
    weight: 6,
    once: false,
    tag: 'danger',
    cond: { loc: ['hanyu_gu'] },
    text: '万籁俱寂，唯有雪粒落在肩头的微响。忽然，一声极轻的“咔”，自雪山深处传来，随即是闷雷般的轰鸣——雪崩了。白浪如海，自高处倾泻而下，整座山都在微微发颤。你仰头望去，那雪浪已近在咫尺，遮天蔽日。',
    choices: [
      {
        label: '横移避锋',
        hint: '考验：精',
        check: { stat: 'jing', dc: 15 },
        success: {
          text: '你看准雪流方向，横移数丈，堪堪避开主流，只被雪雾扑了一身，冷得直打颤。山风掠过，带来一阵草木清气。',
          effects: [{ k: 'hurtPct', v: 10 }]
        },
        fail: {
          text: '你慢了半步，被雪浪卷走，埋入雪下，挣扎良久才爬出，只觉四肢冻得发僵。你心头起伏，久久未能平息。',
          effects: [{ k: 'hurtPct', v: 35 }]
        }
      },
      {
        label: '以炁撑壁',
        hint: '耗炁撑壁，护住己身',
        cost: { qi: 60 },
        outcome: {
          text: '你鼓足炁劲，撑起一面气墙。雪浪拍来，你被压得单膝跪地，终是撑了过去，只余满身冰碴。',
          effects: [{ k: 'hurtPct', v: 15 }]
        }
      },
      {
        label: '顺坡滚下',
        hint: '考验：气运',
        check: { stat: 'luck', dc: 14 },
        success: {
          text: '你顺势滚下，借雪势卸力，竟只擦破几处皮肉，从雪堆里钻出时，还有几分庆幸。此事过后，那余韵仍久久不散。',
          effects: [{ k: 'hurtPct', v: 12 }]
        },
        fail: {
          text: '你滚错了方向，撞上一块暗石，肋骨折断般的疼，抱着胸口半晌说不出话。你把这番际遇，悄悄记在了心底。',
          effects: [{ k: 'hurtPct', v: 40 }]
        }
      }
    ]
  },

  {
    id: 'ev_jieyun',
    title: '劫云误至',
    weight: 5,
    once: false,
    tag: 'danger',
    cond: { features: ['tribulation'] },
    text: '天边劫云翻涌，紫电如蛇，却并非冲你而来——是附近有人渡劫，劫雷劈错了方向，正朝你头顶聚来。逃，未必快过雷；抗，则以凡躯接天威。那劫云越压越低，空气里尽是焦灼的雷腥气。你甚至能看见云层里，紫电如龙蛇般纠缠。',
    choices: [
      {
        label: '伏地避雷',
        hint: '考验：气运',
        check: { stat: 'luck', dc: 14 },
        success: {
          text: '你伏地屏息，那劫雷擦着你身侧劈下，只麻了半边身子，耳畔嗡嗡，久久不绝。四下里静极，只余风声与你。',
          effects: [{ k: 'hurtPct', v: 5 }]
        },
        fail: {
          text: '劫雷不偏不倚，正劈在你背上，你眼前一黑，好半晌才从焦糊味中回过神来。你定了定神，复又恢复了从容。',
          effects: [{ k: 'hurtPct', v: 30 }]
        }
      },
      {
        label: '举器引雷',
        hint: '考验：攻',
        check: { stat: 'atk', dc: 17 },
        success: {
          text: '你举器引雷，那紫电没入兵刃，竟被你炼化入体，炁海雷光滚滚，如得一份天大的机缘。暮色渐合，山影也淡了下去。',
          effects: [{ k: 'maxQi', v: 10 }, { k: 'qi', v: 80 }, { k: 'dao', v: 300 }]
        },
        fail: {
          text: '你引雷失败，天威贯体，你被劈得外焦里嫩，须发倒竖，浑身麻得提不起劲。这其中的滋味，只有你自己知晓。',
          effects: [{ k: 'hurtPct', v: 40 }]
        }
      },
      {
        label: '远遁百里',
        hint: '耗炁遁走，避其锋芒',
        cost: { qi: 50 },
        outcome: {
          text: '你催动身法，远遁百里。身后雷声隆隆，已与你无关，你停下时，仍心有余悸。你回首望了一眼，复又向前行去。',
          effects: [{ k: 'dao', v: 50 }]
        }
      }
    ]
  },

  {
    id: 'ev_zouhuo',
    title: '走火之兆',
    weight: 8,
    once: false,
    tag: 'danger',
    cond: { features: ['cultivate'] },
    text: '行功至半，忽觉丹田之气如脱缰野马，沿经脉乱窜，四肢百骸又冷又热。这是走火入魔之兆。此刻强行镇压，或爆体；顺其气走，或伤经脉；散功而出，则前功尽弃。豆大的汗珠，一颗颗从你额角滚落，打湿了衣襟。',
    choices: [
      {
        label: '徐徐疏导',
        hint: '考验：炁',
        check: { stat: 'qi', dc: 15 },
        success: {
          text: '你不慌不乱，导气归元，那乱窜之气渐次归顺，竟还壮大了几分，如驯服了一匹烈马。一时之间，你也说不清是喜是怅。',
          effects: [{ k: 'qi', v: 40 }, { k: 'dao', v: 100 }]
        },
        fail: {
          text: '你疏导不及，气走岔路，几条经脉火辣辣地疼，如被火线灼过，只得停功调息。钟声渺渺，似从极远处传来。',
          effects: [{ k: 'hurtPct', v: 20 }, { k: 'daoxin', v: -5 }]
        }
      },
      {
        label: '散功保命',
        hint: '舍了此功，保全自身',
        outcome: {
          text: '你当机立断，散去此功。辛辛苦苦积的炁，如流水般泄去，好歹保住了命，只觉一身虚脱。',
          effects: [{ k: 'qi', v: -50 }]
        }
      },
      {
        label: '强压气海',
        hint: '考验：精',
        check: { stat: 'jing', dc: 16 },
        success: {
          text: '你以精元强压气海，竟硬生生镇住了暴走之气，只是心头添了几分躁意，如压住一座活火山。',
          effects: [{ k: 'jing', v: 60 }, { k: 'haste', v: 10 }]
        },
        fail: {
          text: '你强行镇压，气海震荡，一口逆血喷出，经脉欲裂，只觉五脏六腑都移了位。一时之间，天地都显得格外安静。',
          effects: [{ k: 'hurtPct', v: 35 }, { k: 'daoxin', v: -8 }]
        }
      }
    ]
  },

  // ===================== 妖魔 demon（4） =====================
  {
    id: 'ev_modao',
    title: '魔道邀约',
    weight: 3,
    once: true,
    tag: 'demon',
    cond: { realmMin: 2 },
    text: '夜半，一盏青灯无端亮起，灯下有一道黑衣身影，看不清面目。那人声音如蜜，说念你根骨不凡，正道清苦，不如入我魔道，立得魔元灌顶、灵石万千。只消你点点头，签下这一纸血契。灯焰幽幽，映得那血契上的字如活物般蠕动。那人的影子，比你见过的任何影子都长。',
    choices: [
      {
        label: '断然拒绝',
        hint: '守正不阿，魔头退去',
        outcome: {
          text: '你断然拒绝，将血契掷还。黑影冷笑数声，青灯骤灭，只留余音绕梁不去，如附骨之蛆。山风掠过，带来一阵草木清气。',
          effects: [{ k: 'daoxin', v: 15 }, { k: 'merit', v: 30 }, { k: 'flag', id: 'modao_jue' }]
        }
      },
      {
        label: '虚与委蛇',
        hint: '考验：悟性',
        check: { stat: 'insight', dc: 16 },
        success: {
          text: '你假意应允，套出魔窟方位后抽身而退。黑影怒极，却已追你不及，只余满室冷风。你心头起伏，久久未能平息。',
          effects: [{ k: 'merit', v: 10 }, { k: 'flag', id: 'modao_ku' }]
        },
        fail: {
          text: '你心思被看穿，黑影暴起，一只魔爪已探到你面门。避无可避，唯有迎上。此事过后，那余韵仍久久不散。',
          effects: [{ k: 'combat', enemy: 'auto' }]
        }
      },
      {
        label: '签下血契',
        hint: '魔元灌顶，万劫不复',
        outcome: {
          text: '你咬破指尖，签下血契。魔元灌顶，力量暴涨，只是那灯下的人影，从此住进了你的影子里。',
          effects: [{ k: 'qi', v: 200 }, { k: 'maxQi', v: 20 }, { k: 'karma', v: 80 }, { k: 'balance', v: -40 }]
        }
      }
    ]
  },

  {
    id: 'ev_yaowang',
    title: '妖王讨路',
    weight: 4,
    once: false,
    tag: 'demon',
    cond: { loc: ['mihun_lin'] },
    text: '一头巨妖拦住去路，形如苍狼却人立而行，双目赤红，口吐人言：“此山是我家，过路留下买路财，或与我打一场，赢了我自放你过去。”它身后，还有数头小妖龇牙相和。那獠牙上的涎水，一滴滴砸在地上。你不动，它也不急，只把一双红眼在你身上来回打量。',
    choices: [
      {
        label: '拔剑一战',
        hint: '不愿纳贡，以武开路',
        outcome: {
          text: '你缓缓拔出剑来。妖王咧嘴一笑，露出森白獠牙，低吼一声，扑将上来。你把这番际遇，悄悄记在了心底。',
          effects: [{ k: 'combat', enemy: 'auto' }]
        }
      },
      {
        label: '留下买路财',
        hint: '破财消灾，助长妖焰',
        cost: { stone: 150 },
        outcome: {
          text: '你丢下一袋灵石。妖王掂了掂，挥手放行，还不忘提醒你“常来”。你只觉如吞了只苍蝇。',
          effects: [{ k: 'karma', v: 10 }]
        }
      },
      {
        label: '智言周旋',
        hint: '考验：悟性',
        check: { stat: 'insight', dc: 15 },
        success: {
          text: '你三言两语，捧得那妖王心花怒放，竟与你称兄道弟，亲自开路，还让手下小妖送你一程。',
          effects: [{ k: 'repute', v: 5 }, { k: 'dao', v: 100 }]
        },
        fail: {
          text: '你一句话触了它的逆鳞，妖王怒嚎一声，挥爪拍来。话不投机，唯有动手。四下里静极，只余风声与你。',
          effects: [{ k: 'combat', enemy: 'auto' }]
        }
      }
    ]
  },

  {
    id: 'ev_guishi',
    title: '鬼市',
    weight: 3,
    once: true,
    tag: 'demon',
    cond: { loc: ['jiuyou_yuan'] },
    text: '子时，荒山野岭忽现一条长街，灯火通明，买卖者皆是影影绰绰的鬼魅。摊上奇珍异宝琳琅满目，价廉物美，只是每一件都似有阴气缠绕。有鬼商朝你招手，笑得诡谲。那灯火青幽幽的，照得人脸发绿。你这才发觉，这街上，竟没有一个人的影子。',
    choices: [
      {
        label: '入市淘买',
        hint: '阴界奇珍，阴气缠身',
        cost: { stone: 200 },
        outcome: {
          text: '你以灵石换得一盏九转铜炉。那炉入手冰凉，阴气顺腕而上，你打了个寒噤，如坠冰窟。你定了定神，复又恢复了从容。',
          effects: [{ k: 'artifact', id: 'a_jiuzhuan_lu' }, { k: 'balance', v: -15 }, { k: 'karma', v: 10 }]
        }
      },
      {
        label: '掉头就走',
        hint: '不入险地，守心自持',
        outcome: {
          text: '你强压下好奇，掉头就走。身后灯火渐远，如一场未做完的梦，你始终没有回头。暮色渐合，山影也淡了下去。',
          effects: [{ k: 'daoxin', v: 8 }, { k: 'dao', v: 100 }]
        }
      },
      {
        label: '假扮鬼商',
        hint: '考验：气运',
        check: { stat: 'luck', dc: 16 },
        success: {
          text: '你学着鬼魅模样混入其中，竟与鬼做成了几笔买卖，赚得盆满钵满，只是指尖凉得厉害。这其中的滋味，只有你自己知晓。',
          effects: [{ k: 'stone', v: 500 }, { k: 'balance', v: -10 }, { k: 'karma', v: 20 }]
        },
        fail: {
          text: '你装得不像，被一群厉鬼缠上，阴风透骨，狼狈逃出，回头时那长街已消失无踪。你回首望了一眼，复又向前行去。',
          effects: [{ k: 'hurtPct', v: 20 }, { k: 'daoxin', v: -8 }]
        }
      }
    ]
  },

  {
    id: 'ev_yaoteng',
    title: '噬灵妖藤',
    weight: 5,
    once: false,
    tag: 'demon',
    cond: { loc: ['wanyao_gu'], features: ['gather'] },
    text: '你正采集药草，脚下忽有藤蔓如蛇般缠来，藤上有细刺，刺破皮肉，竟在吮吸你的灵力。这噬灵妖藤以修士为食，越挣扎缠得越紧，唯有用火，或舍却灵力断尾求生。那藤蔓收紧，勒得你脚踝生疼，细刺处渗出几点血珠，转瞬便被吸干。',
    choices: [
      {
        label: '以火攻藤',
        hint: '考验：攻',
        check: { stat: 'atk', dc: 15 },
        success: {
          text: '你引火焚藤，那妖藤吃痛缩回，你趁机斩断主藤，还得了半截藤心，藤汁溅了一身。一时之间，你也说不清是喜是怅。',
          effects: [{ k: 'herb', id: 'random', v: 1 }, { k: 'dao', v: 200 }]
        },
        fail: {
          text: '火势未起，藤蔓先一步缠上你，吸走了不少灵力，你只觉身子一点点发软。钟声渺渺，似从极远处传来。',
          effects: [{ k: 'hurtPct', v: 25 }]
        }
      },
      {
        label: '断藤逃生',
        hint: '舍却灵力，先保性命',
        outcome: {
          text: '你狠心舍却一段灵力，抽身而退。妖藤得了便宜，也不再追，只是你脚步虚浮，气力大损。',
          effects: [{ k: 'jing', v: -40 }, { k: 'qi', v: -40 }]
        }
      },
      {
        label: '以身为饵',
        hint: '考验：悟性',
        check: { stat: 'insight', dc: 17 },
        success: {
          text: '你任其吸食，静待妖藤现出本体，寻得藤根一剑斩断，反得整段灵藤心，可谓险中求胜。一时之间，天地都显得格外安静。',
          effects: [{ k: 'herb', id: 'random', v: 2 }, { k: 'dao', v: 300 }]
        },
        fail: {
          text: '你诱敌不成，反被妖藤吸去大量灵力，几乎瘫软在地，拼了命才挣脱出来。山风掠过，带来一阵草木清气。',
          effects: [{ k: 'qi', v: -80 }, { k: 'hurtPct', v: 20 }]
        }
      }
    ]
  }
];
