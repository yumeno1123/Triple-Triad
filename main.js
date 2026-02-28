/**
 * main.js
 * UIの操作（クリックイベント）、画面遷移、アニメーション処理
 */

// グローバルなDOM要素
const screenTitle = document.getElementById('screen-title');
const screenStory = document.getElementById('screen-story');
const screenFreeBattle = document.getElementById('screen-free-battle');
const screenGame = document.getElementById('screen-game');
const screenResult = document.getElementById('screen-result');
const screenTrade = document.getElementById('screen-trade');
const screenCollection = document.getElementById('screen-collection');
const screenHelp = document.getElementById('screen-help');
const screenDeckEdit = document.getElementById('screen-deck-edit');

const btnStory = document.getElementById('btn-story');
const btnFreeBattle = document.getElementById('btn-free-battle');
const btnStoryBack = document.getElementById('btn-story-back');
const btnFreeBattleBack = document.getElementById('btn-free-battle-back');
const btnPvp = document.getElementById('btn-pvp');
const btnPvc = document.getElementById('btn-pvc');
const btnBackTitle = document.getElementById('btn-back-title');
const btnCollection = document.getElementById('btn-collection');
const btnCollectionBack = document.getElementById('btn-collection-back');
const btnHelp = document.getElementById('btn-help');
const btnHelpClose = document.getElementById('btn-help-close');
const btnDeckBack = document.getElementById('btn-deck-back');
const btnDeckStart = document.getElementById('btn-deck-start');

const gameBoard = document.getElementById('game-board');
const handP1 = document.getElementById('hand-player1');
const handP2 = document.getElementById('hand-player2');

const turnIndicator = document.getElementById('turn-indicator');
const scoreP1 = document.getElementById('score-player1');
const scoreP2 = document.getElementById('score-player2');

// 選択中のカード要素
let selectedCardElement = null;
let playerSelectedDeck = []; // プレイヤーが選んだ5枚
let pendingGameMode = 'pvp'; // pvp or pvc
let currentSelectingPlayer = 'p1';
let p1SelectedDeck = [];
let p2SelectedDeck = [];

/* --- イベントリスナーの登録 --- */
btnStory.addEventListener('click', showStoryScreen);
btnFreeBattle.addEventListener('click', showFreeBattleScreen);
btnStoryBack.addEventListener('click', showTitleScreen);
btnFreeBattleBack.addEventListener('click', showTitleScreen);
btnPvp.addEventListener('click', () => prepareGame('pvp'));
btnPvc.addEventListener('click', () => prepareGame('pvc'));
btnBackTitle.addEventListener('click', () => {
    if (pendingGameMode === 'story') {
        showStoryScreen();
    } else if (pendingGameMode === 'pvp' || pendingGameMode === 'pvc') {
        showFreeBattleScreen();
    } else {
        showTitleScreen();
    }
});
btnCollection.addEventListener('click', showCollectionScreen);
btnCollectionBack.addEventListener('click', showTitleScreen);
btnHelp.addEventListener('click', showHelpScreen);
btnHelpClose.addEventListener('click', hideHelpScreen);
btnDeckBack.addEventListener('click', showTitleScreen);
btnDeckStart.addEventListener('click', () => finalizeStartGame());

function prepareGame(mode) {
    pendingGameMode = mode;
    currentSelectingPlayer = 'p1';
    const matchType = document.querySelector('input[name="match-mode"]:checked').value;
    const isRandomHand = document.getElementById('rule-random-hand') && document.getElementById('rule-random-hand').checked;

    if (isRandomHand) {
        // ランダムハンドON時はデッキ編集をスキップして自動構築
        p1SelectedDeck = generateRandomHand(matchType);
        if (mode === 'pvp') {
            p2SelectedDeck = generateRandomHand(matchType, p1SelectedDeck);
        } else {
            p2SelectedDeck = null;
        }

        screenTitle.classList.remove('active');
        screenTitle.classList.add('hidden');
        startConfiguredGame(mode, matchType, p1SelectedDeck, p2SelectedDeck);
    } else {
        showDeckEditScreen(matchType, 'p1');
    }
}

function generateRandomHand(matchType, excludeDeck = []) {
    let pool = [];
    if (matchType === 'free') {
        for (const card of CARD_DATA) {
            let maxCount = 5;
            if (card.level >= 8 || card.id === 'c48') maxCount = 1;
            const excludedCount = excludeDeck.filter(c => c.id === card.id).length;
            const availableCount = maxCount - excludedCount;
            for (let i = 0; i < Math.max(0, availableCount); i++) pool.push(card);
        }
    } else {
        for (const [id, count] of Object.entries(playerInventory)) {
            const card = CARD_DATA.find(c => c.id === id);
            if (card && count > 0) {
                let maxCount = count;
                if (card.level >= 8 || card.id === 'c48') maxCount = Math.min(count, 1);
                const excludedCount = excludeDeck.filter(c => c.id === id).length;
                const availableCount = maxCount - excludedCount;
                for (let i = 0; i < Math.max(0, availableCount); i++) pool.push({ ...card });
            }
        }
    }
    pool = pool.sort(() => 0.5 - Math.random());
    const hand = pool.slice(0, 5);
    while (hand.length < 5) {
        const fallback = CARD_DATA[Math.floor(Math.random() * 5)];
        hand.push({ ...fallback });
    }
    return hand;
}

function showDeckEditScreen(matchType, player = 'p1') {
    currentSelectingPlayer = player;
    const titleEl = document.getElementById('deck-edit-title');
    if (titleEl) {
        titleEl.textContent = `DECK EDIT (PLAYER ${player === 'p1' ? '1' : '2'})`;
    }

    [screenTitle, screenStory, screenFreeBattle].forEach(s => {
        if (s) {
            s.classList.remove('active');
            s.classList.add('hidden');
        }
    });

    screenDeckEdit.classList.remove('hidden');
    screenDeckEdit.classList.add('active');

    playerSelectedDeck = [];
    updateDeckUI();
    renderDeckAvailableCards(matchType);
}

