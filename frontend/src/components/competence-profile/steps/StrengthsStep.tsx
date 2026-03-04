import { content } from "../../../content/de";
import { useAppStore } from "../../../store/useAppStore";
import { Step } from "../../../common";
import { ProgressBar } from "../progress-bar/ProgressBar";
import { QuestionBubble } from "../question-bubble/QuestionBubble";
import { PrimaryButton } from "../../primitives/buttons/PrimaryButton";
import { SecondaryButton } from "../../primitives/buttons/SecondaryButton";
import { BackButton } from "../../back-button/BackButton";

const SLIDER_STOPS = [0, 0.25, 0.5, 0.75, 1];

export function StrengthsStep() {
	const profile = useAppStore((state) => state.profile);
	const strengthSubIndex = useAppStore((state) => state.strengthSubIndex);
	const setStrength = useAppStore((state) => state.setStrength);
	const setStrengthSubIndex = useAppStore((state) => state.setStrengthSubIndex);
	const nextStep = useAppStore((state) => state.nextStep);
	const prevStep = useAppStore((state) => state.prevStep);
	const cards = content["strengths.cards"];
	const current = cards[strengthSubIndex];
	const currentValue = profile.strengths[current.id] ?? 0.5;

	function handleSliderChange(value: number) {
		setStrength(current.id, value);
	}

	function handleNext() {
		if (strengthSubIndex < cards.length - 1) {
			setStrengthSubIndex(strengthSubIndex + 1);
		} else {
			nextStep();
		}
	}

	function handleSkip() {
		nextStep();
	}

	return (
		<div className="flex flex-col min-h-[100dvh]">
			<div className="flex items-center gap-3 px-4 pt-2 pb-1">
				<BackButton
					onClick={() => {
						if (strengthSubIndex > 0) {
							setStrengthSubIndex(strengthSubIndex - 1);
						} else {
							prevStep();
						}
					}}
				/>
				<div className="flex-1">
					<ProgressBar currentStep={Step.Strengths} />
				</div>
			</div>

			<div className="px-4 pt-8">
				<QuestionBubble>
					<h2 className="text-2xl font-bold text-white">
						{content["strengths.question"]}
					</h2>
				</QuestionBubble>
			</div>

			<div className="flex-1 flex flex-col items-center justify-center px-4 pt-6">
				<div
					key={current.id}
					className="w-full bg-gray-50 rounded-3xl p-6 flex flex-col items-center animate-slideIn"
				>
					<img
						src={current.illustration}
						alt=""
						className="w-32 h-32 object-contain mb-4"
					/>
					<h3 className="text-xl leading-6 font-semibold mb-1">
						{current.title}
					</h3>
					<p className="text-base text-gray-500 text-center">
						{current.description}
					</p>
				</div>

				<div className="w-full mt-6">
					<div className="flex justify-between text-sm text-gray-500 mb-3">
						<span>{content["strengths.sliderMin"]}</span>
						<span>{content["strengths.sliderMax"]}</span>
					</div>
					<div className="flex justify-between gap-2">
						{SLIDER_STOPS.map((stop) => (
							<button
								key={stop}
								onClick={() => handleSliderChange(stop)}
								className={`flex-1 h-12 rounded-xl border-2 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
									currentValue === stop
										? "border-sky-300 bg-sky-300"
										: "border-gray-200 bg-white"
								}`}
							/>
						))}
					</div>
				</div>
			</div>

			<div className="flex flex-col justify-center px-4 pb-6 pt-4 space-y-2">
				<PrimaryButton onClick={handleNext} className="w-full">
					{content["navigation.next"]}
				</PrimaryButton>
				<SecondaryButton onClick={handleSkip}>
					{content["navigation.skip"]}
				</SecondaryButton>
			</div>
		</div>
	);
}
