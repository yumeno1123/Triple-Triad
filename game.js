/**
 * game.js
 * ゲームのコアロジック（特殊ルール対応版）
 */

let boardState = new Array(9).fill(null);
let p1Hand = [];
let p2Hand = [];
let currentTurn = 'p1';
let gameMode = 'pvp';

// 発動した特殊ルールの記録用（UI表示のため）
let activeSpecialRules = [];

// ルールの有効化設定
let gameConfig = {
    open: true,
    same: true,
    sameWall: true,
    plus: true,
    suddenDeath: true,
    tradeRule: 'one',
    matchType: 'free'
};

function initGame(mode, rules = null, playerHand = null, npcLevel = 5) {
    gameMode = mode;
    if (rules) {
        gameConfig = {
            ...rules,
            tradeRule: rules.tradeRule || 'one',
            matchType: rules.matchType || 'free'
        };
    }

    boardState = new Array(9).fill(null);

    // プレイヤーの手札が指定されていればそれを使用、そうでなければランダム
    p1Hand = playerHand ? [...playerHand] : drawRandomCards(5);

    // NPCの手札生成: CPU戦なら指定レベルに基づき、PvPなら完全ランダム
    p2Hand = (gameMode === 'pvc') ? drawNPCCards(npcLevel) : drawRandomCards(5);

    const finalTurn = Math.random() < 0.5 ? 'p1' : 'p2';
    activeSpecialRules = [];

    // UIを初期化するが、操作は一旦ブロック
    currentTurn = finalTurn;
    setupUI();

    // ルーレット演出の呼び出し
    playTurnRoulette(finalTurn, () => {
        // 演出完了後のゲーム開始処理
        const startText = currentTurn === 'p1' ? 'PLAYER 1 START!' : (gameMode === 'pvc' ? 'CPU START!' : 'PLAYER 2 START!');
        const color = currentTurn === 'p1' ? 'var(--color-p1)' : 'var(--color-p2)';
        showGameStartEffect(startText, color);

        if (gameMode === 'pvc' && currentTurn === 'p2') {
            setTimeout(playCPUTurn, 2000);
        }
    });
}

function playTurnRoulette(finalTurn, onComplete) {
    const indicator = document.getElementById('turn-indicator');
    const gameArea = document.querySelector('.game-area');

    // 演出中は盤面操作をブロック
    if (gameArea) gameArea.style.pointerEvents = 'none';

    // 画面中央へ移動させて拡大表示（初期準備）
    indicator.style.transition = 'none';
    indicator.style.transform = 'translateY(35vh) scale(2)';
    indicator.style.zIndex = '100';

    let flashes = 0;
    // 回数を元の半分程度に減らし、テンポアップ
    const maxFlashes = 10 + Math.floor(Math.random() * 5);
    let currentShow = 'p1';
    let delay = 15; // 初期のフラッシュ間隔（ミリ秒）

    function flash() {
        flashes++;
        currentShow = currentShow === 'p1' ? 'p2' : 'p1';

        if (flashes >= maxFlashes) {
            // 最終結果で固定
            currentShow = finalTurn;
            const text = currentShow === 'p1' ? 'PLAYER 1 FIRST' : (gameMode === 'pvc' ? 'CPU FIRST' : 'PLAYER 2 FIRST');
            const color = currentShow === 'p1' ? 'var(--color-p1)' : 'var(--color-p2)';

            indicator.textContent = text;
            indicator.style.color = color;
            indicator.style.textShadow = `0 0 15px ${color}`;

            // 結果を画面中央で少し（0.8秒）見せた後、元の位置へスライド移動
            setTimeout(() => {
                indicator.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                indicator.style.transform = 'translateY(0) scale(1)';

                setTimeout(() => {
                    // スライド後、スタイルをクリーンアップしゲーム開始
                    indicator.style.transition = '';
                    indicator.style.transform = '';
                    indicator.style.textShadow = '';
                    indicator.style.zIndex = '';
                    indicator.textContent = `TURN: ${currentTurn === 'p1' ? 'PLAYER 1' : (gameMode === 'pvc' ? 'CPU' : 'PLAYER 2')}`;

                    // ブロック解除
                    if (gameArea) gameArea.style.pointerEvents = '';
                    onComplete();
                }, 500); // スライド時間分待つ
            }, 800); // 決定画面の待機時間も半減（1.8秒 -> 0.8秒）
            return;
        }

        // フラッシュ中のテキスト切り替え
        const text = currentShow === 'p1' ? 'PLAYER 1' : (gameMode === 'pvc' ? 'CPU' : 'PLAYER 2');
        const color = currentShow === 'p1' ? 'var(--color-p1)' : 'var(--color-p2)';

        indicator.textContent = text;
        indicator.style.color = color;

        // 徐々に遅くする（増分も半分にして短縮）
        delay += 6;
        setTimeout(flash, delay);
    }

    flash();
}

