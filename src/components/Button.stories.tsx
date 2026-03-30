import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
	title: "Components/Button",
	component: Button,
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const 通常: Story = {
	args: {
		children: "送信",
		variant: "primary",
	},
};

export const セカンダリ: Story = {
	args: {
		children: "キャンセル",
		variant: "secondary",
	},
};

export const 危険: Story = {
	args: {
		children: "削除",
		variant: "danger",
	},
};

export const 無効化: Story = {
	args: {
		children: "送信",
		disabled: true,
	},
};

export const 読み込み中: Story = {
	args: {
		children: "送信",
		loading: true,
	},
};

export const クリック可能: Story = {
	args: {
		children: "送信",
		onClick: fn(),
	},
};
