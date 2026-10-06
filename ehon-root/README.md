# 赤潮 絵本庫

個人向けの小さな絵本サイトです。

- 目次から話を選ぶ
- 1話は1ページにまとめて表示（ページめくりなし）
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

```text
https://kanokesukoppu.github.io/ehon/bokuno-kokoro-no-ana/?k=yes
```

合言葉は `yes` です。

---

## 新しい話を追加する

`stories.js` の `STORIES` に1件足します。

```js
{
  id: "second-story",
  number: "第二話",
  title: "タイトル",
  author: "赤潮",
  summary: "一行あらすじ",
  paragraphs: [
    "本文……",
    { text: "「セリフ」", quote: true },
    "本文……",
  ],
}
```

---

## 合言葉の変更

`config.js` と `index.html` の両方で:

```js
accessKey: "yes",
```

Discord に貼る `?k=` も同じ値にしてください。
