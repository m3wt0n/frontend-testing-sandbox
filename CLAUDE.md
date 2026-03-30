# CLAUDE.md — Claude Code テスト実装ガイド

このファイルは Claude Code がこのリポジトリでテストを書く際に従うべきルール・手順をまとめたものです。
コーディングを開始する前に必ずこのファイルを読んでください。

---

## このリポジトリの技術スタック

| 役割 | ツール | バージョン |
|---|---|---|
| テストランナー | Vitest | ^2.0 |
| コンポーネントテスト | @testing-library/react | ^16.0 |
| ユーザー操作シミュレーション | @testing-library/user-event | ^14.0 |
| カスタムマッチャー | @testing-library/jest-dom | ^6.0 |
| API モック | MSW | ^2.0 |
| インタラクションテスト | Storybook 8 + @storybook/test | ^8.0 |
| E2E | Playwright | ^1.40 |

---

## テストファイルの配置ルール

```
# コンポーネントテスト・ユニットテスト
src/components/Button.tsx        → src/components/Button.test.tsx
src/hooks/useCounter.ts          → src/hooks/useCounter.test.ts
src/utils/formatDate.ts          → src/utils/formatDate.test.ts

# Storybook ストーリー
src/components/Button.tsx        → src/components/Button.stories.tsx

# E2E テスト
e2e/app.spec.ts

# ビジュアルリグレッション
e2e/visual/*.visual.spec.ts
```

テストファイルは **必ずテスト対象と同じディレクトリに置く**（`__tests__` ディレクトリは使わない）。

---

## テストを書く前に必ず行うこと

### 1. テスト対象のコードと仕様を把握する

```
- コンポーネントの props・返り値・副作用を確認する
- 既存のテストがあれば読んで重複を避ける
- 仕様コメント・型定義を読んで意図を理解する
```

### 2. テストケースを設計してから実装する

コードを書く前に、以下の観点でテストケースを列挙する。

```
【正常系】
- 期待どおりの入力で期待どおりの出力・表示になるか

【異常系】
- 不正な入力・エラーレスポンス時の挙動

【エッジケース】
- 境界値（0・1・最大値）
- 空文字・null・undefined
- 非同期処理のローディング・エラー状態
- ユーザーが予期せぬ操作をした場合
```

---

## テストの書き方ルール

### クエリの優先順位（必ず守る）

```ts
// 優先度 1：getByRole（最優先）
screen.getByRole('button', { name: '送信' })
screen.getByRole('textbox', { name: 'メールアドレス' })
screen.getByRole('heading', { name: 'ユーザー一覧' })

// 優先度 2：getByLabelText（フォーム要素）
screen.getByLabelText('メールアドレス')

// 優先度 3：getByText
screen.getByText('登録が完了しました')

// 最終手段：getByTestId（なるべく使わない）
screen.getByTestId('submit-button')   // ← 原則禁止。やむを得ない場合のみ
```

### ユーザー操作は userEvent を使う（fireEvent は使わない）

```ts
// 禁止：fireEvent はブラウザの実際の挙動を再現しない
fireEvent.click(button)
fireEvent.change(input, { target: { value: 'test' } })

// 必須：userEvent でブラウザと同じ操作を再現する
const user = userEvent.setup()
await user.click(button)
await user.type(input, 'test')
await user.clear(input)
await user.selectOptions(select, 'option1')
```

### 非同期処理の扱い

```ts
// 禁止：非同期を待たずに検証する
render(<UserCard userId="1" />)
expect(screen.getByText('山田太郎')).toBeInTheDocument()  // 失敗する

// 正しい：findBy で待つ（シンプルな場合）
expect(await screen.findByText('山田太郎')).toBeInTheDocument()

// 正しい：waitFor で待つ（複数の検証がある場合）
await waitFor(() => {
  expect(screen.getByText('山田太郎')).toBeInTheDocument()
  expect(screen.getByText('yamada@example.com')).toBeInTheDocument()
})
```

### describe / it の命名規則

```ts
// describe：テスト対象の名前
describe('LoginForm', () => {

  // describe（ネスト）：状況・条件
  describe('バリデーション', () => {

    // it：「〜のとき、〜になる」の形で書く
    it('メールアドレスが空のとき、エラーメッセージが表示される', async () => {})
    it('パスワードが8文字未満のとき、送信できない', async () => {})
  })

  describe('送信', () => {
    it('正しい入力で送信すると、onSubmit が呼ばれる', async () => {})
  })
})
```

### MSW でAPIをモックする

