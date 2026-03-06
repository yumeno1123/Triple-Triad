/**
 * game.js
 * ゲームのコアロジック（特殊ルール対応版）
 */

let boardState = new Array(9).fill(null);
let p1Hand = [];
let p2Hand = [];
let currentTurn = 'p1';
let gameMode = 'pvp';
let elementalBoard = new Array(9).fill(null);

// 発動した特殊ルールの記録用（UI表示のため）
let activeSpecialRules = [];

// チュートリアル用状態管理
let isTutorialMode = false;
let tutorialStep = 0;

// ルールの有効化設定
let gameConfig = {
    open: true,
    same: true,
    sameWall: true,
    plus: true,
    suddenDeath: true,
    elemental: false,
    tradeRule: 'one',
    matchType: 'free'
};

function initGame(mode, rules = null, playerHand = null, npcLevel = 5, player2Hand = null) {
    gameMode = mode;
    if (rules) {
        gameConfig = {
            ...rules,
            tradeRule: rules.tradeRule || 'one',
            matchType: rules.matchType || 'free'
        };
    }

    boardState = new Array(9).fill(null);
    elementalBoard = new Array(9).fill(null);

    // エレメンタルボードのランダム生成
    if (gameConfig.elemental) {
        const elements = ['fire', 'ice', 'thunder', 'earth', 'poison', 'wind', 'water', 'holy'];
        const numSpots = Math.floor(Math.random() * 3) + 1; // 1〜3マス
        let availablePositions = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        for (let i = 0; i < numSpots; i++) {
            const posIdx = Math.floor(Math.random() * availablePositions.length);
            const pos = availablePositions.splice(posIdx, 1)[0];
            const elIdx = Math.floor(Math.random() * elements.length);
            elementalBoard[pos] = elements[elIdx];
        }
    }

    // 生成前に前回の状態をクリアしておく（フィルタリング誤作動防止）
    p1Hand = [];
    p2Hand = [];

    // 新チュートリアルNPCまたは旧チュートリアル教官の場合はチュートリアルモードを強制
    if (typeof currentStoryNpcId !== 'undefined' && currentStoryNpcId &&
        (currentStoryNpcId.startsWith('npc_tut_') || currentStoryNpcId === 'npc_00')) {
        gameConfig.isTutorial = true;
    }

    isTutorialMode = gameConfig.isTutorial || false;
    tutorialStep = isTutorialMode ? 1 : 0;

    if (isTutorialMode) {
        // startStoryBattle から渡された固定手札（p1Deck, p2Deck相当）があればそのまま使う
        if (playerHand && player2Hand) {
            p1Hand = [...playerHand];
            p2Hand = [...player2Hand];
        } else {
            // 下位互換：引数なしの場合は旧チュートリアルの固定手札
            p1Hand = ['c1', 'c8', 'c10', 'c12', 'c13'].map(id => {
                const c = CARD_DATA.find(card => card.id === id);
                return { ...c, stats: [...c.stats] };
            });
            p2Hand = ['c2', 'c3', 'c4', 'c5', 'c7'].map(id => {
                const c = CARD_DATA.find(card => card.id === id);
                return { ...c, stats: [...c.stats] };
            });
        }
    } else {
        // プレイヤーの手札が指定されていればそれを使用、そうでなければランダム
        p1Hand = playerHand ? [...playerHand] : drawRandomCards(5);

        // NPCの手札生成: CPU戦なら指定レベルに基づき、PvPなら指定されたP2の手札（なければ完全ランダム）
        if (gameMode === 'pvc') {
            p2Hand = drawNPCCards(npcLevel);
        } else {
            p2Hand = player2Hand ? [...player2Hand] : drawRandomCards(5);
        }
    }

    const finalTurn = isTutorialMode ? 'p1' : (Math.random() < 0.5 ? 'p1' : 'p2');
    activeSpecialRules = [];

    // UIを初期化するが、操作は一旦ブロック
    currentTurn = finalTurn;
    setupUI();

    if (isTutorialMode) {
        const startText = 'TUTORIAL START!';
        const color = 'var(--color-p1)';

        // チュートリアルでもルール紹介を表示
        showRulesIntroAnimation(gameConfig, () => {
            showGameStartEffect(startText, color);
            setTimeout(() => {
                advanceTutorialStep();
            }, 2000);
        });
    } else {
        // ルーレット演出の呼び出し
        playTurnRoulette(finalTurn, () => {
            // ルール紹介アニメーションを挟んでからゲーム開始テキストを表示
            showRulesIntroAnimation(gameConfig, () => {
                const startText = currentTurn === 'p1' ? 'PLAYER 1 START!' : (gameMode === 'pvc' ? 'CPU START!' : 'PLAYER 2 START!');
                const color = currentTurn === 'p1' ? 'var(--color-p1)' : 'var(--color-p2)';
                showGameStartEffect(startText, color);

                if (gameMode === 'pvc' && currentTurn === 'p2') {
                    setTimeout(playCPUTurn, 2000);
                }
            });
        });
    }
}

