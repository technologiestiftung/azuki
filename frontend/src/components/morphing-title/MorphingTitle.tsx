import type { CSSProperties, ReactNode } from "react";

interface MorphingTitleProps {
	isMorphing: boolean;
	style?: CSSProperties;
	className?: string;
	children: ReactNode;
}

/** Fixed overlay title used while morphing between hero and collapsed header slots. */
export function MorphingTitle({
	isMorphing,
	style,
	className = "",
	children,
}: MorphingTitleProps) {
	if (!isMorphing) {
		return null;
	}

	return (
		<h1
			className={`font-semibold text-left truncate will-change-[left,top,width,font-size] ${className}`}
			style={style}
		>
			{children}
		</h1>
	);
}
