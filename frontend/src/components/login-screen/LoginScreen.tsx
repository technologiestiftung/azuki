import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { unlock } from "../../api/client";
import { PrimaryThemedButton } from "../primitives/buttons/PrimaryThemedButton";
import { content } from "../../content";
import { TextInput } from "../primitives/text-inputs/TextInput";

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
		<div className="flex flex-col items-center justify-center min-h-[100dvh] px-4">
			<img
				src="/illustrations/azuki-lockup.svg"
				alt=""
				className="w-[146px] object-contain mb-[130px]"
			/>
			<p className="text-xl text-sky-900 text-center mb-2">
				{content["login.input.label"]}
			</p>

			<form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
				<TextInput
					type="password"
					name="password"
					value={password}
					onChange={(e) => {
						setPassword(e.target.value);
						setError(false);
					}}
					onClearInput={() => {
						setPassword("");
						setError(false);
					}}
					placeholder=""
					error={error}
					errorMessage="Falsches Passwort"
					autoFocus
					submitDisabled={false}
				/>
				<PrimaryThemedButton
					type="submit"
					disabled={!password.trim() || loading}
					className="w-full"
				>
					{content["login.cta.label"]}
				</PrimaryThemedButton>
			</form>
		</div>
	);
};