function showGameStartEffect(text, color) {
    const effectContainer = document.createElement('div');
    effectContainer.className = 'special-rule-effect';
    effectContainer.style.color = color;
    effectContainer.style.fontSize = '2.5rem';
    effectContainer.style.textShadow = `0 0 10px ${color}, 2px 2px 5px black`;
    effectContainer.textContent = text;
    document.getElementById('screen-game').appendChild(effectContainer);

    setTimeout(() => {
        if (effectContainer) effectContainer.remove();
    }, 2000);
}

function placeCardOnBoard(boardIndex, cardInfo, owner) {
    if (boardState[boardIndex] !== null) {
        return { flipped: [], rules: [] };
    }

    boardState[boardIndex] = {
        id: cardInfo.id,
        owner: owner,
        stats: [...cardInfo.stats]
    };

    activeSpecialRules = [];
    let allFlipped = new Set();

    const specialFlipped = checkSpecialRules(boardIndex, owner);
    specialFlipped.forEach(idx => allFlipped.add(idx));

    const normalFlipped = checkNormalBattles(boardIndex, owner);
    normalFlipped.forEach(idx => allFlipped.add(idx));

    if (specialFlipped.length > 0) {
        let comboQueue = [...specialFlipped];
        let hasCombo = false;

        while (comboQueue.length > 0) {
            const originIndex = comboQueue.shift();
            const newlyFlipped = checkNormalBattles(originIndex, boardState[originIndex].owner);

            newlyFlipped.forEach(idx => {
                if (!allFlipped.has(idx)) {
                    allFlipped.add(idx);
                    comboQueue.push(idx);
                    hasCombo = true;
                }
            });
        }

        if (hasCombo) {
            activeSpecialRules.push('COMBO');
        }
    }

    return {
        flipped: Array.from(allFlipped),
        rules: activeSpecialRules
    };
}

