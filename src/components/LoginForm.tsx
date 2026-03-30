import { useState } from "react";

type LoginData = {
	email: string;
	password: string;
};

type Props = {
	onSubmit: (data: LoginData) => void;
};

export function LoginForm({ onSubmit }: Props) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validate = (): Record<string, string> => {
		const newErrors: Record<string, string> = {};
		if (!email) {
			newErrors.email = "メールアドレスを入力してください";
		} else if (!email.includes("@")) {
			newErrors.email = "正しいメールアドレスを入力してください";
		}
		if (!password) {
			newErrors.password = "パスワードを入力してください";
		} else if (password.length < 8) {
			newErrors.password = "パスワードは8文字以上で入力してください";
		}
		return newErrors;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors = validate();
		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}
		onSubmit({ email, password });
	};

	return (
		<form onSubmit={handleSubmit} noValidate>
			<div>
				<label htmlFor="email">メールアドレス</label>
				<input
					id="email"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				{errors.email && <p role="alert">{errors.email}</p>}
			</div>
			<div>
				<label htmlFor="password">パスワード</label>
				<input
					id="password"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				{errors.password && <p role="alert">{errors.password}</p>}
			</div>
			<button type="submit">ログイン</button>
		</form>
	);
}