/**
 * 試合開始時に適用ルールを1つずつアニメーション表示する
 * @param {Object} config - gameConfig
 * @param {Function} onComplete - 全ルール表示後に呼ぶコールバック
 */
function showRulesIntroAnimation(config, onComplete) {
    // 表示するルール名リストを作成
    const ruleNames = [];
    if (config.open) ruleNames.push('OPEN');
    if (config.same) ruleNames.push('SAME');
    if (config.sameWall) ruleNames.push('SAME WALL');
    if (config.plus) ruleNames.push('PLUS');
    if (config.suddenDeath) ruleNames.push('SUDDEN DEATH');
    if (config.elemental) ruleNames.push('ELEMENTAL');

    // ルールがなければ即コールバック
    if (ruleNames.length === 0) {
        onComplete();
        return;
    }

    const DISPLAY_MS = 700; // 1ルールあたりの表示時間（CSSアニメーションと合わせる）

    let index = 0;
    function showNext() {
        if (index >= ruleNames.length) {
            onComplete();
            return;
        }
        const ruleName = ruleNames[index++];
        const el = document.createElement('div');
        el.className = 'rule-intro-popup'; // style.cssで定義したクラス
        el.textContent = ruleName;
        document.getElementById('screen-game').appendChild(el);

        // SEを鳴らす（もし設定されていれば）
        if (typeof playSE === 'function') playSE('click');

        setTimeout(() => {
            el.remove();
            showNext();
        }, DISPLAY_MS);
    }
    const INITIAL_DELAY = 500; // 盤面が表示されてから最初のルールが出るまでの待ち時間
    setTimeout(showNext, INITIAL_DELAY);
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
    // 回数を1.5倍程度に増やし、じっくり見せる
    const maxFlashes = 15 + Math.floor(Math.random() * 8);
    let currentShow = 'p1';
    let delay = 15; // 初期のフラッシュ間隔（ミリ秒）

    function flash() {
        flashes++;
        currentShow = currentShow === 'p1' ? 'p2' : 'p1';

        // ルーレットの点滅に合わせてSEを鳴らす
        if (typeof playSE === 'function') playSE('click');

        if (flashes >= maxFlashes) {
            // 最終結果で固定
            currentShow = finalTurn;
            const text = currentShow === 'p1' ? 'PLAYER 1 FIRST' : (gameMode === 'pvc' ? 'CPU FIRST' : 'PLAYER 2 FIRST');
            const color = currentShow === 'p1' ? 'var(--color-p1)' : 'var(--color-p2)';

            indicator.textContent = text;
            indicator.style.color = color;
            indicator.style.textShadow = `0 0 25px ${color}, 0 0 40px white`; // 決定時の発光を強化

            // 決定時のSE
            if (typeof playSE === 'function') playSE('place');

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

        // 徐々に遅くする（時間を伸ばすため増分を調整）
        delay += 9;
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

    let mod = 0;
    if (gameConfig.elemental && elementalBoard[boardIndex]) {
        if (cardInfo.element === elementalBoard[boardIndex]) {
            mod = 1;
        } else {
            mod = -1;
        }
    }

    boardState[boardIndex] = {
        id: cardInfo.id,
        owner: owner,
        stats: cardInfo.stats.map(val => Math.min(10, Math.max(1, val + mod))),
        originalStats: [...cardInfo.stats],
        elementMod: mod
    };

    activeSpecialRules = [];
    let allFlipped = new Set();

    const specialResult = checkSpecialRules(boardIndex, owner);
    const specialFlipped = specialResult.flipped;
    const comboStarters = specialResult.comboStarters;

    specialFlipped.forEach(idx => allFlipped.add(idx));

    const normalFlipped = checkNormalBattles(boardIndex, owner);
    normalFlipped.forEach(idx => allFlipped.add(idx));

    if (comboStarters.length > 0) {
        let comboQueue = [...comboStarters];
        let hasCombo = false;

        while (comboQueue.length > 0) {
            const originIndex = comboQueue.shift();
            const newlyFlipped = checkNormalBattles(originIndex, owner);

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

/**
 * 盤面を仮想的に変更して、引っくり返せる枚数を計算するシミュレーション関数（AI用）
 * @param {number} boardIndex - おきたいマス (0-8)
 * @param {Object} cardInfo - カードデータ
 * @param {string} owner - 'p1' または 'p2'
 * @returns {number} - ひっくり返せる枚数
 */
function simulatePlacement(boardIndex, cardInfo, owner) {
    if (boardState[boardIndex] !== null) {
        return 0; // すでに置かれている場合は0枚
    }

    // 1. 現在の盤面状態と特別ルール状態をディープコピーして保存
    const originalBoardState = boardState.map(cell => cell ? { ...cell, stats: [...cell.stats], owner: cell.owner, id: cell.id } : null);
    const originalActiveSpecialRules = [...activeSpecialRules];

    // 2. 実際に配置処理を呼ぶ（内部で boardState が書き換わる）
    const result = placeCardOnBoard(boardIndex, cardInfo, owner);

    // 3. ひっくり返した枚数を取得
    const flippedCount = result.flipped.length;

    // 4. 盤面状態を元に戻す
    for (let i = 0; i < 9; i++) {
        boardState[i] = originalBoardState[i];
    }
    activeSpecialRules.length = 0;
    originalActiveSpecialRules.forEach(r => activeSpecialRules.push(r));

    return flippedCount;
}

function checkSpecialRules(index, owner) {
    const flipped = [];
    const comboStarters = [];
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
                if (!comboStarters.includes(match.index)) {
                    comboStarters.push(match.index);
                }
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
                    if (!comboStarters.includes(match.index)) {
                        comboStarters.push(match.index);
                    }
                    if (match.card.owner !== owner && !flipped.includes(match.index)) {
                        match.card.owner = owner;
                        flipped.push(match.index);
                    }
                });
            }
        }
    }

    return { flipped, comboStarters };
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
    // レアカード（Lv8以上 + コヨコヨ）は1枚しか所持できない（世界に1枚しか存在しない）
    if (typeof CARD_DATA !== 'undefined') {
        const cardInfo = CARD_DATA.find(c => c.id === cardId);
        if (cardInfo && (cardInfo.level >= 8 || cardInfo.id === 'c48')) {
            if (playerInventory[cardId] >= 1) {
                return; // すでに所持している場合は追加をスキップ
            }
        }
    }

    if (!playerInventory[cardId]) {
        playerInventory[cardId] = 0;
    }
    playerInventory[cardId]++;
    saveInventory();
}


