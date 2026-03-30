# frontend-testing-sandbox

フロントエンドテストの学習用リポジトリです。
React + Vitest + Testing Library + Storybook + Playwright を使ったテストパターンと、AI を活用したテスト設計の方法を実践的に学べます。

---

## このリポジトリで学べること

| ステップ | 内容 |
|---|---|
| Step 1 | フロントエンドテストのトレンドとツール選定の考え方 |
| Step 2 | Vitest / Testing Library / Storybook / ビジュアルリグレッションの実践 |
| Step 3 | AI（Claude / Copilot）を使ったテスト設計の方法 |

---

## 技術スタック

| 役割 | ツール |
|---|---|
| フレームワーク | React 18 + TypeScript |
| ビルドツール | Vite |
| テストランナー | Vitest |
| コンポーネントテスト | @testing-library/react + userEvent |
| API モック | MSW v2 |
| UI カタログ + インタラクションテスト | Storybook 8 |
| ビジュアルリグレッション | Playwright スクリーンショット / Chromatic |
| E2E テスト | Playwright |
| CI | GitHub Actions |
| コードフォーマット・Lint | Biome |
| Git フック | Lefthook |

---

## セットアップ

### 必要な環境

- Node.js 20 以上
- npm 10 以上

### インストール

```bash
git clone https://github.com/your-name/frontend-testing-sandbox.git
cd frontend-testing-sandbox
npm install
```

`npm install` の完了時に `postinstall` スクリプトが Lefthook の Git フックを自動で登録します。

### Playwright ブラウザのインストール

```bash
npx playwright install
```

---

## コマンド一覧

```bash
# 開発サーバーを起動する
npm run dev

# ユニット・統合テストを実行する（ウォッチモード）
npm run test

# ブラウザ UI でテスト結果を確認する
npm run test:ui

# カバレッジレポートを生成する
npm run test:coverage

# Storybook を起動する
npm run storybook

# Storybook のインタラクションテストを実行する
npm run test:storybook

# E2E テストを実行する
npm run test:e2e

# ビジュアルリグレッションテストを実行する
npm run test:visual

# ビジュアルリグレッションのスナップショットを更新する
npm run test:visual -- --update-snapshots
```

---

## コード品質

### Biome

フォーマット・Lint を [Biome](https://biomejs.dev/) で一元管理しています。

```bash
# フォーマット + Lint チェック
npx biome check .

# 自動修正
npx biome check --write .
```

### Lefthook（Git フック）

`git commit` のたびに staged ファイルへ Biome が自動で走ります。

```
git commit
    ↓
pre-commit フック起動
    ↓
staged ファイルに biome check --write を実行
  ・修正できるものは自動修正して再ステージ
  ・手動修正が必要なエラーはコミットをブロック
```

フックを手動で再インストールしたい場合：

```bash
npx lefthook install
```

---

## リポジトリ構成

```
frontend-testing-sandbox/
├── .github/
│   └── workflows/
│       └── ci.yml                     # GitHub Actions の設定
├── .storybook/
│   ├── main.ts                        # Storybook の設定
│   └── preview.ts                     # グローバルデコレーター・パラメーター
├── docs/
│   ├── step1-trends.md
│   ├── step2-hands-on.md
│   └── step3-ai-test-design.md
├── e2e/
│   ├── visual/
│   │   └── button.visual.spec.ts      # ビジュアルリグレッション
│   ├── app.spec.ts                    # E2E テスト
│   └── playwright.config.ts
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   ├── Button.stories.tsx
│   │   ├── LoginForm.tsx
│   │   ├── LoginForm.test.tsx
│   │   ├── LoginForm.stories.tsx
│   │   ├── UserCard.tsx
│   │   ├── UserCard.test.tsx
│   │   └── UserCard.stories.tsx
│   ├── hooks/
│   │   ├── useCounter.ts
│   │   └── useCounter.test.ts
│   ├── mocks/
│   │   ├── handlers.ts                # MSW ハンドラー
│   │   └── server.ts                  # Node.js テスト用サーバー
│   └── setupTests.ts                  # jest-dom のセットアップ
├── vitest.config.ts
├── vite.config.ts
└── package.json
```

---

## 学習ドキュメント

各ステップの詳細は `docs/` 以下のMarkdownを参照してください。

- [Step 1：フロントエンドテストのトレンド](./docs/step1-trends.md)
- [Step 2：実践テストパターン（拡充版）](./docs/step2-hands-on.md)
- [Step 3：AI を使ったテスト設計](./docs/step3-ai-test-design.md)

---

## CI の構成

プッシュ・プルリクエスト時に以下が自動で実行されます。

```
unit-test        Vitest によるユニット・統合テスト
storybook-test   Storybook play() のインタラクションテスト
e2e-test         Playwright による E2E テスト
chromatic        ビジュアルリグレッション（差分はPRにコメントされる）
```

Chromatic を使う場合は、リポジトリの `Settings > Secrets` に以下を登録してください。

| キー名 | 値 |
|---|---|
| `CHROMATIC_PROJECT_TOKEN` | Chromatic のプロジェクトトークン |

---

## 各テストの考え方

詳細は Step 2 のドキュメントを参照してください。テストを書く優先順位の目安は以下のとおりです。

1. ビジネスロジック（ユーティリティ・カスタムフック） → Vitest
2. 重要な UI コンポーネントの振る舞い → Testing Library
3. フォーム・インタラクションのシナリオ → Storybook play()
4. デザインの崩れを防ぎたいコンポーネント → ビジュアルリグレッション
5. クリティカルなユーザーフロー（ログイン・購入など） → Playwright E2E

---

## ライセンス

MIT
