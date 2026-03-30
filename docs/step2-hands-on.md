[← Step 1](./step1-trends.md)　｜　[README](../README.md)　｜　次へ：[Step 3 →](./step3-ai-test-design.md)

---

# ステップ2（拡充版）：手を動かす — React + Vitest + Storybook + ビジュアルリグレッション + CI

## 技術スタック

| 役割 | ツール |
|---|---|
| テストランナー | Vitest |
| コンポーネントテスト | @testing-library/react + userEvent |
| API モック | MSW v2 |
| UI カタログ + インタラクションテスト | Storybook 8 + @storybook/test |
| ビジュアルリグレッション（ローカル） | Playwright スクリーンショット比較 |
| ビジュアルリグレッション（クラウド） | Chromatic |
| E2E | Playwright |
| CI | GitHub Actions |
| 言語 | TypeScript |

---

## リポジトリ構成

```
frontend-testing-sandbox/
├── .github/
│   └── workflows/
│       └── ci.yml                     ← GitHub Actions の設定
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   ├── Button.stories.tsx         ← Storybook のストーリー
│   │   ├── UserCard.tsx
│   │   ├── UserCard.test.tsx
│   │   └── UserCard.stories.tsx
│   ├── hooks/
│   │   ├── useCounter.ts
│   │   └── useCounter.test.ts
│   └── mocks/
│       ├── handlers.ts
│       └── server.ts
├── e2e/
│   ├── app.spec.ts
│   ├── visual/
│   │   └── button.visual.spec.ts      ← Playwright ビジュアルリグレッション
│   └── playwright.config.ts
├── .storybook/
│   ├── main.ts
│   └── preview.ts
├── vitest.config.ts
└── package.json
```

---

## セットアップ

### インストール

```bash
# プロジェクト作成
npm create vite@latest frontend-testing-sandbox -- --template react-ts
cd frontend-testing-sandbox

# Vitest + Testing Library
npm install -D vitest @vitest/ui jsdom
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom

# MSW
npm install -D msw

# Storybook（既存プロジェクトへの追加）
npx storybook@latest init

# Storybook テスト関連
npm install -D @storybook/test @storybook/addon-interactions @storybook/test-runner

# Playwright（E2E + ビジュアルリグレッション）
npm install -D @playwright/test
npx playwright install

# Chromatic（ビジュアルリグレッション クラウド版）
npm install -D chromatic
```

### package.json のスクリプト

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:storybook": "test-storybook",
    "test:e2e": "playwright test",
    "test:visual": "playwright test e2e/visual",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "chromatic": "chromatic --project-token=$CHROMATIC_PROJECT_TOKEN"
  }
}
```

---

## Storybook：UIカタログからインタラクションテストへ

### 基本のストーリー（UIカタログとして）

まず従来どおりのストーリーを書く。

```tsx
// src/components/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],           // 自動でドキュメントページを生成する
}

export default meta
type Story = StoryObj<typeof Button>

export const 通常: Story = {
  args: {
    children: '送信',
    variant: 'primary',
  },
}

export const 無効化: Story = {
  args: {
    children: '送信',
    disabled: true,
  },
}

export const 読み込み中: Story = {
  args: {
    children: '送信',
    loading: true,
  },
}
```

### `play()` でインタラクションテストを追加する

`play()` 関数を使うと、ストーリーにユーザー操作のシナリオを書ける。
Storybook 上でアニメーション付きで再生でき、`test-runner` でヘッドレスにも実行できる。

```tsx
// src/components/LoginForm.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { expect, fn, userEvent, within } from '@storybook/test'
import { LoginForm } from './LoginForm'

const meta: Meta<typeof LoginForm> = {
  title: 'Components/LoginForm',
  component: LoginForm,
}

export default meta
type Story = StoryObj<typeof LoginForm>

// 正常系：入力して送信できる
export const 送信成功: Story = {
  args: {
    onSubmit: fn(),              // fn() でスパイ関数を作る
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    // メールアドレスを入力する
    await userEvent.type(
      canvas.getByLabelText('メールアドレス'),
      'user@example.com'
    )

    // パスワードを入力する
    await userEvent.type(
      canvas.getByLabelText('パスワード'),
      'password123'
    )

    // 送信ボタンをクリックする
    await userEvent.click(canvas.getByRole('button', { name: 'ログイン' }))

    // onSubmit が正しい値で呼ばれたことを確認する
    await expect(args.onSubmit).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    })
  },
}

// 異常系：バリデーションエラーが表示される
export const バリデーションエラー: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 何も入力せずに送信する
    await userEvent.click(canvas.getByRole('button', { name: 'ログイン' }))

    // エラーメッセージが表示されることを確認する
    await expect(
      canvas.getByText('メールアドレスを入力してください')
    ).toBeInTheDocument()
  },
}
```

### API を含むコンポーネントのストーリー（MSW と組み合わせる）

```tsx
// src/components/UserCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { expect, within, waitFor } from '@storybook/test'
import { http, HttpResponse } from 'msw'
import { UserCard } from './UserCard'