function checkSpecialRules(index, owner) {
    const flipped = [];
    const originCard = boardState[index];
    const x = index % 3;
    const y = Math.floor(index / 3);

    const neighbors = [];
    const directions = [
        { dx: 0, dy: -1, myStat: 0, enStat: 2 },
        { dx: 1, dy: 0, myStat: 1, enStat: 3 },
        { dx: 0, dy: 1, myStat: 2, enStat: 0 },
        { dx: -1, dy: 0, myStat: 3, enStat: 1 }
    ];

    for (const dir of directions) {
        const tx = x + dir.dx;
        const ty = y + dir.dy;
        if (tx >= 0 && tx < 3 && ty >= 0 && ty < 3) {
            const tIndex = ty * 3 + tx;
            const tCard = boardState[tIndex];
            if (tCard !== null) {
                neighbors.push({
                    index: tIndex,
                    card: tCard,
                    myVal: originCard.stats[dir.myStat],
                    enVal: tCard.stats[dir.enStat],
                    isWall: false
                });
            }
        } else if (gameConfig.sameWall) {
            neighbors.push({
                index: null,
                card: null,
                myVal: originCard.stats[dir.myStat],
                enVal: 10,
                isWall: true
            });
        }
    }

    // SAME / WALL SAME 判定
    const sameMatches = neighbors.filter(n => n.myVal === n.enVal);
    if (sameMatches.length >= 2) {
        const hasWall = sameMatches.some(n => n.isWall);
        const cardMatches = sameMatches.filter(n => !n.isWall);

        let triggerSame = false;
        let triggerWallSame = false;

        // 純粋なセイム（カード同士が2枚以上）
        if (gameConfig.same && cardMatches.length >= 2) {
            triggerSame = true;
        }
        // ウォールセイム（壁を含んで2箇所以上マッチ、かつカードが1枚以上ある）
        if (gameConfig.sameWall && hasWall && sameMatches.length >= 2 && cardMatches.length >= 1) {
            triggerWallSame = true;
        }

        if (triggerSame || triggerWallSame) {
            activeSpecialRules.push(triggerWallSame ? 'WALL SAME' : 'SAME');
            cardMatches.forEach(match => {
                if (match.card.owner !== owner) {
                    match.card.owner = owner;
                    flipped.push(match.index);
                }
            });
        }
    }

    if (gameConfig.plus) {
        const realNeighbors = neighbors.filter(n => !n.isWall);
        const sumMap = {};
        realNeighbors.forEach(n => {
            const sum = n.myVal + n.enVal;
            if (!sumMap[sum]) sumMap[sum] = [];
            sumMap[sum].push(n);
        });

        let isPlusTriggered = false;
        for (const sum in sumMap) {
            if (sumMap[sum].length >= 2) {
                if (!isPlusTriggered) {
                    activeSpecialRules.push('PLUS');
                    isPlusTriggered = true;
                }
                sumMap[sum].forEach(match => {
                    if (match.card.owner !== owner && !flipped.includes(match.index)) {
                        match.card.owner = owner;
                        flipped.push(match.index);
                    }
                });
            }
        }
    }

    return flipped;
}

function checkNormalBattles(index, owner) {
    const flipped = [];
    const originCard = boardState[index];
    const x = index % 3;
    const y = Math.floor(index / 3);

    const directions = [
        { dx: 0, dy: -1, myStat: 0, enStat: 2 },
        { dx: 1, dy: 0, myStat: 1, enStat: 3 },
        { dx: 0, dy: 1, myStat: 2, enStat: 0 },
        { dx: -1, dy: 0, myStat: 3, enStat: 1 }
    ];

    for (const dir of directions) {
        const tx = x + dir.dx;
        const ty = y + dir.dy;
        if (tx >= 0 && tx < 3 && ty >= 0 && ty < 3) {
            const tIndex = ty * 3 + tx;
            const tCard = boardState[tIndex];

            if (tCard !== null && tCard.owner !== owner) {
                const myVal = originCard.stats[dir.myStat];
                const enVal = tCard.stats[dir.enStat];

                if (myVal > enVal) {
                    tCard.owner = owner;
                    flipped.push(tIndex);
                }
            }
        }
    }

    return flipped;
}

function checkGameOver(p1HandCount = 0, p2HandCount = 0) {
    const isBoardFull = boardState.every(cell => cell !== null);
    if (!isBoardFull) return null;

    let p1Score = p1HandCount;
    let p2Score = p2HandCount;
    boardState.forEach(cell => {
        if (cell.owner === 'p1') p1Score++;
        else if (cell.owner === 'p2') p2Score++;
    });

    let winner = 'draw';
    if (p1Score > p2Score) winner = 'p1';
    else if (p2Score > p1Score) winner = 'p2';

    return { p1Score, p2Score, winner };
}

/* Inventory Management System */
let playerInventory = {};

function loadInventory() {
    const saved = localStorage.getItem('triple_triad_inventory');
    if (saved) {
        playerInventory = JSON.parse(saved);
    } else {
        playerInventory = {
            'c1': 5, 'c2': 5, 'c3': 5, 'c4': 5, 'c5': 5
        };
        saveInventory();
    }
}

function saveInventory() {
    localStorage.setItem('triple_triad_inventory', JSON.stringify(playerInventory));
}

function addCardToInventory(cardId) {
    if (!playerInventory[cardId]) {
        playerInventory[cardId] = 0;
    }
    playerInventory[cardId]++;
    saveInventory();
}

loadInventory();
