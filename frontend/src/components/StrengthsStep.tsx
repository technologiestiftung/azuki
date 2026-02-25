import { content } from "../content/de";
import { useAppState, useAppDispatch } from "../context/AppContext";
import { Step } from "../types";
import { ProgressBar } from "./ProgressBar";
import { QuestionBubble } from "./QuestionBubble";
import { motion, AnimatePresence } from "framer-motion";

const SLIDER_STOPS = [0, 0.25, 0.5, 0.75, 1];

export function StrengthsStep() {
	const { profile, strengthSubIndex } = useAppState();
	const dispatch = useAppDispatch();
	const cards = content.strengths.cards;
	const current = cards[strengthSubIndex];
	const currentValue = profile.staerken[current.id] ?? 0.5;

	function handleSliderChange(value: number) {
		dispatch({ type: "SET_STRENGTH", id: current.id, value });
	}

	function handleNext() {
		if (strengthSubIndex < cards.length - 1) {
			dispatch({ type: "SET_STRENGTH_SUB_INDEX", index: strengthSubIndex + 1 });
		} else {
			dispatch({ type: "NEXT_STEP" });
		}
	}

	function handleSkip() {
		dispatch({ type: "NEXT_STEP" });
	}

	return (
		<div className="flex flex-col min-h-[100dvh]">
			<div className="flex items-center gap-3 px-4 pt-4">
				<button
					onClick={() => {
						if (strengthSubIndex > 0) {
							dispatch({ type: "SET_STRENGTH_SUB_INDEX", index: strengthSubIndex - 1 });
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
					<ProgressBar currentStep={Step.Strengths} />
				</div>
			</div>

			<div className="px-4 pt-6">
				<QuestionBubble>
					<h2 className="text-h3 font-bold text-white">
						{content.strengths.question}
					</h2>
				</QuestionBubble>
			</div>

			<div className="flex-1 flex flex-col items-center justify-center px-4 pt-6">
				<AnimatePresence mode="wait">
					<motion.div
						key={current.id}
						initial={{ opacity: 0, x: 40 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -40 }}
						transition={{ duration: 0.25 }}
						className="w-full rounded-3xl p-6 flex flex-col items-center"
						style={{ backgroundColor: "var(--card-fill)" }}
					>
						<img
							src={current.illustration}
							alt=""
							className="w-32 h-32 object-contain mb-4"
						/>
						<h3 className="text-h4 font-semibold mb-1">{current.title}</h3>
						<p className="text-body text-gray-500 text-center">
							{current.description}
						</p>
					</motion.div>
				</AnimatePresence>

				<div className="w-full mt-6">
					<div className="flex justify-between text-caption text-gray-500 mb-3">
						<span>{content.strengths.sliderMin}</span>
						<span>{content.strengths.sliderMax}</span>
					</div>
					<div className="flex justify-between gap-2">
						{SLIDER_STOPS.map((stop) => (
							<button
								key={stop}
								onClick={() => handleSliderChange(stop)}
								className="flex-1 h-12 rounded-xl border-2 transition-all"
								style={{
									borderColor:
										currentValue === stop
											? "var(--theme-primary-filled)"
											: "#e5e7eb",
									backgroundColor:
										currentValue === stop
											? "var(--theme-primary-filled)"
											: "white",
								}}
							/>
						))}
					</div>
				</div>
			</div>

			<div className="px-4 pb-6 pt-4 space-y-2">
				<button
					onClick={handleNext}
					className="w-full py-4 rounded-2xl text-subhead font-semibold transition-colors"
					style={{
						backgroundColor: "var(--theme-primary-filled)",
						color: "var(--theme-on-primary)",
					}}
				>
					{content.navigation.next}
				</button>
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
