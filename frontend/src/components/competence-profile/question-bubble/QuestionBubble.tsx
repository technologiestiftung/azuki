import { type ReactNode } from "react";

interface QuestionBubbleProps {
	children: ReactNode;
}

export function QuestionBubble({ children }: QuestionBubbleProps) {
	return (
		<div className="w-full pt-[38px] bg-gradient-to-b from-sky-white from-50% to-transparent">
			<div className="relative w-full">
				<div className="relative w-full">
					<div className="absolute -top-[35px] left-1.5">
						<div className="relative">
							<img
								src="/illustrations/question-bubble-star.svg"
								alt="Question Bubble"
								className="relative"
							/>
							<img
								src="/illustrations/eyes.svg"
								alt="Question Bubble"
								className="absolute top-[22px] left-6 z-10"
							/>
						</div>
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
