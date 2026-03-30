import type { Meta, StoryObj } from "@storybook/react";
import { expect, waitFor, within } from "@storybook/test";
import { HttpResponse, http } from "msw";
import { UserCard } from "./UserCard";

const meta: Meta<typeof UserCard> = {
	title: "Components/UserCard",
	component: UserCard,
	parameters: {
		msw: {
			handlers: [
				http.get("/api/users/:id", () => {
					return HttpResponse.json({
						id: "1",
						name: "山田 太郎",
						email: "yamada@example.com",
					});
				}),
			],
		},
	},
};

export default meta;
type Story = StoryObj<typeof UserCard>;

export const データ取得成功: Story = {
	args: { userId: "1" },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await waitFor(() => {
			expect(canvas.getByText("山田 太郎")).toBeInTheDocument();
		});
		expect(canvas.getByText("yamada@example.com")).toBeInTheDocument();
	},
};

export const 読み込み中: Story = {
	args: { userId: "1" },
	parameters: {
		msw: {
			handlers: [
				http.get("/api/users/:id", async () => {
					await new Promise((resolve) => setTimeout(resolve, 10000));
					return HttpResponse.json({
						id: "1",
						name: "山田 太郎",
						email: "yamada@example.com",
					});
				}),
			],
		},
	},
};

export const エラー状態: Story = {
	args: { userId: "999" },
	parameters: {
		msw: {
			handlers: [
				http.get("/api/users/:id", () => {
					return HttpResponse.json({ message: "Not found" }, { status: 404 });
				}),
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await waitFor(() => {
			expect(canvas.getByRole("alert")).toBeInTheDocument();
		});
	},
};
