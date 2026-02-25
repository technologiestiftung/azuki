import { type ReactNode } from "react";

interface QuestionBubbleProps {
	children: ReactNode;
}

export function QuestionBubble({ children }: QuestionBubbleProps) {
	return (
		<div className="relative">
			<div className="absolute -top-8 left-1">
				<svg width="40" height="28" viewBox="0 0 40 28" fill="none">
					<ellipse cx="12" cy="18" rx="5" ry="6" fill="#010c13" />
					<ellipse cx="28" cy="18" rx="5" ry="6" fill="#010c13" />
					<ellipse cx="12" cy="16" rx="3.5" ry="4" fill="#fff" />
					<ellipse cx="28" cy="16" rx="3.5" ry="4" fill="#fff" />
					<ellipse cx="13" cy="17" rx="2" ry="2.5" fill="#010c13" />
					<ellipse cx="29" cy="17" rx="2" ry="2.5" fill="#010c13" />
					<path d="M8 4 L20 0 L32 4" stroke="var(--theme-primary-filled)" strokeWidth="3" fill="none" />
				</svg>
			</div>
			<div
				className="rounded-3xl px-5 py-5 mt-2"
				style={{ background: "var(--theme-primary-filled)" }}
			>
				{children}
			</div>
		</div>
	);
}