const meta: Meta<typeof UserCard> = {
  title: 'Components/UserCard',
  component: UserCard,
  parameters: {
    // Storybook の MSW アドオンでリクエストをモックする
    msw: {
      handlers: [
        http.get('/api/users/:id', () => {
          return HttpResponse.json({
            id: '1',
            name: '山田 太郎',
            email: 'yamada@example.com',
          })
        }),
      ],
    },
  },
}

export default meta
type Story = StoryObj<typeof UserCard>

export const データ取得成功: Story = {
  args: { userId: '1' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 非同期でデータが表示されるのを待つ
    await waitFor(() => {
      expect(canvas.getByText('山田 太郎')).toBeInTheDocument()
    })
  },
}

export const エラー状態: Story = {
  args: { userId: '999' },
  parameters: {
    msw: {
      handlers: [
        http.get('/api/users/:id', () => {
          return HttpResponse.json({ message: 'Not found' }, { status: 404 })
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await waitFor(() => {
      expect(canvas.getByRole('alert')).toBeInTheDocument()
    })
  },
}
```

### Storybook テストランナーで CI 実行する

`@storybook/test-runner` を使うと、すべての `play()` をヘッドレスブラウザで実行できる。

```bash
# Storybook を起動した状態で実行する
npm run storybook &
npx wait-on http://localhost:6006
npm run test:storybook
```

---

## ビジュアルリグレッションテスト

UI の見た目の意図しない変化をキャッチするテスト。
スタイル変更・レイアウト崩れ・フォント変更などを自動で検出できる。

### 方法1：Playwright スクリーンショット比較（ローカル）

コストゼロで始められる。初回実行でスクリーンショットを撮影し、以降の実行で差分を検出する。

```ts
// e2e/visual/button.visual.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Button ビジュアルリグレッション', () => {
  test('通常状態のスクリーンショットが一致する', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=components-button--通常')

    // スクリーンショットを撮影して前回と比較する
    // 初回実行時はスクリーンショットを保存するだけ（テストは通過する）
    await expect(page).toHaveScreenshot('button-default.png')
  })

  test('disabled 状態のスクリーンショットが一致する', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=components-button--無効化')
    await expect(page).toHaveScreenshot('button-disabled.png')
  })

  test('ログインフォーム全体のスクリーンショットが一致する', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=components-loginform--送信成功')

    // play() の実行が終わるまで待つ
    await page.waitForSelector('[data-testid="story-loaded"]')
    await expect(page).toHaveScreenshot('login-form.png', {
      maxDiffPixels: 50,         // 許容する差分ピクセル数（フォントのアンチエイリアスなどに対応）
    })
  })
})
```

```ts
// e2e/playwright.config.ts（ビジュアルリグレッション用の設定を追加）
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:6006',
  },
  // スクリーンショットの保存先
  snapshotDir: './e2e/visual/__snapshots__',
  // OS によるレンダリング差異を避けるため Docker や CI では注意が必要
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'npm run storybook',
    url: 'http://localhost:6006',
    reuseExistingServer: !process.env.CI,
  },
})
```

**スクリーンショットの更新方法：**

```bash
# 意図的な変更のあとはスナップショットを更新する
npx playwright test --update-snapshots
```

**注意点：**
- OS が違うとフォントレンダリングが変わるため、CI と同じ OS（Linux）で実行するのが理想
- Docker を使うか、CI 上でのみスナップショットを更新するルールにするとよい

---

### 方法2：Chromatic（クラウド型ビジュアルリグレッション）

Storybook と連携するクラウドサービス。差分をブラウザ上でレビューでき、チームで承認フローを回せる。

**セットアップ手順：**

1. [chromatic.com](https://www.chromatic.com/) でアカウント作成・プロジェクト登録
2. プロジェクトトークンを取得して GitHub Secrets に登録する（`CHROMATIC_PROJECT_TOKEN`）

```bash
# ローカルで試す場合
CHROMATIC_PROJECT_TOKEN=your_token npm run chromatic
```

**Chromatic の動作フロー：**

```
コードをプッシュ
    ↓
GitHub Actions が Storybook をビルドする
    ↓
Chromatic がストーリーのスクリーンショットを撮影する
    ↓
前回のスナップショットと比較する
    ↓
差分があればプルリクエストに通知する（レビュー待ち）
    ↓
