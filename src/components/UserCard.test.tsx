import { render, screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "../mocks/server";
import { UserCard } from "./UserCard";

describe("UserCard", () => {
	it("ユーザー情報を取得して表示する", async () => {
		render(<UserCard userId="1" />);
		expect(await screen.findByText("山田 太郎")).toBeInTheDocument();
		expect(screen.getByText("yamada@example.com")).toBeInTheDocument();
	});

	it("読み込み中は「読み込み中...」が表示される", () => {
		render(<UserCard userId="1" />);
		expect(screen.getByText("読み込み中...")).toBeInTheDocument();
	});

	it("API がエラーを返したとき alert が表示される", async () => {
		server.use(
			http.get("/api/users/:id", () => {
				return HttpResponse.json({ message: "Not found" }, { status: 404 });
			}),
		);
		render(<UserCard userId="999" />);
		expect(await screen.findByRole("alert")).toBeInTheDocument();
	});
});
