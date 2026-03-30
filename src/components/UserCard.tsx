import { useEffect, useState } from "react";

type User = {
	id: string;
	name: string;
	email: string;
};

type Props = {
	userId: string;
};

export function UserCard({ userId }: Props) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		setLoading(true);
		setError(false);
		fetch(`/api/users/${userId}`)
			.then((res) => {
				if (!res.ok) throw new Error("Not found");
				return res.json() as Promise<User>;
			})
			.then((data) => {
				setUser(data);
				setLoading(false);
			})
			.catch(() => {
				setError(true);
				setLoading(false);
			});
	}, [userId]);

	if (loading) return <p>読み込み中...</p>;
	if (error) return <p role="alert">ユーザーが見つかりません</p>;
	if (!user) return null;

	return (
		<div>
			<h2>{user.name}</h2>
			<p>{user.email}</p>
		</div>
	);
}
