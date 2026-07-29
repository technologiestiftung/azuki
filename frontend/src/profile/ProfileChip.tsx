import type { ReactNode } from "react";

const VARIANT_CLASS = {
	default: "border-sky-200 bg-sky-0",
	noGo: "border-orange-200 bg-orange-0",
} as const;

interface ProfileChipProps {
	children: ReactNode;
	variant?: keyof typeof VARIANT_CLASS;
	className?: string;
}

export function ProfileChip({
	children,
	variant = "default",
	className = "",
}: ProfileChipProps) {
	return (
		<div
			className={`min-h-9 flex min-w-0 max-w-full shrink-0 items-center px-[14px] py-1 rounded-[100px] border-2 text-lg text-sky-900 box-border ${VARIANT_CLASS[variant]} ${className}`}
		>
			{children}
		</div>
	);
}