/* Player Statistics (Win/Loss Records) */
let playerStats = {
    wins: 0,
    losses: 0,
    draws: 0,
    levelStats: {},   // { "1": {wins:0, losses:0, draws:0}, ... }
    maxScoreDiff: 0,  // 最大点差勝利
    recentMatches: [] // { date, opponent, myScore, enemyScore, result }
};

function loadStats() {
    const saved = localStorage.getItem('triple_triad_stats');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            playerStats = { ...playerStats, ...parsed };
            // 古いデータ形式の補完
            if (!playerStats.levelStats) playerStats.levelStats = {};
            if (!playerStats.recentMatches) playerStats.recentMatches = [];
            if (playerStats.maxScoreDiff === undefined) playerStats.maxScoreDiff = 0;
        } catch (e) {
            console.error("Failed to parse stats", e);
        }
    }
}

function saveStats() {
    localStorage.setItem('triple_triad_stats', JSON.stringify(playerStats));
}

function updateStats(details) {
    const result = typeof details === 'string' ? details : details.result;
    const myScore = details.myScore !== undefined ? details.myScore : 0;
    const enemyScore = details.enemyScore !== undefined ? details.enemyScore : 0;
    const opponentLevel = details.opponentLevel || 5;
    const mode = details.mode || 'pvp';

    if (result === 'win') playerStats.wins++;
    else if (result === 'loss') playerStats.losses++;
    else if (result === 'draw') playerStats.draws++;

    // CPU戦のレベル別記録
    if (mode === 'pvc') {
        if (!playerStats.levelStats[opponentLevel]) {
            playerStats.levelStats[opponentLevel] = { wins: 0, losses: 0, draws: 0 };
        }
        if (result === 'win') playerStats.levelStats[opponentLevel].wins++;
        else if (result === 'loss') playerStats.levelStats[opponentLevel].losses++;
        else if (result === 'draw') playerStats.levelStats[opponentLevel].draws++;
    }

    // 最大点差記録
    if (result === 'win') {
        const diff = myScore - enemyScore;
        if (diff > playerStats.maxScoreDiff) {
            playerStats.maxScoreDiff = diff;
        }
    }

    // 履歴の記録
    const dateStr = new Date().toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    const opponentName = mode === 'pvc' ? `CPU LV${opponentLevel}` : '対人戦 (PvP)';

    playerStats.recentMatches.unshift({
        date: dateStr,
        opponent: opponentName,
        myScore: myScore,
        enemyScore: enemyScore,
        result: result
    });

    // 履歴は最大10件まで
    if (playerStats.recentMatches.length > 10) {
        playerStats.recentMatches.pop();
    }

    saveStats();
}

