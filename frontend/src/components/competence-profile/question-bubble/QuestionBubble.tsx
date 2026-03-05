import { type ReactNode } from "react";

interface QuestionBubbleProps {
	children: ReactNode;
}

export function QuestionBubble({ children }: QuestionBubbleProps) {
	return (
		<div className="w-full pt-[38px]">
			<div className="relative w-full">
				<div className="relative w-full">
					<div className="absolute -top-[38px] left-0">
						<img
							src="/illustrations/question-bubble-star.svg"
							alt="Question Bubble"
						/>
					</div>
					<img
						src="/illustrations/question-bubble-outline.svg"
						alt="Question Bubble"
						className="absolute inset-0 h-full w-full"
					/>
					<div className="relative flex items-center p-3">{children}</div>
				</div>
			</div>
		</div>
	);
}
