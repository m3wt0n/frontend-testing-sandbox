import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
	describe("バリデーション", () => {
		it("メールアドレスが空のとき、エラーメッセージが表示される", async () => {
			const user = userEvent.setup();
			render(<LoginForm onSubmit={vi.fn()} />);
			await user.click(screen.getByRole("button", { name: "ログイン" }));
			expect(
				await screen.findByText("メールアドレスを入力してください"),
			).toBeInTheDocument();
		});

		it("@ を含まないメールアドレスのとき、エラーメッセージが表示される", async () => {
			const user = userEvent.setup();
			render(<LoginForm onSubmit={vi.fn()} />);
			await user.type(screen.getByLabelText("メールアドレス"), "invalid-email");
			await user.click(screen.getByRole("button", { name: "ログイン" }));
			expect(
				await screen.findByText("正しいメールアドレスを入力してください"),
			).toBeInTheDocument();
		});

		it("パスワードが空のとき、エラーメッセージが表示される", async () => {
			const user = userEvent.setup();
			render(<LoginForm onSubmit={vi.fn()} />);
			await user.type(
				screen.getByLabelText("メールアドレス"),
				"user@example.com",
			);
			await user.click(screen.getByRole("button", { name: "ログイン" }));
			expect(
				await screen.findByText("パスワードを入力してください"),
			).toBeInTheDocument();
		});

		it("パスワードが7文字のとき（境界値）、エラーメッセージが表示される", async () => {
			const user = userEvent.setup();
			render(<LoginForm onSubmit={vi.fn()} />);
			await user.type(
				screen.getByLabelText("メールアドレス"),
				"user@example.com",
			);
			await user.type(screen.getByLabelText("パスワード"), "1234567");
			await user.click(screen.getByRole("button", { name: "ログイン" }));
			expect(
				await screen.findByText("パスワードは8文字以上で入力してください"),
			).toBeInTheDocument();
		});

		it("バリデーションエラーのとき、onSubmit が呼ばれない", async () => {
			const onSubmit = vi.fn();
			const user = userEvent.setup();
			render(<LoginForm onSubmit={onSubmit} />);
			await user.click(screen.getByRole("button", { name: "ログイン" }));
			expect(onSubmit).not.toHaveBeenCalled();
		});
	});

	describe("送信", () => {
		it("正しい入力で送信すると、onSubmit が正しい値で呼ばれる", async () => {
			const onSubmit = vi.fn();
			const user = userEvent.setup();
			render(<LoginForm onSubmit={onSubmit} />);
			await user.type(
				screen.getByLabelText("メールアドレス"),
				"user@example.com",
			);
			await user.type(screen.getByLabelText("パスワード"), "password123");
			await user.click(screen.getByRole("button", { name: "ログイン" }));
			expect(onSubmit).toHaveBeenCalledWith({
				email: "user@example.com",
				password: "password123",
			});
		});

		it("パスワードがちょうど8文字のとき（境界値）、送信できる", async () => {
			const onSubmit = vi.fn();
			const user = userEvent.setup();
			render(<LoginForm onSubmit={onSubmit} />);
			await user.type(
				screen.getByLabelText("メールアドレス"),
				"user@example.com",
			);
			await user.type(screen.getByLabelText("パスワード"), "12345678");
			await user.click(screen.getByRole("button", { name: "ログイン" }));
			expect(onSubmit).toHaveBeenCalledOnce();
		});
	});
});
