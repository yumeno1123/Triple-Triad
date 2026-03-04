/**
 * ストーリーモード用 NPCマスターデータ
 * unlockCondition: 解放条件となるNPCのID（nullの場合は最初から解放されている）
 * deckType: 'level' (指定レベル周辺からランダム生成), 'fixed' (指定されたIDのカードで固定)
 * baseLevel: deckTypeが'level'の場合の基準レベル
 * fixedDeck: deckTypeが'fixed'の場合のカードID配列（長さ5）
 * rules: このNPC戦で強制適用される特殊ルールの配列 (例: ['open', 'same'], なしの場合は空配列)
 */
const AREA_DATA = [
    { id: 'area_tutorial', name: 'チュートリアル', unlockCondition: null },
    { id: 'area_balamb_garden', name: 'バラムガーデン', unlockCondition: 'npc_tut_combo' },
    { id: 'area_other', name: 'その他の地域', unlockCondition: 'npc_05' }
];

const NPC_DATA = [
    {
        id: 'npc_00',
        name: 'チュートリアル教官',
        areaId: 'area_tutorial',
        description: 'カードの置き方と裏返しの基本ルールを教えてくれる。まずはここから始めよう！',
        deckType: 'fixed',
        fixedDeck: ['c2', 'c3', 'c4', 'c5', 'c7'], // ゲスパーなどを固定手札に
        rules: [],
        unlockCondition: null
    },
    {
        id: 'npc_tut_same',
        name: 'チュートリアル教官（セイム）',
        areaId: 'area_tutorial',
        description: '隣接する数字が2箇所以上同じ場合に発動する「セイム」ルールを実地で教えてくれます。',
        deckType: 'fixed',
        fixedDeck: ['c4', 'c6', 'c10', 'c11', 'c12'], // レッドマウス等
        rules: ['same'],
        unlockCondition: 'npc_00'
    },
    {
        id: 'npc_tut_plus',
        name: 'チュートリアル教官（プラス）',
        areaId: 'area_tutorial',
        description: '隣接する数字の「足し算の合計」が2箇所以上同じ場合に発動する「プラス」ルールを教えます。',
        deckType: 'fixed',
        fixedDeck: ['c21', 'c22', 'c23', 'c24', 'c25'],
        rules: ['plus'],
        unlockCondition: 'npc_tut_same'
    },
    {
        id: 'npc_tut_combo',
        name: 'チュートリアル教官（コンボ）',
        areaId: 'area_tutorial',
        description: 'セイムやプラスから派生して別のカードを奪う「連鎖（コンボ）」ルールを実地で教えます。',
        deckType: 'fixed',
        fixedDeck: ['c2', 'c8', 'c14', 'c15', 'c18'],
        rules: ['same', 'plus'],
        unlockCondition: 'npc_tut_plus'
    },
    {
        id: 'npc_01',
        name: 'バラムガーデン門下生',
        areaId: 'area_balamb_garden',
        description: 'カードゲームの初心者。ルールを覚えるのに最適。',
        deckType: 'level',
        baseLevel: 1,
        rules: [],
        unlockCondition: 'npc_tut_combo'
    },
    {
        id: 'npc_02',
        name: 'トゥリープFC会員01',
        areaId: 'area_balamb_garden',
        description: '少しカードを集め始めた生徒。オープンルールで手札を公開して戦う。',
        deckType: 'level',
        baseLevel: 2,
        rules: ['open'],
        unlockCondition: 'npc_01'
    },
    {
        id: 'npc_03',
        name: 'カドワキ先生',
        areaId: 'area_balamb_garden',
        description: '保健室の先生。強力なモンスターカードを隠し持っているという噂がある。',
        deckType: 'level',
        baseLevel: 3,
        rules: ['open'],
        unlockCondition: 'npc_02'
    },
    {
        id: 'npc_04',
        name: 'シュウ',
        areaId: 'area_balamb_garden',
        description: 'シードの先輩。同じ数字が隣接するとひっくり返る「セイム」ルールを好む。',
        deckType: 'level',
        baseLevel: 4,
        rules: ['open', 'same'],
        unlockCondition: 'npc_03'
    },
    {
        id: 'npc_05',
        name: 'シド学園長',
        areaId: 'area_balamb_garden',
        description: 'バラムガーデンの学園長。合計値が同じ箇所でひっくり返る「プラス」ルールを駆使する難敵。',
        deckType: 'level',
        baseLevel: 5,
        rules: ['open', 'same', 'plus'],
        unlockCondition: 'npc_04'
    },
    {
        id: 'npc_06',
        name: 'ノーグ',
        areaId: 'area_other',
        description: 'ガーデンのマスター。サドンデス特有の長期戦と、エレメンタルルールの複雑な盤面を用意してくる。',
        deckType: 'level',
        baseLevel: 6,
        rules: ['open', 'same-wall', 'sudden-death', 'elemental'],
        unlockCondition: 'npc_05'
    },
    {
        id: 'npc_07',
        name: 'イデア',
        areaId: 'area_other',
        description: '魔女。すべてのルールが複合した過酷な条件で、高レベルカードの猛攻を仕掛けてくる。',
        deckType: 'level',
        baseLevel: 7,
        rules: ['open', 'same', 'plus', 'same-wall', 'sudden-death', 'elemental'],
        unlockCondition: 'npc_06'
    }
];
