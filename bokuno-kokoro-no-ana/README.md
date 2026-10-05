# 赤潮 絵本庫

クリックでページ送りする、個人向けの小さな絵本サイトです。

- 目次から話を選ぶ
- 1ページあたりの文量は短くまとめすぎない
- 合言葉つきURLを知る人だけが開ける（簡易の非公開）

## ファイル

```text
bokuno-kokoro-no-ana/
├── index.html
├── styles.css
├── app.js
├── config.js      … 合言葉・書庫名
├── stories.js     … 作品データ（追加はここ）
├── robots.txt
├── .nojekyll
└── README.md
```

---

## Discord に貼るURL

GitHub Pages 公開後、次の形で共有します。

```text
https://あなたのユーザー名.github.io/リポジトリ名/?k=akashio-7f3c9b2e
```

`akashio-7f3c9b2e` は `config.js` の `accessKey` です。公開前に変更推奨。

合言葉なしで開くと入力画面が出ます。正しい合言葉、または `?k=...` 付きリンクなら目次が見えます。

### 注意（重要）

これは「URLと合言葉を知る人向け」の簡易ロックです。  
GitHub Pages が Public の場合、技術的にはファイル自体は取得可能なので、完全な秘密保管ではありません。  
Discord の個人サーバー向けとしては十分なことが多いです。

より強く隠したい場合の例:

1. リポジトリ名を推測しにくい英数字にする
2. `accessKey` を長くてランダムな文字列にする
3. 必要なら Private リポジトリ + 有料の Pages 設定を検討する

---

## GitHub 公開手順

1. [https://github.com](https://github.com) にログイン
2. **New repository** を作る（Public）
3. 次をアップロードする
   - `index.html`
   - `styles.css`
   - `app.js`
   - `config.js`
   - `stories.js`
   - `robots.txt`
   - `.nojekyll`
4. **Settings → Pages**
5. Source: **Deploy from a branch**
6. Branch: `main`（または `master`）の `/ (root)` を Save
7. 数分後にURLが出る
8. そのURLの末尾に `?k=あなたの合言葉` を付けて Discord へ

---

## 新しい話を追加する

`stories.js` を開き、`STORIES` 配列に1件足します。

```js
{
  id: "second-story",
  title: "タイトル",
  author: "赤潮",
  summary: "一行あらすじ",
  pages: [
    { kind: "cover", kicker: "第二話", title: "タイトル", lines: ["作者　赤潮"] },
    { lines: ["本文……", "本文……"] },
    { kind: "end", title: "おわり", lines: ["タイトル", "作者　赤潮"], hint: "目次へ戻る" },
  ],
}
```

保存して GitHub 上で Commit すれば反映されます。

---

## 合言葉の変更

`config.js` のここを書き換えます。

```js
accessKey: "akashio-7f3c9b2e",
```

変更後は、Discord に貼るURLの `?k=` も同じ値に更新してください。
