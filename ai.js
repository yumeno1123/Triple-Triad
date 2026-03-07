/**
 * ai.js
 * CPUモード時の敵（Player 2）の行動ロジック
 */

let isAIThinking = false; // AIが思考中かどうかのフラグ

function playCPUTurn() {
    // 既に思考中か、そもそも自分のターンでなければ実行しない
    if (isAIThinking || currentTurn !== 'p2') {
        console.log("AI execution blocked: already thinking or not NPC turn");
        return;
    }

    isAIThinking = true;
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
    const npcLevelInput = document.getElementById('npc-strength-level-input');
    // 強さスライダーがあればその値、なければgameConfigに保存した値、それでもなければ3（中級）とする
    let npcStrength = npcLevelInput ? parseInt(npcLevelInput.value) : null;
    if (!npcStrength) {
        npcStrength = (typeof gameConfig !== 'undefined' && gameConfig.npcStrength) ? gameConfig.npcStrength : 3;
    }

    let bestMove = null;

    // NPCの強さ(1〜5)に応じて探索深さを決定
    // Lv1: 探索なし(ランダム)
    // Lv2: Depth 1 (自分の番のみ)
    // Lv3: Depth 2 (次の相手の番まで)
    // Lv4: Depth 3
    // Lv5: Depth 4 (限界まで)
    let depth = 0;
    if (npcStrength === 1) depth = 0;
    else if (npcStrength === 2) depth = 1;
    else if (npcStrength === 3) depth = 2;
    else if (npcStrength === 4) depth = 3;
    else if (npcStrength === 5) depth = 4;

    if (depth === 0) {
        // Lv1: 完全ランダム
        bestMove = {
            cellIndex: emptyCells[Math.floor(Math.random() * emptyCells.length)],
            cardElement: availableCards[Math.floor(Math.random() * availableCards.length)]
        };
    } else {
        // Lv2〜5: ミニマックス探索
        const p1HandDiv = document.getElementById('hand-player1');
        const p1AvailableCards = Array.from(p1HandDiv.querySelectorAll('.card:not(.played)'));

        // ElementからCardデータを取り出しておく
        const p2CardsData = availableCards.map(el => ({ element: el, info: CARD_DATA.find(c => c.id === el.dataset.id) }));
        const p1CardsData = p1AvailableCards.map(el => ({ element: el, info: CARD_DATA.find(c => c.id === el.dataset.id) }));

        // 探索開始
        let bestValue = -Infinity;
        let candidates = [];

        // alpha-beta 用
        let alpha = -Infinity;
        let beta = Infinity;

        for (const cellIndex of emptyCells) {
            for (const card of p2CardsData) {
                // 仮置き
                const originalBoardState = boardState.map(c => c ? { ...c, stats: [...c.stats], owner: c.owner, id: c.id } : null);
                const originalActiveSpecialRules = [...activeSpecialRules];

                const result = placeCardOnBoard(cellIndex, card.info, 'p2');

                // 次の手番は p1
                const remainingP2Cards = p2CardsData.filter(c => c.info.id !== card.info.id);
                // p1の手番の評価は p2 (AI) にとって最小化したいので minMax を呼ぶ
                const value = minimax(depth - 1, false, alpha, beta, remainingP2Cards, p1CardsData, emptyCells.filter(idx => idx !== cellIndex));

                // 盤面を戻す
                for (let i = 0; i < 9; i++) {
                    boardState[i] = originalBoardState[i];
                }
                activeSpecialRules.length = 0;
                originalActiveSpecialRules.forEach(r => activeSpecialRules.push(r));

                if (value > bestValue) {
                    bestValue = value;
                    candidates = [{ cellIndex: cellIndex, cardElement: card.element }];
                } else if (value === bestValue) {
                    candidates.push({ cellIndex: cellIndex, cardElement: card.element });
                }

                alpha = Math.max(alpha, bestValue);
                // 最初の層なので prune はしない (一番良い手を全て集めるため)
            }
        }

        if (candidates.length > 0) {
            // 同スコアならランダムに選ぶ
            bestMove = candidates[Math.floor(Math.random() * candidates.length)];
        }
    }

    // フェールセーフ
    if (!bestMove) {
        bestMove = {
            cellIndex: emptyCells[Math.floor(Math.random() * emptyCells.length)],
            cardElement: availableCards[Math.floor(Math.random() * availableCards.length)]
        };
    }

    const { cellIndex: targetCellIndex, cardElement } = bestMove;

    // 擬似的な思考時間（数秒待つ）を演出してから配置する
    setTimeout(() => {
        cardElement.classList.add('selected');
        setTimeout(() => {
            const cellElement = document.getElementById(`cell-${targetCellIndex}`);
            executeCPUPlacement(cardElement, cellElement, targetCellIndex);
        }, 500 * getSpeedMultiplier());
    }, 500 * getSpeedMultiplier());
}

