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

    // --- 思考ルーチン分岐 ---
    const npcLevelInput = document.getElementById('npc-level-input');
    const npcLevel = npcLevelInput ? parseInt(npcLevelInput.value) || 5 : 5;

    let bestMove = null;

    if (npcLevel >= 1 && npcLevel <= 4) {
        bestMove = getMoveTypeA(emptyCells, availableCards);
    } else if (npcLevel >= 5 && npcLevel <= 7) {
        bestMove = getMoveTypeB(emptyCells, availableCards);
    } else {
        bestMove = getMoveTypeC(emptyCells, availableCards);
    }

    // フェールセーフ (万が一bestMoveが見つからなかった場合はランダム)
    if (!bestMove) {
        bestMove = {
            cellIndex: emptyCells[Math.floor(Math.random() * emptyCells.length)],
            cardElement: availableCards[Math.floor(Math.random() * availableCards.length)]
        };
    }

    const { cellIndex: targetCellIndex, cardElement } = bestMove;

    // 擬似的な思考時間（数秒待つ）を演出してから配置する
    setTimeout(() => {
        // カードを選択状態にする（演出）
        cardElement.classList.add('selected');

        setTimeout(() => {
            // 対象マスを取得
            const cellElement = document.getElementById(`cell-${targetCellIndex}`);

            // 実際に配置する処理
            executeCPUPlacement(cardElement, cellElement, targetCellIndex);
        }, 500); // 0.5秒後に配置
    }, 500); // 0.5秒後にカード選択
}

// ----------------------------------------------------
// AI 思考アルゴリズム
// ----------------------------------------------------

/**
 * Type A: 猪突猛進型 (Lv 1-4)
 * - 返せる枚数が一番多い場所とカードをただ選ぶ
 */
function getMoveTypeA(emptyCells, availableCards) {
    let bestMoves = [];
    let maxFlipped = -1;

    for (const cellIndex of emptyCells) {
        for (const cardElement of availableCards) {
            const cardId = cardElement.dataset.id;
            const cardInfo = CARD_DATA.find(c => c.id === cardId);
            const flippedCount = simulatePlacement(cellIndex, cardInfo, 'p2');

            if (flippedCount > maxFlipped) {
                maxFlipped = flippedCount;
                bestMoves = [{ cellIndex, cardElement }];
            } else if (flippedCount === maxFlipped) {
                bestMoves.push({ cellIndex, cardElement });
            }
        }
    }
    return bestMoves.length > 0 ? bestMoves[Math.floor(Math.random() * bestMoves.length)] : null;
}

/**
 * Type B: 鉄壁防御型 (Lv 5-7)
 * - 角や端を優先して陣取り、自分の強い数値を一番外側（敵側）へ向ける安全地帯構築
 */
function getMoveTypeB(emptyCells, availableCards) {
    let bestMoves = [];
    let maxScore = -Infinity;

    for (const cellIndex of emptyCells) {
        // 角や端の評価点
        let cellWeight = 0;
        if ([0, 2, 6, 8].includes(cellIndex)) cellWeight = 20;
        else if ([1, 3, 5, 7].includes(cellIndex)) cellWeight = 10;
        else cellWeight = 0;

        for (const cardElement of availableCards) {
            const cardId = cardElement.dataset.id;
            const cardInfo = CARD_DATA.find(c => c.id === cardId);

            // 露出スコア: 壁ではない開けた方向へ高い数値が向いているかを評価
            let exposureScore = 0;
            if (Math.floor(cellIndex / 3) > 0) exposureScore += cardInfo.stats[0]; // 上が開いている
            if (cellIndex % 3 < 2) exposureScore += cardInfo.stats[1]; // 右が開いている
            if (Math.floor(cellIndex / 3) < 2) exposureScore += cardInfo.stats[2]; // 下が開いている
            if (cellIndex % 3 > 0) exposureScore += cardInfo.stats[3]; // 左が開いている

            const flippedCount = simulatePlacement(cellIndex, cardInfo, 'p2');

            const score = cellWeight + exposureScore + (flippedCount * 2);

            if (score > maxScore) {
                maxScore = score;
                bestMoves = [{ cellIndex, cardElement }];
            } else if (score === maxScore) {
                bestMoves.push({ cellIndex, cardElement });
            }
        }
    }
    return bestMoves.length > 0 ? bestMoves[Math.floor(Math.random() * bestMoves.length)] : null;
}