function renderDeckAvailableCards(matchType) {
    const grid = document.getElementById('deck-available-grid');
    grid.innerHTML = '';

    // レベル（10〜1）の降順でグループ化して表示
    for (let level = 10; level >= 1; level--) {
        let levelCards = [];
        if (matchType === 'free') {
            levelCards = CARD_DATA.filter(c => c.level === level);
        } else {
            // 所持しているカードのみ
            levelCards = CARD_DATA.filter(c => c.level === level && playerInventory[c.id] > 0);
        }

        if (levelCards.length === 0) continue;

        // レベルの見出しを作成（コレクション用のスタイルを流用）
        const levelHeader = document.createElement('div');
        levelHeader.className = 'collection-level-header';
        levelHeader.style.marginTop = '20px'; // デッキ画面用に微調整
        levelHeader.textContent = `LEVEL ${level}`;
        grid.appendChild(levelHeader);

        // そのレベルのカード用サブグリッドを作成
        const subGrid = document.createElement('div');
        subGrid.className = 'deck-grid'; // CSSでgrid-template-columnsが設定されているクラス

        levelCards.forEach(card => {
            const item = document.createElement('div');
            item.className = 'deck-card-item';
            item.dataset.id = card.id;
            const cardEl = createCardElement(card);
            item.appendChild(cardEl);

            // 残機数表示用バッジ
            const badge = document.createElement('div');
            badge.className = 'card-count-badge';
            item.appendChild(badge);

            item.addEventListener('click', () => addCardToDeck(card, matchType));
            subGrid.appendChild(item);
        });
        grid.appendChild(subGrid);
    }

    // バッジ等の初期状態を反映
    updateDeckUI();
}

function addCardToDeck(card, matchType) {
    if (playerSelectedDeck.length >= 5) return; // 5枚まで

    const currentCountInDeck = playerSelectedDeck.filter(c => c.id === card.id).length;
    let maxOwned = matchType === 'free' ? 5 : (playerInventory[card.id] || 0);

    // 新規追加制限：レアカード（Lv8以上 + コヨコヨ）はフリーモードでも1枚制限
    if (card.level >= 8 || card.id === 'c48') {
        maxOwned = Math.min(maxOwned, 1);
    }

    let consumedByP1 = 0;
    if (currentSelectingPlayer === 'p2') {
        if (matchType !== 'free') {
            consumedByP1 = p1SelectedDeck.filter(c => c.id === card.id).length;
        } else if (card.level >= 8 || card.id === 'c48') {
            consumedByP1 = p1SelectedDeck.filter(c => c.id === card.id).length;
        }
    }

    if (currentCountInDeck < maxOwned - consumedByP1) {
        playerSelectedDeck.push(card);
        updateDeckUI();
    }
}

function updateDeckUI() {
    const slots = document.getElementById('deck-slots');
    slots.innerHTML = '';

    for (let i = 0; i < 5; i++) {
        const slot = document.createElement('div');
        slot.className = 'deck-slot';
        if (playerSelectedDeck[i]) {
            const cardEl = createCardElement(playerSelectedDeck[i]);
            slot.appendChild(cardEl);
            // スロット内のカードをクリックで外す（インデックス指定で確実に消す）
            slot.addEventListener('click', () => {
                playerSelectedDeck.splice(i, 1);
                updateDeckUI();
            });
        } else {
            slot.innerHTML = '<div class="empty-slot">?</div>';
        }
        slots.appendChild(slot);
    }

    document.getElementById('selected-count').textContent = playerSelectedDeck.length;
    btnDeckStart.disabled = playerSelectedDeck.length < 5;

    // 「選択可能なカードリスト」側のバッジ更新とグレーアウト処理
    const matchType = document.querySelector('input[name="match-mode"]:checked')?.value || 'advance';
    const gridItems = document.querySelectorAll('.deck-card-item');

    gridItems.forEach(item => {
        const id = item.dataset.id;
        const countInDeck = playerSelectedDeck.filter(c => c.id === id).length;
        let maxOwned = matchType === 'free' ? 5 : (playerInventory[id] || 0);

        // UI制限：レアカード（Lv8以上 + コヨコヨ）は1枚制限
        if (typeof CARD_DATA !== 'undefined') {
            const cardInfo = CARD_DATA.find(c => c.id === id);
            if (cardInfo && (cardInfo.level >= 8 || cardInfo.id === 'c48')) {
                maxOwned = Math.min(maxOwned, 1);
            }
        }

        let consumedByP1 = 0;
        if (currentSelectingPlayer === 'p2') {
            if (matchType !== 'free') {
                consumedByP1 = p1SelectedDeck.filter(c => c.id === id).length;
            } else {
                const cardInfo = CARD_DATA.find(c => c.id === id);
                if (cardInfo && (cardInfo.level >= 8 || cardInfo.id === 'c48')) {
                    consumedByP1 = p1SelectedDeck.filter(c => c.id === id).length;
                }
            }
        }

        const remaining = maxOwned - countInDeck - consumedByP1;

        const badge = item.querySelector('.card-count-badge');
        if (badge) {
            badge.textContent = remaining > 1 ? `x${remaining}` : '';
            if (remaining === 1 && maxOwned > 1) {
                badge.textContent = `x1`;
            } else if (matchType === 'free') {
                badge.textContent = ''; // フリーモードではあえて出さない
            }
        }

        if (remaining <= 0 || playerSelectedDeck.length >= 5) {
            item.classList.add('disabled-item');
            item.classList.remove('selected');
        } else {
            item.classList.remove('disabled-item');
            // 原作っぽく、最低1枚デッキに入っていれば選択中ハイライトをつける場合
            if (countInDeck > 0) item.classList.add('selected');
            else item.classList.remove('selected');
        }
    });
}


