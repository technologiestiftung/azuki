import { content } from "../../../content/de";
import { useAppStore } from "../../../store/useAppStore";
import { Step, type NoGoAnswer } from "../../../common";
import { ProgressBar } from "../progress-bar/ProgressBar";
import { QuestionBubble } from "../question-bubble/QuestionBubble";
// Removed framer-motion
import { BackButton } from "../../back-button/BackButton";

export function NoGosStep() {
	const noGoSubIndex = useAppStore((state) => state.noGoSubIndex);
	const setNoGo = useAppStore((state) => state.setNoGo);
	const setNoGoSubIndex = useAppStore((state) => state.setNoGoSubIndex);
	const goToStep = useAppStore((state) => state.goToStep);
	const prevStep = useAppStore((state) => state.prevStep);
	const cards = content["noGos.cards"];
	const current = cards[noGoSubIndex];

	function handleAnswer(answer: NoGoAnswer) {
		setNoGo(current.id, answer);
		if (noGoSubIndex < cards.length - 1) {
			setNoGoSubIndex(noGoSubIndex + 1);
		} else {
			goToStep(Step.Loading);
		}
	}

	return (
		<div className="flex flex-col min-h-[100dvh]">
			<div className="flex items-center gap-3 px-4 pt-2 pb-1">
				<BackButton
					onClick={() => {
						if (noGoSubIndex > 0) {
							setNoGoSubIndex(noGoSubIndex - 1);
						} else {
							prevStep();
						}
					}}
				/>
				<div className="flex-1">
					<ProgressBar currentStep={Step.NoGos} />
				</div>
			</div>

			<div className="px-4 pt-8">
				<QuestionBubble>
					<h2 className="text-2xl font-bold text-white">
						{content["noGos.question"]}
					</h2>
				</QuestionBubble>
			</div>

			<div className="flex-1 flex flex-col items-center justify-center px-4 pt-6">
				<div
					key={current.id}
					className="w-full bg-gray-50 rounded-3xl p-8 flex flex-col items-center transition-all duration-200 ease-in-out opacity-100 scale-100"
				>
					<img
						src={current.illustration}
						alt=""
						className="w-40 h-40 object-contain mb-4"
					/>
					<h3 className="text-xl leading-6 font-semibold text-center mb-2">
						{current.title}
					</h3>
					<p className="text-base text-gray-500 text-center">
						{current.description}
					</p>
				</div>
			</div>

			<div className="flex gap-3 px-4 pb-8 pt-6">
				<button
					className="py-4 rounded-2xl text-lg leading-6 font-semibold text-orange-1000 flex items-center justify-center gap-2 transition-transform active:scale-[0.97] flex-1 bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
					onClick={() => handleAnswer("geht_nicht")}
				>
					<img src="/icons/close-black.svg" alt="" className="w-6 h-6" />
					{content["noGos.rejectLabel"]}
				</button>
				<button
					className="py-4 rounded-2xl text-lg leading-6 font-semibold text-orange-1000 flex items-center justify-center gap-2 transition-transform active:scale-[0.97] flex-1 bg-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
					onClick={() => handleAnswer("ist_okay")}
				>
					{content["noGos.acceptLabel"]}
					<img src="/icons/check-black.svg" alt="" className="w-6 h-6" />
				</button>
			</div>
		</div>
	);
}
