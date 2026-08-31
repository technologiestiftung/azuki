import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { unlock } from "../../api/client";
import { PrimaryButton } from "../primitives/buttons/PrimaryButton";

export const LoginScreen = () => {
	const navigate = useNavigate();
	const [password, setPassword] = useState("");
	const [error, setError] = useState(false);
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!password.trim()) {
			return;
		}

		setLoading(true);
		setError(false);

		const ok = await unlock(password.trim());
		setLoading(false);

		if (ok) {
			navigate("/start");
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
			<h1 className="text-3xl font-bold text-center mb-2">Azuki</h1>
			<p className="text-base text-sky-shade-110 text-center mb-8">
				Bitte gib das Passwort ein, um fortzufahren.
			</p>

			<form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
				<input
					type="password"
					name="password"
					value={password}
					onChange={(e) => {
						setPassword(e.target.value);
						setError(false);
					}}
					placeholder="Passwort"
					className={`w-full px-4 py-3 rounded-2xl border-2 text-base outline-none transition-colors focus:outline-none focus-visible:border-sky-300 ${
						error ? "border-red-500" : "border-sky-shade-20"
					}`}
					autoFocus
				/>
				{error && (
					<p className="text-sm text-red-500 text-center">
						Falsches Passwort. Bitte versuche es erneut.
					</p>
				)}
				<PrimaryButton
					type="submit"
					disabled={!password.trim() || loading}
					className="w-full"
				>
					{loading ? "..." : "Weiter"}
				</PrimaryButton>
			</form>
		</div>
	);
};
