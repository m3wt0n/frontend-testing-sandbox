import { expect, test } from "@playwright/test";

test.describe("アプリ E2E", () => {
	test("トップページが表示される", async ({ page }) => {
		await page.goto("/");
		await expect(page).toHaveTitle(/frontend-testing-sandbox/i);
	});

	test("Button コンポーネントが表示される", async ({ page }) => {
		await page.goto("/");
		const button = page.getByRole("button", { name: "送信" });
		await expect(button).toBeVisible();
	});

	test("LoginForm が表示される", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByLabel("メールアドレス")).toBeVisible();
		await expect(page.getByLabel("パスワード")).toBeVisible();
		await expect(page.getByRole("button", { name: "ログイン" })).toBeVisible();
	});
});
