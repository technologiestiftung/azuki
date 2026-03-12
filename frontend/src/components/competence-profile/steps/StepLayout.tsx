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
	onBack?: () => void;
	nextDisabled?: boolean;
	hasSkipButton?: boolean;
	hasNextButton?: boolean;
	currentStep: Step;
	skipLabel?: string;
	bottomContent?: ReactNode;
}

export function StepLayout({
	question,
	subtitle,
	children,
	onNext,
	onSkip,
	onBack,
	nextDisabled = false,
	hasSkipButton = true,
	hasNextButton = true,
	currentStep,
	skipLabel,
	bottomContent,
}: StepLayoutProps) {
	const prevStep = useAppStore((state) => state.prevStep);

	return (
		<div className="flex flex-col h-[100dvh] p-4">
			<div className="flex items-center gap-3 pb-1 shrink-0">
				<BackButton onClick={onBack ?? prevStep} />
				<div className="flex-1">
					<ProgressBar currentStep={currentStep} />
				</div>
			</div>
			<div className="flex flex-1 flex-col gap-8 min-h-0">
				<div className="shrink-0">
					<QuestionBubble>
						<h2 className="text-3xl font-bold text-sky-1000">{question}</h2>
						{subtitle && (
							<p className="text-base text-white/80 mt-1">{subtitle}</p>
						)}
					</QuestionBubble>
				</div>

				<div className="flex-1 overflow-y-auto min-h-0 pt-0.5 px-0.5 pb-32">
					{children}
				</div>
			</div>

			<div
				className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-white border-t-2 border-gray-200 flex flex-col px-4 gap-y-2 max-w-[430px] ${hasSkipButton ? "pt-4 pb-2" : "py-4"}`}
			>
				{bottomContent}
				{hasNextButton && (
					<PrimaryButton
						onClick={onNext}
						disabled={nextDisabled}
						className="w-full"
					>
						{content["navigation.next"]}
					</PrimaryButton>
				)}

				{hasSkipButton && onSkip && (
					<SecondaryButton onClick={onSkip}>
						{skipLabel || content["navigation.skip"]}
					</SecondaryButton>
				)}
			</div>
		</div>
	);
}
