/**
 * カードのマスターデータ
 * stats: [Top, Right, Bottom, Left]
 * 10は 'A' として表示される
 */
const CARD_DATA = [
    // Level 1: モンスター級
    { id: 'c1', level: 1, name: 'ゲイザード', stats: [1, 4, 1, 5] },
    { id: 'c2', level: 1, name: 'フンゴオンゴ', stats: [5, 1, 1, 3] },
    { id: 'c3', level: 1, name: 'バイトバグ', stats: [1, 3, 3, 5] },
    { id: 'c4', level: 1, name: 'レッドバット', stats: [6, 1, 1, 2] },
    { id: 'c5', level: 1, name: 'ブロブラ', stats: [2, 3, 1, 5] },
    { id: 'c6', level: 1, name: 'ゲイラキャット', stats: [2, 1, 4, 4] },

    // Level 2
    { id: 'c7', level: 2, name: 'グラット', stats: [7, 1, 3, 1] },
    { id: 'c8', level: 2, name: 'ブエル', stats: [6, 2, 2, 3] },
    { id: 'c9', level: 2, name: 'ジェライエ', stats: [3, 2, 1, 7] },
    { id: 'c10', level: 2, name: 'グラシアルアイ', stats: [6, 1, 4, 3] },

    // Level 3
    { id: 'c11', level: 3, name: 'アルマダード', stats: [6, 3, 1, 6] },
    { id: 'c12', level: 3, name: 'トライフェイス', stats: [3, 5, 5, 5] },
    { id: 'c13', level: 3, name: 'フォスティトガロン', stats: [7, 5, 1, 3] },
    { id: 'c14', level: 3, name: 'スノーライオン', stats: [7, 1, 5, 3] },

    // Level 4
    { id: 'c15', level: 4, name: 'アルケオダイノス', stats: [4, 6, 2, 7] },
    { id: 'c16', level: 4, name: 'ボム', stats: [2, 7, 6, 3] },
    { id: 'c17', level: 4, name: 'バイセージ', stats: [8, 5, 4, 1] },

    // Level 5
    { id: 'c18', level: 5, name: '鉄巨人', stats: [6, 5, 6, 5] },
    { id: 'c19', level: 5, name: 'ベヒーモス', stats: [3, 6, 7, 5] },
    { id: 'c20', level: 5, name: 'モルボル', stats: [7, 10, 2, 7] },

    // Level 6 (Bosses)
    { id: 'c21', level: 6, name: 'エルノーイル', stats: [5, 6, 3, 10] },
    { id: 'c22', level: 6, name: 'X-ATM092', stats: [4, 8, 7, 3] },

    // Level 7
    { id: 'c23', level: 7, name: 'プロパゲーター', stats: [8, 4, 4, 8] },
    { id: 'c24', level: 7, name: 'ジャボテンダー', stats: [8, 4, 10, 4] },

    // Level 8 (GF/Rare)
    { id: 'c25', level: 8, name: 'シヴァ', stats: [6, 7, 4, 10] },
    { id: 'c26', level: 8, name: 'イフリート', stats: [9, 6, 2, 8] },

    // Level 9
    { id: 'c27', level: 9, name: 'バハムート', stats: [10, 8, 2, 10] },
    { id: 'c28', level: 9, name: 'ディアボロス', stats: [5, 10, 8, 3] },

    // Level 10 (Legendary)
    { id: 'c29', level: 10, name: 'スコール', stats: [10, 4, 6, 9] },
    { id: 'c30', level: 10, name: 'サイファー', stats: [6, 9, 10, 4] },
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
    if (cardInfo.level >= 9) card.classList.add('card-rare');
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

    card.innerHTML = `
        <div class="card-inner">
            <div class="card-front">
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
    const deck = [...CARD_DATA];
    const hand = [];

    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * deck.length);
        hand.push(deck[randomIndex]);
        // 重複なしにする場合は下を有効にするが、今回は重複あり(簡易的)にするためコメントアウト
        // deck.splice(randomIndex, 1);
    }

    return hand;
}
