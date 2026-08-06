import type { CSSProperties, ReactNode } from "react";

const VARIANT_CLASS = {
	default: "border-sky-200 bg-sky-0",
	noGo: "border-orange-200 bg-orange-0",
} as const;

interface ProfileChipProps {
	children: ReactNode;
	variant?: keyof typeof VARIANT_CLASS;
	className?: string;
	style?: CSSProperties;
	/** When true, chip may shrink and truncate to fit a measured max width. */
	constrained?: boolean;
}

export function ProfileChip({
	children,
	variant = "default",
	className = "",
	style,
	constrained = false,
}: ProfileChipProps) {
	const content =
		typeof children === "string" || typeof children === "number" ? (
			<span className={constrained ? "min-w-0 truncate" : "min-w-0"}>
				{children}
			</span>
		) : (
			children
		);

	return (
		<div
			className={`min-h-9 flex min-w-0 max-w-full shrink-0 items-center px-[14px] py-1 rounded-[100px] border-2 text-lg text-sky-900 box-border ${
				constrained
					? "shrink overflow-hidden [&_[data-chip-label]]:min-w-0 [&_[data-chip-label]]:truncate"
					: ""
			} ${VARIANT_CLASS[variant]} ${className}`}
			style={style}
		>
			{content}
		</div>
	);
}
