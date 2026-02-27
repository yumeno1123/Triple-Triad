/**
 * ai.js
 * CPUモード時の敵（Player 2）の行動ロジック
 */

function playCPUTurn() {
    // 盤面の空いているマスを探す
    const emptyCells = [];
    for (let i = 0; i < 9; i++) {
        if (boardState[i] === null) {
            emptyCells.push(i);
        }
    }

    // 手札からまだ使っていないカードを探す
    const p2HandDiv = document.getElementById('hand-player2');
    const availableCards = Array.from(p2HandDiv.querySelectorAll('.card:not(.played)'));

    // 空きマスか手札がない場合はターン終了
    if (emptyCells.length === 0 || availableCards.length === 0) {
        return;
    }

    // --- 思考ルーチン（現在はランダム） ---
    // ランダムに置くマスを決定
    const targetCellIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    // ランダムに出すカードを決定
    const cardElement = availableCards[Math.floor(Math.random() * availableCards.length)];

    // 擬似的な思考時間（数秒待つ）を演出してから配置する
    setTimeout(() => {
        // カードを選択状態にする（演出）
        cardElement.classList.add('selected');

        setTimeout(() => {
            // 対象マスを取得
            const cellElement = document.getElementById(`cell-${targetCellIndex}`);

            // 実際に配置する処理（main.js側に実装されている配置イベントを直接叩くか、同等の処理を行う）
            executeCPUPlacement(cardElement, cellElement, targetCellIndex);
        }, 500); // 0.5秒後に配置
    }, 500); // 0.5秒後にカード選択
}

/**
 * CPUが選んだカードを盤面に実際に配置する処理
 */
async function executeCPUPlacement(cardElement, cellElement, cellIndex) {
    // データ側への配置
    const cardId = cardElement.dataset.id;
    const owner = cardElement.dataset.owner;

    // カード情報をマスターデータから取得
    const cardInfo = CARD_DATA.find(c => c.id === cardId);

    // 盤面データ更新と裏返しチェック
    const result = placeCardOnBoard(cellIndex, cardInfo, owner);

    // UI側の更新（アニメーション含む）
    // 1. 手札のカードを盤面に移動
    cardElement.classList.remove('selected');
    cardElement.classList.add('played'); // 二度と選ばれないようにクラス付与

    // 盤面セルにカードを追加（既存の中身をクリアしてから）
    cellElement.innerHTML = '';

    // CSS調整（元の手札としてのスタイルをリセットし、親要素にフィットさせる）
    cardElement.style.position = 'absolute';
    cardElement.style.width = '100%';
    cardElement.style.height = '100%';
    cardElement.style.top = '0';
    cardElement.style.left = '0';

    // ※今回は簡易的にクローンを作って盤面に入れ、元のカードは見えなくするアプローチを取る
    const clonedCard = cardElement.cloneNode(true);
    cellElement.appendChild(clonedCard);

    // 元のカードを見えなくする
    cardElement.style.visibility = 'hidden';

    // 特殊ルール発動のアニメーション
    if (result.rules && result.rules.length > 0) {
        showSpecialRuleEffect(result.rules);
    }

    // 2. 裏返されたカードのアニメーション処理
    await processFlippedCards(result.flipped, owner);

    // 3. 終了判定チェック、なければターン交代
    checkAndEndTurn();
}
