---
description: 変更内容をGitHubにアップロード（プッシュ）します
---

このワークフローは、現在のプロジェクトの変更をGitHubに保存（コミット＆プッシュ）するための手順をガイドします。

1. **バージョン情報を更新します**
> [!IMPORTANT]
> アップロード前に、タイトル画面に表示されるバージョン情報を更新しましょう。
> `index.html` の以下の行（現在は `v1.4.1`）を新しいバージョン番号に書き換えてください。

[index.html:L406](file:///c:/Users/Owner/Documents/myproject/Triple%20Triad/index.html#L406)

2. **現在の状態を確認します**
// turbo
```powershell
git status
```

3. **すべての変更をステージング（準備）します**
// turbo
```powershell
git add .
```

4. **変更内容にコメントを付けて保存（コミット）します**
> [!NOTE]
> コミットメッセージを入力してください（例: "新機能の追加", "バグ修正" など）。メッセージは二重引用符 `"` で囲んでください。
> 下記のコマンドの `"変更内容の要約"` の部分を書き換えて実行してください。

```powershell
git commit -m "変更内容の要約"
```

5. **GitHubにアップロード（プッシュ）します**
// turbo
```powershell
git push origin main
```

完了しました！GitHub上で変更が反映されているか確認してください。
