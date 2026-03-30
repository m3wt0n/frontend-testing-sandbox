type Variant = "primary" | "secondary" | "danger";

type Props = {
	children: React.ReactNode;
	variant?: Variant;
	disabled?: boolean;
	loading?: boolean;
	onClick?: () => void;
};

export function Button({
	children,
	variant = "primary",
	disabled = false,
	loading = false,
	onClick,
}: Props) {
	return (
		<button
			type="button"
			className={`btn btn-${variant}`}
			disabled={disabled || loading}
			onClick={onClick}
			aria-busy={loading}
		>
			{loading ? "読み込み中..." : children}
		</button>
	);
}
