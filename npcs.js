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
    { id: 'area_balamb_garden', name: 'バラムガーデン', unlockCondition: 'npc_00' },
    { id: 'area_dollet', name: 'ドール', unlockCondition: 'npc_04' },
    { id: 'area_galbadia', name: 'ガルバディア', unlockCondition: 'npc_dollet_new_01' },
    { id: 'area_fh', name: 'F.H.', unlockCondition: 'npc_gal_new_01' },
    { id: 'area_trabia', name: 'トラビア', unlockCondition: 'npc_fh_new_01' },
    { id: 'area_esthar', name: 'エスタ', unlockCondition: 'npc_tra_01' },
    { id: 'area_lunar', name: '宇宙', unlockCondition: 'npc_est_new_01' },
    { id: 'area_balamb_cc', name: 'バラムガーデン (CC団)', unlockCondition: 'npc_05' }
];

const NPC_DATA = [
    // --- チュートリアル ---
    {
        id: 'npc_00',
        name: 'チュートリアル教官',
        areaId: 'area_tutorial',
        description: 'カードの置き方と裏返しの基本ルールを教えてくれる。まずはここから始めよう！',
        deckType: 'fixed',
        fixedDeck: ['c2', 'c3', 'c4', 'c5', 'c7'],
        rules: ['open'],
        unlockCondition: null
    },
    {
        id: 'npc_tut_same',
        name: 'チュートリアル教官（セイム）',
        areaId: 'area_tutorial',
        description: '隣接する数字が2箇所以上同じ場合に発動する「セイム」ルールを実地で教えてくれます。',
        deckType: 'fixed',
        // c5(プリヌラ:上2)を左下に配置させる
        // プレイヤーのケダチク(下2, 上4)とハウリザード(下4)で、2点一致 → セイム成立
        fixedDeck: ['c5', 'c8', 'c12', 'c11', 'c7'],
        rules: ['same', 'open'],
        unlockCondition: 'npc_00'
    },
    {
        id: 'npc_tut_plus',
        name: 'チュートリアル教官（プラス）',
        areaId: 'area_tutorial',
        description: '隣接する数字の「足し算の合計」が2箇所以上同じ場合に発動する「プラス」ルールを教えます。',
        deckType: 'fixed',
        fixedDeck: ['c21', 'c23', 'c22', 'c24', 'c25'],
        rules: ['plus', 'open'],
        unlockCondition: 'npc_tut_same'
    },
    {
        id: 'npc_tut_combo',
        name: 'チュートリアル教官（コンボ）',
        areaId: 'area_tutorial',
        description: 'セイムやプラスから派生して別のカードを奪う「連鎖（コンボ）」ルールを実地で教えます。',
        deckType: 'fixed',
        fixedDeck: ['c2', 'c18', 'c14', 'c11', 'c8'],
        rules: ['same', 'plus', 'open'],
        unlockCondition: 'npc_tut_plus'
    },
    {
        id: 'npc_tut_same_wall',
        name: 'チュートリアル教官（ウォールセイム）',
        areaId: 'area_tutorial',
        description: '盤面の「壁」を、数字のA（10）として扱う「ウォールセイム」ルールを学びます。',
        deckType: 'fixed',
        fixedDeck: ['c53', 'c10', 'c12', 'c13', 'c16'],
        rules: ['same-wall', 'open'],
        unlockCondition: 'npc_tut_combo'
    },

    // --- バラムガーデン ---
    {
        id: 'npc_01',
        name: 'バラムガーデン門下生',
        areaId: 'area_balamb_garden',
        description: 'カードゲームの初心者。ルールを覚えるのに最適。',
        deckType: 'level',
        baseLevel: 1,
        rules: ['open'],
        unlockCondition: 'npc_00'
    },
    {
        id: 'npc_02',
        name: 'トゥリープFC会員01',
        areaId: 'area_balamb_garden',
        description: 'キスティスの熱狂的なファン。手札を公開する「オープン」ルールで挑んでくる。',
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
        description: 'CC団の「ハート」。同じ数字が隣接するとひっくり返る「セイム」ルールを好む。',
        deckType: 'level',
        baseLevel: 4,
        rules: ['open', 'same'],
        unlockCondition: 'npc_03'
    },
    {
        id: 'npc_05',
        name: 'シド学園長',
        areaId: 'area_balamb_garden',
        description: '学園長。合計値が同じ箇所でひっくり返る「プラス」ルールを駆使する難敵。',
        deckType: 'level',
        baseLevel: 5,
        rules: ['open', 'same', 'plus'],
        unlockCondition: 'npc_04'
    },

    // --- ドール ---
    {
        id: 'npc_dollet_01',
        name: 'ドールのパブのオーナー',
        areaId: 'area_dollet',
        description: 'パブ2F。手札がランダムに選ばれる「ランダム」ルールの使い手。',
        deckType: 'level',
        baseLevel: 4,
        rules: ['random', 'open'],
        unlockCondition: 'npc_05'
    },
    {
        id: 'npc_dollet_new_01',
        name: '画家の孫',
        areaId: 'area_dollet',
        description: 'ドールの街で絵を描いている画家の孫。強いカードもたまに交じったランダムな手札で戦う。',
        deckType: 'level',
        baseLevel: 5,
        rules: ['random', 'open'],
        unlockCondition: 'npc_dollet_01'
    },
    {
        id: 'npc_dollet_02',
        name: 'カードクイーン',
        areaId: 'area_dollet',
        description: '世界を旅するカードの女王。盤面の属性による補正「エレメンタル」ルールを好む。',
        deckType: 'level',
        baseLevel: 6,
        rules: ['random', 'elemental', 'open'],
        unlockCondition: 'npc_dollet_new_01'
    },

    // --- ガルバディア ---
    {
        id: 'npc_gal_01',
        name: '駅員',
        areaId: 'area_galbadia',
        description: '名もなき駅員。基本的なセイムルールで戦ってくる。',
        deckType: 'level',
        baseLevel: 3,
        rules: ['same', 'open'],
        unlockCondition: 'npc_dollet_02'
    },
    {
        id: 'npc_gal_new_01',
        name: '黒い服の男',
        areaId: 'area_galbadia',
        description: 'ガルバディア軍の士官。一般兵より一回り強力なデッキと、プラスルールを組み合わせてくる。',
        deckType: 'level',
        baseLevel: 5,
        rules: ['same', 'plus', 'open'],
        unlockCondition: 'npc_gal_01'
    },
    {
        id: 'npc_gal_02',
        name: 'カーウェイ大佐',
        areaId: 'area_galbadia',
        description: 'デリングシティの権力者。強力なレベル10カードを繰り出してくる。',
        deckType: 'level',
        baseLevel: 7,
        rules: ['same', 'open'],
        unlockCondition: 'npc_gal_new_01'
    },

    // --- F.H. (Fisherman's Horizon) ---
    {
        id: 'npc_fh_01',
        name: 'ドープ駅長',
        areaId: 'area_fh',
        description: '海上の街の代表。引き分けで再戦となる「サドンデス」ルールを貫く。',
        deckType: 'level',
        baseLevel: 4,
        rules: ['sudden-death', 'elemental', 'open'],
        unlockCondition: 'npc_gal_02'
    },
    {
        id: 'npc_fh_new_01',
        name: 'F.H.の整備士',
        areaId: 'area_fh',
        description: 'F.H.を支える親方整備士。属性を活かした戦術を得意とする。',
        deckType: 'level',
        baseLevel: 6,
        rules: ['sudden-death', 'elemental', 'open'],
        unlockCondition: 'npc_fh_01'
    },
    {
        id: 'npc_fh_02',
        name: 'マルティネ',
        areaId: 'area_fh',
        description: 'ガルバディアから離れた元副学園長。かつて見たことのあるレアカードを持っている。',
        deckType: 'level',
        baseLevel: 8,
        rules: ['sudden-death', 'plus', 'open'],
        unlockCondition: 'npc_fh_new_01'
    },

    // --- トラビア ---
    {
        id: 'npc_tra_new_01',
        name: 'トラビアの男子生徒',
        areaId: 'area_trabia',
        description: 'トラビア渓谷で学ぶ生徒。ランダムルールだがまだカードは揃っていない。',
        deckType: 'level',
        baseLevel: 4,
        rules: ['random', 'open'],
        unlockCondition: 'npc_fh_02'
    },
    {
        id: 'npc_tra_01',
        name: 'セルフィの友達',
        areaId: 'area_trabia',
        description: 'ガーモイル像付近にいる生徒。プラスとランダムが混ざった非常に強力なルールの使い手。',
        deckType: 'level',
        baseLevel: 5,
        rules: ['random', 'plus', 'open'],
        unlockCondition: 'npc_tra_new_01'
    },
    {
        id: 'npc_tra_new_02',
        name: '歌手志望の女子',
        areaId: 'area_trabia',
        description: 'トラビア・ガーデンを見守る者。セルフィの友達以上の実力を持つ。',
        deckType: 'level',
        baseLevel: 6,
        rules: ['random', 'plus', 'open'],
        unlockCondition: 'npc_tra_01'
    },

    // --- エスタ ---
    {
        id: 'npc_est_01',
        name: '紫の服の女性',
        areaId: 'area_esthar',
        description: '高度な文明を持つ都市の住人。壁を数字のA(10)として扱う「ウォールセイム」を使う。',
        deckType: 'level',
        baseLevel: 6,
        rules: ['elemental', 'same-wall', 'open'],
        unlockCondition: 'npc_tra_new_02'
    },
    {
        id: 'npc_est_new_01',
        name: 'ちょっと年配の兵士',
        areaId: 'area_esthar',
        description: '高度な技術で武装した兵士。市民よりもレベルの高い戦闘を仕掛けてくる。',
        deckType: 'level',
        baseLevel: 7,
        rules: ['elemental', 'same-wall', 'open'],
        unlockCondition: 'npc_est_01'
    },
    {
        id: 'npc_est_02',
        name: 'オダイン博士',
        areaId: 'area_esthar',
        description: '科学者。エレメンタルとウォールセイムを組み合わせた特殊な環境で戦う。',
        deckType: 'level',
        baseLevel: 9,
        rules: ['elemental', 'same-wall', 'same', 'open'],
        unlockCondition: 'npc_est_new_01'
    },

    // --- 宇宙・月 ---
    {
        id: 'npc_lunar_new_01',
        name: '医療クルー',
        areaId: 'area_lunar',
        description: 'ルナサイドベースで働く医療クルー。全ルールが存在する月面の過酷な環境に順応している。',
        deckType: 'level',
        baseLevel: 8,
        rules: ['open', 'same', 'plus', 'same-wall', 'random', 'sudden-death', 'elemental'],
        unlockCondition: 'npc_est_02'
    },
    {
        id: 'npc_lunar_01',
        name: 'ピエット',
        areaId: 'area_lunar',
        description: 'ルナサイドベースの職員。ここには「すべてのルール」が存在する。',
        deckType: 'level',
        baseLevel: 9,
        rules: ['open', 'same', 'plus', 'same-wall', 'random', 'sudden-death', 'elemental'],
        unlockCondition: 'npc_lunar_new_01'
    },
    {
        id: 'npc_lunar_02',
        name: 'エルオーネ',
        areaId: 'area_lunar',
        description: '特別な少女。極限のルールの中で、伝説のカードを操る。',
        deckType: 'level',
        baseLevel: 10,
        rules: ['open', 'same', 'plus', 'same-wall', 'random', 'sudden-death', 'elemental'],
        unlockCondition: 'npc_lunar_01'
    },

    // --- バラムガーデン (CC団) ---
    {
        id: 'npc_cc_jack',
        name: 'ジャック (CC団)',
        areaId: 'area_balamb_cc',
        description: 'CC団の最下級メンバー。カードゲームの初歩を試してくる。',
        deckType: 'level',
        baseLevel: 4,
        rules: ['open'],
        unlockCondition: 'npc_05' // 本編シド撃破で出現
    },
    {
        id: 'npc_cc_club',
        name: 'クラブ (CC団)',
        areaId: 'area_balamb_cc',
        description: 'ジャックの次の相手。セイムルールを活用する。',
        deckType: 'level',
        baseLevel: 5,
        rules: ['same', 'open'],
        unlockCondition: 'npc_cc_jack'
    },
    {
        id: 'npc_cc_joker',
        name: 'ジョーカー (CC団)',
        areaId: 'area_balamb_cc',
        description: '訓練施設に潜む裏メンバー。ランダムとエレメンタルが混じった変則的な戦い。',
        deckType: 'level',
        baseLevel: 6,
        rules: ['random', 'elemental', 'open'],
        unlockCondition: 'npc_cc_club'
    },
    {
        id: 'npc_cc_diamond',
        name: 'ダイヤ (CC団)',
        areaId: 'area_balamb_cc',
        description: '高い実力を持つ女子生徒たち。ランダムルールで翻弄してくる。',
        deckType: 'level',
        baseLevel: 6,
        rules: ['random', 'open'],
        unlockCondition: 'npc_cc_joker'
    },
    {
        id: 'npc_cc_spade',
        name: 'スペード (CC団)',
        areaId: 'area_balamb_cc',
        description: 'CC団の上位メンバー。プラスルールを巧みに操る。',
        deckType: 'level',
        baseLevel: 7,
        rules: ['plus', 'open'],
        unlockCondition: 'npc_cc_diamond'
    },
    {
        id: 'npc_cc_heart',
        name: 'シュウ (CC団・ハート)',
        areaId: 'area_balamb_cc',
        description: 'CC団の「ハート」。本編より強力なカードとルールで立ちはだかる。',
        deckType: 'level',
        baseLevel: 8,
        rules: ['same', 'plus', 'open'],
        unlockCondition: 'npc_cc_spade'
    },
    {
        id: 'npc_cc_king',
        name: 'キスティス (CC団・キング)',
        areaId: 'area_balamb_cc',
        description: 'CC団の頂点に立つ最強のマスター。最高レベルのデッキを使用する。',
        deckType: 'level',
        baseLevel: 9,
        rules: ['same-wall', 'same', 'plus', 'open'],
        unlockCondition: 'npc_cc_heart'
    }
];
