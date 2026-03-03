import { type ReactNode } from "react";
import { ProgressBar } from "../progress-bar/ProgressBar";
import { QuestionBubble } from "../question-bubble/QuestionBubble";
import { useAppStore } from "../../../store/useAppStore";
import { content } from "../../../content/de";
import { type Step } from "../../../common";
import { PrimaryButton } from "../../primitives/buttons/PrimaryButton";
import { SecondaryButton } from "../../primitives/buttons/SecondaryButton";
import { BackButton } from "../../back-button/BackButton";

interface StepLayoutProps {
	question: string;
	subtitle?: string;
	children: ReactNode;
	onNext?: () => void;
	onSkip?: () => void;
	nextDisabled?: boolean;
	showSkip?: boolean;
	showNext?: boolean;
	currentStep: Step;
}

export function StepLayout({
	question,
	subtitle,
	children,
	onNext,
	onSkip,
	nextDisabled = false,
	showSkip = true,
	showNext = true,
	currentStep,
}: StepLayoutProps) {
	const prevStep = useAppStore((state) => state.prevStep);

	return (
		<div className="flex flex-col min-h-[100dvh]">
			<div className="flex items-center gap-3 px-4 pt-2 pb-1">
				<BackButton onClick={prevStep} />
				<div className="flex-1">
					<ProgressBar currentStep={currentStep} />
				</div>
			</div>

			<div className="px-4 pt-8">
				<QuestionBubble>
					<h2 className="text-2xl font-bold text-white">{question}</h2>
					{subtitle && (
						<p className="text-base text-white/80 mt-1">{subtitle}</p>
					)}
				</QuestionBubble>
			</div>

			<div className="flex-1 px-4 pt-6 pb-4 overflow-y-auto">{children}</div>

			<div className="flex flex-col px-4 pb-6 pt-2 space-y-2 justify-center">
				{showNext && (
					<PrimaryButton
						onClick={onNext}
						disabled={nextDisabled}
						className="w-full"
					>
						{content["navigation.next"]}
					</PrimaryButton>
				)}
				{showSkip && onSkip && (
					<SecondaryButton onClick={onSkip}>
						{content["navigation.skip"]}
					</SecondaryButton>
				)}
			</div>
		</div>
	);
}
