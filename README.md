# 🧠 兄貴Bot - AnikiBot

GPT-4をベースにした、関西弁でおしゃべりする多機能Discord Botです。  
質問、雑談、検索、モード変更など幅広く対応！Discloudでの24時間稼働にも対応しています。

---

## ✨ 主な機能

| コマンド |説明|
|------------|------
|`!ask`      | ChatGPTに質問できます（関西弁で返答） |
| `!chat`    | 雑談モード。複数ラウンドの会話に対応 |
| `!search`  | インターネットから最新情報を取得して返答（SerpAPI使用） |
| `!model`   | 利用するAIモデルを変更できます（通常／大卒） |
| `!reset`   | 会話履歴をリセットします |
| `!help`    | 利用可能なコマンド一覧を表示します |

---

## 🚀 導入方法（Discloudで稼働）

### 1. `.env` ファイルを作成して以下を記述：

```
DISCORD_TOKEN=あなたのDiscord Botトークン
OPENAI_API_KEY=あなたのOpenAIキー
SERPAPI_KEY=（任意）検索用APIキー
```

### 2. ファイル構成（例）

```
📁 anikibot
├── index.js
├── package.json
├── .env
├── discloud.config
└── その他ファイル
```

### 3. アップロード（Discloud CLI）

```
discloud app upload ./anikibot.zip
```

---

## 🛠 使用している技術

- Node.js (v18+)
- Discord.js v14
- OpenAI API（GPT-4o）
- SerpAPI（検索用）
- Discloud CLI（ホスティング）

---

## 🧪 今後追加予定の機能

- キャラ切替（お嬢様、ツンデレなど）
- なぞなぞ・クイズモード
- 要約＆翻訳モード
- 音声読み上げ（VC対応／外部Bot連携）

---

## 📄 ライセンス

MIT License

---

## ⚠️ 利用・公開に関する注意事項

- 本Botは [OpenAI](https://openai.com/policies/usage-policies) のAPIを使用しています。  
  利用者はOpenAIの利用規約を遵守してください。
- `!search` コマンドは [SerpAPI](https://serpapi.com/legal) を使用しています（無料枠には利用回数制限あり）。
- 環境変数（APIキーなど）は `.env` ファイルで管理し、**絶対にGitHub等に公開しないでください**。
- VOICEVOXなどの音声合成を使用する場合は、公式ライセンスとキャラクターのクレジット表記を遵守してください。  
  → https://voicevox.hiroshiba.jp/

---

## 🙌 Special Thanks

- [OpenAI](https://openai.com/)
- [Discloud](https://discloud.com/)
- [SerpAPI](https://serpapi.com/)
- [VOICEVOX](https://voicevox.hiroshiba.jp/)（実装未定)
- [illustimage](https://illustimage.com/help.php)(アイコン利用)

---

## 🗣️ 作者より
よければ使ってね  

もし気に入ったら、スター ⭐ やフォーク 🔁 よろしくお願いします！   
