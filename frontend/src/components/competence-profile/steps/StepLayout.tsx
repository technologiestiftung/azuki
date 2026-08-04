import { type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProgressBar } from "../progress-bar/ProgressBar";
import { QuestionBubble } from "../question-bubble/QuestionBubble";
import { content } from "../../../content";
import { PrimaryButton } from "../../primitives/buttons/PrimaryButton";
import { GhostButton } from "../../primitives/buttons/GhostButton";
import { BackButton } from "../../back-button/BackButton";
import {
	getGranularProgress,
	getPreviousPath,
} from "../../../routing/routes";
import { Toast } from "../../primitives/toast/Toast";
import { useToastStore } from "../../../store/useToastStore";

function closeToast() {
	useToastStore.getState().close();
}
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
}: StepLayoutProps) {
	const { pathname, hash } = useLocation();
	const navigate = useNavigate();
	const progress = getGranularProgress(pathname, hash);

	const handleBack = () => {
		closeToast();
		if (onBack) {
			onBack();
			return;
		}
		navigate(getPreviousPath(pathname, hash));
	};

	const handleSkip = () => {
		closeToast();
		onSkip?.();
	};

	return (
		<div className="relative flex flex-col h-[100dvh] py-4">
			<Toast />
			<div className="flex items-center gap-3 pb-1 shrink-0 px-4">
				<BackButton onClick={handleBack} />
				<div className="flex-1">
					<ProgressBar progress={progress} />
				</div>
			</div>
			<div className="flex flex-1 flex-col min-h-0">
				<div className="shrink-0 px-4">
					<QuestionBubble question={question} subtitle={subtitle} />
				</div>

				<div
					className={`flex flex-1 flex-col min-h-0 overflow-x-clip overflow-y-auto overscroll-y-contain overscroll-x-none touch-pan-y pt-8 px-4 ${hasSkipButton ? "pb-[110px]" : "pb-20"}`}
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
						onClick={onNext}
						disabled={isNextDisabled}
						className="w-full"
					>
						{content["navigation.next"]}
					</PrimaryButton>
				)}

				{hasSkipButton && (
					<GhostButton onClick={handleSkip}>
						{skipLabel || content["navigation.skip"]}
					</GhostButton>
				)}
			</div>
		</div>
	);
}
