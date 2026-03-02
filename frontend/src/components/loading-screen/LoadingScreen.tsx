import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { content } from "../../content/de";
import { useAppStore } from "../../store/useAppStore";
import { Step } from "../../common";
import { matchProfile } from "../../api/client";

export function LoadingScreen() {
	const profile = useAppStore((state) => state.profile);
	const setMatchResults = useAppStore((state) => state.setMatchResults);
	const goToStep = useAppStore((state) => state.goToStep);
	const called = useRef(false);

	useEffect(() => {
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
			goToStep(Step.Results);
		});
	}, [profile, setMatchResults, goToStep]);

	return (
		<div className="flex flex-col items-center justify-center min-h-[100dvh] px-8">
			<motion.div
				animate={{ rotate: 360 }}
				transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
				className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-sky-300 mb-8"
			/>
			<h2 className="text-h3 font-semibold text-center">
				{content["loading.title"]}
			</h2>
		</div>
	);
}