// 初期化時に読み込み
loadInventory();
loadStats();

// ==========================================
// チュートリアル用 スクリプトイベント制御
// ==========================================

/**
 * チュートリアル用のハイライトを一括削除する
 */
function clearTutorialHighlights() {
    const highlights = document.querySelectorAll('.highlight-tutorial');
    highlights.forEach(el => el.classList.remove('highlight-tutorial'));
}

window.advanceTutorialStep = function () {
    const box = document.getElementById('tutorial-message-box');
    const text = document.getElementById('tutorial-text');
    if (!box || !text) return;

    box.classList.remove('hidden');

    // どのチュートリアルを実行するか判定
    if (currentStoryNpcId === 'npc_00') {
        runBasicTutorial(box, text);
    } else if (currentStoryNpcId === 'npc_tut_same') {
        runSameTutorial(box, text);
    } else if (currentStoryNpcId === 'npc_tut_plus') {
        runPlusTutorial(box, text);
    } else if (currentStoryNpcId === 'npc_tut_combo') {
        runComboTutorial(box, text);
    } else if (currentStoryNpcId === 'npc_tut_same_wall') {
        runWallSameTutorial(box, text);
    } else {
        box.classList.add('hidden');
        isTutorialMode = false;
    }
};

function runBasicTutorial(box, text) {
    switch (tutorialStep) {
        case 1:
            text.innerHTML = '教官：「あなた（青）のターンからよ。<br>まずは手札の『ハウリザード』を選んで、左上のマスに置いてみて。」';
            const c0 = document.getElementById('p1-card-0'); // ハウリザード
            if (c0) c0.classList.add('highlight-tutorial');
            const cell0 = document.getElementById('cell-0'); // 左上
            if (cell0) cell0.classList.add('highlight-tutorial');
            break;
        case 2:
            text.innerHTML = '教官：「いいわね。…次は私の番ね。」';
            setTimeout(() => {
                box.classList.add('hidden');
                setTimeout(() => {
                    // 教官のカード c2 (フンゴオンゴ) を cell 1 に置く
                    const cpuCardElement = document.getElementById('p2-card-0');
                    const cellElement = document.getElementById('cell-1');
                    if (cpuCardElement && cellElement && typeof executeCPUPlacement === 'function') {
                        executeCPUPlacement(cpuCardElement, cellElement, 1);
                    }
                }, 500);
            }, 2000);
            break;
        case 3:
            text.innerHTML = '教官：「このカード、下の数字が『1』……弱点が見えるわね。<br>あなたの手札の『フォカロル(小)』(上:3) を、私のカードのすぐ下のマス（真ん中）に置いてみて。<br>接している数字が相手より大きければ、裏返せるわ。」';
            const c1 = document.getElementById('p1-card-1'); // フォカロル小
            if (c1) c1.classList.add('highlight-tutorial');
            const cell4 = document.getElementById('cell-4'); // 真ん中の中央
            if (cell4) cell4.classList.add('highlight-tutorial');
            break;
        case 4:
            text.innerHTML = '教官：「見事ね！<br>最終的に自分の色のカードが多い状態になれば勝利よ。あとは自分で考えて。実戦で学ぶのが一番よ。」';
            clearTutorialHighlights();
            setTimeout(() => {
                box.classList.add('hidden');
                isTutorialMode = false; // チュートリアル終了
                tutorialStep = 0;
                // 次のターン（教官の通常ターン）を開始
                setTimeout(playCPUTurn, 1000);
            }, 5000);
            break;
    }
}

