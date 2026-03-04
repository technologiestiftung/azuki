import { type ReactNode } from "react";

interface QuestionBubbleProps {
	children: ReactNode;
}

export function QuestionBubble({ children }: QuestionBubbleProps) {
	return (
		<div className="pt-10">
			<div className="relative">
				<div className="absolute -top-10 left-1">
					<img
						src="/illustrations/question-bubble-star.svg"
						alt="Question Bubble"
					/>
				</div>
				<div className="bg-sky-300 rounded-xl p-3">{children}</div>
			</div>
		</div>
	);
}