function finalizeStartGame() {
    const matchType = document.querySelector('input[name="match-mode"]:checked')?.value || 'advance';

    if (pendingGameMode === 'pvp' && currentSelectingPlayer === 'p1') {
        p1SelectedDeck = [...playerSelectedDeck];
        showDeckEditScreen(matchType, 'p2');
        return;
    } else if (pendingGameMode === 'pvp' && currentSelectingPlayer === 'p2') {
        p2SelectedDeck = [...playerSelectedDeck];
    } else {
        p1SelectedDeck = [...playerSelectedDeck];
        p2SelectedDeck = null;
    }

    startConfiguredGame(pendingGameMode, matchType, p1SelectedDeck, p2SelectedDeck);
}

function startConfiguredGame(mode, matchType, p1Deck, p2Deck) {
    [screenDeckEdit, screenStory, screenFreeBattle, screenTitle].forEach(s => {
        if (s) {
            s.classList.remove('active');
            s.classList.add('hidden');
        }
    });

    screenGame.classList.remove('hidden');
    screenGame.classList.add('active');

    let rules;
    let npcLevel = parseInt(document.getElementById('npc-level-input').value) || 5;

    if (mode === 'story' && currentStoryNpcId) {
        const npc = NPC_DATA.find(n => n.id === currentStoryNpcId);
        if (npc) {
            rules = {
                open: npc.rules.includes('open'),
                same: npc.rules.includes('same'),
                sameWall: npc.rules.includes('same-wall') || npc.rules.includes('samewall'),
                plus: npc.rules.includes('plus'),
                suddenDeath: npc.rules.includes('sudden-death') || npc.rules.includes('suddendeath'),
                elemental: npc.rules.includes('elemental'),
                tradeRule: 'one',
                matchType: 'advance' // ストーリーモードは自分の手札から使う
            };
            npcLevel = npc.baseLevel;
        }
    } else {
        rules = {
            open: document.getElementById('rule-open').checked,
            same: document.getElementById('rule-same').checked,
            sameWall: document.getElementById('rule-same-wall').checked,
            plus: document.getElementById('rule-plus').checked,
            suddenDeath: document.getElementById('rule-sudden-death').checked,
            elemental: document.getElementById('rule-elemental').checked,
            tradeRule: document.getElementById('select-trade-rule').value,
            matchType: matchType
        };
    }

    const container = document.getElementById('game-container');
    if (rules.open) container.classList.add('rules-open');
    else container.classList.remove('rules-open');

    const internalMode = (mode === 'story') ? 'pvc' : mode;
    initGame(internalMode, rules, p1Deck, npcLevel, p2Deck);
}

/* --- ストーリーモード関連の管理 --- */
let defeatedNPCs = [];
let currentStoryNpcId = null;

function loadStoryProgress() {
    const saved = localStorage.getItem('tripleTriadStoryProgress');
    if (saved) {
        try {
            defeatedNPCs = JSON.parse(saved);
        } catch (e) {
            defeatedNPCs = [];
        }
    }
}

function saveStoryProgress() {
    localStorage.setItem('tripleTriadStoryProgress', JSON.stringify(defeatedNPCs));
}

window.renderStoryNPCList = function () {
    loadStoryProgress();
    const container = document.getElementById('story-npc-list');
    container.innerHTML = '';

    if (typeof NPC_DATA === 'undefined') {
        container.innerHTML = '<p>NPCデータが見つかりません</p>';
        return;
    }

    NPC_DATA.forEach(npc => {
        const isUnlocked = !npc.unlockCondition || defeatedNPCs.includes(npc.unlockCondition);
        const isDefeated = defeatedNPCs.includes(npc.id);

        const card = document.createElement('div');
        card.className = `npc-card ${isUnlocked ? 'unlocked' : 'locked'} ${isDefeated ? 'defeated' : ''}`;

        if (isUnlocked) {
            const rulesText = npc.rules.length > 0 ? npc.rules.map(r => r.toUpperCase()).join(', ') : 'なし';
            card.innerHTML = `
                <div class="npc-info">
                    <div class="npc-header">
                        <h3>${npc.name}</h3>
                        ${isDefeated ? '<span class="beaten-badge">CLEAR!</span>' : ''}
                    </div>
                    <p class="npc-desc">${npc.description}</p>
                    <div class="npc-rules">特殊ルール: <span>${rulesText}</span></div>
                    <div class="npc-rules">NPCの強さ設定: LV<span>${npc.baseLevel}</span></div>
                </div>
                <div class="npc-action">
                    <button class="btn-primary btn-challenge" data-id="${npc.id}">挑戦する</button>
                </div>
            `;
            card.querySelector('.btn-challenge').addEventListener('click', () => startStoryBattle(npc.id));
        } else {
            card.innerHTML = `
                <div class="npc-info">
                    <div class="npc-header">
                        <h3>???</h3>
                    </div>
                    <p class="npc-desc">解放条件を満たしていません</p>
                </div>
            `;
        }
        container.appendChild(card);
    });
};

function startStoryBattle(npcId) {
    const npc = NPC_DATA.find(n => n.id === npcId);
    if (!npc) return;

    currentStoryNpcId = npcId;
    pendingGameMode = 'story';
    currentSelectingPlayer = 'p1';

    // ストーリーモード時は自分の手持ちカードから選ぶ「アドバンス」仕様
    showDeckEditScreen('advance', 'p1');
}

