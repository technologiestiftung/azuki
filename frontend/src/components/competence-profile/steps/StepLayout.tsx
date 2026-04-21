import { type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProgressBar } from "../progress-bar/ProgressBar";
import { QuestionBubble } from "../question-bubble/QuestionBubble";
import { content } from "../../../content/de";
import { PrimaryButton } from "../../primitives/buttons/PrimaryButton";
import { GhostButton } from "../../primitives/buttons/GhostButton";
import { BackButton } from "../../back-button/BackButton";
import { pathnameToStep, getPreviousPath } from "../../../routing/routes";
import {
	type SkipConfirmDescriptionContentKey,
	type SkipConfirmTitleContentKey,
	SkipConfirmDialog,
	showSkipConfirmDialog,
} from "../../skip-confirm-dialog/SkipConfirmDialog";

interface StepLayoutProps {
	question: string;
	subtitle?: string;
	children: ReactNode;
	onNext?: () => void;
	onSkip?: () => void;
	onBack?: () => void;
	isNextDisabled?: boolean;
	hasSkipButton?: boolean;
	hasNextButton?: boolean;
	skipLabel?: string;
	bottomContent?: ReactNode;
	isSkipConfirmDialogOpen?: boolean;
	skipConfirmTitleKey?: SkipConfirmTitleContentKey;
	skipConfirmDescriptionKey?: SkipConfirmDescriptionContentKey;
	skipConfirmOnStay?: () => void;
}

export function StepLayout({
	question,
	subtitle,
	children,
	onNext,
	onSkip,
	onBack,
	isNextDisabled = false,
	hasSkipButton = false,
	hasNextButton = true,
	skipLabel,
	bottomContent,
	isSkipConfirmDialogOpen,
	skipConfirmTitleKey,
	skipConfirmDescriptionKey,
	skipConfirmOnStay,
}: StepLayoutProps) {
	const { pathname, hash } = useLocation();
	const navigate = useNavigate();
	const progressStep = pathnameToStep(pathname);

	const handleBack =
		onBack ?? (() => navigate(getPreviousPath(pathname, hash)));

	return (
		<div className="flex flex-col h-[100dvh] py-4">
			<div className="flex items-center gap-3 pb-1 shrink-0 px-4">
				<BackButton onClick={handleBack} />
				<div className="flex-1">
					<ProgressBar currentStep={progressStep} />
				</div>
			</div>
			<div className="flex flex-1 flex-col min-h-0">
				<div className="shrink-0 px-4">
					<QuestionBubble question={question} subtitle={subtitle} />
				</div>

				<div
					className={`flex-1 min-h-0 overflow-x-clip overflow-y-auto overscroll-y-contain overscroll-x-none touch-pan-y pt-8 px-4 ${hasSkipButton ? "pb-28" : "pb-20"}`}
				>
					{children}
				</div>
			</div>

			<div
				className={`fixed bottom-0 left-1/2 z-30 -translate-x-1/2 w-full bg-sky-white border-t-2 border-gray-200 flex flex-col px-4 gap-y-1 max-w-[430px] ${hasSkipButton ? "pt-4 pb-2" : "py-4"}`}
			>
				{bottomContent}
				{hasNextButton && (
					<PrimaryButton
						onClick={isSkipConfirmDialogOpen ? showSkipConfirmDialog : onNext}
						disabled={isNextDisabled}
						className="w-full"
					>
						{content["navigation.next"]}
					</PrimaryButton>
				)}

				{hasSkipButton && (
					<GhostButton
						onClick={isSkipConfirmDialogOpen ? showSkipConfirmDialog : onSkip}
					>
						{skipLabel || content["navigation.skip"]}
					</GhostButton>
				)}
				{isSkipConfirmDialogOpen && (
					<SkipConfirmDialog
						onSkip={onSkip}
						onStay={skipConfirmOnStay}
						titleKey={skipConfirmTitleKey}
						descriptionKey={skipConfirmDescriptionKey}
					/>
				)}
			</div>
		</div>
	);
}