function runSameTutorial(box, text) {
    switch (tutorialStep) {
        case 1:
            currentTurn = 'p1';
            text.innerHTML = '教官（セイム）：「セイムの仕組みを教えるわ。<br>まずはあなたの番よ。手札の『ハウリザード』を左上に置いてみて。」';
            const c_p1 = document.getElementById('p1-card-0'); // ハウリザード
            if (c_p1) c_p1.classList.add('highlight-tutorial');
            const cell0 = document.getElementById('cell-0'); // 左上
            if (cell0) cell0.classList.add('highlight-tutorial');
            break;
        case 2:
            text.innerHTML = '教官（セイム）：「次は私ね。左下に置くわ。」';
            setTimeout(() => {
                box.classList.add('hidden');
                setTimeout(() => {
                    const cpuCardElement = document.getElementById('p2-card-0'); // プリヌラ
                    const cellElement = document.getElementById('cell-6');
                    if (cpuCardElement && cellElement && typeof executeCPUPlacement === 'function') {
                        executeCPUPlacement(cpuCardElement, cellElement, 6);
                    }
                }, 500);
            }, 2500);
            break;
        case 3:
            currentTurn = 'p1'; // プレイヤーのターンに強制
            text.innerHTML = '教官（セイム）：「あなたの手札に『ケダチク (上:4, 下:2)』があるわね。<br>それをハウリザードとプリヌラの間（左中央）に置いてみて。<br>上のカードとは「4」、下のカードとは「2」が一致して『セイム』が発動するはずよ。」';
            const c_p2 = document.getElementById('p1-card-1'); // ケダチク
            if (c_p2) c_p2.classList.add('highlight-tutorial');
            const cell3 = document.getElementById('cell-3'); // 左中央
            if (cell3) cell3.classList.add('highlight-tutorial');
            break;
        case 4:
            text.innerHTML = '教官（セイム）：「これが『セイム』よ。数字の強さに関係なく、同じ数字なら奪い取れる強力な技だわ。<br>残りは自分で進めてみて。」';
            clearTutorialHighlights();
            setTimeout(() => {
                box.classList.add('hidden');
                isTutorialMode = false;
                tutorialStep = 0;
                setTimeout(playCPUTurn, 1000);
            }, 5000);
            break;
    }
}

