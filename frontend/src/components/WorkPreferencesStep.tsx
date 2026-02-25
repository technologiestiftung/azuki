import { content } from "../content/de";
import { useAppState, useAppDispatch } from "../context/AppContext";
import { Step, type WorkPreferenceChoice } from "../types";
import { ProgressBar } from "./ProgressBar";
import { QuestionBubble } from "./QuestionBubble";
import { motion, AnimatePresence } from "framer-motion";

export function WorkPreferencesStep() {
	const { workPrefSubIndex } = useAppState();
	const dispatch = useAppDispatch();
	const pairs = content.workPreferences.pairs;
	const current = pairs[workPrefSubIndex];

	function handleChoice(choice: WorkPreferenceChoice) {
		dispatch({ type: "SET_WORK_PREFERENCE", id: current.id, choice });
		if (workPrefSubIndex < pairs.length - 1) {
			dispatch({
				type: "SET_WORK_PREF_SUB_INDEX",
				index: workPrefSubIndex + 1,
			});
		} else {
			dispatch({ type: "NEXT_STEP" });
		}
	}

	function handleSkip() {
		if (workPrefSubIndex < pairs.length - 1) {
			dispatch({
				type: "SET_WORK_PREF_SUB_INDEX",
				index: workPrefSubIndex + 1,
			});
		} else {
			dispatch({ type: "NEXT_STEP" });
		}
	}

	return (
		<div className="flex flex-col min-h-[100dvh]">
			<div className="flex items-center gap-3 px-4 pt-4">
				<button
					onClick={() => {
						if (workPrefSubIndex > 0) {
							dispatch({
								type: "SET_WORK_PREF_SUB_INDEX",
								index: workPrefSubIndex - 1,
							});
						} else {
							dispatch({ type: "PREV_STEP" });
						}
					}}
					className="w-10 h-10 flex items-center justify-center rounded-full"
				>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M19 12H5M12 19l-7-7 7-7" />
					</svg>
				</button>
				<div className="flex-1">
					<ProgressBar currentStep={Step.WorkPreferences} />
				</div>
			</div>

			<div className="px-4 pt-6">
				<QuestionBubble>
					<h2 className="text-h3 font-bold text-white">
						{content.workPreferences.question}
					</h2>
				</QuestionBubble>
			</div>

			<div className="flex-1 flex flex-col justify-center px-4 pt-6 gap-3">
				<AnimatePresence mode="wait">
					<motion.div
						key={current.id}
						initial={{ opacity: 0, x: 40 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -40 }}
						transition={{ duration: 0.25 }}
						className="space-y-3"
					>
						<button
							onClick={() => handleChoice("a")}
							className="w-full py-10 px-6 rounded-3xl text-h4 font-semibold text-center transition-transform active:scale-[0.98]"
							style={{
								backgroundColor: "var(--theme-subtle)",
								color: "var(--theme-text)",
							}}
						>
							{current.a}
						</button>

						<p className="text-center text-body text-gray-400">
							{content.workPreferences.orLabel}
						</p>

						<button
							onClick={() => handleChoice("b")}
							className="w-full py-10 px-6 rounded-3xl text-h4 font-semibold text-center text-white transition-transform active:scale-[0.98]"
							style={{
								backgroundColor: "var(--theme-text)",
							}}
						>
							{current.b}
						</button>
					</motion.div>
				</AnimatePresence>
			</div>

			<div className="px-4 pb-8 pt-4">
				<button
					onClick={handleSkip}
					className="w-full py-3 text-body text-gray-500 font-medium"
				>
					{content.navigation.skip}
				</button>
			</div>
		</div>
	);
}
