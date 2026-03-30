import { HttpResponse, http } from "msw";

export const handlers = [
	http.get("/api/users/:id", ({ params }) => {
		const { id } = params;
		return HttpResponse.json({
			id,
			name: "山田 太郎",
			email: "yamada@example.com",
		});
	}),
];