function runPlusTutorial(box, text) {
    switch (tutorialStep) {
        case 1:
            text.innerHTML = '教官（プラス）：「プラスのルールを教えるわ。<br>私が2枚カードを置くから、少し待っていて。」';
            setTimeout(() => {
                box.classList.add('hidden');
                setTimeout(() => {
                    const cpuCard1 = document.getElementById('p2-card-0'); // ダブルハガー [3, 7, 2, 1] -> 右:7
                    const cell0 = document.getElementById('cell-0');
                    if (cpuCard1 && cell0) executeCPUPlacement(cpuCard1, cell0, 0);
                }, 500);
            }, 3000);
            break;
        case 2:
            setTimeout(() => {
                const cpuCard2 = document.getElementById('p2-card-1'); // ライフフォビドン [6, 2, 6, 3] -> 左:3
                const cell2 = document.getElementById('cell-2');
                if (cpuCard2 && cell2) executeCPUPlacement(cpuCard2, cell2, 2);
            }, 500);
            break;
        case 3:
            currentTurn = 'p1'; // プレイヤーのターンに強制
            text.innerHTML = '教官（プラス）：「さあ、あなたの手札の『ハウリザード (左:1, 右:5)』を、2枚のカードの間に置いてみて。<br>接する数字を足し算するの。<br>左側は [7+1=8]、右側は [5+3=8] ……この『合計値』が2箇所以上で同じなら、『プラス』が発動するわ。」';
            const c1 = document.getElementById('p1-card-0'); // ハウリザード
            if (c1) c1.classList.add('highlight-tutorial');
            const cell1 = document.getElementById('cell-1'); // 中央上
            if (cell1) cell1.classList.add('highlight-tutorial');
            break;
        case 4:
            text.innerHTML = '教官（プラス）：「お見事。合計が同じなら、相手の数字がいくつでも奪えるのがプラスの力よ。<br>この調子で、残りのカードも置いてみて。」';
            clearTutorialHighlights();
            setTimeout(() => {
                box.classList.add('hidden');
                isTutorialMode = false;
                tutorialStep = 0;
                setTimeout(playCPUTurn, 1000);
            }, 4000);
            break;
    }
}

