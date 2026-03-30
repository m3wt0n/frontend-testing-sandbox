import { Button } from "./components/Button";
import { LoginForm } from "./components/LoginForm";
import { UserCard } from "./components/UserCard";

function App() {
	return (
		<main>
			<h1>frontend-testing-sandbox</h1>

			<section>
				<h2>Button</h2>
				<Button>送信</Button>
				<Button variant="secondary">キャンセル</Button>
				<Button disabled>無効</Button>
				<Button loading>読み込み中</Button>
			</section>

			<section>
				<h2>UserCard</h2>
				<UserCard userId="1" />
			</section>

			<section>
				<h2>LoginForm</h2>
				<LoginForm onSubmit={(data) => console.log("submitted:", data)} />
			</section>
		</main>
	);
}

export default App;