// ----------------------------------------------------
// AI 思考アルゴリズム (Minimax / Alpha-Beta Pruning)
// ----------------------------------------------------

/**
 * 盤面状態からAI (p2) にとっての評価値を計算する
 */
function evaluateBoard() {
    let score = 0;
    // 自分のカードが多いほどプラス
    for (let i = 0; i < 9; i++) {
        if (boardState[i] !== null) {
            if (boardState[i].owner === 'p2') score += 10;
            else if (boardState[i].owner === 'p1') score -= 10;
        }
    }
    return score;
}

/**
 * ミニマックス再帰関数
 * @param {number} depth - 残り探索深さ
 * @param {boolean} isMaximizing - 現在ターンがAI(p2)の場合はtrue、プレイヤー(p1)の場合はfalse
 * @param {number} alpha
 * @param {number} beta
 * @param {Array} p2CardsData
 * @param {Array} p1CardsData
 * @param {Array} emptyCells
 * @returns {number} 評価値
 */
function minimax(depth, isMaximizing, alpha, beta, p2CardsData, p1CardsData, emptyCells) {
    if (depth === 0 || emptyCells.length === 0 || p2CardsData.length === 0 || p1CardsData.length === 0) {
        // ヒューリスティック評価値を返す
        // ※深度が0になったら、あるいはゲーム終了時ならその盤面のスコア
        return evaluateBoard();
    }

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const cellIndex of emptyCells) {
            for (const card of p2CardsData) {
                const originalBoardState = boardState.map(c => c ? { ...c, stats: [...c.stats], owner: c.owner, id: c.id } : null);
                const originalActiveSpecialRules = [...activeSpecialRules];

                placeCardOnBoard(cellIndex, card.info, 'p2');

                const remainingCards = p2CardsData.filter(c => c.info.id !== card.info.id);
                const remainingCells = emptyCells.filter(idx => idx !== cellIndex);

                const ev = minimax(depth - 1, false, alpha, beta, remainingCards, p1CardsData, remainingCells);

                for (let i = 0; i < 9; i++) { boardState[i] = originalBoardState[i]; }
                activeSpecialRules.length = 0;
                originalActiveSpecialRules.forEach(r => activeSpecialRules.push(r));

                maxEval = Math.max(maxEval, ev);
                alpha = Math.max(alpha, ev);
                if (beta <= alpha) {
                    break; // Beta cutoff
                }
            }
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        // プレイヤー(p1)のターン
        let minEval = Infinity;
        for (const cellIndex of emptyCells) {
            for (const card of p1CardsData) {
                const originalBoardState = boardState.map(c => c ? { ...c, stats: [...c.stats], owner: c.owner, id: c.id } : null);
                const originalActiveSpecialRules = [...activeSpecialRules];

                placeCardOnBoard(cellIndex, card.info, 'p1');

                const remainingCards = p1CardsData.filter(c => c.info.id !== card.info.id);
                const remainingCells = emptyCells.filter(idx => idx !== cellIndex);

                const ev = minimax(depth - 1, true, alpha, beta, p2CardsData, remainingCards, remainingCells);

                for (let i = 0; i < 9; i++) { boardState[i] = originalBoardState[i]; }
                activeSpecialRules.length = 0;
                originalActiveSpecialRules.forEach(r => activeSpecialRules.push(r));

                minEval = Math.min(minEval, ev);
                beta = Math.min(beta, ev);
                if (beta <= alpha) {
                    break; // Alpha cutoff
                }
            }
            if (beta <= alpha) break;
        }
        return minEval;
    }
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

    // 解説演出（設定が有効、またはチュートリアル中の場合に実行）
    const showExpSetting = document.getElementById('setting-rule-explanation')?.checked ?? true;
    if ((isTutorialMode || showExpSetting) && result.flipped.length > 0) {
        if (typeof showTutorialFlipExplanation === 'function') {
            await showTutorialFlipExplanation(cellIndex, result);
        }
    }

    // 2. 裏返されたカードのアニメーション処理
    await processFlippedCards(result.flipped, owner);

    // 3. 終了判定チェック、なければターン交代
    isAIThinking = false; // 配置完了したら思考フラグを解除
    checkAndEndTurn();
}