```ts
// src/mocks/handlers.ts にハンドラーを追加する
// テストファイルで server.use() を使い、テストごとにハンドラーを上書きできる

// グローバル設定（vitest.config.ts の setupFiles で読み込み済み）
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())   // 各テスト後に必ずリセットする
afterAll(() => server.close())

// テスト内でのエラーケース上書き
server.use(
  http.get('/api/users/:id', () => {
    return HttpResponse.json({ message: 'Not found' }, { status: 404 })
  })
)
```

---

## Storybook ストーリーの書き方ルール

### 必ず含めるストーリー

```
- 通常状態（デフォルト表示）
- 主要なバリエーション（variant / size / disabled など）
- エラー状態（該当する場合）
- ローディング状態（該当する場合）
```

### play() を書く基準

以下のコンポーネントには必ず `play()` でインタラクションテストを書く。

```
- フォームコンポーネント（送信・バリデーション）
- モーダル・ドロワー（開閉）
- タブ・アコーディオン（切り替え）
- ドロップダウン・セレクト
- 複数ステップを持つ UI
```

### play() の書き方

```tsx
export const 送信成功: Story = {
  args: {
    onSubmit: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    // 操作する
    await userEvent.type(canvas.getByLabelText('メールアドレス'), 'user@example.com')
    await userEvent.click(canvas.getByRole('button', { name: '送信' }))

    // 結果を検証する
    await expect(args.onSubmit).toHaveBeenCalledOnce()
    await expect(canvas.getByText('送信完了')).toBeInTheDocument()
  },
}
```

---

## テストを追加・修正するときの手順

### 新しいコンポーネントにテストを追加する場合

```
1. コンポーネントのコード・型・仕様コメントを読む
2. テストケースを箇条書きで列挙する（コメントとして残してもよい）
3. vitest.config.ts・setupTests.ts を確認してセットアップを把握する
4. src/mocks/handlers.ts を確認して既存のモックを把握する
5. テストコードを書く
6. `npm run test` でテストを実行して通ることを確認する
7. Storybook が必要なコンポーネントなら *.stories.tsx も追加する
```

### 既存のテストを修正する場合

```
1. 既存テストが失敗している原因を特定する
2. コンポーネントの変更内容を確認する
3. テストの修正方針を決める（仕様変更なのかリファクタなのか）
4. 修正後に `npm run test` で全テストが通ることを確認する
5. カバレッジが下がっていないことを確認する（npm run test:coverage）
```

---

## 禁止事項

以下はこのリポジトリでは使用しない。

```ts
// 1. fireEvent（userEvent を使う）
import { fireEvent } from '@testing-library/react'

// 2. getByTestId（getByRole・getByLabelText を優先する）
screen.getByTestId('...')

// 3. コンポーネントの内部状態・実装の詳細に依存するアサーション
expect(wrapper.state()).toEqual(...)
expect(component.find('.internal-class')).toHaveLength(1)

// 4. act の手動ラップ（Testing Library の userEvent・waitFor が内部で処理する）
import { act } from 'react'
act(() => { ... })   // ← renderHook 以外では不要なことが多い

// 5. スナップショットテスト（toMatchSnapshot）
// 変更のたびに更新が必要になり、テストの意図が不明瞭になるため
expect(component).toMatchSnapshot()
```

---

## テスト実行コマンド

```bash
# ウォッチモードで実行（開発中はこれを使う）
npm run test

# 1回だけ実行（CI・カバレッジ確認時）
npm run test:coverage

# Storybook インタラクションテスト
npm run storybook &         # 先に Storybook を起動する
npm run test:storybook

# E2E テスト
npm run test:e2e

# ビジュアルリグレッション
npm run test:visual
```

---

## よくある質問

**Q. テストが非同期エラーで落ちる**
→ `await user.click()` や `await screen.findBy*()` を使っているか確認する。
`waitFor` の中で複数の `expect` を書いている場合、最初の `expect` が失敗すると後続が実行されないため、1つずつ `findBy` で待つ方が安定する。

**Q. MSW のハンドラーが効いていない**
→ `server.listen()` が `beforeAll` で呼ばれているか確認する。また `afterEach(() => server.resetHandlers())` がないと前のテストのハンドラーが残る。

**Q. Storybook の play() がタイムアウトする**
→ `waitFor` のタイムアウトはデフォルト 1000ms。遅い API モックがある場合は `waitFor(() => {...}, { timeout: 3000 })` で延ばす。

**Q. ビジュアルリグレッションのスナップショットが環境によって変わる**
→ OS によってフォントレンダリングが異なるため、スナップショットの生成・比較は CI（Linux）上でのみ行う運用にする。ローカルでは `--update-snapshots` を使わない。

---

*このファイルはリポジトリのルートに `CLAUDE.md` として配置してください。*
*Claude Code はプロジェクト開始時にこのファイルを自動で読み込みます。*
