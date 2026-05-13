import { useState, type FormEvent, type ReactNode } from "react";
import { isAuthenticated, unlock } from "../../api/client";

interface Props {
	children: ReactNode;
}

export function EvalAuthGate({ children }: Props) {
	const [unlocked, setUnlocked] = useState(isAuthenticated());
	const [password, setPassword] = useState("");
	const [error, setError] = useState(false);
	const [loading, setLoading] = useState(false);

	if (unlocked) {
		return <>{children}</>;
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (!password.trim()) {
			return;
		}
		setLoading(true);
		setError(false);
		const ok = await unlock(password.trim());
		setLoading(false);
		if (ok) {
			setUnlocked(true);
		} else {
			setError(true);
		}
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-[100dvh] px-8 bg-white">
			<h1 className="text-2xl font-semibold mb-2">Eval</h1>
			<p className="text-sm text-gray-500 mb-6">
				Passwort eingeben, um auf das Eval-Tool zuzugreifen.
			</p>
			<form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
				<input
					type="password"
					name="password"
					value={password}
					onChange={(e) => {
						setPassword(e.target.value);
						setError(false);
					}}
					placeholder="Passwort"
					autoFocus
					className={`w-full px-4 py-3 rounded-2xl border-2 text-base outline-none transition-colors focus:outline-none focus-visible:border-sky-300 ${
						error ? "border-red-500" : "border-gray-200"
					}`}
				/>
				{error && (
					<p className="text-sm text-red-500 text-center">
						Falsches Passwort. Bitte versuche es erneut.
					</p>
				)}
				<button
					type="submit"
					disabled={!password.trim() || loading}
					className="w-full bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
				>
					{loading ? "..." : "Weiter"}
				</button>
			</form>
		</div>
	);
}
