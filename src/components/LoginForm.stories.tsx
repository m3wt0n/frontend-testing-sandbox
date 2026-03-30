import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { LoginForm } from "./LoginForm";

const meta: Meta<typeof LoginForm> = {
	title: "Components/LoginForm",
	component: LoginForm,
};

export default meta;
type Story = StoryObj<typeof LoginForm>;

export const デフォルト: Story = {
	args: {
		onSubmit: fn(),
	},
};

export const 送信成功: Story = {
	args: {
		onSubmit: fn(),
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);

		await userEvent.type(
			canvas.getByLabelText("メールアドレス"),
			"user@example.com",
		);
		await userEvent.type(canvas.getByLabelText("パスワード"), "password123");
		await userEvent.click(canvas.getByRole("button", { name: "ログイン" }));

		await expect(args.onSubmit).toHaveBeenCalledWith({
			email: "user@example.com",
			password: "password123",
		});
	},
};

export const バリデーションエラー: Story = {
	args: {
		onSubmit: fn(),
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		await userEvent.click(canvas.getByRole("button", { name: "ログイン" }));

		await expect(
			canvas.getByText("メールアドレスを入力してください"),
		).toBeInTheDocument();
	},
};

export const メールアドレス不正: Story = {
	args: {
		onSubmit: fn(),
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		await userEvent.type(
			canvas.getByLabelText("メールアドレス"),
			"invalid-email",
		);
		await userEvent.click(canvas.getByRole("button", { name: "ログイン" }));

		await expect(
			canvas.getByText("正しいメールアドレスを入力してください"),
		).toBeInTheDocument();
	},
};