function startGame(mode) {
    // prepareGameに移行したため、この関数は直接呼ばれなくなりますが
    // 互換性やSudden Deathなどでの内部再開用に残しておくか、統合します。
    prepareGame(mode);
}

function showStoryScreen() {
    [screenTitle, screenFreeBattle, screenGame, screenResult, screenTrade, screenCollection, screenHelp, screenDeckEdit].forEach(s => {
        if (s) {
            s.classList.remove('active');
            s.classList.add('hidden');
        }
    });
    screenStory.classList.remove('hidden');
    screenStory.classList.add('active');
    renderStoryNPCList(); // 追加実装予定
}

function showFreeBattleScreen() {
    [screenTitle, screenStory, screenGame, screenResult, screenTrade, screenCollection, screenHelp, screenDeckEdit].forEach(s => {
        if (s) {
            s.classList.remove('active');
            s.classList.add('hidden');
        }
    });
    screenFreeBattle.classList.remove('hidden');
    screenFreeBattle.classList.add('active');
}

function showTitleScreen() {
    document.getElementById('game-container').classList.remove('rules-open');
    [screenStory, screenFreeBattle, screenGame, screenResult, screenTrade, screenCollection, screenHelp, screenDeckEdit].forEach(s => {
        if (s) {
            s.classList.remove('active');
            s.classList.add('hidden');
        }
    });

    screenTitle.classList.remove('hidden');
    screenTitle.classList.add('active');
}

function showHelpScreen() {
    screenHelp.classList.remove('hidden');
    screenHelp.classList.add('active');
}

function hideHelpScreen() {
    screenHelp.classList.remove('active');
    screenHelp.classList.add('hidden');
}

window.setupUI = function () {
    gameBoard.innerHTML = '';
    const elemEmojis = {
        'fire': '🔥', 'ice': '❄️', 'thunder': '⚡', 'earth': '🪨',
        'poison': '☠️', 'wind': '🌪️', 'water': '💧', 'holy': '✨'
    };

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('board-cell');
        cell.id = `cell-${i}`;
        cell.dataset.index = i;

        if (typeof gameConfig !== 'undefined' && gameConfig.elemental && typeof elementalBoard !== 'undefined' && elementalBoard[i]) {
            cell.dataset.element = elementalBoard[i];
            const elIcon = document.createElement('div');
            elIcon.className = 'element-icon';
            elIcon.textContent = elemEmojis[elementalBoard[i]] || '';
            cell.appendChild(elIcon);
        }

        cell.addEventListener('click', () => handleCellClick(i, cell));
        gameBoard.appendChild(cell);
    }

    handP1.innerHTML = '';
    p1Hand.forEach((cardInfo, i) => {
        const cardElem = createCardElement(cardInfo, 'p1', `p1-card-${i}`);
        cardElem.addEventListener('click', () => handleHandCardClick(cardElem, 'p1'));
        handP1.appendChild(cardElem);
    });

    handP2.innerHTML = '';
    p2Hand.forEach((cardInfo, i) => {
        const cardElem = createCardElement(cardInfo, 'p2', `p2-card-${i}`);
        cardElem.addEventListener('click', () => handleHandCardClick(cardElem, 'p2'));
        handP2.appendChild(cardElem);
    });

    updateTurnDisplay();
    updateScoreDisplay();
};

// NPCレベルスライダーのリアルタイム表示更新
document.addEventListener('DOMContentLoaded', () => {
    const levelInput = document.getElementById('npc-level-input');
    const levelDisplay = document.getElementById('npc-level-value');

    if (levelInput && levelDisplay) {
        levelInput.addEventListener('input', (e) => {
            levelDisplay.textContent = e.target.value;
        });
    }
});

function handleHandCardClick(cardElement, owner) {
    if (owner !== currentTurn) return;
    if (gameMode === 'pvc' && owner === 'p2') return;
    if (cardElement.classList.contains('played')) return;

    if (selectedCardElement) {
        selectedCardElement.classList.remove('selected');
    }

    if (selectedCardElement === cardElement) {
        selectedCardElement = null;
        clearBoardHighlight();
        return;
    }

    selectedCardElement = cardElement;
    selectedCardElement.classList.add('selected');
    highlightAvailableCells();
}

async function handleCellClick(index, cellElement) {
    if (!selectedCardElement || boardState[index] !== null) return;

    const cardId = selectedCardElement.dataset.id;
    const owner = selectedCardElement.dataset.owner;
    const cardInfo = CARD_DATA.find(c => c.id === cardId);

    const result = placeCardOnBoard(index, cardInfo, owner);
    await finalizePlacementUI(index, cellElement, result);
}

async function finalizePlacementUI(cellIndex, cellElement, result) {
    const owner = selectedCardElement.dataset.owner;

    selectedCardElement.classList.remove('selected');
    selectedCardElement.classList.add('played');
    selectedCardElement.style.visibility = 'hidden';

    const clonedCard = selectedCardElement.cloneNode(true);
    clonedCard.style.visibility = 'visible';
    clonedCard.style.position = 'absolute';
    clonedCard.style.top = '0';
    clonedCard.style.left = '0';
    clonedCard.classList.remove('played');

    // 属性配置時のステータス補正バッジを描画
    if (boardState[cellIndex] && boardState[cellIndex].elementMod !== undefined && boardState[cellIndex].elementMod !== 0) {
        const modBadge = document.createElement('div');
        modBadge.className = 'element-mod-badge';
        const mod = boardState[cellIndex].elementMod;
        modBadge.textContent = mod > 0 ? `+${mod}` : `${mod}`;
        clonedCard.appendChild(modBadge);
    }

    cellElement.appendChild(clonedCard);
    selectedCardElement = null;
    clearBoardHighlight();

    if (typeof playSE === 'function') playSE('place');

    if (result.rules && result.rules.length > 0) {
        showSpecialRuleEffect(result.rules);
    }

    await processFlippedCards(result.flipped, owner);
    checkAndEndTurn();
}

