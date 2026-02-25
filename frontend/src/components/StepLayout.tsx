import { type ReactNode } from "react";
import { ProgressBar } from "./ProgressBar";
import { QuestionBubble } from "./QuestionBubble";
import { useAppState, useAppDispatch } from "../context/AppContext";
import { content } from "../content/de";
import { type Step } from "../types";

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
	const dispatch = useAppDispatch();

	return (
		<div className="flex flex-col min-h-[100dvh]">
			<div className="flex items-center gap-3 px-4 pt-4">
				<button
					onClick={() => dispatch({ type: "PREV_STEP" })}
					className="w-10 h-10 flex items-center justify-center rounded-full"
					aria-label={content.navigation.back}
				>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M19 12H5M12 19l-7-7 7-7" />
					</svg>
				</button>
				<div className="flex-1">
					<ProgressBar currentStep={currentStep} />
				</div>
			</div>

			<div className="px-4 pt-6">
				<QuestionBubble>
					<h2 className="text-h3 font-bold text-white">{question}</h2>
					{subtitle && (
						<p className="text-body text-white/80 mt-1">{subtitle}</p>
					)}
				</QuestionBubble>
			</div>

			<div className="flex-1 px-4 pt-6 pb-4 overflow-y-auto">
				{children}
			</div>

			<div className="px-4 pb-6 pt-2 space-y-2">
				{showNext && (
					<button
						onClick={onNext}
						disabled={nextDisabled}
						className="w-full py-4 rounded-2xl text-subhead font-semibold transition-colors"
						style={{
							backgroundColor: nextDisabled
								? "var(--btn-fill-disabled)"
								: "var(--theme-primary-filled)",
							color: nextDisabled
								? "var(--btn-on-disabled)"
								: "var(--theme-on-primary)",
						}}
					>
						{content.navigation.next}
					</button>
				)}
				{showSkip && onSkip && (
					<button
						onClick={onSkip}
						className="w-full py-3 text-body text-gray-500 font-medium"
					>
						{content.navigation.skip}
					</button>
				)}
			</div>
		</div>
	);
}
