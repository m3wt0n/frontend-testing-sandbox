[← README に戻る](../README.md)　｜　次へ：[Step 2 →](./step2-hands-on.md)

---

# ステップ1：フロントエンドテストのトレンド（2024〜2025）

## 概要

フロントエンドテストは「何を・どの粒度で・どんな思想でテストするか」の理解が重要。
ツールの選定より先に、**テストの目的と思想**を押さえておくことがスタート地点。

---

## テストの全体像（テストピラミッド）

```
        ┌──────────────────┐
        │   E2E テスト      │  ← 少量・低速・高信頼性
        │ Playwright / Cypress│
        ├──────────────────┤
        │  統合 / CT テスト  │  ← 中量・中速
        │ Testing Library   │
        │ Storybook        │
        ├──────────────────┤
        │  ユニットテスト    │  ← 多量・高速・低コスト
        │ Vitest / Jest     │
        └──────────────────┘
```

下に行くほど「高速・多量・低コスト」、上に行くほど「信頼性が高いが遅い・コストが高い」。
**ピラミッドの形を崩さないこと**（E2E に頼りすぎると CI が遅くなる）が重要。

---

## 主要ツールの整理

### ユニットテスト / テストランナー

| ツール | 特徴 | 採用推奨度 |
|---|---|---|
| **Vitest** | Vite ネイティブ・ESM 対応・高速・Jest 互換 API | ★★★ 新規プロジェクトはこれ |
| **Jest** | デファクトスタンダード・安定・エコシステムが豊富 | ★★☆ 既存プロジェクトの移行コスト注意 |
| **Node test runner** | Node.js 組み込み・依存ゼロ | ★☆☆ ライブラリ開発向け |

#### Vitest が急成長した理由

- Vite ベースプロジェクトで設定ほぼゼロ
- ESM ネイティブ（Jest は transform が必要）
- HMR と同じ変換パイプラインを共有 → 設定の二重管理が不要
- `--ui` オプションでブラウザ上にテスト結果を表示できる

---

### 統合テスト / コンポーネントテスト（CT）

| ツール | 特徴 |
|---|---|
| **@testing-library/react** | ユーザー視点テスト・`getByRole` 中心 |
| **Storybook + play()** | UI カタログ兼テスト・インタラクションテストが可能 |
| **Playwright Component Testing** | 実ブラウザ上で CT を実行・Vitest と棲み分け |

#### Testing Library の思想（重要）

> **「実装ではなく、ユーザーの振る舞いをテストする」**

```ts
// NG：実装に依存（クラス名が変わると壊れる）
container.querySelector('.btn-primary')

// OK：ユーザーが見るものを基準にする
screen.getByRole('button', { name: '送信' })
screen.getByLabelText('メールアドレス')
screen.getByText('登録が完了しました')
```

クエリの優先順位（公式推奨）：
1. `getByRole` — アクセシブルな名前で取得（最優先）
2. `getByLabelText` — フォーム要素
3. `getByPlaceholderText`
4. `getByText`
5. `getByTestId` — 最終手段（なるべく使わない）

---

### E2E テスト

| ツール | 特徴 | 採用推奨度 |
|---|---|---|
| **Playwright** | Microsoft 製・全ブラウザ対応・高速・CI 安定 | ★★★ 現在の主流 |
| **Cypress** | 成熟・安定・DX が高い・Component Testing も可 | ★★☆ 既存資産があれば継続 |
| **Puppeteer** | Chrome 専用・低レベル API | ★☆☆ 特殊用途向け |

#### Playwright が主流になった背景

- Firefox・Chrome・Safari（WebKit）をすべてサポート
- `page.waitForSelector` 等の自動 wait 機構が充実
- CI 環境での安定性が Cypress より高い評判
- TypeScript ファースト
- Trace Viewer でデバッグが容易

---

### API モック

| ツール | 特徴 |
|---|---|
| **MSW（Mock Service Worker）** | ネットワーク層をインターセプト・ブラウザ/Node 両対応 |
| `vi.mock` / `jest.mock` | モジュール単位のモック |

MSW を使うメリット：本物の fetch を使うため、テストとプロダクションコードの乖離が少ない。

---

## 2024〜2025 の思想トレンド

### 1. "Testing Library" 思想の業界標準化

`getByRole` + `userEvent` の組み合わせが事実上の標準になった。
`fireEvent` より `userEvent` が推奨される理由：実際のブラウザ操作（hover → focus → input → click）を再現するため、ユーザーの体験に近いテストになる。

### 2. コンポーネントテスト（CT）の重視

ユニットと E2E の間の「グレーゾーン」を埋める層として注目。
Storybook の `play()` 関数や Playwright CT がこれを担う。

```ts
// Storybook の play() 例
export const Submitted: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText('Email'), 'test@example.com')
    await userEvent.click(canvas.getByRole('button', { name: '送信' }))
    await expect(canvas.getByText('送信完了')).toBeInTheDocument()
  },
}
```

### 3. テストカバレッジより「テストの質」

100% カバレッジより、**ユーザーにとって重要なフローがテストされているか**が重視される。
`v8` / `istanbul` でカバレッジを計測しつつ、数値目標より「変更への自信」を指標にする考え方。

### 4. AI によるテスト設計支援（最新）

- Claude / GPT：テストケースの網羅性チェック、エッジケース発見
- GitHub Copilot：テストコードの自動補完・生成
- Qodo（旧 CodiumAI）：コミット単位でテストを提案

詳細はステップ3で扱う。

---

## 技術スタック選定の目安（2025年時点）

```
新規 React プロジェクト
├── テストランナー    → Vitest
├── コンポーネントテスト → @testing-library/react + userEvent
├── API モック       → MSW v2
├── E2E              → Playwright
└── UI カタログ      → Storybook（任意）

既存 CRA / Jest プロジェクト
├── 急がなければ Vitest 移行を検討
└── Testing Library の思想に合わせてテストをリファクタ

Vue / Nuxt プロジェクト
├── テストランナー    → Vitest
└── コンポーネントテスト → @testing-library/vue
```

---

## 参考リンク

- [Vitest 公式](https://vitest.dev/)
- [Testing Library 公式](https://testing-library.com/)
- [Playwright 公式](https://playwright.dev/)
- [MSW 公式](https://mswjs.io/)
- [Which query should I use? — Testing Library](https://testing-library.com/docs/queries/about#priority)
- [State of JS 2024 — Testing](https://2024.stateofjs.com/en-US/libraries/testing/)

---
