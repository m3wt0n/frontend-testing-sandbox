import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
	describe("表示", () => {
		it("テキストが表示される", () => {
			render(<Button>送信</Button>);
			expect(screen.getByRole("button", { name: "送信" })).toBeInTheDocument();
		});

		it("loading のとき「読み込み中...」が表示される", () => {
			render(<Button loading>送信</Button>);
			expect(
				screen.getByRole("button", { name: "読み込み中..." }),
			).toBeInTheDocument();
		});

		it("disabled のとき押せない", () => {
			render(<Button disabled>送信</Button>);
			expect(screen.getByRole("button", { name: "送信" })).toBeDisabled();
		});

		it("loading のとき押せない", () => {
			render(<Button loading>送信</Button>);
			expect(
				screen.getByRole("button", { name: "読み込み中..." }),
			).toBeDisabled();
		});
	});

	describe("クリック", () => {
		it("クリックすると onClick が呼ばれる", async () => {
			const onClick = vi.fn();
			const user = userEvent.setup();
			render(<Button onClick={onClick}>送信</Button>);
			await user.click(screen.getByRole("button", { name: "送信" }));
			expect(onClick).toHaveBeenCalledOnce();
		});

		it("disabled のとき onClick が呼ばれない", async () => {
			const onClick = vi.fn();
			const user = userEvent.setup();
			render(
				<Button disabled onClick={onClick}>
					送信
				</Button>,
			);
			await user.click(screen.getByRole("button", { name: "送信" }));
			expect(onClick).not.toHaveBeenCalled();
		});
	});
});