function runComboTutorial(box, text) {
    switch (tutorialStep) {
        case 1:
            text.innerHTML = '教官（コンボ）：「連鎖（コンボ）……これを知るかどうかで、勝負の質が変わるわ。<br>まずは下準備として、私のカードを左中央に置くわね。」';
            setTimeout(() => {
                box.classList.add('hidden');
                setTimeout(() => {
                    const cpuCard = document.getElementById('p2-card-0'); // フンゴオンゴ (下1)
                    if (cpuCard) executeCPUPlacement(cpuCard, document.getElementById('cell-3'), 3);
                }, 500);
            }, 3000);
            break;
        case 2:
            currentTurn = 'p1'; // プレイヤーのターンに強制
            text.innerHTML = '教官（コンボ）：「次に、あなたの手札の『フォカロル(小) (下:5)』を、その右隣（中央）に置いてみて。」';
            const c1 = document.getElementById('p1-card-1'); // フォカロル小
            if (c1) c1.classList.add('highlight-tutorial');
            const cell4 = document.getElementById('cell-4');
            if (cell4) cell4.classList.add('highlight-tutorial');
            break;
        case 3:
            text.innerHTML = '教官（コンボ）：「いいわ。私も左下にカードを置くわね。」';
            setTimeout(() => {
                box.classList.add('hidden');
                setTimeout(() => {
                    const cpuCard = document.getElementById('p2-card-1'); // コカトリス (右6, 上2)
                    executeCPUPlacement(cpuCard, document.getElementById('cell-6'), 6);
                }, 500);
            }, 2000);
            break;
        case 4:
            currentTurn = 'p1'; // プレイヤーのターンに強制
            text.innerHTML = '教官（コンボ）：「さあ、仕上げよ。手札の『ハウリザード (左:1, 上:1)』を、2枚のカードの間に置いて。<br>上側は [1+5=6]、左側は [1+5=6]。これで『プラス』が発動するわ。<br>そして、奪ったカードが隣のカードを数字で上回れば、『連鎖（コンボ）』が次々と起きるの。」';
            const c2 = document.getElementById('p1-card-0'); // ハウリザード
            if (c2) c2.classList.add('highlight-tutorial');
            const cell7 = document.getElementById('cell-7'); // 下中央
            if (cell7) cell7.classList.add('highlight-tutorial');
            break;
        case 5:
            text.innerHTML = '教官（コンボ）：「……これが連鎖よ。弱いカードでも、配置次第で局面をひっくり返せる。<br>覚えておくといいわ。」';
            clearTutorialHighlights();
            setTimeout(() => {
                box.classList.add('hidden');
                isTutorialMode = false;
                tutorialStep = 0;
                setTimeout(playCPUTurn, 1000);
            }, 5000);
            break;
    }
}

function runWallSameTutorial(box, text) {
    switch (tutorialStep) {
        case 1:
            text.innerHTML = '教官（ウォールセイム）：「次は『ウォールセイム』よ。<br>このルールでは、盤面の端……つまり壁を数字の『A（10）』として扱うの。<br>まずは私から置くわね。」';
            setTimeout(() => {
                box.classList.add('hidden');
                setTimeout(() => {
                    const cpuCard = document.getElementById('p2-card-0'); // エルノーイル [5, 6, 3, 7]
                    const cellElement = document.getElementById('cell-1');
                    if (cpuCard && cellElement && typeof executeCPUPlacement === 'function') {
                        executeCPUPlacement(cpuCard, cellElement, 1); // 中央上
                    }
                }, 500);
            }, 3000);
            break;
        case 2:
            currentTurn = 'p1';
            text.innerHTML = '教官（ウォールセイム）：「あなたの番よ。<br>手札の『パンデモニウム (上:A, 左:7)』を、左上の隅に置いてみて。<br>上と左が壁に接するわ。」';
            const c1 = document.getElementById('p1-card-0'); // パンデモニウム
            if (c1) c1.classList.add('highlight-tutorial');
            const cell0 = document.getElementById('cell-0'); // 左上
            if (cell0) cell0.classList.add('highlight-tutorial');
            break;
        case 3:
            text.innerHTML = '教官（ウォールセイム）：「上手くいったわね。<br>上と左が壁＝『A』と同じ数字として判定されて、『セイム』が発動したわ。<br>隣の私のカードも巻き込まれたわね。」';
            setTimeout(() => {
                text.innerHTML = '教官（ウォールセイム）：「壁を味方につければ、どんな強力なカードも崩せる。<br>あとは自分で工夫してみて。あなたなら、すぐに使いこなせるはずよ。」';
                clearTutorialHighlights();
                setTimeout(() => {
                    box.classList.add('hidden');
                    isTutorialMode = false;
                    tutorialStep = 0;
                    setTimeout(playCPUTurn, 1000);
                }, 4000);
            }, 4000);
            break;
    }
}
