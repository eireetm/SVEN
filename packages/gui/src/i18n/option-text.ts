// The card scripts' option labels (the Core's English, `label` in packages/core/src/script) in the card texts' other
// languages, quoted from the official Chinese and Japanese texts of the card in `card`: an option of a "choose" ability is
// that option's whole text, other options the matching clause (without "you may"). Keys with {0}, {1} ... are the labels
// scripts build: a number, a card's name or a listed part of a name goes there (game/options.ts puts it in the card text's
// language). A label that is exactly a card's name is not listed: the GUI shows the card's own name. Where the official
// Chinese text has an error the notes say what was written instead.
// New cards bring new labels: test/i18n.test.ts lists every label of the scripts missing here.

export interface OptionText {
  /** The card whose official texts are quoted. */
  card: string;
  cn: string;
  ja: string;
}

export const OPTION_TEXT: Readonly<Record<string, OptionText>> = {
  // BP01-005
  "Deal X damage to an enemy follower": { card: "BP01-005", cn: "选择敌方的1个从者。给予其与「这张卡的攻击力」等量的伤害", ja: "相手のフォロワー1体を選ぶ。それに「これの攻撃力」と同じダメージ" },
  "Give this follower Storm": { card: "BP01-005", cn: "使这张卡获得【疾驰】能力", ja: "これは【疾走】を持つ" },
  // BP01-057
  "Banish 10 spells in your cemetery: costs 7": { card: "BP01-057", cn: "将10张墓场中的法术卡消失：将消费变为7", ja: "墓場のスペル10枚を消滅：コストを7にする" },
  // BP01-067
  "Earth Rite: +1/+2": { card: "BP01-067", cn: "【土之秘术】使这张卡《攻击力》+1/《生命值》+2", ja: "【土の秘術】これは《攻撃力》+1/《体力》+2する" },
  "Summon a Magic Sediment": { card: "BP01-067", cn: "将1个『大地之魔片』召唤", ja: "『大地の魔片』1つを出す" },
  // BP01-103
  "Banish 4 Abysscraft cards in your EX area: costs 9 less": { card: "BP01-103", cn: "将EX区域的4张《梦魇职业》卡片消失：将消费-9", ja: "EXエリアの《ナイトメア》カード4枚を消滅：コストを-9する" },
  "Put 4 reserved Abysscraft cards from your field into the cemetery: costs 9 less": { card: "BP01-103", cn: "将场上的竖置状态的4张《梦魇职业》卡片置于墓场：将消费-9", ja: "場のスタンド状態の《ナイトメア》カード4枚を墓場に置く：コストを-9する" },
  // BP01-T12
  "Mimi, Infernal Right Paw": { card: "BP01-T12", cn: "米米", ja: "冥焔の右腕・ミミ" },
  // BP01-T13
  "Coco, Infernal Left Paw": { card: "BP01-T13", cn: "可可", ja: "冥焔の左腕・ココ" },
  // BP02-010
  "Give a Pixie follower on your field +2/+2": { card: "BP02-010", cn: "选择自己的1个妖精类型·从者。使其《攻击力》+2/《生命值》+2", ja: "自分の妖精・フォロワー1体を選ぶ。それは《攻撃力》+2/《体力》+2する" },
  "Search your deck for a Pixie follower": { card: "BP02-010", cn: "从自己的牌堆之中搜寻1张妖精类型·从者卡，并加入手牌", ja: "自分のデッキから妖精・フォロワー1枚を探し、手札に加える" },
  // BP02-021
  "Put a follower costing 3 or less from your hand onto your field": { card: "BP02-021", cn: "选择自己的手牌中的消费为3及以下的1张从者卡。将其召唤到场上", ja: "自分の手札のコスト3以下のフォロワー1枚を選ぶ。それを場に出す" },
  // BP02-045
  "Draw a card": { card: "BP02-045", cn: "抽取1张卡", ja: "1枚引く" },
  "Summon a Guardform Golem token": { card: "BP02-045", cn: "将1个『防御型巨像』召唤", ja: "『防御型ゴーレム』1体を出す" },
  // BP02-081
  "Give each Forest Bat on your field +1/+1": { card: "BP02-081", cn: "使自己的全体『丛林蝙蝠』各《攻击力》+1/《生命值》+1", ja: "自分の『フォレストバット』すべては《攻撃力》+1/《体力》+1する" },
  "Summon a Forest Bat for each enemy card on the field": { card: "BP02-081", cn: "将与「敌方场上的卡片的张数」等量的『丛林蝙蝠』召唤", ja: "『フォレストバット』を「相手の場のカードの枚数」と同じだけ出す" },
  // BP02-088
  "Put a follower costing 2 or less from your cemetery onto your field": { card: "BP02-088", cn: "选择自己的墓场中的消费为2及以下的1张从者卡。将其召唤到场上", ja: "自分の墓場のコスト2以下のフォロワー1枚を選ぶ。それを場に出す" },
  "Summon 2 Ghost tokens": { card: "BP02-088", cn: "将2个『怨灵』召唤", ja: "『ゴースト』2体を出す" },
  // BP02-106
  "Each opponent discards a card": { card: "BP02-106", cn: "敌方的全体玩家，各将自身的1张手牌舍弃", ja: "相手プレイヤーすべては、自身の手札1枚を捨てる" },
  "Gain 1 Evolution Point": { card: "BP02-106", cn: "将自己的EP+1", ja: "自分のEPを+1する" },
  "Give your leader +3 defense": { card: "BP02-106", cn: "使自己的主战者《生命值》+3", ja: "自分のリーダーは《体力》+3する" },
  // BP03-030
  "+1 attack; you may put a Fable counter": { card: "BP03-030", cn: "选择自己的1个从者。使其《攻击力》+1。可以将1个童话指示物置于到其上", ja: "自分のフォロワー1体を選ぶ。それは攻撃力+1する。それに童話カウンター1つを置いてよい" },
  "Return up to 3 Swordcraft followers, shuffle, draw": { card: "BP03-030", cn: "选择自己的墓场中的《皇家护卫职业》从者卡最多3张。将其放回牌堆，并洗切。抽取1张卡", ja: "自分の墓場のロイヤルフォロワー3枚まで選ぶ。それをデッキに戻し、シャッフルする。1枚引く" },
  // BP03-091
  "Gain Storm": { card: "BP03-091", cn: "使这张卡获得【疾驰】能力", ja: "これは【疾走】を持つ" },
  "Gain Ward": { card: "BP03-091", cn: "使这张卡获得【守护】能力", ja: "これは【守護】を持つ" },
  // BP03-117
  "Discard a Fallen Angel follower: +3 defense, draw": { card: "BP03-117", cn: "将手牌中的1张堕天使类型·从者卡舍弃：使自己的主战者《生命值》+3。抽取1张卡", ja: "手札の堕天使・フォロワー1枚を捨てる：自分のリーダーは体力+3する。1枚引く" },
  "Discard an Angel follower: destroy an enemy follower": { card: "BP03-117", cn: "将手牌中的1张天使类型·从者卡舍弃：选择敌方的1个从者。将其破坏", ja: "手札の天使・フォロワー1枚を捨てる：相手のフォロワー1体を選ぶ。それを破壊する" },
  // BP04-007
  "An enemy follower gets -2/-2": { card: "BP04-007", cn: "选择敌方的1个从者。使其《攻击力》-2/《生命值》-2", ja: "相手のフォロワー1体を選ぶ。それは攻撃力-2/体力-2する" },
  "Another follower of yours gets +2/+2": { card: "BP04-007", cn: "选择自己的其他的1个从者。使其《攻击力》+2/《生命值》+2", ja: "自分の他のフォロワー1体を選ぶ。それは攻撃力+2/体力+2する" },
  // BP04-021
  "X = {0}": { card: "BP04-021", cn: "X = {0}", ja: "X = {0}" },
  // BP04-031
  "An Arthurian follower of yours gets +1/+2": { card: "BP04-031", cn: "选择自己的1个圆桌类型·从者。使其《攻击力》+1/《生命值》+2", ja: "自分の円卓・フォロワー1体を選ぶ。それは攻撃力+1/体力+2する" },
  "Search for an Arthurian follower": { card: "BP04-031", cn: "从自己的牌堆之中搜寻1张圆桌类型·从者卡，并加入手牌", ja: "自分のデッキから円卓・フォロワー1枚を探し、手札に加える" },
  // BP04-066
  "Play for 5 more play points": { card: "BP04-066", cn: "将消费+5", ja: "コストを+5する" },
  // BP05-006
  "Can't draw a card during your next start phase": { card: "BP05-006", cn: "下个开始阶段中，不能抽取1张卡", ja: "次のスタートフェイズに1枚引けない" },
  "Can't increase your maximum play points during your next start phase": { card: "BP05-006", cn: "下个开始阶段中，不能将PP最大值+1点", ja: "次のスタートフェイズにPP最大値を+1できない" },
  "Can't play followers during your next main phase": { card: "BP05-006", cn: "下个主要阶段中，不能将从者卡使用", ja: "次のメインフェイズにフォロワーをプレイできない" },
  // BP05-041
  "Pay 2: deal X damage to each enemy follower": { card: "BP05-041", cn: "《消费2》：给予敌方场上的全体从者各与「自己场上的爱豆类型·卡片的张数」等量的伤害", ja: "コスト2：相手の場のフォロワーすべてに「自分の場のアイドル・カードの枚数」と同じダメージ" },
  "Search for a Lishenna, Omen of Destruction": { card: "BP05-041", cn: "从自己的牌堆之中搜寻1张『破坏绝杰·里榭娜』卡，并加入手牌", ja: "自分のデッキから『破壊の絶傑・リーシェナ』1枚を探し、手札に加える" },
  // BP05-044
  "Deal 3 damage to an enemy follower": { card: "BP05-044", cn: "选择敌方场上的1个从者。给予其3点伤害", ja: "相手の場のフォロワー1体を選ぶ。それに3ダメージ" },
  "Deal 3 damage to each enemy leader": { card: "BP05-044", cn: "给予敌方的全体主战者各3点伤害", ja: "相手のリーダーすべてに3ダメージ" },
  "Draw 2 cards": { card: "BP05-044", cn: "抽取2张卡", ja: "2枚引く" },
  // BP05-078
  "Give a follower on your field Rush": { card: "BP05-078", cn: "选择自己场上的1个从者。使其获得【突进】能力。给予自己的主战者1点伤害", ja: "自分の場のフォロワー1体を選ぶ。それは【突進】を持つ。自分のリーダーに1ダメージ" },
  // BP05-085
  "Each opponent discards a random card": { card: "BP05-085", cn: "敌方的全体玩家，各随机将自身的1张手牌舍弃", ja: "相手プレイヤーすべては、自身の手札をランダムに1枚捨てる" },
  // BP05-088
  "Discard your hand, then draw 4 cards": { card: "BP05-088", cn: "将自己的全部手牌舍弃。抽取4张卡", ja: "自分の手札すべてを捨てる。4枚引く" },
  "Recover 4 play points": { card: "BP05-088", cn: "将自己的PP回复4点", ja: "自分のPPを4回復する" },
  // BP05-100
  "Banish an enemy follower with 2 defense or less": { card: "BP05-100", cn: "选择生命值为2及以下的敌方场上的1个从者。将其消失", ja: "体力2以下の相手の場のフォロワー1体を選ぶ。それを消滅させる" },
  "Search for a Marwynn, Omen of Repose": { card: "BP05-100", cn: "从自己的牌堆之中搜寻1张『安息绝杰·玛文』卡，并加入手牌", ja: "自分のデッキから『安息の絶傑・マーウィン』1枚を探し、手札に加える" },
  // BP05-109
  "Destroy an enemy follower that costs 1": { card: "BP05-109", cn: "选择原始消费为1的敌方场上的1个从者。将其破坏", ja: "元のコスト1の相手の場のフォロワー1体を選ぶ。それを破壊する" },
  "Look at the top 5 cards": { card: "BP05-109", cn: "查看自己的牌堆顶5张卡。从那之中，可以将原始消费为1的1张从者卡公开并加入手牌。将剩余的卡以任意顺序置于牌库底", ja: "自分のデッキの上5枚を見る。その中から、元のコスト1のフォロワー1枚を公開して手札に加えてよい。残りを好きな順にデッキの下に置く" },
  // BP06-011
  "Give a Pixie token +2/+2": { card: "BP06-011", cn: "选择自己场上或自己EX区域的1张妖精类型·衍生物。使其《攻击力》+2/《生命值》+2", ja: "自分の場か自分のEXエリアの妖精・トークン1枚を選ぶ。それは攻撃力+2/体力+2する" },
  "Put 2 Fairy tokens into your EX area": { card: "BP06-011", cn: "将2张『妖精』卡置于EX区域", ja: "『フェアリー』2枚をEXエリアに置く" },
  // BP06-031
  "Draw a card, then discard a card": { card: "BP06-031", cn: "抽取1张卡。将自己的1张手牌舍弃", ja: "1枚引く。自分の手札1枚を捨てる" },
  "Each opponent buries the top card of their deck": { card: "BP06-031", cn: "将敌方的牌堆顶1张卡置于墓场", ja: "相手のデッキの上1枚を墓場に置く" },
  // BP06-080
  "Add a Yokai follower from your cemetery to your hand": { card: "BP06-080", cn: "选择自己的墓场中的1张「与这张卡不同名的妖怪类型·从者卡」。将其加入手牌", ja: "自分の墓場の「これと同名を除く妖怪・フォロワー」1枚を選ぶ。それを手札に加える" },
  "Deal 1 damage to an enemy follower and bury the top card of your deck": { card: "BP06-080", cn: "选择敌方场上的1个从者。给予其1点伤害。将自己的牌堆顶1张卡置于墓场", ja: "相手の場のフォロワー1体を選ぶ。それに1ダメージ。自分のデッキの上1枚を墓場に置く" },
  // BP06-108
  "Give another follower +1/+1": { card: "BP06-108", cn: "选择自己场上的其他的1个从者。使其《攻击力》+1/《生命值》+1", ja: "自分の場の他のフォロワー1体を選ぶ。それは攻撃力+1/体力+1する" },
  "Give your leader +2 defense": { card: "BP06-108", cn: "使自己的主战者《生命值》+2", ja: "自分のリーダーは体力+2する" },
  // BP06-109
  "Deal 2 damage to each enemy leader": { card: "BP06-109", cn: "给予敌方的全体主战者各2点伤害", ja: "相手のリーダーすべてに2ダメージ" },
  "Engage each enemy follower": { card: "BP06-109", cn: "将敌方场上的全体从者横置", ja: "相手の場のフォロワーすべてをアクトする" },
  "Put the top card of your deck into your EX area": { card: "BP06-109", cn: "将自己的牌堆顶1张卡置于EX区域", ja: "自分のデッキの上1枚をEXエリアに置く" },
  // BP07-004
  "Bury 4 Natura cards on your field: costs 4 less": { card: "BP07-004", cn: "将场上的4张自然类型·卡片置于墓场：将消费-4", ja: "場の自然・カード4枚を墓場に置く：コストを-4する" },
  // BP07-008
  "Put a Fairy into your EX area": { card: "BP07-008", cn: "将1张『妖精』卡置于EX区域", ja: "『フェアリー』1枚をEXエリアに置く" },
  "Put a Naterran Great Tree into your EX area": { card: "BP07-008", cn: "将1张『那塔拉的大树』卡置于EX区域", ja: "『ナテラの大樹』1枚をEXエリアに置く" },
  // BP07-018
  "Don't put it": { card: "BP07-018", cn: "不放置", ja: "置かない" },
  "Put it into your EX area": { card: "BP07-018", cn: "将其置于EX区域", ja: "それをEXエリアに置く" },
  "Put it onto your field": { card: "BP07-018", cn: "将其置于场上", ja: "それを場に置く" },
  // BP07-024
  "Engage 2 Naterran Great Trees on your field: costs 2 less": { card: "BP07-024", cn: "将场上的2个『那塔拉的大树』《横置》：将消费-2", ja: "場の『ナテラの大樹』2つをアクト：コストを-2する" },
  // BP07-038
  "(1) Deal 5 damage to an enemy follower": { card: "BP07-038", cn: "选择敌方场上的1个从者。给予其5点伤害", ja: "相手の場のフォロワー1体を選ぶ。それに5ダメージ" },
  "(2) Give this follower +3/+0": { card: "BP07-038", cn: "使这张卡《攻击力》+3", ja: "これは攻撃力+3する" },
  "(3) Draw 2 cards": { card: "BP07-038", cn: "抽取2张卡", ja: "2枚引く" },
  // BP07-046
  "Put a Repair Mode into your EX area": { card: "BP07-046", cn: "将1张『修复模式』卡置于EX区域", ja: "『リペアモード』1枚をEXエリアに置く" },
  "Put an Assembly Droid into your EX area": { card: "BP07-046", cn: "将1张『生产器械』卡置于EX区域", ja: "『プロダクトマシーン』1枚をEXエリアに置く" },
  // BP07-047
  "(1) Put an Assembly Droid into your EX area": { card: "BP07-047", cn: "将1张『生产器械』卡置于EX区域", ja: "『プロダクトマシーン』1枚をEXエリアに置く" },
  "(2) With 3 Machina cards in your EX area: +1/+1 and Rush": { card: "BP07-047", cn: "如果自己EX区域的机械类型·卡片为3张及以上的话，使这张卡《攻击力》+1/《生命值》+1，并获得【突进】能力", ja: "自分のEXエリアの機械・カードが3枚以上なら、これは攻撃力+1/体力+1して、【突進】を持つ" },
  // BP07-049
  "(1) Summon a Magic Sediment": { card: "BP07-049", cn: "将1个『大地之魔片』召唤", ja: "『大地の魔片』1つを出す" },
  "(2) Earth Rite: 4 damage divided between up to 2 enemy followers": { card: "BP07-049", cn: "【土之秘术】选择敌方场上的从者最多2个。给予其合计4点伤害，任意分配", ja: "【土の秘術】相手の場のフォロワー2体まで選ぶ。それに4ダメージを割りふる" },
  // BP07-053
  "(1) 4 damage to an enemy follower; a Shadow's Corrosion from your deck into your EX area": { card: "BP07-053", cn: "选择敌方场上的1个从者。给予其4点伤害。从自己的牌堆中搜寻1张『影之侵蚀』卡，并置于EX区域", ja: "相手の場のフォロワー1体を選ぶ。それに4ダメージ。自分のデッキから『影の侵食』1枚を探し、EXエリアに置く" },
  "(2) Play a Shadow's Corrosion from your cemetery for 0": { card: "BP07-053", cn: "选择自己的墓场中的1张『影之侵蚀』卡。将其以「消费变为0」使用", ja: "自分の墓場の『影の侵食』1枚を選ぶ。それのコストを0にしてプレイする" },
  // BP07-064
  "Summon {0}": { card: "BP07-064", cn: "将{0}个『那塔拉的大树』召唤", ja: "『ナテラの大樹』{0}つを出す" },
  // BP07-075
  "(1) A Machina follower from your cemetery to your hand": { card: "BP07-075", cn: "选择自己的墓场中的1张机械类型·从者卡。将其加入手牌", ja: "自分の墓場の機械・フォロワー1枚を選ぶ。それを手札に加える" },
  "(2) Summon a Mono, Garnet Rebel from your cemetery": { card: "BP07-075", cn: "选择自己的墓场中的1张『绯红抗战者·莫诺』卡。将其召唤到场上", ja: "自分の墓場の『真紅の抗戦者・モノ』1枚を選ぶ。それを場に出す" },
  // BP07-092
  "(1) Banish 2 Repair Modes: summon a Machina follower costing 3 or less from your deck": { card: "BP07-092", cn: "将EX区域的2张『修复模式』卡消失：从自己的牌堆中搜寻原始消费为3及以下的1张机械类型·从者卡，并召唤到场上", ja: "EXエリアの『リペアモード』2枚を消滅：自分のデッキから元のコスト3以下の機械・フォロワー1枚を探し、場に出す" },
  "(2) Banish 5 Repair Modes: summon a Machina follower costing 6 or less from your deck": { card: "BP07-092", cn: "将EX区域的5张『修复模式』卡消失：从自己的牌堆中搜寻原始消费为6及以下的1张机械类型·从者卡，并召唤到场上", ja: "EXエリアの『リペアモード』5枚を消滅：自分のデッキから元のコスト6以下の機械・フォロワー1枚を探し、場に出す" },
  // BP07-103
  "(1) Destroy an enemy follower": { card: "BP07-103", cn: "选择敌方场上的1个从者。将其破坏", ja: "相手の場のフォロワー1体を選ぶ。それを破壊する" },
  "(2) Destroy an enemy amulet": { card: "BP07-103", cn: "选择敌方场上的1个护符。将其破坏", ja: "相手の場のアミュレット1つを選ぶ。それを破壊する" },
  "(3) Deal 3 damage to each enemy leader": { card: "BP07-103", cn: "给予敌方的全体主战者各3点伤害", ja: "相手のリーダーすべてに3ダメージ" },
  "(4) Search your deck for a Machina card not named Technolord": { card: "BP07-103", cn: "从自己的牌堆之中搜寻1张「与这张卡不同名的机械类型·卡片」，并加入手牌", ja: "自分のデッキから「これと同名を除く機械・カード」1枚を探し、手札に加える" },
  // BP08-021
  "Search for Durandal the Incorruptible": { card: "BP08-021", cn: "从自己的牌堆之中搜寻1张『不灭圣剑·杜兰朵』卡，并加入手牌", ja: "自分のデッキから『不滅の聖剣・デュランダル』1枚を探し、手札に加える" },
  "You may summon Durandal the Incorruptible from your hand": { card: "BP08-021", cn: "可以将自己的手牌中的1张『不灭圣剑·杜兰朵』卡召唤到场上", ja: "自分の手札の『不滅の聖剣・デュランダル』1枚を場に出してよい" },
  // BP08-024
  "A follower takes at most 3 damage from each instance": { card: "BP08-024", cn: "选择自己场上的1个从者。这个回合与下个敌方的回合中，使其获得「这张卡受到的4点及以上的伤害变为3点」能力", ja: "自分の場のフォロワー1体を選ぶ。このターンと次の相手のターン中、それは「これが受ける4以上のダメージを3にする」を持つ" },
  "Give a follower +1 attack": { card: "BP08-024", cn: "选择自己场上的1个从者。使其《攻击力》+1", ja: "自分の場のフォロワー1体を選ぶ。それは攻撃力+1する" },
  "Give a follower +1 defense": { card: "BP08-024", cn: "选择自己场上的1个从者。使其《生命值》+1", ja: "自分の場のフォロワー1体を選ぶ。それは体力+1する" },
  // BP08-037
  "Banish one card of each base cost 1–10 from your cemetery: costs 10 less": { card: "BP08-037", cn: "将墓场中的原始消费为1、2、3、4、5、6、7、8、9、10的卡片各1张消失：将消费-10", ja: "墓場の元のコスト1、2、3、4、5、6、7、8、9、10のカードを1枚ずつ消滅：コストを-10する" },
  // BP08-040
  "Summon a Morra from your deck": { card: "BP08-040", cn: "从自己的牌堆中搜寻1张『奇幻魔兽·摩拉』卡，并召唤到场上", ja: "自分のデッキから『マジカルビースト・モーラ』1枚を探し、場に出す" },
  "You may summon a Morra from your hand": { card: "BP08-040", cn: "可以将自己的手牌中的1张『奇幻魔兽·摩拉』卡召唤到场上", ja: "自分の手札の『マジカルビースト・モーラ』1枚を場に出してよい" },
  // BP08-064
  "Deal 2 damage to each enemy follower": { card: "BP08-064", cn: "给予敌方场上的全体从者各2点伤害", ja: "相手の場のフォロワーすべてに2ダメージ" },
  "Deal 4 damage to an enemy follower": { card: "BP08-064", cn: "选择敌方场上的1个从者。给予其4点伤害", ja: "相手の場のフォロワー1体を選ぶ。それに4ダメージ" },
  // BP08-070
  "Deal 2 to each enemy follower; leader +2": { card: "BP08-070", cn: "给予敌方场上的全体从者各2点伤害。使自己的主战者《生命值》+2", ja: "相手の場のフォロワーすべてに2ダメージ。自分のリーダーは体力+2する" },
  "Deal 2 to each enemy leader": { card: "BP08-070", cn: "给予敌方的全体主战者各2点伤害", ja: "相手のリーダーすべてに2ダメージ" },
  // BP08-103
  "Any other number (greater than {0})": { card: "BP08-103", cn: "其他任意数字（大于{0}）", ja: "その他の好きな数（{0}より大きい）" },
  // BP09-006
  "(1) Deal 4 damage to an enemy follower": { card: "BP09-006", cn: "选择敌方场上的1个从者。给予其4点伤害", ja: "相手の場のフォロワー1体を選ぶ。それに4ダメージ" },
  "(2) Deal 2 damage to each enemy leader": { card: "BP09-006", cn: "给予敌方的全体主战者各2点伤害", ja: "相手のリーダーすべてに2ダメージ" },
  // BP09-054
  "Bury a follower with \"Zirnitra\" in its name: this card costs 3 less": { card: "BP09-054", cn: "将场上的1个「卡片名包含『吉尔尼特拉』的从者」置于墓场：将消费-3", ja: "場の「カード名に『ジルニトラ』を含むフォロワー」1体を墓場に置く：コストを-3する" },
  // BP09-071
  "(1) Draw a card": { card: "BP09-071", cn: "抽取1张卡", ja: "1枚引く" },
  "(2) Summon 2 Ghost tokens": { card: "BP09-071", cn: "将2个『怨灵』召唤", ja: "『ゴースト』2体を出す" },
  "(3) Bury the top 2 cards of your deck": { card: "BP09-071", cn: "将自己的牌堆顶2张卡置于墓场", ja: "自分のデッキの上2枚を墓場に置く" },
  // BP09-078
  "(1) Deal 4 damage to an enemy follower and draw a card": { card: "BP09-078", cn: "选择敌方场上的1个从者。给予其4点伤害。抽取1张卡", ja: "相手の場のフォロワー1体を選ぶ。それに4ダメージ。1枚引く" },
  "(2) Deal 2 damage to each enemy leader, give your leader +2 defense and draw a card": { card: "BP09-078", cn: "给予敌方的全体主战者各2点伤害。使自己的主战者《生命值》+2。抽取1张卡", ja: "相手のリーダーすべてに2ダメージ。自分のリーダーは体力+2する。1枚引く" },
  // BP09-112
  "(1) Deal 2 damage to an enemy follower": { card: "BP09-112", cn: "选择敌方场上的1个从者。给予其2点伤害", ja: "相手の場のフォロワー1体を選ぶ。それに2ダメージ" },
  "(2) Give your leader +1 defense": { card: "BP09-112", cn: "使自己的主战者《生命值》+1", ja: "自分のリーダーは体力+1する" },
  // BP10-003
  "Summon a Mystic Artifact; the Ancient Artifact goes into your EX area": { card: "BP10-003", cn: "将1张『神秘的创造物』卡召唤到场上、将1张『古老的创造物』卡置于EX区域", ja: "『ミスティックアーティファクト』1枚を場に出す。『エンシェントアーティファクト』1枚をEXエリアに置く" },
  "Summon an Ancient Artifact; the Mystic Artifact goes into your EX area": { card: "BP10-003", cn: "将1张『古老的创造物』卡召唤到场上、将1张『神秘的创造物』卡置于EX区域", ja: "『エンシェントアーティファクト』1枚を場に出す。『ミスティックアーティファクト』1枚をEXエリアに置く" },
  // BP10-019
  "(1) Summon a Knight token": { card: "BP10-019", cn: "将1个『骑士』召唤到场上", ja: "『ナイト』1体を場に出す" },
  "(2) This follower gets +1 attack, Rush and Ward": { card: "BP10-019", cn: "使这张卡《攻击力》+1，并获得【突进】【守护】能力", ja: "これは攻撃力+1して、【突進】【守護】を持つ" },
  "(3) Deal 2 damage to each enemy leader": { card: "BP10-019", cn: "给予敌方的全体主战者各2点伤害", ja: "相手のリーダーすべてに2ダメージ" },
  "(4) Pay 4 and bury this card: you may summon VII. Oluon, Runaway Chariot from your evolve deck": { card: "BP10-019", cn: "《消费4》将这张卡置于墓场：可以将自己的进化牌组中的1张『《暴走》战车·奥辂昂』卡召唤到场上", ja: "コスト4これを墓場に置く：自分のエボルヴデッキの『《暴走》する戦車・オルオーン』1枚を場に出してよい" },
  // BP10-030
  "(1) Deal 3 damage to an enemy follower": { card: "BP10-030", cn: "选择敌方场上的1个从者。给予其3点伤害", ja: "相手の場のフォロワー1体を選ぶ。それに3ダメージ" },
  "(2) Summon a Fable follower that costs 2 or less from your deck": { card: "BP10-030", cn: "从自己的牌堆之中搜寻原始消费为2及以下的1张童话类型·从者卡，并召唤到场上", ja: "自分のデッキから元のコスト2以下の童話・フォロワー1枚を探し、場に出す" },
  // BP10-036
  "(2) With a Princess follower on your field, search for a Swordcraft follower": { card: "BP10-036", cn: "如果自己的场上有公主类型·从者的话，从自己的牌堆之中搜寻1张《皇家护卫职业》从者卡，并加入手牌", ja: "自分の場にプリンセス・フォロワーがいるなら、自分のデッキからロイヤルフォロワー1枚を探し、手札に加える" },
  // BP10-049
  "(1) Discard a Runecraft card: leader +5 defense": { card: "BP10-049", cn: "将手牌中的1张《巫师职业》卡片舍弃：使自己的主战者《生命值》+5", ja: "手札のウィッチカード1枚を捨てる：自分のリーダーは体力+5する" },
  "(2) Discard a non-Runecraft card: 5 damage to an enemy follower": { card: "BP10-049", cn: "将手牌中的1张「非《巫师职业》卡片」舍弃：选择敌方场上的1个从者。给予其5点伤害", ja: "手札の「ウィッチでないカード」1枚を捨てる：相手の場のフォロワー1体を選ぶ。それに5ダメージ" },
  // BP10-050
  "(1) Add 1 to a Stack on your field": { card: "BP10-050", cn: "将自己场上的【蓄积】+1", ja: "自分の場の【スタック】を+1する" },
  "(2) Earth Rite: deal 2 damage to each enemy leader": { card: "BP10-050", cn: "【土之秘术】给予敌方的全体主战者各2点伤害", ja: "【土の秘術】相手のリーダーすべてに2ダメージ" },
  // BP10-051
  "(2) Add a spell from your cemetery to your hand": { card: "BP10-051", cn: "选择自己的墓场中的1张法术卡。将其加入手牌", ja: "自分の墓場のスペル1枚を選ぶ。それを手札に加える" },
  // BP10-052
  "(1) Each opponent buries a follower": { card: "BP10-052", cn: "敌方的全体玩家，各将自身场上的1个从者置于墓场", ja: "相手プレイヤーすべては、自身の場のフォロワー1体を墓場に置く" },
  "(2) Give your leader +3 defense": { card: "BP10-052", cn: "使自己的主战者《生命值》+3", ja: "自分のリーダーは体力+3する" },
  // BP10-056
  "(1) Max play points +1, recover 2 play points": { card: "BP10-056", cn: "将自己的PP最大值+1点。将自己的PP回复2点", ja: "自分のPP最大値を+1する。自分のPPを2回復する" },
  "(2) Overflow: summon a Devoted Dragon, leader +2 defense": { card: "BP10-056", cn: "如果处于【觉醒】状态的话，将1个『羁绊之霸龙』召唤到场上。使自己的主战者《生命值》+2", ja: "【覚醒】状態なら、『絆の覇竜』1体を場に出す。自分のリーダーは体力+2する" },
  // BP10-062
  "2nd from the top of its owner's deck": { card: "BP10-062", cn: "牌堆顶第2张", ja: "自分のデッキの上から2番目" },
  "The bottom of its owner's deck": { card: "BP10-062", cn: "牌堆底", ja: "自分のデッキの下" },
  // BP10-088
  "(1) Put a Ghost token into your EX area": { card: "BP10-088", cn: "将1张『怨灵』卡置于EX区域", ja: "『ゴースト』1枚をEXエリアに置く" },
  "(2) With a Ghost follower in your EX area, an Abysscraft card from the top 3": { card: "BP10-088", cn: "如果自己的EX区域有「卡片名包含『怨灵』的从者卡」的话，查看自己的牌堆顶3张卡。从那之中，可以将1张《梦魇职业》卡片公开并加入手牌。将剩余的卡以任意顺序置于牌堆底", ja: "自分のEXエリアに「カード名に『ゴースト』を含むフォロワー」があるなら、自分のデッキの上3枚を見る。その中から、ナイトメアカード1枚を公開して手札に加えてよい。残りを好きな順にデッキの下に置く" },
  // BP10-102
  "{0} calamity counter(s)": { card: "BP10-102", cn: "{0}个灾祸指示物", ja: "災いカウンター{0}個" },
  // BP10-106
  "(1) Summon a Holy Falcon token": { card: "BP10-106", cn: "将1个『神圣猎鹰』召唤到场上", ja: "『ホーリーファルコン』1体を場に出す" },
  "(2) Add an amulet from your cemetery to your hand": { card: "BP10-106", cn: "选择自己的墓场中的1张护符卡。将其加入手牌", ja: "自分の墓場のアミュレット1枚を選ぶ。それを手札に加える" },
  // BP11-002
  "(2) Another follower of yours +3/+3": { card: "BP11-002", cn: "选择自己场上的其他的1个从者。使其《攻击力》+3/《生命值》+3", ja: "自分の場の他のフォロワー1体を選ぶ。それは攻撃力+3/体力+3する" },
  // BP11-007
  "Bury 4 Pixie tokens": { card: "BP11-007", cn: "将场上的4个妖精类型·衍生物置于墓场", ja: "場の妖精・トークン4体を墓場に置く" },
  // BP11-020
  "(1) Summon a Val, Trusty Getaway Car": { card: "BP11-020", cn: "将1个『魔导四轮车·V』召唤到场上", ja: "『魔導四輪車・V』1つを場に出す" },
  "(2) Search for a Desperados' Shot": { card: "BP11-020", cn: "从自己的牌堆之中搜寻1张『亡命者的枪击』卡，并加入手牌", ja: "自分のデッキから『デスペラードショット』1枚を探し、手札に加える" },
  // BP11-042
  "Bane": { card: "BP11-042", cn: "【必杀】", ja: "【必殺】" },
  "Drain": { card: "BP11-042", cn: "【吸血】", ja: "【ドレイン】" },
  "Rush": { card: "BP11-042", cn: "【突进】", ja: "【突進】" },
  // BP11-068
  "Discard a Dragoncraft card that costs 7 or more": { card: "BP11-068", cn: "将手牌中的原始消费为7及以上的1张《龙族职业》卡片舍弃", ja: "手札の元のコスト7以上のドラゴンカード1枚を捨てる" },
  // BP11-074
  "Summon a {0}": { card: "BP11-074", cn: "将1张『{0}』卡召唤到场上", ja: "『{0}』1枚を場に出す" },
  // BP11-092
  "(1) 3 damage to an enemy follower": { card: "BP11-092", cn: "选择敌方场上的1个从者。给予其3点伤害", ja: "相手の場のフォロワー1体を選ぶ。それに3ダメージ" },
  "(2) A follower of yours +1/+1": { card: "BP11-092", cn: "选择自己场上的1个从者。使其《攻击力》+1/《生命值》+1", ja: "自分の場のフォロワー1体を選ぶ。それは攻撃力+1/体力+1する" },
  "(3) Summon a Holy Tiger": { card: "BP11-092", cn: "将1个『神圣猛虎』召唤", ja: "『ホーリータイガー』1体を場に出す" },
  // BP11-108
  "(1) Search for an Archfiend card": { card: "BP11-108", cn: "从自己的牌堆之中搜寻1张魔王类型·卡片，并加入手牌", ja: "自分のデッキから魔王・カード1枚を探し、手札に加える" },
  "(2) Destroy an enemy follower, 3 damage to your leader": { card: "BP11-108", cn: "选择敌方场上的1个从者。将其破坏。给予自己的主战者3点伤害", ja: "相手の場のフォロワー1体を選ぶ。それを破壊する。自分のリーダーに3ダメージ" },
  // BP11-115
  "Put a {0} into your EX area": { card: "BP11-115", cn: "将1张『{0}』卡置于EX区域", ja: "『{0}』1枚をEXエリアに置く" },
  "Put a {0} onto your field": { card: "BP11-115", cn: "将1张『{0}』卡置于场上", ja: "『{0}』1枚を場に置く" },
  // BP12-007
  "(1) Put a Natura card from your field into the EX area: 3 damage to an enemy follower": { card: "BP12-007", cn: "将场上的1张自然类型·卡片置于EX区域：选择敌方场上的1个从者。给予其3点伤害", ja: "場の自然・カード1枚をEXエリアに置く：相手の場のフォロワー1体を選ぶ。それに3ダメージ" },
  "(2) Summon 2 Fairies": { card: "BP12-007", cn: "将2个『妖精』召唤到场上", ja: "『フェアリー』2体を場に出す" },
  // BP12-020
  "(1) Put a Twilight Blade into your EX area": { card: "BP12-020", cn: "将1张『暮光之刃』卡置于EX区域", ja: "『トワイライトソード』1枚をEXエリアに置く" },
  "(2) Your leader +2 defense": { card: "BP12-020", cn: "使自己的主战者《生命值》+2", ja: "自分のリーダーは体力+2する" },
  // BP12-023
  "(1) The next Alwida's Command costs 5 less": { card: "BP12-023", cn: "这个回合，下次自己将『亚尔丽妲的号令』卡使用之际，将其消费-5", ja: "このターン、次に自分が『アルビダの号令』をプレイする際、コストを-5する" },
  "(2) The next Thief card costs 3 less": { card: "BP12-023", cn: "这个回合，下次自己将盗贼类型·卡片使用之际，将其消费-3", ja: "このターン、次に自分が盗賊・カードをプレイする際、コストを-3する" },
  // BP12-024
  "Engage 2 Naterran Great Trees on your field": { card: "BP12-024", cn: "将场上的2个『那塔拉的大树』横置", ja: "場の『ナテラの大樹』2つをアクトする" },
  // BP12-035
  "Summon an Armored Tentacle": { card: "BP12-035", cn: "将1个『阻断的触手』召唤到场上", ja: "『遮断の触手』1体を場に出す" },
  "Summon an Assault Tentacle": { card: "BP12-035", cn: "将1个『蹂躏的触手』召唤到场上", ja: "『蹂躙の触手』1体を場に出す" },
  // BP12-062
  "(1) 2 damage to an enemy follower": { card: "BP12-062", cn: "选择敌方场上的1个从者。给予其2点伤害", ja: "相手の場のフォロワー1体を選ぶ。それに2ダメージ" },
  "(2) Pay X twice: summon up to X Star Phoenixes with Rush": { card: "BP12-062", cn: "《消费X》《消费X》：从自己的牌堆之中搜寻最多X张『星之不死鸟』卡，并召唤到场上。使其获得【突进】能力", ja: "コストXコストX：自分のデッキから『スターフェニックス』X枚まで探し、場に出す。それは【突進】を持つ" },
  "X = {0} (pay {1})": { card: "BP12-062", cn: "X = {0}（支付{1}点PP）", ja: "X = {0}（PPを{1}支払う）" },
  // BP12-079
  "(1) 2 damage to each enemy leader, 1 to yours": { card: "BP12-079", cn: "给予敌方的全体主战者各2点伤害。给予自己的主战者1点伤害", ja: "相手のリーダーすべてに2ダメージ。自分のリーダーに1ダメージ" },
  "(2) An Assembly Droid onto the field and one into the EX area": { card: "BP12-079", cn: "将1个『生产器械』召唤到场上。将1张『生产器械』卡置于EX区域。如果自己的场上有『绯红抗战者·莫诺』的话，由置于EX区域、转变为召唤到场上", ja: "『プロダクトマシーン』1体を場に出す。『プロダクトマシーン』1枚をEXエリアに置く。自分の場に『真紅の抗戦者・モノ』がいるなら、EXエリアに置く代わりに場に出す" },
  // BP12-087
  "(1) Damage equal to your Machina followers": { card: "BP12-087", cn: "选择敌方场上的1个从者。给予其与「自己场上的机械类型·从者的数量」等量的伤害", ja: "相手の場のフォロワー1体を選ぶ。それに「自分の場の機械・フォロワーの数」と同じダメージ" },
  "(2) Give this follower Storm": { card: "BP12-087", cn: "使这张卡获得【疾驰】能力", ja: "これは【疾走】を持つ" },
  // BP12-090
  "(1) 5 damage to an enemy follower": { card: "BP12-090", cn: "选择敌方场上的1个从者。给予其5点伤害", ja: "相手の場のフォロワー1体を選ぶ。それに5ダメージ" },
  "(2) Your other Machina followers +1/+1": { card: "BP12-090", cn: "使自己场上的其他的全体机械类型·从者各《攻击力》+1/《生命值》+1", ja: "自分の場の他の機械・フォロワーすべては攻撃力+1/体力+1する" },
  // BP12-092
  "(1) Your leader +2 defense, draw 2": { card: "BP12-092", cn: "使自己的主战者《生命值》+2。抽取2张卡", ja: "自分のリーダーは体力+2する。2枚引く" },
  "(2) Summon up to 2 different \"Meowskers\" cards from your deck": { card: "BP12-092", cn: "从自己的牌堆之中搜寻卡片名各不相同的「卡片名包含『喵鲁』的卡片」最多2张，并召唤到场上", ja: "自分のデッキから「カード名に『ムニャール』を含むカード」をカード名が異なるように2枚まで探し、場に出す" },
  // BP12-096
  "Discard a Heavenly Aegis: costs 2 less": { card: "BP12-096", cn: "将手牌中的1张『天曜盾甲』卡舍弃：将消费-2", ja: "手札の『ヘヴンリーイージス』1枚を捨てる：コストを-2する" },
  // BP12-106
  "(1) Destroy an enemy card that costs 2 or less": { card: "BP12-106", cn: "选择原始消费为2及以下的敌方场上的1张卡片。将其破坏", ja: "元のコスト2以下の相手の場のカード1枚を選ぶ。それを破壊する" },
  "(2) Pay 2: destroy an enemy card that costs 6 or less": { card: "BP12-106", cn: "《消费2》：选择原始消费为6及以下的敌方场上的1张卡片。将其破坏", ja: "コスト2：元のコスト6以下の相手の場のカード1枚を選ぶ。それを破壊する" },
  // BP12-110
  "(1) Summon a Chef follower that costs 3 or less from your deck": { card: "BP12-110", cn: "从自己的牌堆之中搜寻原始消费为3及以下的1张厨师类型·从者卡，并召唤到场上", ja: "自分のデッキから元のコスト3以下のコック・フォロワー1枚を探し、場に出す" },
  "(2) Draw a card": { card: "BP12-110", cn: "抽取1张卡", ja: "1枚引く" },
  // BP12-T01
  "(1) Return a follower to its owner's hand": { card: "BP12-T01", cn: "选择场上的1个从者。将其放回手牌", ja: "場のフォロワー1体を選ぶ。それを手札に戻す。（手札に戻ったトークンはゲームから取り除く）" },
  "(2) Your leader +4 defense": { card: "BP12-T01", cn: "使自己的主战者《生命值》+4", ja: "自分のリーダーは体力+4する" },
  // BP12-T02
  "Engage a Lecia, Sky Saber and a Nano, the Dawnblade on your field": { card: "BP12-T02", cn: "将场上的1个『苍空剑士·莉夏』与1个『黄昏之刃·奈诺』横置", ja: "場の『スカイセイバー・リーシャ』1体と『黄昏の刃・ナノ』1体をアクトする" },
  // BP13-002
  "(1) Search your deck for a Resolve of the Nine-Tailed Fox": { card: "BP13-002", cn: "从自己的牌堆之中搜寻1张『九尾的决意』卡，并加入手牌", ja: "自分のデッキから『九尾の決意』1枚を探し、手札に加える" },
  "(2) A Resolve of the Nine-Tailed Fox from your cemetery": { card: "BP13-002", cn: "选择自己的墓场中的1张『九尾的决意』卡。将其加入手牌", ja: "自分の墓場の『九尾の決意』1枚を選ぶ。それを手札に加える" },
  // BP13-008
  "(1) Sekka, Ninefold Blaze +2/+2 and Storm with 9 banished cards": { card: "BP13-008", cn: "选择自己场上的1个『九火石炎·雪华』。如果自己的消失领域为9张及以上的话，使其《攻击力》+2/《生命值》+2，并获得【疾驰】能力", ja: "自分の場の『九火石炎・セッカ』1体を選ぶ。自分の消滅領域が9枚以上なら、それは攻撃力+2/体力+2して、【疾走】を持つ" },
  "(2) A Sekka follower +2/+2, then damage equal to its attack": { card: "BP13-008", cn: "选择自己场上的1个「卡片名包含『雪华』的从者」与敌方场上的1个从者。使前者《攻击力》+2/《生命值》+2。给予后者与「前者的攻击力」等量的伤害", ja: "自分の場の「カード名に『セッカ』を含むフォロワー」1体と相手の場のフォロワー1体を選ぶ。前者は攻撃力+2/体力+2する。後者に「前者の攻撃力」と同じダメージ" },
  // BP13-025
  "Play for 2 more play points": { card: "BP13-025", cn: "将消费+2", ja: "コストを+2する" },
  // BP13-028
  "Bury a Levin follower that costs 3 or less: costs 3 less": { card: "BP13-028", cn: "将原始消费为3及以下的场上的1个雷维翁类型·从者置于墓场：将消费-3", ja: "元のコスト3以下の場のレヴィオン・フォロワー1体を墓場に置く：コストを-3する" },
  // BP13-035
  "Play for 4 more play points": { card: "BP13-035", cn: "将消费+4", ja: "コストを+4する" },
  // BP13-060
  "Play for 3 more play points": { card: "BP13-060", cn: "将消费+3", ja: "コストを+3する" },
  // BP13-064
  "Engage a Dragoncraft follower that costs 7 or more on your field": { card: "BP13-064", cn: "将原始消费为7及以上的场上的1个《龙族职业》从者横置", ja: "元のコスト7以上の場のドラゴンフォロワー1体をアクトする" },
  // BP13-070
  "Bury a Dragonewt follower": { card: "BP13-070", cn: "将场上的1个龙人类型·从者置于墓场", ja: "場のドラゴニュート・フォロワー1体を墓場に置く" },
  // BP13-072
  // split of 将这张卡与1张『血红獠牙』卡置于EX区域 / これと『紅の牙』1枚をEXエリアに置く; {0} is Aluzard itself (这张卡 / これ in the text)
  "Put {0} into the EX area": { card: "BP13-072", cn: "将『{0}』置于EX区域", ja: "『{0}』をEXエリアに置く" },
  "Put a {0} token into the EX area": { card: "BP13-072", cn: "将1张『{0}』卡置于EX区域", ja: "『{0}』1枚をEXエリアに置く" },
  // BP13-073
  "(1) Damage to an enemy follower equal to the times your leader lost defense this turn": { card: "BP13-073", cn: "选择敌方场上的1个从者。给予其与「这个回合中自己的主战者生命值减少的次数」等量的伤害", ja: "相手の場のフォロワー1体を選ぶ。それに「このターン中に自分のリーダーの体力が減少した回数」と同じダメージ" },
  "(2) This follower +1/+1": { card: "BP13-073", cn: "使这张卡《攻击力》+1/《生命值》+1", ja: "これは攻撃力+1/体力+1する" },
  "(3) This follower gains Storm": { card: "BP13-073", cn: "使这张卡获得【疾驰】能力", ja: "これは【疾走】を持つ" },
  // BP13-076
  "(1) A Soulstrike from your cemetery into your EX area": { card: "BP13-076", cn: "选择自己的墓场中的1张『入魂一刀』卡。将其置于EX区域。【NC_20】这个回合，将其使用之际，将其消费-2", ja: "自分の墓場の『魂の一刀』1枚を選ぶ。それをEXエリアに置く。【NC_20】このターン、それをプレイする際、コストを-2する" },
  "(2) Bury the top 2 cards of your deck": { card: "BP13-076", cn: "将自己的牌堆顶2张卡置于墓场", ja: "自分のデッキの上2枚を墓場に置く" },
  // BP13-098
  "Bury an amulet": { card: "BP13-098", cn: "将场上的1个护符置于墓场", ja: "場のアミュレット1つを墓場に置く" },
  // BP13-T02
  "(1) 4 damage to an enemy follower": { card: "BP13-T02", cn: "选择敌方场上的1个从者。给予其4点伤害", ja: "相手の場のフォロワー1体を選ぶ。それに4ダメージ" },
  // official CN says 选择敌方场上的从者最多2个 (up to 2); EN / JA (2体) and ruling Q2 say exactly 2, so written 选择敌方场上的2个从者 like 选择敌方场上的1个从者
  "(2) 4 damage to 2 enemy followers with 15 Academic cards in your cemetery": { card: "BP13-T02", cn: "选择敌方场上的2个从者。如果自己的墓场中的学院类型·卡片为15张及以上的话，给予其4点伤害", ja: "相手の場のフォロワー2体を選ぶ。自分の墓場の学院・カードが15枚以上なら、それに4ダメージ" },
  // BP13-T04
  "Bury 2 followers": { card: "BP13-T04", cn: "将场上的2个从者置于墓场", ja: "場のフォロワー2体を墓場に置く" },
  // BP14-004
  "{0} damage": { card: "BP14-004", cn: "给予其{0}点伤害", ja: "それに{0}ダメージ" },
  "+{0}/+{1}": { card: "BP14-004", cn: "使其《攻击力》+{0}/《生命值》+{1}", ja: "それは攻撃力+{0}/体力+{1}する" },
  // BP14-011
  "Banish a card from your EX area": { card: "BP14-011", cn: "将EX区域的1张卡片消失", ja: "EXエリアのカード1枚を消滅する" },
  // BP14-034
  "(1) 2 damage and a Glittering Gold": { card: "BP14-034", cn: "选择敌方场上的1个从者。给予其2点伤害。将1张『闪耀的金币』卡置于EX区域", ja: "相手の場のフォロワー1体を選ぶ。それに2ダメージ。『輝く金貨』1枚をEXエリアに置く" },
  "(2) 4 damage with 3 Festive cards in your EX area": { card: "BP14-034", cn: "选择敌方场上的1个从者。如果自己EX区域的宴乐类型·卡片为3张及以上的话，给予其4点伤害", ja: "相手の場のフォロワー1体を選ぶ。自分のEXエリアの宴楽・カードが3枚以上なら、それに4ダメージ" },
  // BP14-039
  "Put it on the bottom of your deck": { card: "BP14-039", cn: "将剩余的卡置于牌堆底", ja: "残りをデッキの下に置く" },
  "Put it on the top of your deck": { card: "BP14-039", cn: "将剩余的卡置于牌堆顶", ja: "残りをデッキの上に置く" },
  // BP14-043
  "Storm": { card: "BP14-043", cn: "【疾驰】", ja: "【疾走】" },
  // BP14-063
  "Remove 2 divine water counters: 2 less": { card: "BP14-063", cn: "将场上的1个『龙山温泉』的2个神汤指示物取除：将消费-2", ja: "場の『竜山温泉』1つの神湯カウンター2個を取る：コストを-2する" },
  // BP14-068
  "Engage a Marine follower: 2 less": { card: "BP14-068", cn: "将场上的1个海洋类型·从者《横置》：将消费-2", ja: "場の海洋・フォロワー1体をアクト：コストを-2する" },
  // BP14-114
  "(1) 6 damage to an enemy follower": { card: "BP14-114", cn: "选择敌方场上的1个从者。给予其6点伤害", ja: "相手の場のフォロワー1体を選ぶ。それに6ダメージ" },
  "(2) 3 damage to each enemy follower": { card: "BP14-114", cn: "给予敌方场上的全体从者各3点伤害", ja: "相手の場のフォロワーすべてに3ダメージ" },
  // BP14-119
  "Discard a Goblinoid card: 2 less": { card: "BP14-119", cn: "将手牌中的1张哥布林类型·卡片舍弃：将消费-2", ja: "手札のゴブリン・カード1枚を捨てる：コストを-2する" },
  // BP15-027
  "(1) A Ralmia follower to your hand": { card: "BP15-027", cn: "从自己的牌堆之中搜寻1张「卡片名包含『洛菈米亚』的从者卡」，并加入手牌", ja: "自分のデッキから「カード名に『ララミア』を含むフォロワー」1枚を探し、手札に加える" },
  "(2) (4): Up to 2 Ralmia followers with different names onto your field": { card: "BP15-027", cn: "《消费4》：从自己的牌堆之中搜寻卡片名各不相同的「卡片名包含『洛菈米亚』的从者卡」最多2张，并召唤到场上", ja: "コスト4：自分のデッキから「カード名に『ララミア』を含むフォロワー」をカード名が異なるように2枚まで探し、場に出す" },
  // BP15-031
  "(2) A fighting spirit counter on a Kagemitsu": { card: "BP15-031", cn: "选择自己场上或自己EX区域的1张『失落武士·景光』卡。将1个战意指示物置于到其上", ja: "自分の場か自分のEXエリアの『ロストサムライ・カゲミツ』1枚を選ぶ。それに戦意カウンター1個を置く" },
  // BP15-038
  "Bury 3 Mage followers (2 or more) on your field: costs 9 less": { card: "BP15-038", cn: "将原始消费为2及以上的场上的3个魔法使类型·从者置于墓场：将消费-9", ja: "元のコスト2以上の場の魔法使い・フォロワー3体を墓場に置く：コストを-9する" },
  // BP15-041
  "Reveal 2 Onmyoji cards from your hand: costs 1 less": { card: "BP15-041", cn: "将手牌中的2张阴阳师类型·卡片公开：将消费-1", ja: "手札の陰陽師・カード2枚を公開：コストを-1する" },
  // BP15-045
  "Banish a Lishenna follower from your cemetery": { card: "BP15-045", cn: "将墓场中的1张「卡片名包含『里榭娜』的从者卡」消失", ja: "墓場の「カード名に『リーシェナ』を含むフォロワー」1枚を消滅させる" },
  // BP15-046
  "Reveal 2 Onmyoji cards from your hand": { card: "BP15-046", cn: "将手牌中的2张阴阳师类型·卡片公开", ja: "手札の陰陽師・カード2枚を公開する" },
  // BP15-048
  "(2) A Raio follower from your deck": { card: "BP15-048", cn: "从自己的牌堆之中搜寻1张「卡片名包含『莱欧』的从者卡」，并加入手牌", ja: "自分のデッキから「カード名に『ライオ』を含むフォロワー」1枚を探し、手札に加える" },
  // BP15-077
  "(1) A Wings of Desire into your EX area": { card: "BP15-077", cn: "将1张『爱绝的飞翔』卡置于EX区域", ja: "『愛絶の飛翔』1枚をEXエリアに置く" },
  // BP15-083
  "Bury 2 One-Tailed Foxes on your field": { card: "BP15-083", cn: "将场上的2个『一尾狐』置于墓场", ja: "場の『一ツ尾狐』2体を墓場に置く" },
  // BP15-087
  "Engage two 2-cost followers on your field: costs 1 less": { card: "BP15-087", cn: "将原始消费为2的场上的2个从者《横置》：将消费-1", ja: "元のコスト2の場のフォロワー2体をアクト：コストを-1する" },
  // BP15-089
  "(1) A Rulenye follower from your cemetery onto the field": { card: "BP15-089", cn: "选择自己的墓场中的1张「卡片名包含『鲁鲁纳伊』的从者卡」。将其召唤到场上", ja: "自分の墓場の「カード名に『ルルナイ』を含むフォロワー」1枚を選ぶ。それを場に出す" },
  "(2) 2 damage to an enemy follower": { card: "BP15-089", cn: "选择敌方场上的1个从者。给予其2点伤害", ja: "相手の場のフォロワー1体を選ぶ。それに2ダメージ" },
  // BP15-114
  "(1) Another follower: +2/-2": { card: "BP15-114", cn: "选择场上的其他的1个从者。使其《攻击力》+2/《生命值》-2", ja: "場の他のフォロワー1体を選ぶ。それは攻撃力+2/体力-2する" },
  "(2) A Ravenous Sweetness into your EX area": { card: "BP15-114", cn: "将1张『涸绝的甘露』卡置于EX区域", ja: "『干絶の甘露』1枚をEXエリアに置く" },
  // BP15-117
  "(1) Destroy an enemy amulet": { card: "BP15-117", cn: "选择敌方场上的1个护符。将其破坏", ja: "相手の場のアミュレット1つを選ぶ。それを破壊する" },
  "(3) Storm": { card: "BP15-117", cn: "使这张卡获得【疾驰】能力", ja: "これは【疾走】を持つ" },
  "(4) Draw 2 cards": { card: "BP15-117", cn: "抽取2张卡", ja: "2枚引く" },
  // BP15-PR10
  "(1) 3 damage, 8 with 10 cards in the opponents' cemeteries": { card: "BP15-PR10", cn: "选择敌方场上的1个从者。给予其3点伤害。如果敌方的墓场为10张及以上的话，转变为8点伤害", ja: "相手の場のフォロワー1体を選ぶ。それに3ダメージ。相手の墓場が10枚以上なら、代わりに8ダメージ" },
  "(2) A Thief card from the top 3": { card: "BP15-PR10", cn: "查看自己的牌堆顶3张卡。从那之中，可以将1张盗贼类型·卡片公开并加入手牌。将剩余的卡以任意顺序置于牌堆底", ja: "自分のデッキの上3枚を見る。その中から、盗賊・カード1枚を公開して手札に加えてよい。残りを好きな順にデッキの下に置く" },
  // BP15-PR12
  "Engage any number of Idolatry cards on your field": { card: "BP15-PR12", cn: "将场上的爱豆类型·卡片任意张数横置", ja: "場のアイドル・カードを好きな枚数アクトする" },
  // BP16-018
  "(1) Leader +2": { card: "BP16-018", cn: "使自己的主战者《生命值》+2", ja: "自分のリーダーは体力+2する" },
  // BP16-019
  // the 'you may' choice of BP16-019 / 020 (put none of the three tokens); not in the card text, written with its wording 置于EX区域 / EXエリアに置く
  "None": { card: "BP16-019", cn: "不置于EX区域", ja: "EXエリアに置かない" },
  // BP16-022
  "(1) Engage an enemy follower; it doesn't refresh next start phase": { card: "BP16-022", cn: "选择敌方场上的1个从者。将其横置。使其在下个其玩家的开始阶段中不能竖置", ja: "相手の場のフォロワー1体を選ぶ。それをアクトする。それは次のそれのプレイヤーのスタートフェイズにスタンドしない" },
  "(2) Draw, then a card from your hand on the top or bottom of your deck": { card: "BP16-022", cn: "抽取1张卡。将自己的1张手牌置于牌堆顶或牌堆底", ja: "1枚引く。自分の手札1枚をデッキの上か下に置く" },
  "(3) 2 Glittering Gold into your EX area": { card: "BP16-022", cn: "将2张『闪耀的金币』卡置于EX区域", ja: "『輝く金貨』2枚をEXエリアに置く" },
  "The bottom of your deck": { card: "BP16-022", cn: "将自己的1张手牌置于牌堆底", ja: "自分の手札1枚をデッキの下に置く" },
  "The top of your deck": { card: "BP16-022", cn: "将自己的1张手牌置于牌堆顶", ja: "自分の手札1枚をデッキの上に置く" },
  // BP16-026
  "Engage a Levin follower on your field": { card: "BP16-026", cn: "将场上的1个雷维翁类型·从者横置", ja: "場のレヴィオン・フォロワー1体をアクトする" },
  // BP16-036
  "(1) A Steelclad Knight, Shield Guardian and Knight": { card: "BP16-036", cn: "将1个『铁甲骑士』与1个『战盾卫士』与1个『骑士』召唤到场上", ja: "『スティールナイト』1体と『シールドガーディアン』1体と『ナイト』1体を場に出す" },
  "(2) +1/+1 to your Officer token followers": { card: "BP16-036", cn: "使自己场上的全体士兵类型·衍生物·从者各《攻击力》+1/《生命值》+1", ja: "自分の場の兵士・トークン・フォロワーすべては攻撃力+1/体力+1する" },
  // BP16-052
  "(1) A Magic Sediment": { card: "BP16-052", cn: "将1个『大地之魔片』召唤到场上", ja: "『大地の魔片』1つを場に出す" },
  "(2) Earth Rite: 3 damage to an enemy follower": { card: "BP16-052", cn: "【土之秘术】选择敌方场上的1个从者。给予其3点伤害", ja: "【土の秘術】相手の場のフォロワー1体を選ぶ。それに3ダメージ" },
  // BP16-054
  "(1) A Magic Sediment, leader +1": { card: "BP16-054", cn: "将1个『大地之魔片』召唤到场上。使自己的主战者《生命值》+1", ja: "『大地の魔片』1つを場に出す。自分のリーダーは体力+1する" },
  "(2) A Guardian Golem into your EX area": { card: "BP16-054", cn: "将1张『守护者巨像』卡置于EX区域", ja: "『ガーディアンゴーレム』1枚をEXエリアに置く" },
  // BP16-074
  "(1) Leader +3": { card: "BP16-074", cn: "使自己的主战者《生命值》+3", ja: "自分のリーダーは体力+3する" },
  "(2) Draw 2 cards": { card: "BP16-074", cn: "抽取2张卡", ja: "2枚引く" },
  // BP16-078
  "(1) An Arcane Personnel Carrier, leader +1": { card: "BP16-078", cn: "将1个『魔导装甲车』召唤到场上。使自己的主战者《生命值》+1", ja: "『魔導装甲車』1つを場に出す。自分のリーダーは体力+1する" },
  // BP16-081
  "(1) (1): Destroy an enemy follower": { card: "BP16-081", cn: "《消费1》：选择敌方场上的1个从者。将其破坏", ja: "コスト1：相手の場のフォロワー1体を選ぶ。それを破壊する" },
  "(2) (1): +2/+2 and Ward": { card: "BP16-081", cn: "《消费1》：使这张卡《攻击力》+2/《生命值》+2，并获得【守护】能力", ja: "コスト1：これは攻撃力+2/体力+2して、【守護】を持つ" },
  "(3) (1): +1/+1, draw 2, discard 1": { card: "BP16-081", cn: "《消费1》：使这张卡《攻击力》+1/《生命值》+1。抽取2张卡。将自己的1张手牌舍弃", ja: "コスト1：これは攻撃力+1/体力+1する。2枚引く。自分の手札1枚を捨てる" },
  // BP16-084
  "(1) An enemy follower; Necrocharge (10): 5 damage": { card: "BP16-084", cn: "选择敌方场上的1个从者。【死灵充能_10】给予其5点伤害", ja: "相手の場のフォロワー1体を選ぶ。【ネクロチャージ_10】それに5ダメージ" },
  // BP16-085
  "2 Forest Bats": { card: "BP16-085", cn: "将2张『丛林蝙蝠』卡置于EX区域", ja: "『フォレストバット』2枚をEXエリアに置く" },
  "2 Ghosts": { card: "BP16-085", cn: "将2张『怨灵』卡置于EX区域", ja: "『ゴースト』2枚をEXエリアに置く" },
  // BP17-007
  "Engage 2 Naterran Great Trees: costs 2 less": { card: "BP17-007", cn: "将场上的2个『那塔拉的大树』《横置》：将消费-2", ja: "場の『ナテラの大樹』2つをアクト：コストを-2する" },
  // BP17-012
  "(1) +2/+2 to a Puppetry token follower": { card: "BP17-012", cn: "选择自己场上的1个人偶类型·衍生物·从者。使其《攻击力》+2/《生命值》+2", ja: "自分の場の人形・トークン・フォロワー1体を選ぶ。それは攻撃力+2/体力+2する" },
  "(2) 2 Puppets into your EX area": { card: "BP17-012", cn: "将2张『悬丝傀儡』卡置于EX区域", ja: "『操り人形』2枚をEXエリアに置く" },
  // BP17-025
  "(1) A Natura follower (3 or less) from your deck": { card: "BP17-025", cn: "从自己的牌堆之中搜寻原始消费为3及以下的1张自然类型·从者卡，并召唤到场上", ja: "自分のデッキから元のコスト3以下の自然・フォロワー1枚を探し、場に出す" },
  "(2) (3): A Natura follower (6 or less) from your deck": { card: "BP17-025", cn: "《消费3》：从自己的牌堆之中搜寻原始消费为6及以下的1张自然类型·从者卡，并召唤到场上", ja: "コスト3：自分のデッキから元のコスト6以下の自然・フォロワー1枚を探し、場に出す" },
  // BP17-030
  // the text is conditional (如果选择……的话，将消费-2 / ……を選んでいたなら、コストを-2する); written as 'select: cost' like the other play options
  "Select a Leod follower: costs 2 less": { card: "BP17-030", cn: "选择自己场上的「卡片名包含『里欧德』的从者」：将消费-2", ja: "自分の場の「カード名に『リオード』を含むフォロワー」を選ぶ：コストを-2する" },
  // engine split (an Assassin follower without Leod in its name); 其他的 / 他の added to the official 选择自己场上的1个暗杀者类型·从者 / 自分の場の暗殺者・フォロワー1体を選ぶ
  "Select another Assassin follower": { card: "BP17-030", cn: "选择自己场上的其他的1个暗杀者类型·从者", ja: "自分の場の他の暗殺者・フォロワー1体を選ぶ" },
  // BP17-044
  "Play it for 2 more play points": { card: "BP17-044", cn: "将消费+2", ja: "コストを+2する" },
  // BP17-053
  "(1) Leader +5": { card: "BP17-053", cn: "使自己的主战者《生命值》+5", ja: "自分のリーダーは体力+5する" },
  // official CN says 给予敌方的全体主战者各5点伤害 (each enemy leader), a data error: EN / JA and the script hit each enemy follower on the field; written with the standard wording (BP14-059, BP21-017 ...)
  "(2) (2): 5 damage to each enemy follower": { card: "BP17-053", cn: "《消费2》：给予敌方场上的全体从者各5点伤害", ja: "コスト2：相手の場のフォロワーすべてに5ダメージ" },
  // BP17-054
  "Reveal an Academic card from your hand and put it on the bottom of your deck": { card: "BP17-054", cn: "将手牌中的1张学院类型·卡片公开并置于牌堆底", ja: "手札の学院・カード1枚を公開してデッキの下に置く" },
  // BP17-056
  "(2) Up to 2 Natura spells with different names into your EX area": { card: "BP17-056", cn: "从自己的牌堆之中搜寻卡片名各不相同的自然类型·法术卡最多2张，并置于EX区域", ja: "自分のデッキから自然・スペルをカード名が異なるように2枚まで探し、EXエリアに置く" },
  "(3) Leader +2": { card: "BP17-056", cn: "使自己的主战者《生命值》+2", ja: "自分のリーダーは体力+2する" },
  // BP17-075
  "(1) 3 damage to an enemy follower, 1 to your leader": { card: "BP17-075", cn: "选择敌方场上的1个从者。给予其3点伤害。给予自己的主战者1点伤害", ja: "相手の場のフォロワー1体を選ぶ。それに3ダメージ。自分のリーダーに1ダメージ" },
  "(2) 1 damage to your leader and each enemy follower": { card: "BP17-075", cn: "给予自己的主战者1点伤害。给予敌方场上的全体从者各1点伤害", ja: "自分のリーダーに1ダメージ。相手の場のフォロワーすべてに1ダメージ" },
  "(3) 1 damage to your leader, draw a card": { card: "BP17-075", cn: "给予自己的主战者1点伤害。抽取1张卡", ja: "自分のリーダーに1ダメージ。1枚引く" },
  // BP17-080
  "(1) A Machina follower from your deck into your hand": { card: "BP17-080", cn: "从自己的牌堆之中搜寻1张机械类型·从者卡，并加入手牌", ja: "自分のデッキから機械・フォロワー1枚を探し、手札に加える" },
  "(2) (6): Machina followers costing 4, 3 and 2 or less from your deck onto the field": { card: "BP17-080", cn: "《消费6》：从自己的牌堆之中搜寻原始消费为4及以下的1张机械类型·从者卡与原始消费为3及以下的1张机械类型·从者卡与原始消费为2及以下的1张机械类型·从者卡，并召唤到场上", ja: "コスト6：自分のデッキから元のコスト4以下の機械・フォロワー1枚と元のコスト3以下の機械・フォロワー1枚と元のコスト2以下の機械・フォロワー1枚を探し、場に出す" },
  // BP17-103
  "(2) A Meowskers follower from your cemetery onto the field": { card: "BP17-103", cn: "选择自己的墓场中的1张「卡片名包含『喵鲁』的从者」。将其召唤到场上", ja: "自分の墓場の「カード名に『ムニャール』を含むフォロワー」1枚を選ぶ。それを場に出す" },
  // BP17-112
  "(2) A Viridia Magna from your deck onto the field": { card: "BP17-112", cn: "从自己的牌堆之中搜寻1张『大地之母』卡，并召唤到场上", ja: "自分のデッキから『母なる君』1枚を探し、場に出す" },
  "(3) Turn 2 faceup evolved Natura followers in your evolve deck facedown: draw a card, recover 2": { card: "BP17-112", cn: "可以将自己的进化牌组中正面放置的2张自然类型·进化后从者卡变为反面放置。若如此做，抽取1张卡。将自己的PP回复2点", ja: "自分のエボルヴデッキの表向きの自然・エボルヴフォロワー2枚を裏向きにしてよい。そうしたなら、1枚引く。自分のPPを2回復する" },
  // BP17-116
  "Turn a facedown evolved follower in your evolve deck faceup": { card: "BP17-116", cn: "将进化牌组中的反面放置的1张进化后从者卡变为正面放置", ja: "エボルヴデッキの裏向きのエボルヴフォロワー1枚を表向きにする" },
  // BP17-119
  "(1) A Machina follower of yours +0/+1": { card: "BP17-119", cn: "选择自己场上的1个机械类型·从者。使其《生命值》+1", ja: "自分の場の機械・フォロワー1体を選ぶ。それは体力+1する" },
  "(2) Leader +1": { card: "BP17-119", cn: "使自己的主战者《生命值》+1", ja: "自分のリーダーは体力+1する" },
  // BP18-046
  "(1) With 10 banished cards, 2 damage to an enemy follower and its leader": { card: "BP18-046", cn: "选择敌方场上的1个从者。如果自己的消失领域为10张及以上的话，给予其与其主战者各2点伤害", ja: "相手の場のフォロワー1体を選ぶ。自分の消滅領域が10枚以上なら、それとそれのリーダーに2ダメージ" },
  "(2) Draw a card, banish the top card of your deck": { card: "BP18-046", cn: "抽取1张卡。将自己的牌堆顶1张卡消失", ja: "1枚引く。自分のデッキの上1枚を消滅させる" },
  // BP18-050
  "(1) Destroy an enemy follower, banish the top 2 cards of your deck": { card: "BP18-050", cn: "选择敌方场上的1个从者。将其破坏。将自己的牌堆顶2张卡消失", ja: "相手の場のフォロワー1体を選ぶ。それを破壊する。自分のデッキの上2枚を消滅させる" },
  "(2) (1): Up to 2 followers (2 or less, different names) from your banished zone onto the field": { card: "BP18-050", cn: "《消费1》：选择自己的消失领域中的原始消费为2及以下的、卡片名各不相同的从者卡最多2张。将其召唤到场上", ja: "コスト1：自分の消滅領域の元のコスト2以下のフォロワーをカード名が異なるように2枚まで選ぶ。それを場に出す" },
  // BP18-074
  "Summon a Dragon": { card: "BP18-074", cn: "将1个『飞龙』召唤到场上", ja: "『ドラゴン』1体を場に出す" },
  "Summon a Hellflame Dragon": { card: "BP18-074", cn: "将1个『地狱火魔龙』召唤到场上", ja: "『ヘルフレイムドラゴン』1体を場に出す" },
  // BP18-090
  "Discard a 2-cost card: 1 less": { card: "BP18-090", cn: "将手牌中的原始消费为2的1张卡片舍弃：将消费-1", ja: "手札の元のコスト2のカード1枚を捨てる：コストを-1する" },
  // BP18-118
  "(1) An A-Class Pyromancy from your cemetery into your EX area, 1 less this turn": { card: "BP18-118", cn: "选择自己的墓场中的1张『炎术鉴定A级』卡。将其置于EX区域。这个回合，将其使用之际，将其消费-1", ja: "自分の墓場の『炎術検定A級』1枚を選ぶ。それをEXエリアに置く。このターン、それをプレイする際、コストを-1する" },
  "(2) Leader +1, bury the top card of your deck": { card: "BP18-118", cn: "使自己的主战者《生命值》+1。将自己的牌堆顶1张卡置于墓场", ja: "自分のリーダーは体力+1する。自分のデッキの上1枚を墓場に置く" },
  "(3) Banish a card from your hand: draw a card": { card: "BP18-118", cn: "将1张手牌消失：抽取1张卡", ja: "手札1枚を消滅：1枚引く" },
  // BP18-119
  "Discard a Togh Keyoh card": { card: "BP18-119", cn: "将手牌中的1张透京类型·卡片舍弃", ja: "手札の透京・カード1枚を捨てる" },
  // BP19-020
  "(2) The opponent buries the top 2 cards of their deck": { card: "BP19-020", cn: "将敌方的牌堆顶2张卡置于墓场", ja: "相手のデッキの上2枚を墓場に置く" },
  "(3) Recover 2 play points": { card: "BP19-020", cn: "将自己的PP回复2点", ja: "自分のPPを2回復する" },
  // BP19-025
  "(1) A Warden of Honor from your deck onto the field": { card: "BP19-025", cn: "从自己的牌堆之中搜寻1张『尽忠看守』卡，并召唤到场上", ja: "自分のデッキから『尽忠の看守』1枚を探し、場に出す" },
  "(2) (3): A Radiel, Valorous Enforcer from your deck onto the field": { card: "BP19-025", cn: "《消费3》：从自己的牌堆之中搜寻1张『武皇执行者·雷帝尔』卡，并召唤到场上", ja: "コスト3：自分のデッキから『武皇の執行者・レーディエル』1枚を探し、場に出す" },
  // BP19-039
  "(2) Summon a Multi-Headed Test Subject": { card: "BP19-039", cn: "将1个『多首的实验体』召唤到场上", ja: "『多頭の実験体』1体を場に出す" },
  // BP19-052
  "A Guardform Golem": { card: "BP19-052", cn: "1个『防御型巨像』", ja: "『防御型ゴーレム』1体" },
  "A Strikeform Golem": { card: "BP19-052", cn: "1个『攻击型巨像』", ja: "『攻撃型ゴーレム』1体" },
  // BP19-088
  "(1) Necrocharge (10): 2 damage to an enemy follower": { card: "BP19-088", cn: "选择敌方场上的1个从者。【死灵充能_10】给予其2点伤害", ja: "相手の場のフォロワー1体を選ぶ。【ネクロチャージ_10】それに2ダメージ" },
  "(2) Bury the top card of your deck": { card: "BP19-088", cn: "将自己的牌堆顶1张卡置于墓场", ja: "自分のデッキの上1枚を墓場に置く" },
  // BP19-090
  "(1) (1): 2 damage to an enemy follower, 1 to your leader": { card: "BP19-090", cn: "《消费1》：选择敌方场上的1个从者。给予其2点伤害。给予自己的主战者1点伤害", ja: "コスト1：相手の場のフォロワー1体を選ぶ。それに2ダメージ。自分のリーダーに1ダメージ" },
  "(2) (1): 1 damage to your leader, draw a card": { card: "BP19-090", cn: "《消费1》：给予自己的主战者1点伤害。抽取1张卡", ja: "コスト1：自分のリーダーに1ダメージ。1枚引く" },
  // BP19-092
  "(2) Leader +1, refresh this": { card: "BP19-092", cn: "使自己的主战者《生命值》+1。将这张卡竖置", ja: "自分のリーダーは体力+1する。これをスタンドする" },
  "(3) Draw a card": { card: "BP19-092", cn: "抽取1张卡", ja: "1枚引く" },
  // BP19-098
  "Engage an Erralde, Troth Convict on your field: costs 0": { card: "BP19-098", cn: "将场上的1个『结盟的罪人·艾路拉戴』《横置》：将消费变为0", ja: "場の『結盟の咎人・エルラーデ』1体をアクト：コストを0にする" },
  // BP19-099
  "(1) 2 damage to each enemy leader": { card: "BP19-099", cn: "给予敌方的全体主战者各2点伤害", ja: "相手のリーダーすべてに2ダメージ" },
  "(2) Leader +2": { card: "BP19-099", cn: "使自己的主战者《生命值》+2", ja: "自分のリーダーは体力+2する" },
  // BP19-119
  "(1) Summon a Zerael, Regent of Rebirth from your deck": { card: "BP19-119", cn: "从自己的牌堆之中搜寻1张『轮回统治者·泽勒尔』卡，并召唤到场上", ja: "自分のデッキから『輪廻の統治者・ゼラエル』1枚を探し、場に出す" },
  "(2) Recover 8 play points": { card: "BP19-119", cn: "将自己的PP回复8点", ja: "自分のPPを8回復する" },
  // BP20-018
  "Discard a Beast card": { card: "BP20-018", cn: "将手牌中的1张野兽类型·卡片舍弃", ja: "手札の獣・カード1枚を捨てる" },
  // BP20-019
  "(1) A Crest: Octrice, Hollowness Manifest into your EX area": { card: "BP20-019", cn: "将1张『纹章 空绝的显现·欧克托莉斯』卡置于EX区域", ja: "『クレスト 空絶の顕現・オクトリス』1枚をEXエリアに置く" },
  "(2) A Returning Slash from your deck": { card: "BP20-019", cn: "从自己的牌堆之中搜寻1张『奉还的剑闪』卡，并加入手牌", ja: "自分のデッキから『返還の剣閃』1枚を探し、手札に加える" },
  // BP20-020
  "Fuse {0}": { card: "BP20-020", cn: "【融合】{0}张卡片", ja: "【融合】カード{0}枚" },
  // BP20-037
  "(1) Destroy another Idolatry card of yours, a Melodious Monody into your EX area": { card: "BP20-037", cn: "选择自己场上的其他的1张爱豆类型·卡片。将其破坏。将1张『奏绝的独唱』卡置于EX区域", ja: "自分の場の他のアイドル・カード1枚を選ぶ。それを破壊する。『奏絶の独唱』1枚をEXエリアに置く" },
  "(2) Summon a White Psalm, New Revelation": { card: "BP20-037", cn: "将1个『新约·白之章』召唤到场上", ja: "『新約・白の章』1つを場に出す" },
  // BP20-045
  "(1) Destroy an Idolatry card of yours, draw a card": { card: "BP20-045", cn: "选择自己场上的1张爱豆类型·卡片。将其破坏。抽取1张卡", ja: "自分の場のアイドル・カード1枚を選ぶ。それを破壊する。1枚引く" },
  // BP20-049
  "Add it to your hand": { card: "BP20-049", cn: "加入手牌", ja: "手札に加える" },
  // BP20-075
  "(1) Summon 2 Rulenye, Echoing Scream": { card: "BP20-075", cn: "将2个『绝叫残响·鲁鲁纳伊』召唤到场上", ja: "『絶叫の残響・ルルナイ』2体を場に出す" },
  "(2) Storm to this, +1/+0 to each Abysscraft Omen follower of yours": { card: "BP20-075", cn: "使这张卡获得【疾驰】能力。使自己场上的全体《梦魇职业》绝杰类型·从者各《攻击力》+1", ja: "これは【疾走】を持つ。自分の場のナイトメア絶傑・フォロワーすべては攻撃力+1する" },
  // BP20-080
  "(2) A 3-cost or less Abysscraft Omen follower from your cemetery": { card: "BP20-080", cn: "选择自己的墓场中的原始消费为3及以下的1张《梦魇职业》绝杰类型·从者卡。将其召唤到场上", ja: "自分の墓場の元のコスト3以下のナイトメア絶傑・フォロワー1枚を選ぶ。それを場に出す" },
  "(3) +1/+1 to each Abysscraft Omen follower of yours": { card: "BP20-080", cn: "使自己场上的全体《梦魇职业》绝杰类型·从者各《攻击力》+1/《生命值》+1", ja: "自分の場のナイトメア絶傑・フォロワーすべては攻撃力+1/体力+1する" },
  // BP20-081
  "(1) 4 damage to each enemy follower": { card: "BP20-081", cn: "给予敌方场上的全体从者各4点伤害", ja: "相手の場のフォロワーすべてに4ダメージ" },
  "(2) Leader +4, draw 2": { card: "BP20-081", cn: "使自己的主战者《生命值》+4。抽取2张卡", ja: "自分のリーダーは体力+4する。2枚引く" },
  // BP20-082
  "(2) 2 damage to each enemy leader": { card: "BP20-082", cn: "给予敌方的全体主战者各2点伤害", ja: "相手のリーダーすべてに2ダメージ" },
  "(3) Draw a card, then discard a card": { card: "BP20-082", cn: "抽取1张卡。将自己的1张手牌舍弃", ja: "1枚引く。自分の手札1枚を捨てる" },
  "(4) Recover 1 play point": { card: "BP20-082", cn: "将自己的PP回复1点", ja: "自分のPPを1回復する" },
  // BP20-085
  "(1) 1 damage to an enemy follower": { card: "BP20-085", cn: "选择敌方场上的1个从者。给予其1点伤害", ja: "相手の場のフォロワー1体を選ぶ。それに1ダメージ" },
  // BP20-086
  "(1) Rush to a follower of yours": { card: "BP20-086", cn: "选择自己场上的1个从者。使其获得【突进】能力", ja: "自分の場のフォロワー1体を選ぶ。それは【突進】を持つ" },
  "(2) Assail to a follower of yours": { card: "BP20-086", cn: "选择自己场上的1个从者。使其获得【指定攻击】能力", ja: "自分の場のフォロワー1体を選ぶ。それは【指定攻撃】を持つ" },
  // BP20-089
  "(2) 1 damage to each enemy leader and follower": { card: "BP20-089", cn: "给予敌方的全体主战者与敌方场上的全体从者各1点伤害", ja: "相手のリーダーすべてと相手の場のフォロワーすべてに1ダメージ" },
  // BP20-093
  "(1) With 3 crests: banish an enemy follower, leader +2": { card: "BP20-093", cn: "选择敌方场上的1个从者。如果自己EX区域的纹章卡为3张及以上的话，将其消失。使自己的主战者《生命值》+2", ja: "相手の場のフォロワー1体を選ぶ。自分のEXエリアのクレストが3枚以上なら、それを消滅させる。自分のリーダーは体力+2する" },
  "(2) A Crest: Marwynn, Despair Manifest into your EX area": { card: "BP20-093", cn: "将1张『纹章 绝望的显现·玛文』卡置于EX区域", ja: "『クレスト 絶望の顕現・マーウィン』1枚をEXエリアに置く" },
  // BP20-096
  "(2) (1): A Holy Serpent's Blessing from your deck onto the field": { card: "BP20-096", cn: "《消费1》：从自己的牌堆之中搜寻1张『圣蛇的加护』卡，并召唤到场上", ja: "コスト1：自分のデッキから『聖蛇の加護』1枚を探し、場に出す" },
  // BP20-117
  "Leave it in your deck": { card: "BP20-117", cn: "留在自己的牌堆中", ja: "自分のデッキに残す" },
  "Summon it": { card: "BP20-117", cn: "召唤到场上", ja: "場に出す" },
  // BP21-007
  "(1) +1/+1 to up to 2 Pixie token followers in your EX area or on your field": { card: "BP21-007", cn: "选择「自己场上或自己EX区域的妖精类型·衍生物·从者卡」合计最多2张。使其《攻击力》+1/《生命值》+1", ja: "自分の場や自分のEXエリアの妖精・トークン・フォロワー2枚まで選ぶ。それは攻撃力+1/体力+1する" },
  // BP21-022
  "(2) 3 damage to each enemy leader": { card: "BP21-022", cn: "给予敌方的全体主战者各3点伤害", ja: "相手のリーダーすべてに3ダメージ" },
  "(3) Draw 2, discard a card": { card: "BP21-022", cn: "抽取2张卡。将自己的1张手牌舍弃", ja: "2枚引く。自分の手札1枚を捨てる" },
  // BP21-026
  "A follower with \"{0}\" in its name from your deck onto the field": { card: "BP21-026", cn: "从自己的牌堆中搜寻1张「卡片名包含『{0}』的从者卡」，并召唤到场上", ja: "自分のデッキから「カード名に『{0}』を含むフォロワー」1枚を探し、場に出す" },
  "Amelia": { card: "BP21-026", cn: "艾蜜莉亚", ja: "エミリア" },
  "Lecia": { card: "BP21-026", cn: "莉夏", ja: "リーシャ" },
  // BP21-035
  "Engage an Officer follower on your field: 1 less": { card: "BP21-035", cn: "将场上的1个士兵类型·从者《横置》：将消费-1", ja: "場の兵士・フォロワー1体をアクト：コストを-1する" },
  // BP21-052
  "Engage 2 Academic followers on your field: 2 less": { card: "BP21-052", cn: "将场上的2个学院类型·从者《横置》：将消费-2", ja: "場の学院・フォロワー2体をアクト：コストを-2する" },
  // BP21-090
  "(1) Banish an Abysscraft follower from your cemetery: 2x its attack as damage": { card: "BP21-090", cn: "将墓场中的1张《梦魇职业》从者卡消失：选择敌方场上的1个从者。给予其与「以这个能力消失的《梦魇职业》从者卡的攻击力」的2倍等量的伤害", ja: "墓場のナイトメアフォロワー1枚を消滅：相手の場のフォロワー1体を選ぶ。それに「これによって消滅したナイトメアフォロワーの攻撃力」の2倍のダメージ" },
  "(2) Banish a non-Abysscraft follower from your cemetery: its attack as damage": { card: "BP21-090", cn: "将墓场中的1张「非《梦魇职业》的从者卡」消失：选择敌方场上的1个从者。给予其与「以这个能力消失的「非《梦魇职业》的从者卡」的攻击力」等量的伤害", ja: "墓場の「ナイトメアでないフォロワー」1枚を消滅：相手の場のフォロワー1体を選ぶ。それに「これによって消滅した「ナイトメアでないフォロワー」の攻撃力」と同じダメージ" },
  // BP21-095
  "(1) Summon a Holy Cavalier; Holy Cavaliers get +1/+0 and Assail": { card: "BP21-095", cn: "将1个『圣骑兵』召唤到场上。使自己场上的全体『圣骑兵』各《攻击力》+1，并获得【指定攻击】能力", ja: "『聖騎兵』1体を場に出す。自分の場の『聖騎兵』すべては攻撃力+1して、【指定攻撃】を持つ" },
  "(2) Put a Crest: Wilbert, Desolate Paladin into your EX area": { card: "BP21-095", cn: "将1张『纹章 哀泣的圣骑士·维尔伯特』卡置于EX区域", ja: "『クレスト 嗚咽の聖騎士・ウィルバート』1枚をEXエリアに置く" },
  // CP01-005
  "(1) A follower with Storm from your deck": { card: "CP01-005", cn: "从自己的牌堆之中搜寻持有【疾驰】能力的1张从者卡，并加入手牌", ja: "自分のデッキから【疾走】を持つフォロワー1枚を探し、手札に加える" },
  "(2) +3/+0 to a follower with Storm on your field": { card: "CP01-005", cn: "选择持有【疾驰】能力的自己的1个从者。使其《攻击力》+3", ja: "【疾走】を持つ自分のフォロワー1体を選ぶ。それは《攻撃力》+3する" },
  // CP01-021
  "(1) An Umamusume card from the top 2": { card: "CP01-021", cn: "查看自己的牌堆顶2张卡。从那之中，可以将1张赛马娘类型·卡片公开并加入手牌。将剩余的卡以任意顺序置于牌堆底", ja: "自分のデッキの上2枚を見る。その中から、ウマ娘・カード1枚を公開して手札に加えてよい。残りを好きな順にデッキの下に置く" },
  "(2) A BNW follower from your cemetery": { card: "CP01-021", cn: "选择自己的墓场中的1张BNW类型·从者卡。将其加入手牌", ja: "自分の墓場のBNW・フォロワー1枚を選ぶ。それを手札に加える" },
  // CP01-045
  "(1) The top card of your deck into your EX area, 3 times": { card: "CP01-045", cn: "将自己的牌堆顶1张卡置于EX区域。将这动作进行3次", ja: "自分のデッキの上1枚をEXエリアに置く。これを3回くり返す" },
  "(2) A Kawakami Princess from your deck onto your field": { card: "CP01-045", cn: "从自己的牌堆之中搜寻1张『川上公主』卡，并召唤到场上", ja: "自分のデッキから『カワカミプリンセス』1枚を探し、場に出す" },
  // CP02-019
  "Engage it": { card: "CP02-019", cn: "将其横置", ja: "それをアクトする" },
  "Refresh it": { card: "CP02-019", cn: "将其竖置", ja: "それをスタンドする" },
  // CP02-020
  "Destroy an enemy follower": { card: "CP02-020", cn: "选择敌方场上的1个从者。将其破坏", ja: "相手の場のフォロワー1体を選ぶ。それを破壊する" },
  // CP02-038
  "Discard 3 iM@S CG cards: costs 6 less": { card: "CP02-038", cn: "将手牌中的3张IMC类型·卡片舍弃：将消费-6", ja: "手札のデレマス・カード3枚を捨てる：コストを-6する" },
  // CP02-050
  "Discard a card: costs 2 less": { card: "CP02-050", cn: "将1张手牌舍弃：将消费-2", ja: "手札1枚を捨てる：コストを-2する" },
  // CP02-065
  "Destroy an enemy amulet": { card: "CP02-065", cn: "选择敌方场上的1个护符。将其破坏", ja: "相手の場のアミュレット1つを選ぶ。それを破壊する" },
  // CP02-103
  "Banish 3 Cute, 3 Cool and 3 Passion cards from your cemetery: costs 9 less": { card: "CP02-103", cn: "将墓场中的3张Cute类型·卡片与3张Cool类型·卡片与3张Passion类型·卡片消失：将消费-9", ja: "墓場のキュート・カード3枚とクール・カード3枚とパッション・カード3枚を消滅：コストを-9する" },
  // CP03-014
  "Deal 2 damage to an enemy follower": { card: "CP03-014", cn: "选择敌方场上的1个从者。给予其2点伤害", ja: "相手の場のフォロワー1体を選ぶ。それに2ダメージ" },
  "Discard an Aqua Force card: 3 damage, and a 1-cost Aqua Force follower from the top of your deck": { card: "CP03-014", cn: "将手牌中的1张苍海军势类型·卡片舍弃：选择敌方场上的1个从者。给予其3点伤害。查看自己的牌堆顶1张卡。从那之中，可以将原始消费为1的1张苍海军势类型·从者卡公开并加入手牌", ja: "手札のアクアフォース・カード1枚を捨てる：相手の場のフォロワー1体を選ぶ。それに3ダメージ。自分のデッキの上1枚を見る。その中から、元のコスト1のアクアフォース・フォロワー1枚を公開して手札に加えてよい" },
  // CP03-029
  "Turn a faceup evolved Blaster follower in your evolve deck facedown: costs 3 less": { card: "CP03-029", cn: "将进化牌组中正面放置的1张「卡片名包含『狂风』的从者卡」变为反面放置：将消费-3", ja: "エボルヴデッキの表向きの「カード名に『ブラスター』を含むエボルヴフォロワー」1枚を裏向きにする：コストを-3する" },
  // CP03-040
  "Your leader's next damage this turn is 5 less": { card: "CP03-040", cn: "这个回合，使自己的主战者下次受到的伤害-5", ja: "このターン、自分のリーダーが次に受けるダメージを-5する" },
  // CP03-044
  "Pay 4: summon a Pale Moon follower from your banished zone": { card: "CP03-044", cn: "《消费4》：选择自己的消失领域中的1张黯月类型·从者卡。将其召唤到场上", ja: "コスト4：自分の消滅領域のペイルムーン・フォロワー1枚を選ぶ。それを場に出す" },
  "Summon a 2-cost or less Pale Moon follower from your banished zone": { card: "CP03-044", cn: "选择自己的消失领域中的原始消费为2及以下的1张黯月类型·从者卡。将其召唤到场上", ja: "自分の消滅領域の元のコスト2以下のペイルムーン・フォロワー1枚を選ぶ。それを場に出す" },
  // CP03-045
  "Draw a card, then banish a card from your hand": { card: "CP03-045", cn: "抽取1张卡。将自己的1张手牌消失", ja: "1枚引く。自分の手札1枚を消滅させる" },
  "Storm to a Pale Moon follower with 5 cards in your banished zone": { card: "CP03-045", cn: "选择自己场上的1个黯月类型·从者。如果自己的消失领域为5张及以上的话，使其获得【疾驰】能力", ja: "自分の場のペイルムーン・フォロワー1体を選ぶ。自分の消滅領域が5枚以上なら、それは【疾走】を持つ" },
  // CP03-055
  "Discard a Pale Moon card: 3 damage and banish your top 3 cards": { card: "CP03-055", cn: "将手牌中的1张黯月类型·卡片舍弃：选择敌方场上的1个从者。给予其3点伤害。将自己的牌堆顶3张卡消失", ja: "手札のペイルムーン・カード1枚を捨てる：相手の場のフォロワー1体を選ぶ。それに3ダメージ。自分のデッキの上3枚を消滅させる" },
  // CP03-083
  "Bury a Phantom Blaster Dragon instead of paying the cost": { card: "CP03-083", cn: "不支付这张卡的原始消费，将场上的1个『幻影狂风龙』置于墓场", ja: "これの元のコストを払うのではなく、場の『ファントム・ブラスター・ドラゴン』1体を墓場に置く" },
  // CP03-084
  "Bury a Shadow Paladin follower": { card: "CP03-084", cn: "将场上的1个暗影骑士团类型·从者置于墓场", ja: "場のシャドウパラディン・フォロワー1体を墓場に置く" },
  // CP03-096
  "Discard a Shadow Paladin card: 3 damage and bury your top card": { card: "CP03-096", cn: "将手牌中的1张暗影骑士团类型·卡片舍弃：选择敌方场上的1个从者。给予其3点伤害。将自己的牌堆顶1张卡置于墓场", ja: "手札のシャドウパラディン・カード1枚を捨てる：相手の場のフォロワー1体を選ぶ。それに3ダメージ。自分のデッキの上1枚を墓場に置く" },
  // CP03-107
  "Banish an enemy follower": { card: "CP03-107", cn: "选择敌方场上的1个从者。将其消失", ja: "相手の場のフォロワー1体を選ぶ。それを消滅させる" },
  // CP03-117
  "Discard an Oracle Think Tank card: 3 damage and arrange your top 2 cards": { card: "CP03-117", cn: "将手牌中的1张占卜魔法团类型·卡片舍弃：选择敌方场上的1个从者。给予其3点伤害。查看自己的牌堆顶2张卡。从那之中，将卡任意张数以任意顺序置于牌堆顶。将剩余的卡以任意顺序置于牌堆底", ja: "手札のオラクルシンクタンク・カード1枚を捨てる：相手の場のフォロワー1体を選ぶ。それに3ダメージ。自分のデッキの上2枚を見る。その中から、好きな枚数を好きな順にデッキの上に置く。残りを好きな順にデッキの下に置く" },
  // CP03-123
  "Arrange the top 3 cards of your deck": { card: "CP03-123", cn: "查看自己的牌堆顶3张卡。从那之中，将卡任意张数以任意顺序置于牌堆顶。将剩余的卡以任意顺序置于牌堆底", ja: "自分のデッキの上3枚を見る。その中から、好きな枚数を好きな順にデッキの上に置く。残りを好きな順にデッキの下に置く" },
  "Return 5 followers with Triggers from your cemetery to your deck, draw a card and recover 1 play point": { card: "CP03-123", cn: "选择自己的墓场中的持有触发能力的5张从者卡。将其放回牌堆，并洗切。抽取1张卡。将自己的PP回复1点", ja: "自分の墓場のトリガーを持つフォロワー5枚を選ぶ。それをデッキに戻し、シャッフルする。1枚引く。自分のPPを1回復する" },
  // CP03-125
  "Add a follower from your cemetery to your hand": { card: "CP03-125", cn: "选择自己的墓场中的1张从者卡。将其加入手牌", ja: "自分の墓場のフォロワー1枚を選ぶ。それを手札に加える" },
  "Give your leader +4 defense": { card: "CP03-125", cn: "使自己的主战者《生命值》+4", ja: "自分のリーダーは体力+4する" },
  // CP04-036
  "Engage a Pecorine follower: 3 less": { card: "CP04-036", cn: "将场上的1个「卡片名包含『佩可莉姆』的从者」《横置》：将消费-3", ja: "場の「カード名に『ペコリーヌ』を含むフォロワー」1体をアクト：コストを-3する" },
  // CP04-062
  "Max play points +1, leader +1 defense": { card: "CP04-062", cn: "将自己的PP最大值+1点。使自己的《生命值》+1", ja: "自分のPP最大値を+1する。自分のリーダーは体力+1する" },
  "With 10 max play points: summon a 2-cost PriConne follower from your deck": { card: "CP04-062", cn: "如果自己的PP最大值为10的话，从自己的牌堆之中搜寻原始消费为2的1张公主连结类型·从者卡，并召唤到场上", ja: "自分のPP最大値が10なら、自分のデッキから元のコスト2のプリコネ・フォロワー1枚を探し、場に出す" },
  // CP04-091
  "Equip this with a Glorious Feather token": { card: "CP04-091", cn: "将1张『辉煌羽饰』卡装备到这张卡", ja: "これは『グロリアスフェザー』1枚を装備する" },
  "Summon up to 2 Sarendia Orphanage followers with a total cost of 3 or less": { card: "CP04-091", cn: "直到原始消费的合计变为3及以下、从自己的牌堆之中搜寻咲恋救济院类型·从者卡最多2张，并召唤到场上", ja: "自分のデッキからサレンディア救護院・フォロワーを元のコストの合計が3以下になるように2枚まで探し、場に出す" },
  // CP04-099
  "Ward": { card: "CP04-099", cn: "【守护】", ja: "【守護】" },
  // CP04-114
  "Execute a Union Burst ability of a PriConne follower": { card: "CP04-114", cn: "选择自己场上的1个「与这张卡不同名的公主连结类型·从者」。如果不包含这个能力，这个回合中自己的《UB》能力已发动2次及以上的话，不支付原始消费、将其的《UB》能力发动1次", ja: "自分の場の「これと同名を除くプリコネ・フォロワー」1体を選ぶ。これを含めず、このターン中に自分のUB能力が2回以上発動していたなら、それのUB能力1つを元のコストを支払わずに発動する" },
  "Give another follower Ward": { card: "CP04-114", cn: "选择自己场上的其他的1个从者。使其获得【守护】能力", ja: "自分の場の他のフォロワー1体を選ぶ。それは【守護】を持つ" },
  // CSD03a-007
  "Discard a Royal Paladin card: 3 damage to an enemy follower, and your leader +2": { card: "CSD03a-007", cn: "将手牌中的1张光辉骑士团类型·卡片舍弃：选择敌方场上的1个从者。给予其3点伤害。使自己的主战者《生命值》+2", ja: "手札のロイヤルパラディン・カード1枚を捨てる：相手の場のフォロワー1体を選ぶ。それに3ダメージ。自分のリーダーは体力+2する" },
  // CSD03b-007
  "Discard a Kagero card: 3 damage to an enemy follower and 1 to its leader": { card: "CSD03b-007", cn: "将手牌中的1张阳炎类型·卡片舍弃：选择敌方场上的1个从者。给予其3点伤害。给予其主战者1点伤害", ja: "手札のかげろう・カード1枚を捨てる：相手の場のフォロワー1体を選ぶ。それに3ダメージ。それのリーダーに1ダメージ" },
  // DSD01a-001
  "Search your deck for a Grea, Mysterian Dragoness and summon it": { card: "DSD01a-001", cn: "从自己的牌堆之中搜寻1张『马纳历亚龙人公主·古蕾娅』卡，并召唤到场上", ja: "自分のデッキから『マナリアの竜姫・グレア』1枚を探し、場に出す" },
  "Search your deck for an Anne's Sorcery (into your EX area); the next one costs 5 less": { card: "DSD01a-001", cn: "从自己的牌堆之中搜寻1张『安的大魔法』卡，并置于EX区域。这个回合，下次自己将『安的大魔法』卡使用之际，将其消费-5", ja: "自分のデッキから『アンの大魔法』1枚を探し、EXエリアに置く。このターン、次に自分が『アンの大魔法』をプレイする際、コストを-5する" },
  // DSD01a-008
  "{[cost03]}: with 10 Academic cards in your cemetery, deal 8 damage and draw 2 cards": { card: "DSD01a-008", cn: "《消费3》：选择敌方的1位主战者或敌方场上的1个从者。如果自己的墓场中的学院类型·卡片为10张及以上的话，给予其8点伤害。抽取2张卡", ja: "コスト3：相手のリーダー1人か相手の場のフォロワー1体を選ぶ。自分の墓場の学院・カードが10枚以上なら、それに8ダメージ。2枚引く" },
  "Deal 4 damage to an enemy leader or follower and draw a card": { card: "DSD01a-008", cn: "选择敌方的1位主战者或敌方场上的1个从者。给予其4点伤害。抽取1张卡", ja: "相手のリーダー1人か相手の場のフォロワー1体を選ぶ。それに4ダメージ。1枚引く" },
  // DSD01a-014
  "Reveal 2 Academic cards from your hand": { card: "DSD01a-014", cn: "将手牌中的2张学院类型·卡片公开", ja: "手札の学院・カード2枚を公開する" },
  // DSD01a-015
  "Put a マナリアの魔弾 token into your EX area": { card: "DSD01a-015", cn: "将1张『马纳历亚魔弹』卡置于EX区域", ja: "『マナリアの魔弾』1枚をEXエリアに置く" },
  "Select an Academic spell in your cemetery; with 5 Academic cards there, add it to your hand": { card: "DSD01a-015", cn: "选择自己的墓场中的1张学院类型·法术卡。如果自己的墓场中的学院类型·卡片为5张及以上的话，将其加入手牌", ja: "自分の墓場の学院・スペル1枚を選ぶ。自分の墓場の学院・カードが5枚以上なら、それを手札に加える" },
  // ECP01-006
  "Return an enemy follower to its owner's hand": { card: "ECP01-006", cn: "选择敌方场上的1个从者。将其放回手牌", ja: "相手の場のフォロワー1体を選ぶ。それを手札に戻す" },
  "Summon an Umamusume follower that costs 2 or less from your deck": { card: "ECP01-006", cn: "从自己的牌堆之中搜寻原始消费为2及以下的1张赛马娘类型·从者卡，并召唤到场上", ja: "自分のデッキから元のコスト2以下のウマ娘・フォロワー1枚を探し、場に出す" },
  // ECP01-029
  "Discard 3 Umamusume cards: increase your max play points by 2": { card: "ECP01-029", cn: "将手牌中的3张赛马娘类型·卡片舍弃：将自己的PP最大值+2点", ja: "手札のウマ娘・カード3枚を捨てる：自分のPP最大値を+2する" },
  "Discard an Umamusume card: increase your max play points by 1": { card: "ECP01-029", cn: "将手牌中的1张赛马娘类型·卡片舍弃：将自己的PP最大值+1点", ja: "手札のウマ娘・カード1枚を捨てる：自分のPP最大値を+1する" },
  // ECP01-036
  "Discard an Umamusume card: this costs 2 less": { card: "ECP01-036", cn: "将手牌中的1张赛马娘类型·卡片舍弃：将消费-2", ja: "手札のウマ娘・カード1枚を捨てる：コストを-2する" },
  // ECP01-048
  "Give your leader +2 defense and draw a card": { card: "ECP01-048", cn: "使自己的主战者《生命值》+2。抽取1张卡", ja: "自分のリーダーは体力+2する。1枚引く" },
  // ECP01-055
  "Add an Umamusume follower that costs 5 or less from your cemetery to your hand": { card: "ECP01-055", cn: "选择自己的墓场中的原始消费为5及以下的1张赛马娘类型·从者卡。将其加入手牌", ja: "自分の墓場の元のコスト5以下のウマ娘・フォロワー1枚を選ぶ。それを手札に加える" },
  "Give each other Umamusume follower on your field +1/+1": { card: "ECP01-055", cn: "使自己场上的其他的全体赛马娘类型·从者各《攻击力》+1/《生命值》+1", ja: "自分の場の他のウマ娘・フォロワーすべては攻撃力+1/体力+1する" },
  "Turn up to 2 faceup Carrots facedown and gain 1 evolution point": { card: "ECP01-055", cn: "选择自己的进化牌组中的正面放置的2张『胡萝卜』卡。将其变为反面放置。将自己的EP+1", ja: "自分のエボルヴデッキの表向きの『にんじん』2枚まで選ぶ。それを裏向きにする。自分のEPを+1する" },
  // ECP02-038
  "Pay 4 and bury this: summon a follower with \"Fumika Sagisawa\" in its name from your deck": { card: "ECP02-038", cn: "《消费4》将这张卡置于墓场：从自己的牌堆之中搜寻1张「卡片名包含『鹭泽文香』的从者卡」，并召唤到场上", ja: "コスト4これを墓場に置く：自分のデッキから「カード名に『鷺沢文香』を含むフォロワー」1枚を探し、場に出す" },
  // ECP02-043
  "Look at the top 2 cards and take a Passion card": { card: "ECP02-043", cn: "查看自己的牌堆顶2张卡。从那之中，可以将1张Passion类型·卡片公开并加入手牌。将剩余的卡以任意顺序置于牌堆底", ja: "自分のデッキの上2枚を見る。その中から、パッション・カード1枚を公開して手札に加えてよい。残りを好きな順にデッキの下に置く" },
  "Pay 3 and bury this: summon a follower with \"Yui Ohtsuki\" in its name from your deck and evolve it": { card: "ECP02-043", cn: "《消费3》将这张卡置于墓场：从自己的牌堆之中搜寻1张「卡片名包含『大槻唯』的从者卡」，并召唤到场上。使其进化", ja: "コスト3これを墓場に置く：自分のデッキから「カード名に『大槻唯』を含むフォロワー」1枚を探し、場に出す。それは進化する" },
  // ECP02-059
  "Put a Magical Item token into your EX area": { card: "ECP02-059", cn: "将1张『魔法道具』卡置于EX区域", ja: "『魔法のアイテム』1枚をEXエリアに置く" },
  "Summon a follower with \"Sachiko Koshimizu\" in its name from your deck; it gets Drain": { card: "ECP02-059", cn: "从自己的牌堆之中搜寻1张「卡片名包含『舆水幸子』的从者卡」，并召唤到场上。使其获得【吸血】能力", ja: "自分のデッキから「カード名に『輿水幸子』を含むフォロワー」1枚を探し、場に出す。それは【ドレイン】を持つ" },
  // SD01-001
  "Put into your EX area: {0}": { card: "SD01-001", cn: "将{0}张置于EX区域", ja: "{0}枚をEXエリアに置く" },
  "Put onto your field: {0}": { card: "SD01-001", cn: "将{0}张召唤到场上", ja: "{0}枚を場に出す" },
  // SD03-016
  "Put a Guardform Golem into your EX area": { card: "SD03-016", cn: "将1张『防御型巨像』卡置于EX区域", ja: "『防御型ゴーレム』1枚をEXエリアに置く" },
  "Put a Strikeform Golem into your EX area": { card: "SD03-016", cn: "将1张『攻击型巨像』卡置于EX区域", ja: "『攻撃型ゴーレム』1枚をEXエリアに置く" },
  // SD04-002
  "Increase your maximum play points by 1": { card: "SD04-002", cn: "将自己的PP最大值+1点", ja: "自分のPP最大値を+1する" },
  // SP01-026
  "An enemy follower can't attack during its controller's next turn": { card: "SP01-026", cn: "选择敌方场上的1个从者。下次的其玩家的回合中，使其不能对敌方进行攻击", ja: "相手の場のフォロワー1体を選ぶ。次のそれのプレイヤーのターン中、それは相手を攻撃できない" },
  "The next follower put onto your field this turn gets +1/+1": { card: "SP01-026", cn: "这个回合，当下次从者1个及以上召唤到自己的场上时，使那之中的1个《攻击力》+1/《生命值》+1", ja: "このターン、次に自分の場にフォロワーが1体以上出たとき、その中の1体は攻撃力+1/体力+1する" },
};
