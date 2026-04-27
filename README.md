# マンション名ジェネレーター Pro

投資用一棟アパート・マンション向けに、物件の世界観と居住者像から由来のあるネーミング案を生成する Next.js アプリです。

## 技術スタック

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- localStorage（保存機能）

## 実装済み機能

- 基本入力フォーム
  - エリア
  - 物件タイプ（アパート / マンション / その他）
  - 世界観コンセプト
  - 居住者イメージ
  - 自由キーワード
- 入力バリデーション
- API 経由のネーミング生成
- 10件前後の出力カード表示
  - 物件名
  - 読み（任意）
  - 由来・意味
  - 印象・トーン
  - 居住者イメージとの整合コメント
  - ひとこと評価
  - Google検索リンク
  - 商標確認リンク
- 各案ごとの保存機能（localStorage）
- 保存一覧ページ
  - 保存時点の入力条件
  - 選択案の詳細
  - 同時に生成した全候補の確認

## AI 利用について

`.env.local` に以下を設定すると AI 生成を利用できます。未設定時はローカルのフォールバック生成ロジックで動作します。

```bash
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4.1-mini
```

## 開発

```bash
npm install
npm run dev
```

## 本番ビルド

```bash
npm run build
npm run start
```