チームメンバーが Chromatic UI で承認 or 拒否する
```

**Playwright との使い分け：**

| 比較項目 | Playwright スクリーンショット | Chromatic |
|---|---|---|
| コスト | 無料 | 無料枠あり（スナップショット数制限） |
| セットアップ | 簡単 | Storybook 必須・アカウント登録が必要 |
| 差分レビュー | ローカルのみ | ブラウザ上でチームレビューできる |
| OS差異 | 注意が必要 | クラウド管理なので一貫している |
| 向いている場面 | 個人・小規模チーム | チーム開発・デザインレビューが重要な場合 |

---

## GitHub Actions による CI 設定

### 全体の CI フロー

```
プッシュ / プルリクエスト
    ↓
┌─────────────────────────────────────────┐
│ unit-test ジョブ                        │
│  Vitest でユニット・統合テストを実行する  │
└─────────────────────────────────────────┘
    ↓（並列実行）
┌─────────────────────────────────────────┐
│ storybook-test ジョブ                   │
│  Storybook をビルドして                 │
│  test-runner で play() を実行する        │
└─────────────────────────────────────────┘
    ↓（並列実行）
┌─────────────────────────────────────────┐
│ e2e-test ジョブ                         │
│  Playwright で E2E テストを実行する      │
└─────────────────────────────────────────┘
    ↓（storybook-test 完了後）
┌─────────────────────────────────────────┐
│ chromatic ジョブ                        │
│  ビジュアルリグレッションをチェックする   │
└─────────────────────────────────────────┘
```

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # ユニット・統合テスト
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: 依存関係をインストールする
        run: npm ci

      - name: Vitest を実行する
        run: npm run test:coverage

      - name: カバレッジレポートをアップロードする
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/

  # Storybook インタラクションテスト
  storybook-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: 依存関係をインストールする
        run: npm ci

      - name: Storybook をビルドする
        run: npm run build-storybook

      - name: Storybook テストを実行する
        run: |
          npx concurrently -k -s first -n "SB,TEST" -c "magenta,blue" \
            "npx http-server storybook-static --port 6006 --silent" \
            "npx wait-on tcp:6006 && npm run test:storybook"

  # E2E テスト
  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: 依存関係をインストールする
        run: npm ci

      - name: Playwright ブラウザをインストールする
        run: npx playwright install --with-deps chromium

      - name: E2E テストを実行する
        run: npm run test:e2e

      - name: テスト結果をアップロードする（失敗時）
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  # Chromatic ビジュアルリグレッション
  chromatic:
    runs-on: ubuntu-latest
    needs: storybook-test         # Storybook テストが通ってから実行する
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0           # Chromatic の差分検出に履歴が必要

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: 依存関係をインストールする
        run: npm ci

      - name: Chromatic を実行する
        uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          exitZeroOnChanges: true  # 差分があっても CI を失敗にしない（レビュー待ちにする）
```

### GitHub Secrets の設定

リポジトリの `Settings > Secrets and variables > Actions` から登録する。

| キー名 | 値 |
|---|---|
| `CHROMATIC_PROJECT_TOKEN` | Chromatic のプロジェクトトークン |

---

## テスト戦略のまとめ

どのテストを何のために書くかを整理しておくと、テストの重複や抜け漏れを防げる。

| テストの種類 | 何をテストするか | ツール | 実行タイミング |
|---|---|---|---|
| ユニットテスト | ロジック・ユーティリティ関数 | Vitest | ローカル開発中・CI |
| コンポーネントテスト | UI の振る舞い・インタラクション | Vitest + Testing Library | ローカル開発中・CI |
| インタラクションテスト | シナリオ単位の UI 操作 | Storybook play() | CI |
| ビジュアルリグレッション | 見た目の意図しない変化 | Playwright / Chromatic | CI（PR 時） |
| E2E テスト | ページをまたいだユーザーフロー | Playwright | CI |

**テストを書く優先順位の目安：**

```
1. ビジネスロジック（ユーティリティ・カスタムフック）→ Vitest
2. 重要な UI コンポーネントの振る舞い           → Testing Library
3. フォーム・インタラクションのシナリオ           → Storybook play()
4. デザインの崩れを防ぎたいコンポーネント         → ビジュアルリグレッション
5. クリティカルなユーザーフロー（ログイン・購入など）→ Playwright E2E
```

---

## 参考リンク

- [Storybook 公式ドキュメント](https://storybook.js.org/)
- [@storybook/test ドキュメント](https://storybook.js.org/docs/writing-tests/component-testing)
- [Storybook test-runner](https://storybook.js.org/docs/writing-tests/test-runner)
- [Playwright スクリーンショットテスト](https://playwright.dev/docs/screenshots)
- [Chromatic 公式ドキュメント](https://www.chromatic.com/docs/)
- [GitHub Actions 公式ドキュメント](https://docs.github.com/ja/actions)

---
