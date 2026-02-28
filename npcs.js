/**
 * ストーリーモード用 NPCマスターデータ
 * unlockCondition: 解放条件となるNPCのID（nullの場合は最初から解放されている）
 * deckType: 'level' (指定レベル周辺からランダム生成), 'fixed' (指定されたIDのカードで固定)
 * baseLevel: deckTypeが'level'の場合の基準レベル
 * fixedDeck: deckTypeが'fixed'の場合のカードID配列（長さ5）
 * rules: このNPC戦で強制適用される特殊ルールの配列 (例: ['open', 'same'], なしの場合は空配列)
 */
const NPC_DATA = [
    {
        id: 'npc_00',
        name: 'チュートリアル教官',
        description: 'カードの置き方と裏返しの基本ルールを教えてくれる。まずはここから始めよう！',
        deckType: 'fixed',
        fixedDeck: ['c2', 'c3', 'c4', 'c5', 'c7'], // ゲスパーなどを固定手札に
        rules: [],
        unlockCondition: null
    },
    {
        id: 'npc_01',
        name: 'バラムガーデン門下生',
        description: 'カードゲームの初心者。ルールを覚えるのに最適。',
        deckType: 'level',
        baseLevel: 1,
        rules: [],
        unlockCondition: 'npc_00'
    },
    {
        id: 'npc_02',
        name: 'トゥリープFC会員01',
        description: '少しカードを集め始めた生徒。オープンルールで手札を公開して戦う。',
        deckType: 'level',
        baseLevel: 2,
        rules: ['open'],
        unlockCondition: 'npc_01'
    },
    {
        id: 'npc_03',
        name: 'カドワキ先生',
        description: '保健室の先生。強力なモンスターカードを隠し持っているという噂がある。',
        deckType: 'level',
        baseLevel: 3,
        rules: ['open'],
        unlockCondition: 'npc_02'
    },
    {
        id: 'npc_04',
        name: 'シュウ',
        description: 'シードの先輩。同じ数字が隣接するとひっくり返る「セイム」ルールを好む。',
        deckType: 'level',
        baseLevel: 4,
        rules: ['open', 'same'],
        unlockCondition: 'npc_03'
    },
    {
        id: 'npc_05',
        name: 'シド学園長',
        description: 'バラムガーデンの学園長。合計値が同じ箇所でひっくり返る「プラス」ルールを駆使する難敵。',
        deckType: 'level',
        baseLevel: 5,
        rules: ['open', 'same', 'plus'],
        unlockCondition: 'npc_04'
    },
    {
        id: 'npc_06',
        name: 'ノーグ',
        description: 'ガーデンのマスター。サドンデス特有の長期戦と、エレメンタルルールの複雑な盤面を用意してくる。',
        deckType: 'level',
        baseLevel: 6,
        rules: ['open', 'same-wall', 'sudden-death', 'elemental'],
        unlockCondition: 'npc_05'
    },
    {
        id: 'npc_07',
        name: 'イデア',
        description: '魔女。すべてのルールが複合した過酷な条件で、高レベルカードの猛攻を仕掛けてくる。',
        deckType: 'level',
        baseLevel: 7,
        rules: ['open', 'same', 'plus', 'same-wall', 'sudden-death', 'elemental'],
        unlockCondition: 'npc_06'
    }
];
