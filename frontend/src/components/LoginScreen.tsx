import { useState } from "react";
import { useAppDispatch } from "../context/AppContext";
import { Step } from "../types";
import { unlock } from "../api/client";

export function LoginScreen() {
	const dispatch = useAppDispatch();
	const [password, setPassword] = useState("");
	const [error, setError] = useState(false);
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!password.trim()) return;

		setLoading(true);
		setError(false);

		const ok = await unlock(password.trim());
		setLoading(false);

		if (ok) {
			dispatch({ type: "GO_TO_STEP", step: Step.Welcome });
		} else {
			setError(true);
		}
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-[100dvh] px-8">
			<img
				src="/illustrations/star.svg"
				alt=""
				className="w-32 h-32 object-contain mb-8"
			/>
			<h1 className="text-h2 font-bold text-center mb-2">Azuki</h1>
			<p className="text-body text-gray-500 text-center mb-8">
				Bitte gib das Passwort ein, um fortzufahren.
			</p>

			<form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
				<input
					type="password"
					value={password}
					onChange={(e) => {
						setPassword(e.target.value);
						setError(false);
					}}
					placeholder="Passwort"
					className="w-full px-4 py-3 rounded-2xl border-2 text-body outline-none transition-colors"
					style={{
						borderColor: error ? "#ef4444" : "#e5e7eb",
					}}
					autoFocus
				/>
				{error && (
					<p className="text-caption text-red-500 text-center">
						Falsches Passwort. Bitte versuche es erneut.
					</p>
				)}
				<button
					type="submit"
					disabled={!password.trim() || loading}
					className="w-full py-4 rounded-2xl text-subhead font-semibold transition-colors"
					style={{
						backgroundColor:
							!password.trim() || loading
								? "var(--btn-fill-disabled)"
								: "var(--theme-primary-filled)",
						color:
							!password.trim() || loading
								? "var(--btn-on-disabled)"
								: "var(--theme-on-primary)",
					}}
				>
					{loading ? "..." : "Weiter"}
				</button>
			</form>
		</div>
	);
}
