import { expect, test } from "@playwright/test";

test.describe("Button ビジュアルリグレッション", () => {
	test("通常状態のスクリーンショットが一致する", async ({ page }) => {
		await page.goto("/iframe.html?id=components-button--通常");
		await expect(page).toHaveScreenshot("button-default.png");
	});

	test("disabled 状態のスクリーンショットが一致する", async ({ page }) => {
		await page.goto("/iframe.html?id=components-button--無効化");
		await expect(page).toHaveScreenshot("button-disabled.png");
	});
});