/**
 * Type C: 策士（先読み）型 (Lv 8-10)
 * - 自分が置いた後、次にプレイヤーが繰り出してくる「最大の反撃」を計算し、
 *   自分が最終的に生き残る・コンボを決められる手を探す
 */
function getMoveTypeC(emptyCells, availableCards) {
    let bestMoves = [];
    let maxNetScore = -Infinity;

    const p1HandDiv = document.getElementById('hand-player1');
    const p1AvailableCards = Array.from(p1HandDiv.querySelectorAll('.card:not(.played)'));

    for (const cellIndex of emptyCells) {
        for (const cardElement of availableCards) {
            const cardId = cardElement.dataset.id;
            const cardInfo = CARD_DATA.find(c => c.id === cardId);

            // 1. まず自分が置いた状況を仮想的に作る（boardStateを書き換えるためディープコピー）
            const originalBoardState = boardState.map(cell => cell ? { ...cell, stats: [...cell.stats], owner: cell.owner, id: cell.id } : null);
            const originalActiveSpecialRules = [...activeSpecialRules];

            const result = placeCardOnBoard(cellIndex, cardInfo, 'p2');
            const p2Flipped = result.flipped.length;

            // 2. 次のターンのプレイヤー(p1)の最大の反撃をシミュレート
            let maxP1Flipped = 0;
            const remainingEmpty = [];
            for (let i = 0; i < 9; i++) {
                if (boardState[i] === null) remainingEmpty.push(i);
            }

            if (remainingEmpty.length > 0 && p1AvailableCards.length > 0) {
                for (const p1Cell of remainingEmpty) {
                    for (const p1CardEl of p1AvailableCards) {
                        const p1CardInfo = CARD_DATA.find(c => c.id === p1CardEl.dataset.id);
                        // p1の仮想プレイ（simulatePlacementはさらに内部で状態を戻してくれる）
                        const p1Flipped = simulatePlacement(p1Cell, p1CardInfo, 'p1');
                        if (p1Flipped > maxP1Flipped) {
                            maxP1Flipped = p1Flipped;
                        }
                    }
                }
            }

            // 盤面を元に戻す
            for (let i = 0; i < 9; i++) {
                boardState[i] = originalBoardState[i];
            }
            activeSpecialRules.length = 0;
            originalActiveSpecialRules.forEach(r => activeSpecialRules.push(r));

            // 純利益の計算：自分が今回取れる枚数(x10) - 相手に次取られる想定枚数(x15) 
            // マイナスを重く見積ることで、罠にはまらないようにする
            // 同スコア時はTypeBの防御的配置（exposureScore）が高いものを少し優遇
            let exposureScore = 0;
            if (Math.floor(cellIndex / 3) > 0) exposureScore += cardInfo.stats[0];
            if (cellIndex % 3 < 2) exposureScore += cardInfo.stats[1];
            if (Math.floor(cellIndex / 3) < 2) exposureScore += cardInfo.stats[2];
            if (cellIndex % 3 > 0) exposureScore += cardInfo.stats[3];

            const netScore = (p2Flipped * 10) - (maxP1Flipped * 15) + exposureScore;

            if (netScore > maxNetScore) {
                maxNetScore = netScore;
                bestMoves = [{ cellIndex, cardElement }];
            } else if (netScore === maxNetScore) {
                bestMoves.push({ cellIndex, cardElement });
            }
        }
    }
    return bestMoves.length > 0 ? bestMoves[Math.floor(Math.random() * bestMoves.length)] : null;
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
