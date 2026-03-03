import { type ReactNode } from "react";

interface QuestionBubbleProps {
	children: ReactNode;
}

export function QuestionBubble({ children }: QuestionBubbleProps) {
	return (
		<div className="relative">
			<div className="absolute -top-10 left-1">
				<img
					src="/illustrations/question-bubble-star.svg"
					alt="Question Bubble"
				/>
			</div>
			<div className="bg-sky-300 rounded-3xl px-5 py-5 mt-2">{children}</div>
		</div>
	);
}
