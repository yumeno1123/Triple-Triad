# NPCレベル選択機能の実装計画

## 1. 目的
NPC（CPU）に強さの概念（レベル1〜10）を導入し、プレイヤーが対戦相手のレベルを選べるようにします。NPCの手札構成をレベルに連動させることで、段階的な難易度を楽しめるようにします。

## 2. 実装内容

### [index.html](file:///C:/Users/Owner/Documents/myproject/Triple%20Triad/index.html) の修正
- マッチタイプ設定の付近に「NPCレベル」の選択セクションを追加します。
- スライダーまたはボタン形式（1〜10）で選択可能にします。
- この設定は「CPU戦」を選択している時のみ有効（または表示）されるように制御します。

### [style.css](file:///C:/Users/Owner/Documents/myproject/Triple%20Triad/style.css) の修正
- レベル選択UIがプレミアムな外観になるようスタイリングします。
- 選択中のレベルを視覚的に強調します。

### [cards.js](file:///C:/Users/Owner/Documents/myproject/Triple%20Triad/cards.js) の修正
- 新しい関数 `drawNPCCards(level, count = 5)` を追加します。
- ロジック: `CARD_DATA` から `level - 1` 以上 `level + 1` 以下のカードを抽出し、そこからランダムに5枚選びます。
- ※レベル1の時は1〜2、レベル10の時は9〜10となります。

### [game.js](file:///C:/Users/Owner/Documents/myproject/Triple%20Triad/game.js) の修正
- `initGame(mode, rules, playerHand, npcLevel)` のように、第4引数でNPCレベルを受け取るように拡張します。
- `p2Hand` を `drawNPCCards(npcLevel)` で初期化します。

### [main.js](file:///C:/Users/Owner/Documents/myproject/Triple%20Triad/main.js) の修正
- `finalizeStartGame` にて、画面から選択されているNPCレベルを取得し、`initGame` へ渡します。

## 3. 検証プラン
- [ ] タイトル画面でNPCレベルが1〜10まで選択できること。
- [ ] レベル1を選んだ時、NPCの手札がレベル1〜2のカードのみで構成されること。
- [ ] レベル10を選んだ時、NPCが強力なカード（レベル9〜10）を使用してくること。
- [ ] 自動デプロイ後、公開サイトで正常にレベル選択・反映が行われること。
