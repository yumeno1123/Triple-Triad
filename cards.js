/**
 * カードのマスターデータ
 * stats: [Top, Right, Bottom, Left]
 * 10は 'A' として表示される
 */
const CARD_DATA = [

    // Level 1: Monsters
    { id: 'c1', level: 1, name: 'ハウリザード', stats: [1, 4, 1, 5] },
    { id: 'c2', level: 1, name: 'フンゴオンゴ', stats: [5, 1, 1, 3] },
    { id: 'c3', level: 1, name: 'バイトバグ', stats: [1, 3, 3, 5] },
    { id: 'c4', level: 1, name: 'レッドマウス', stats: [6, 1, 1, 2] },
    { id: 'c5', level: 1, name: 'プリヌラ', stats: [2, 3, 1, 5] },
    { id: 'c6', level: 1, name: 'ゲイラ', stats: [2, 4, 1, 4] },
    { id: 'c7', level: 1, name: 'ゲスパー', stats: [1, 5, 4, 1] },
    { id: 'c8', level: 1, name: 'フォカロル(小)', stats: [3, 5, 2, 1] },
    { id: 'c9', level: 1, name: 'ブラットソウル', stats: [2, 1, 6, 1] },
    { id: 'c10', level: 1, name: 'ケダチク', stats: [4, 2, 4, 3] },
    { id: 'c11', level: 1, name: 'コカトリス', stats: [2, 1, 2, 6] },

    // Level 2: Monsters
    { id: 'c12', level: 2, name: 'グラット', stats: [7, 1, 3, 1] },
    { id: 'c13', level: 2, name: 'ブエル', stats: [6, 2, 2, 3] },
    { id: 'c14', level: 2, name: 'メズマライズ', stats: [5, 3, 3, 4] },
    { id: 'c15', level: 2, name: 'グヘイスアイ', stats: [6, 1, 4, 3] },
    { id: 'c16', level: 2, name: 'ベルヘルメルヘル', stats: [3, 4, 5, 3] },
    { id: 'c17', level: 2, name: 'スラストエイビス', stats: [5, 3, 2, 5] },
    { id: 'c18', level: 2, name: 'ヘッジヴァイパー', stats: [5, 1, 3, 5] },
    { id: 'c19', level: 2, name: 'クリープス', stats: [5, 2, 5, 2] },
    { id: 'c20', level: 2, name: 'グレンデル', stats: [4, 4, 5, 2] },
    { id: 'c21', level: 2, name: 'ダブルハガー', stats: [3, 2, 1, 7] },
    { id: 'c22', level: 2, name: 'グランデアーロ', stats: [5, 2, 5, 3] },

    // Level 3: Monsters
    { id: 'c23', level: 3, name: 'ライフフォビドン', stats: [5, 7, 1, 3] },
    { id: 'c24', level: 3, name: 'エサンスーシ', stats: [3, 2, 6, 6] },
    { id: 'c25', level: 3, name: 'トライフェイス', stats: [3, 5, 5, 5] },
    { id: 'c26', level: 3, name: 'フォカロル', stats: [8, 2, 2, 5] },
    { id: 'c27', level: 3, name: 'ゴージュシール', stats: [5, 6, 3, 3] },
    { id: 'c28', level: 3, name: 'オチュー', stats: [5, 6, 3, 3] },
    { id: 'c29', level: 3, name: 'SAM08G', stats: [5, 4, 2, 6] },
    { id: 'c30', level: 3, name: 'ワイルドフック', stats: [2, 7, 6, 3] },
    { id: 'c31', level: 3, name: 'サボテンダー', stats: [6, 2, 6, 3] },
    { id: 'c32', level: 3, name: 'トンベリ', stats: [3, 4, 6, 4] },
    { id: 'c33', level: 3, name: 'アビスウォーム', stats: [7, 5, 2, 3] },

    // Level 4: Monsters
    { id: 'c34', level: 4, name: 'グラナトゥム', stats: [2, 3, 6, 7] },
    { id: 'c35', level: 4, name: 'バイセージ', stats: [6, 5, 4, 5] },
    { id: 'c36', level: 4, name: 'アルケオダイノス', stats: [4, 6, 2, 7] },
    { id: 'c37', level: 4, name: 'ボム', stats: [2, 7, 3, 6] },
    { id: 'c38', level: 4, name: 'ブリッツ', stats: [1, 7, 6, 4] },
    { id: 'c39', level: 4, name: 'ウェンディゴ', stats: [7, 6, 3, 1] },
    { id: 'c40', level: 4, name: 'クアール', stats: [7, 3, 6, 7] },
    { id: 'c41', level: 4, name: 'ガルキマセラ', stats: [5, 3, 8, 3] },
    { id: 'c42', level: 4, name: 'ドラゴンイゾルデ', stats: [3, 6, 7, 5] },
    { id: 'c43', level: 4, name: 'アダマンタイマイ', stats: [4, 6, 5, 5] },
    { id: 'c44', level: 4, name: 'メルトドラゴン', stats: [7, 3, 2, 8] },

    // Level 5: Monsters
    { id: 'c45', level: 5, name: '鉄巨人', stats: [6, 5, 6, 5] },
    { id: 'c46', level: 5, name: 'ベヒーモス', stats: [3, 7, 6, 5] },
    { id: 'c47', level: 5, name: 'キマイラブレイン', stats: [7, 3, 6, 5] },
    { id: 'c48', level: 5, name: 'コヨコヨ', stats: [3, 1, 10, 2] },
    { id: 'c49', level: 5, name: 'インビンシブル', stats: [6, 2, 6, 7] },
    { id: 'c50', level: 5, name: 'GIM47N', stats: [5, 4, 5, 7] },
    { id: 'c51', level: 5, name: 'モルボル', stats: [7, 2, 7, 4] },
    { id: 'c52', level: 5, name: 'ルブルムドラゴン', stats: [7, 2, 3, 5] },
    { id: 'c53', level: 5, name: 'エルノーイル', stats: [5, 10, 8, 6] },
    { id: 'c54', level: 5, name: 'トンベリキング', stats: [4, 4, 6, 7] },
    { id: 'c55', level: 5, name: 'ウェッジ・ビッグス', stats: [6, 6, 3, 7] },

    // Level 6: Bosses
    { id: 'c56', level: 6, name: '風神・雷神', stats: [2, 4, 8, 8] },
    { id: 'c57', level: 6, name: 'エルヴィオレ', stats: [7, 4, 8, 3] },
    { id: 'c58', level: 6, name: 'X-ATM092', stats: [4, 3, 8, 7] },
    { id: 'c59', level: 6, name: 'グラナルド', stats: [7, 5, 2, 8] },
    { id: 'c60', level: 6, name: 'ナムタル・ウトク', stats: [1, 8, 8, 3] },
    { id: 'c61', level: 6, name: 'シュメルケ', stats: [5, 8, 3, 6] },
    { id: 'c62', level: 6, name: 'アバドン', stats: [6, 5, 8, 4] },
    { id: 'c63', level: 6, name: 'ドルメン', stats: [4, 6, 8, 5] },
    { id: 'c64', level: 6, name: 'オイルシッパー', stats: [4, 6, 4, 8] },
    { id: 'c65', level: 6, name: 'シュミ族', stats: [6, 4, 5, 8] },
    { id: 'c66', level: 6, name: 'コキュートス', stats: [8, 8, 4, 4] },

    // Level 7: Bosses
    { id: 'c67', level: 7, name: 'プロパゲーター', stats: [8, 8, 4, 4] },
    { id: 'c68', level: 7, name: 'ジャボテンダー', stats: [8, 4, 10, 4] },
    { id: 'c69', level: 7, name: 'トライエッジ', stats: [3, 8, 8, 8] },
    { id: 'c70', level: 7, name: 'ガルガンチュア', stats: [5, 8, 6, 6] },
    { id: 'c71', level: 7, name: '機動兵器8型BIS', stats: [8, 6, 7, 3] },
    { id: 'c72', level: 7, name: 'アンドロ', stats: [8, 3, 5, 8] },
    { id: 'c73', level: 7, name: 'ティアマト', stats: [8, 4, 8, 5] },
    { id: 'c74', level: 7, name: 'BGH251F2', stats: [5, 5, 7, 8] },
    { id: 'c75', level: 7, name: 'ウルフラマイター', stats: [4, 8, 7, 4] },
    { id: 'c76', level: 7, name: 'カトブレパス', stats: [1, 7, 8, 7] },
    { id: 'c77', level: 7, name: 'アルテマウェポン', stats: [7, 8, 7, 2] },

    // Level 8: GF Cards
    { id: 'c78', level: 8, name: 'デブチョコボ', stats: [4, 9, 4, 8] },
    { id: 'c79', level: 8, name: 'アンジェロ', stats: [9, 3, 6, 7] },
    { id: 'c80', level: 8, name: 'ギルガメッシュ', stats: [3, 6, 7, 9] },
    { id: 'c81', level: 8, name: 'コモーグリ', stats: [9, 2, 3, 9] },
    { id: 'c82', level: 8, name: 'コチョコボ', stats: [4, 9, 8, 4] },
    { id: 'c83', level: 8, name: 'ケツァクウァトル', stats: [2, 4, 9, 9] },
    { id: 'c84', level: 8, name: 'シヴァ', stats: [6, 9, 4, 7] },
    { id: 'c85', level: 8, name: 'イフリート', stats: [9, 8, 6, 2] },
    { id: 'c86', level: 8, name: 'セイレーン', stats: [8, 2, 9, 6] },
    { id: 'c87', level: 8, name: 'セクレト', stats: [9, 7, 3, 6] },
    { id: 'c88', level: 8, name: 'ミノタウロス', stats: [9, 3, 9, 2] },

    // Level 9: GF Cards
    { id: 'c89', level: 9, name: 'カーバンクル', stats: [8, 4, 10, 4] },
    { id: 'c90', level: 9, name: 'ディアボロス', stats: [5, 10, 8, 3] },
    { id: 'c91', level: 9, name: 'リヴァイアサン', stats: [7, 10, 1, 7] },
    { id: 'c92', level: 9, name: 'オーディン', stats: [8, 10, 3, 5] },
    { id: 'c93', level: 9, name: 'パンデモニウム', stats: [10, 7, 1, 7] },
    { id: 'c94', level: 9, name: 'ケルベロス', stats: [7, 10, 4, 6] },
    { id: 'c95', level: 9, name: 'アレクサンダー', stats: [9, 2, 10, 4] },
    { id: 'c96', level: 9, name: 'フェニックス', stats: [7, 2, 7, 10] },
    { id: 'c97', level: 9, name: 'バハムート', stats: [10, 8, 2, 10] },
    { id: 'c98', level: 9, name: 'グラシャラボラス', stats: [3, 10, 10, 1] },
    { id: 'c99', level: 9, name: 'エデン', stats: [4, 10, 4, 9] },

    // Level 10: Character Cards
    { id: 'c100', level: 10, name: 'ウォード', stats: [10, 8, 7, 2] },
    { id: 'c101', level: 10, name: 'キロス', stats: [6, 10, 7, 6] },
    { id: 'c102', level: 10, name: 'ラグナ', stats: [5, 10, 3, 10] },
    { id: 'c103', level: 10, name: 'セルフィ', stats: [10, 4, 8, 6] },
    { id: 'c104', level: 10, name: 'キスティス', stats: [9, 2, 6, 10] },
    { id: 'c105', level: 10, name: 'アーヴァイン', stats: [2, 10, 6, 9] },
    { id: 'c106', level: 10, name: 'ゼル', stats: [8, 6, 5, 10] },
    { id: 'c107', level: 10, name: 'リノア', stats: [4, 10, 2, 10] },
    { id: 'c108', level: 10, name: 'イデア', stats: [10, 3, 10, 3] },
    { id: 'c109', level: 10, name: 'サイファー', stats: [6, 4, 9, 10] },
    { id: 'c110', level: 10, name: 'スコール', stats: [10, 9, 4, 6] },
];

