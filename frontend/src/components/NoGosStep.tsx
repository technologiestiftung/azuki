import { content } from "../content/de";
import { useAppState, useAppDispatch } from "../context/AppContext";
import { Step, type NoGoAnswer } from "../types";
import { ProgressBar } from "./ProgressBar";
import { QuestionBubble } from "./QuestionBubble";
import { motion, AnimatePresence } from "framer-motion";

export function NoGosStep() {
	const { profile, noGoSubIndex } = useAppState();
	const dispatch = useAppDispatch();
	const cards = content.noGos.cards;
	const current = cards[noGoSubIndex];

	function handleAnswer(answer: NoGoAnswer) {
		dispatch({ type: "SET_NOGO", id: current.id, answer });
		if (noGoSubIndex < cards.length - 1) {
			dispatch({ type: "SET_NOGO_SUB_INDEX", index: noGoSubIndex + 1 });
		} else {
			dispatch({ type: "GO_TO_STEP", step: Step.Loading });
		}
	}

	return (
		<div className="flex flex-col min-h-[100dvh]">
			<div className="flex items-center gap-3 px-4 pt-4">
				<button
					onClick={() => {
						if (noGoSubIndex > 0) {
							dispatch({
								type: "SET_NOGO_SUB_INDEX",
								index: noGoSubIndex - 1,
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
					<ProgressBar currentStep={Step.NoGos} />
				</div>
			</div>

			<div className="px-4 pt-6">
				<QuestionBubble>
					<h2 className="text-h3 font-bold text-white">
						{content.noGos.question}
					</h2>
				</QuestionBubble>
			</div>

			<div className="flex-1 flex flex-col items-center justify-center px-4 pt-6">
				<AnimatePresence mode="wait">
					<motion.div
						key={current.id}
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.25 }}
						className="w-full rounded-3xl p-8 flex flex-col items-center"
						style={{ backgroundColor: "var(--card-fill)" }}
					>
						<img
							src={current.illustration}
							alt=""
							className="w-40 h-40 object-contain mb-4"
						/>
						<h3 className="text-h4 font-semibold text-center mb-2">
							{current.title}
						</h3>
						<p className="text-body text-gray-500 text-center">
							{current.description}
						</p>
					</motion.div>
				</AnimatePresence>
			</div>

			<div className="flex gap-3 px-4 pb-8 pt-6">
				<button
					onClick={() => handleAnswer("geht_nicht")}
					className="flex-1 py-4 rounded-2xl text-subhead font-semibold text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.97]"
					style={{ backgroundColor: "#ea580c" }}
				>
					{content.noGos.rejectLabel}
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
						<path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
					</svg>
				</button>
				<button
					onClick={() => handleAnswer("ist_okay")}
					className="flex-1 py-4 rounded-2xl text-subhead font-semibold text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.97]"
					style={{ backgroundColor: "#f97316" }}
				>
					{content.noGos.acceptLabel}
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
						<path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</button>
			</div>
		</div>
	);
}
