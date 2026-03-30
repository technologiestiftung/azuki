import { type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProgressBar } from "../progress-bar/ProgressBar";
import { QuestionBubble } from "../question-bubble/QuestionBubble";
import { content } from "../../../content/de";
import { PrimaryButton } from "../../primitives/buttons/PrimaryButton";
import { GhostButton } from "../../primitives/buttons/GhostButton";
import { BackButton } from "../../back-button/BackButton";
import { pathnameToStep, getPreviousPath } from "../../../routing/routes";

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
	skipLabel,
	bottomContent,
}: StepLayoutProps) {
	const { pathname, hash } = useLocation();
	const navigate = useNavigate();
	const progressStep = pathnameToStep(pathname);

	const handleBack =
		onBack ?? (() => navigate(getPreviousPath(pathname, hash)));

	return (
		<div className="flex flex-col h-[100dvh] p-4">
			<div className="flex items-center gap-3 pb-1 shrink-0">
				<BackButton onClick={handleBack} />
				<div className="flex-1">
					<ProgressBar currentStep={progressStep} />
				</div>
			</div>
			<div className="flex flex-1 flex-col min-h-0">
				<div className="shrink-0">
					<QuestionBubble question={question} subtitle={subtitle} />
				</div>

				<div className="flex-1 overflow-y-auto min-h-0 pt-8 px-0.5 pb-32">
					{children}
				</div>
			</div>

			<div
				className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-sky-white border-t-2 border-gray-200 flex flex-col px-4 gap-y-2 max-w-[430px] ${hasSkipButton ? "pt-4 pb-2" : "py-4"}`}
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
					<GhostButton onClick={onSkip}>
						{skipLabel || content["navigation.skip"]}
					</GhostButton>
				)}
			</div>
		</div>
	);
}