/**
 * 数値を表示用の文字に変換する (10 -> A)
 * @param {number} val 
 * @returns {string}
 */
function formatStat(val) {
    return val === 10 ? 'A' : val.toString();
}

/**
 * 渡されたカードオブジェクトからHTML要素（DOM）を生成する
 * 
 * @param {Object} cardInfo CARD_DATAの1要素
 * @param {string} owner 'p1' | 'p2' | 'neutral'
 * @param {string} uniqueId DOM要素のID
 * @returns {HTMLElement} カードのDOM
 */
function createCardElement(cardInfo, owner = 'neutral', uniqueId) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.classList.add(`owner-${owner}`);
    if (cardInfo.level >= 8) card.classList.add('card-rare');
    if (cardInfo.level <= 5) card.classList.add('card-common');
    if (uniqueId) card.id = uniqueId;

    // カードの内部データとして保持
    card.dataset.id = cardInfo.id;
    card.dataset.owner = owner;

    // A（10）の場合は色を変えるためのクラスを付与
    const tClass = cardInfo.stats[0] === 10 ? 'stat-a' : '';
    const rClass = cardInfo.stats[1] === 10 ? 'stat-a' : '';
    const bClass = cardInfo.stats[2] === 10 ? 'stat-a' : '';
    const lClass = cardInfo.stats[3] === 10 ? 'stat-a' : '';

    // レベル10専用の四隅装飾
    const legendaryDecorations = cardInfo.level === 10 ? `
        <div class="legendary-corner top-left"></div>
        <div class="legendary-corner top-right"></div>
        <div class="legendary-corner bottom-left"></div>
        <div class="legendary-corner bottom-right"></div>
    ` : '';

    card.innerHTML = `
        <div class="card-inner">
            <div class="card-front">
                ${legendaryDecorations}
                <img src="assets/cards/${cardInfo.id}.webp" class="card-image" onerror="this.style.display='none'">
                <div class="card-stats">
                    <div class="stat stat-top ${tClass}">${formatStat(cardInfo.stats[0])}</div>
                    <div class="stat stat-right ${rClass}">${formatStat(cardInfo.stats[1])}</div>
                    <div class="stat stat-bottom ${bClass}">${formatStat(cardInfo.stats[2])}</div>
                    <div class="stat stat-left ${lClass}">${formatStat(cardInfo.stats[3])}</div>
                </div>
                <div class="card-name">${cardInfo.name}</div>
            </div>
            <div class="card-back"></div>
        </div>
    `;

    return card;
}

/**
 * ランダムに手札の配列を返す
 * @param {number} count 欲しい枚数 (通常5)
 * @returns {Array} 引いたカードデータの配列
 */
function drawRandomCards(count = 5) {
    const deck = [...CARD_DATA