function showSpecialRuleEffect(rules) {
    const effectContainer = document.createElement('div');
    effectContainer.className = 'special-rule-effect';
    const uniqueRules = [...new Set(rules)];
    effectContainer.textContent = uniqueRules.join(' / ') + '!!';
    document.getElementById('screen-game').appendChild(effectContainer);
    setTimeout(() => effectContainer.remove(), 1500);
}

function clearBoardHighlight() {
    document.querySelectorAll('.board-cell').forEach(cell => cell.classList.remove('highlight'));
}

function highlightAvailableCells() {
    clearBoardHighlight();
    boardState.forEach((state, idx) => {
        if (state === null) {
            document.getElementById(`cell-${idx}`).classList.add('highlight');
        }
    });
}

function updateTurnDisplay() {
    if (currentTurn === 'p1') {
        turnIndicator.textContent = "TURN: PLAYER 1";
        turnIndicator.className = "turn-indicator turn-p1";
    } else {
        turnIndicator.textContent = gameMode === 'pvc' ? "TURN: CPU" : "TURN: PLAYER 2";
        turnIndicator.className = "turn-indicator turn-p2";
    }
}

function updateScoreDisplay() {
    let p1 = 0, p2 = 0;
    boardState.forEach(cell => {
        if (cell !== null) {
            if (cell.owner === 'p1') p1++;
            else if (cell.owner === 'p2') p2++;
        }
    });
    const p1Remaining = 5 - document.querySelectorAll('#hand-player1 .played').length;
    const p2Remaining = 5 - document.querySelectorAll('#hand-player2 .played').length;
    scoreP1.textContent = p1 + p1Remaining;
    scoreP2.textContent = p2 + p2Remaining;
}

