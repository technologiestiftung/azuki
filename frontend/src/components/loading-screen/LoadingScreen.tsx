import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { content } from "../../content/de";
import { useAppStore } from "../../store/useAppStore";
import { matchProfile } from "../../api/client";

export function LoadingScreen() {
	const profile = useAppStore((state) => state.profile);
	const matchResults = useAppStore((state) => state.matchResults);
	const setMatchResults = useAppStore((state) => state.setMatchResults);
	const navigate = useNavigate();
	const called = useRef(false);

	useEffect(() => {
		if (matchResults) {
			navigate("/results/list", { replace: true });
			return;
		}
		if (called.current) {
			return;
		}
		called.current = true;

		const doMatch = async () => {
			try {
				const result = await matchProfile(profile);
				setMatchResults(result);
			} catch (err) {
				console.error("Match API error:", err);
			}
		};

		const minDelay = new Promise<void>((r) => setTimeout(r, 2500));

		Promise.all([doMatch(), minDelay]).then(() => {
			navigate("/results/list");
		});
	}, [profile, matchResults, setMatchResults, navigate]);

	return (
		<div className="flex flex-col items-center justify-center min-h-[100dvh] px-8">
			<div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-sky-300 mb-8 animate-spin" />
			<h2 className="text-2xl font-semibold text-center">
				{content["loading.title"]}
			</h2>
		</div>
	);
}