window.processFlippedCards = async function (flippedIndices, newOwner) {
    for (const idx of flippedIndices) {
        const cell = document.getElementById(`cell-${idx}`);
        const cardElem = cell.querySelector('.card');
        if (cardElem) {
            // 現在の持ち主が既にnewOwnerならスキップ
            if (cardElem.dataset.owner === newOwner) continue;

            if (typeof playSE === 'function') playSE('flip');
            cardElem.classList.add('flip-anim');
            // アニメーションの完了を待機するためのユーティリティ
            await new Promise(resolve => {
                setTimeout(() => {
                    cardElem.classList.remove('owner-p1', 'owner-p2');
                    cardElem.classList.add(`owner-${newOwner}`);
                    cardElem.dataset.owner = newOwner;
                    setTimeout(() => {
                        cardElem.classList.remove('flip-anim');
                        updateScoreDisplay();
                        resolve();
                    }, 200); // フリップ完了後の短い余韻
                }, 300); // 裏返るタイミング
            });
            // 次のカードへ移る前のわずかなウェイト（連鎖感の演出）
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
};

window.checkAndEndTurn = function () {
    updateScoreDisplay();
    const counts = getHandCounts();
    const result = checkGameOver(counts.p1, counts.p2);
    if (result) {
        if (result.winner === 'draw' && gameConfig.suddenDeath) {
            setTimeout(() => startSuddenDeath(), 1000);
        } else {
            setTimeout(() => showResultScreen(result), 1000);
        }
    } else {
        currentTurn = currentTurn === 'p1' ? 'p2' : 'p1';
        updateTurnDisplay();
        if (gameMode === 'pvc' && currentTurn === 'p2') {
            setTimeout(playCPUTurn, 1000);
        }
    }
};

function getHandCounts() {
    const p1 = 5 - document.querySelectorAll('#hand-player1 .card.played').length;
    const p2 = 5 - document.querySelectorAll('#hand-player2 .card.played').length;
    return { p1, p2 };
}

function startSuddenDeath() {
    const effectContainer = document.createElement('div');
    effectContainer.className = 'special-rule-effect';
    effectContainer.style.color = '#ff3333';
    effectContainer.textContent = 'SUDDEN DEATH!!';
    document.getElementById('screen-game').appendChild(effectContainer);

    setTimeout(() => {
        effectContainer.remove();
        const newP1Hand = [], newP2Hand = [];

        // 盤面のカードを分配
        boardState.forEach(cell => {
            if (cell !== null) {
                const cardInfo = CARD_DATA.find(c => c.id === cell.id);
                if (cell.owner === 'p1') newP1Hand.push(cardInfo);
                else if (cell.owner === 'p2') newP2Hand.push(cardInfo);
            }
        });

        // 手札に残っているカードも分配
        document.querySelectorAll('#hand-player1 .card:not(.played)').forEach(el => {
            newP1Hand.push(CARD_DATA.find(c => c.id === el.dataset.id));
        });
        document.querySelectorAll('#hand-player2 .card:not(.played)').forEach(el => {
            newP2Hand.push(CARD_DATA.find(c => c.id === el.dataset.id));
        });

        p1Hand = newP1Hand;
        p2Hand = newP2Hand;
        boardState = new Array(9).fill(null);
        currentTurn = Math.random() < 0.5 ? 'p1' : 'p2';
        activeSpecialRules = [];
        selectedCardElement = null;
        setupUI();
        if (gameMode === 'pvc' && currentTurn === 'p2') {
            setTimeout(playCPUTurn, 1000);
        }
    }, 2000);
}

function showResultScreen(result) {
    screenResult.classList.remove('hidden', 'win-effect', 'lose-effect');
    screenResult.classList.add('active');

    // 詳細表示用クラスの初期化
    const resultBox = document.querySelector('.result-box');
    resultBox.classList.remove('show-details');

    // 既存の動的メッセージ（トレード結果など）をクリア
    const oldMsg = resultBox.querySelector('.trade-message-area');
    if (oldMsg) oldMsg.remove();
    const oldStoryMsg = resultBox.querySelector('.story-unlock-message');
    if (oldStoryMsg) oldStoryMsg.remove();

    // アニメーションを再トリガーするために一時的に非表示→表示するテクニック
    const titleEl = document.getElementById('result-title');
    titleEl.style.animation = 'none';
    titleEl.offsetHeight; // リフロー強制
    titleEl.style.animation = null;

    document.getElementById('final-score-p1').textContent = result.p1Score;
    document.getElementById('final-score-p2').textContent = result.p2Score;

    if (result.winner === 'p1') {
        if (typeof playSE === 'function') playSE('win');
        titleEl.textContent = 'YOU WIN!';
        titleEl.style.color = 'var(--color-p1)';
        screenResult.classList.add('win-effect');
        updateStats({ result: 'win', myScore: result.p1Score, enemyScore: result.p2Score, opponentLevel: parseInt(document.getElementById('npc-level-input').value) || 5, mode: pendingGameMode });

        // ストーリーモードで勝利かつ未討伐のNPCだった場合の進行処理
        if (pendingGameMode === 'story' && currentStoryNpcId) {
            if (!defeatedNPCs.includes(currentStoryNpcId)) {
                defeatedNPCs.push(currentStoryNpcId);
                saveStoryProgress();

                setTimeout(() => {
                    const msg = document.createElement('div');
                    msg.className = 'story-unlock-message';
                    msg.innerHTML = '【STORY CLEAR】新たなNPCが解放されました！';
                    msg.style.color = '#FFD700';
                    msg.style.marginTop = '15px';
                    msg.style.fontSize = '1.2rem';
                    msg.style.fontWeight = 'bold';
                    resultBox.appendChild(msg);
                }, 2500);
            }
        }
    }
    else if (result.winner === 'p2') {
        if (typeof playSE === 'function') playSE('lose');
        titleEl.textContent = 'YOU LOSE...';
        titleEl.style.color = 'var(--color-p2)';
        screenResult.classList.add('lose-effect');
        updateStats({ result: 'loss', myScore: result.p1Score, enemyScore: result.p2Score, opponentLevel: parseInt(document.getElementById('npc-level-input').value) || 5, mode: pendingGameMode });
    } else {
        if (typeof playSE === 'function') playSE('draw');
        titleEl.textContent = 'DRAW';
        titleEl.style.color = 'white';
        updateStats({ result: 'draw', myScore: result.p1Score, enemyScore: result.p2Score, opponentLevel: parseInt(document.getElementById('npc-level-input').value) || 5, mode: pendingGameMode });
    }

    // FF8原作風の二段階演出：文字をバーンと出した後、2秒後にスコアやトレードをフェードイン
    setTimeout(() => {
        resultBox.classList.add('show-details');
        handlePostGameTrade(result);
    }, 2000);
}

function handlePostGameTrade(gameResult) {
    if (gameConfig.matchType === 'free') {
        showTradeMessage('FREE MODE: NO REWARD / NO PENALTY');
        return;
    }

    if (!gameResult || gameResult.winner === 'draw') {
        return;
    }

    if (gameResult.winner === 'p1') {
        processVictoryReward(gameResult);
    } else if (gameResult.winner === 'p2') {
        handleDefeatPenalty(gameResult);
    }
}

function processVictoryReward(gameResult) {
    const tradeRule = gameConfig.tradeRule || 'one';
    const scoreDiff = Math.abs(gameResult.p1Score - gameResult.p2Score);
    const enemyCards = p2Hand;

    if (tradeRule === 'one') {
        showTradeSelectionScreen(enemyCards, 1);
    } else if (tradeRule === 'diff') {
        const count = Math.min(Math.max(scoreDiff, 1), 5);
        showTradeSelectionScreen(enemyCards, count);
    } else if (tradeRule === 'all') {
        enemyCards.forEach(card => addCardToInventory(card.id));
        showTradeMessage(`ALL GET!! (${enemyCards.length} cards)`);
    } else if (tradeRule === 'direct') {
        const rewardedCards = enemyCards.filter(card => {
            return boardState.some(cell => cell && cell.id === card.id && cell.owner === 'p1');
        });
        rewardedCards.forEach(card => addCardToInventory(card.id));
        showTradeMessage(`DIRECT GET!! (${rewardedCards.length} cards)`);
    }
}

function handleDefeatPenalty(gameResult) {
    // 現在の総所持枚数を計算
    const totalCards = Object.values(playerInventory).reduce((sum, count) => sum + count, 0);
    const maxLosingCards = Math.max(0, totalCards - 5);

    if (maxLosingCards <= 0) {
        showTradeMessage('LOSING PROTECTED: Minimum 5 cards retained.');
        return;
    }

    const tradeRule = gameConfig.tradeRule || 'one';
    const scoreDiff = Math.abs(gameResult.p1Score - gameResult.p2Score);
    // 初期手札全体のコピーから喪失候補を選ぶ
    let losingPool = [...p1Hand];
    let lostCards = [];

    // Fisher-Yates シャッフルによるランダム抽出ヘルパー
    const getRandomCards = (pool, count) => {
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    if (tradeRule === 'one') {
        lostCards = getRandomCards(losingPool, 1);
    } else if (tradeRule === 'diff') {
        const count = Math.min(Math.max(scoreDiff, 1), 5);
        lostCards = getRandomCards(losingPool, count);
    } else if (tradeRule === 'all') {
        lostCards = [...losingPool];
    } else if (tradeRule === 'direct') {
        // Direct: 最終的に相手(p2)の陣地になった自分の初期手札
        lostCards = losingPool.filter(card => {
            return boardState.some(cell => cell && cell.id === card.id && cell.owner === 'p2');
        });
    }

    // 上限 (maxLosingCards) を超える場合はさらにランダムに絞り込む
    if (lostCards.length > maxLosingCards) {
        lostCards = getRandomCards(lostCards, maxLosingCards);
    }

    if (lostCards.length > 0) {
        // インベントリから削除
        lostCards.forEach(card => removeCardFromInventory(card.id));
        showTradeMessage(`PENALTY: LOST ${lostCards.length} CARD(S)`);
    } else {
        showTradeMessage('LUCKY: NO CARDS LOST');
    }
}

function showTradeMessage(text) {
    const resultBox = document.querySelector('.result-box');
    let msgArea = resultBox.querySelector('.trade-message-area');

    if (!msgArea) {
        msgArea = document.createElement('div');
        msgArea.className = 'trade-message-area';
        msgArea.style.fontSize = '1.2rem';
        msgArea.style.marginTop = '20px';
        msgArea.style.color = '#FFD700';
        resultBox.appendChild(msgArea);
    }

    msgArea.innerHTML = `<strong>${text}</strong>`;
}

function showCollectionScreen() {
    screenTitle.classList.remove('active');
    screenTitle.classList.add('hidden');
    screenCollection.classList.remove('hidden');
    screenCollection.classList.add('active');
    renderCollection();
}

function renderCollection() {
    // 戦績の表示更新
    document.getElementById('stats-wins').textContent = playerStats.wins;
    document.getElementById('stats-losses').textContent = playerStats.losses;
    document.getElementById('stats-draws').textContent = playerStats.draws;
    document.getElementById('stats-max-diff').textContent = playerStats.maxScoreDiff > 0 ? '+' + playerStats.maxScoreDiff : '0';

    // 履歴の表示
    const historyList = document.getElementById('recent-matches-list');
    historyList.innerHTML = '';
    if (playerStats.recentMatches && playerStats.recentMatches.length > 0) {
        playerStats.recentMatches.forEach(match => {
            const li = document.createElement('li');
            li.className = `history-item result-${match.result}`;
            const resultText = match.result === 'win' ? 'WIN' : (match.result === 'loss' ? 'LOSS' : 'DRAW');
            li.innerHTML = `
                <span class="history-date">${match.date}</span>
                <span class="history-opponent">${match.opponent}</span>
                <span class="history-score">${match.myScore} - ${match.enemyScore}</span>
                <span class="history-result">${resultText}</span>
            `;
            historyList.appendChild(li);
        });
    } else {
        historyList.innerHTML = '<li class="history-empty">NO RECORDS</li>';
    }

    // レベル別勝敗の表示
    const levelGrid = document.getElementById('level-stats-grid');
    levelGrid.innerHTML = '';
    if (playerStats.levelStats) {
        for (let i = 1; i <= 10; i++) {
            const stats = playerStats.levelStats[i] || { wins: 0, losses: 0, draws: 0 };
            const div = document.createElement('div');
            div.className = 'level-stat-box';
            div.innerHTML = `
                <div class="lv-badge">LV${i}</div>
                <div class="lv-record">W:${stats.wins} L:${stats.losses} D:${stats.draws}</div>
            `;
            levelGrid.appendChild(div);
        }
    }

    const collectionGrid = document.getElementById('collection-grid');
    collectionGrid.innerHTML = '';
    let totalCount = 0;

    // レベル（10〜1）の降順でグループ化
    for (let level = 10; level >= 1; level--) {
        const levelCards = CARD_DATA.filter(c => c.level === level);
        if (levelCards.length === 0) continue;

        // レベルの見出しを作成
        const levelHeader = document.createElement('div');
        levelHeader.className = 'collection-level-header';
        levelHeader.textContent = `LEVEL ${level}`;
        collectionGrid.appendChild(levelHeader);

        // そのレベルのカード用グリッドを作成
        const subGrid = document.createElement('div');
        subGrid.className = 'collection-sub-grid';

        levelCards.forEach(card => {
            const count = playerInventory[card.id] || 0;
            totalCount += count;
            const cardWrapper = document.createElement('div');
            cardWrapper.className = 'collection-item';

            const cardEl = createCardElement(card);
            if (count === 0) cardEl.style.filter = 'grayscale(1) opacity(0.5)';

            const countLabel = document.createElement('div');
            countLabel.className = 'collection-count';
            countLabel.textContent = 'x ' + count;

            cardWrapper.appendChild(cardEl);
            cardWrapper.appendChild(countLabel);
            subGrid.appendChild(cardWrapper);
        });
        collectionGrid.appendChild(subGrid);
    }
    document.getElementById('inventory-count').textContent = 'TOTAL: ' + totalCount;
}

let selectedTradeCardIds = [];
let maxSelectableCards = 0;
let enemyTeamCards = [];

function showTradeSelectionScreen(cards, maxCount) {
    maxSelectableCards = maxCount;
    enemyTeamCards = cards;
    selectedTradeCardIds = [];
    screenResult.classList.add('hidden');
    screenTrade.classList.remove('hidden');
    screenTrade.classList.add('active');
    document.getElementById('trade-info').textContent = `Pick ${maxCount} card(s)`;
    renderTradeGrid();
}

function renderTradeGrid() {
    const grid = document.getElementById('trade-cards-grid');
    grid.innerHTML = '';
    document.getElementById('btn-confirm-trade').style.display = 'none';

    enemyTeamCards.forEach(card => {
        const cardWrapper = document.createElement('div');
        cardWrapper.className = 'trade-card-item';

        // レベル表示を追加
        const levelLabel = document.createElement('div');
        levelLabel.className = 'trade-card-level';
        levelLabel.textContent = `LV ${card.level}`;
        cardWrapper.appendChild(levelLabel);

        const cardEl = createCardElement(card);
        cardWrapper.appendChild(cardEl);
        cardWrapper.addEventListener('click', () => toggleTradeSelection(card, cardWrapper));
        grid.appendChild(cardWrapper);
    });
}

function toggleTradeSelection(card, element) {
    const index = selectedTradeCardIds.indexOf(card.id);
    if (index > -1) {
        selectedTradeCardIds.splice(index, 1);
        element.classList.remove('selected');
    } else {
        if (selectedTradeCardIds.length < maxSelectableCards) {
            selectedTradeCardIds.push(card.id);
            element.classList.add('selected');
        }
    }
    document.getElementById('btn-confirm-trade').style.display =
        selectedTradeCardIds.length === maxSelectableCards ? 'block' : 'none';
}

document.getElementById('btn-confirm-trade').addEventListener('click', () => {
    selectedTradeCardIds.forEach(id => addCardToInventory(id));
    const msg = document.createElement('div');
    msg.className = 'special-rule-effect';
    msg.textContent = 'TRADE COMPLETED!';
    document.getElementById('screen-trade').appendChild(msg);
    setTimeout(() => {
        msg.remove();
        if (pendingGameMode === 'story') {
            showStoryScreen();
        } else if (pendingGameMode === 'pvp' || pendingGameMode === 'pvc') {
            showFreeBattleScreen();
        } else {
            showTitleScreen();
        }
    }, 2000);
});

/* --- Rule Settings Save/Load --- */
function saveRuleSettings() {
    const rules = {
        open: document.getElementById('rule-open').checked,
        same: document.getElementById('rule-same').checked,
        sameWall: document.getElementById('rule-same-wall').checked,
        plus: document.getElementById('rule-plus').checked,
        suddenDeath: document.getElementById('rule-sudden-death').checked,
        randomHand: document.getElementById('rule-random-hand').checked,
        elemental: document.getElementById('rule-elemental').checked,
        tradeRule: document.getElementById('select-trade-rule').value,
        matchMode: document.querySelector('input[name="match-mode"]:checked')?.value || 'free',
        npcLevel: document.getElementById('npc-level-input').value
    };
    localStorage.setItem('triple_triad_rules', JSON.stringify(rules));
}

function loadRuleSettings() {
    const saved = localStorage.getItem('triple_triad_rules');
    if (saved) {
        try {
            const rules = JSON.parse(saved);
            if (rules.open !== undefined) document.getElementById('rule-open').checked = rules.open;
            if (rules.same !== undefined) document.getElementById('rule-same').checked = rules.same;
            if (rules.sameWall !== undefined) document.getElementById('rule-same-wall').checked = rules.sameWall;
            if (rules.plus !== undefined) document.getElementById('rule-plus').checked = rules.plus;
            if (rules.suddenDeath !== undefined) document.getElementById('rule-sudden-death').checked = rules.suddenDeath;
            if (rules.randomHand !== undefined) document.getElementById('rule-random-hand').checked = rules.randomHand;
            if (rules.elemental !== undefined) document.getElementById('rule-elemental').checked = rules.elemental;
            if (rules.tradeRule !== undefined) document.getElementById('select-trade-rule').value = rules.tradeRule;
            if (rules.matchMode !== undefined) {
                const radio = document.querySelector(`input[name="match-mode"][value="${rules.matchMode}"]`);
                if (radio) radio.checked = true;
            }
            if (rules.npcLevel !== undefined) {
                document.getElementById('npc-level-input').value = rules.npcLevel;
            }
        } catch (e) {
            console.error('Failed to parse rule settings', e);
        }
    }
}

// Attach listeners
['rule-open', 'rule-same', 'rule-same-wall', 'rule-plus', 'rule-sudden-death', 'rule-random-hand', 'rule-elemental'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', saveRuleSettings);
});
const tradeSelect = document.getElementById('select-trade-rule');
if (tradeSelect) tradeSelect.addEventListener('change', saveRuleSettings);

// マッチタイプとNPCレベルのリスナー追加
document.querySelectorAll('input[name="match-mode"]').forEach(radio => {
    radio.addEventListener('change', saveRuleSettings);
});
const npcLevelInput = document.getElementById('npc-level-input');
if (npcLevelInput) npcLevelInput.addEventListener('change', saveRuleSettings);

// Load at startup
loadRuleSettings();

/* --- Audio UI & Initialization --- */
document.addEventListener('DOMContentLoaded', () => {
    const bgmSlider = document.getElementById('bgm-volume-input');
    const seSlider = document.getElementById('se-volume-input');

    if (bgmSlider) {
        // Retrieve initial value if saved
        const savedBgmVol = localStorage.getItem('bgmVolume');
        if (savedBgmVol !== null) bgmSlider.value = savedBgmVol;
        bgmSlider.addEventListener('input', (e) => setBGMVolume(parseFloat(e.target.value)));
    }

    if (seSlider) {
        const savedSeVol = localStorage.getItem('seVolume');
        if (savedSeVol !== null) seSlider.value = savedSeVol;
        seSlider.addEventListener('input', (e) => setSEVolume(parseFloat(e.target.value)));
    }

    // Initialize audio context on first user interaction anywhere on the document
    const initAudioOnInteraction = () => {
        if (typeof initAudio === 'function') {
            initAudio();
            playBGM(); // Try playing BGM if any
        }
        document.removeEventListener('click', initAudioOnInteraction);
    };
    document.addEventListener('click', initAudioOnInteraction);
});

// A helper function to attach click sounds to all primary/secondary buttons globally
document.addEventListener('click', (e) => {
    // ボタンらしい要素がクリックされた場合に 'click' 音を鳴らす
    if (e.target.closest('button') || e.target.closest('.card') || e.target.closest('.trade-card-item')) {
        if (typeof playSE === 'function') playSE('click');
    }
});
