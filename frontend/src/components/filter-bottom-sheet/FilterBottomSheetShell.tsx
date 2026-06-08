import { type ReactNode } from "react";
import { GhostIconButton } from "../primitives/buttons/GhostIconButton";
import { BottomSheet } from "../primitives/bottom-sheet/BottomSheet";
import { PrimaryButton } from "../primitives/buttons/PrimaryButton";
import { content } from "../../content";

export interface FilterBottomSheetShellProps {
	open: boolean;
	onClose: () => void;
	title: string;
	ariaLabel: string;
	onReset: () => void;
	onApply: () => void;
	children: ReactNode;
}

export function FilterBottomSheetShell({
	open,
	onClose,
	title,
	ariaLabel,
	onReset,
	onApply,
	children,
}: FilterBottomSheetShellProps) {
	return (
		<BottomSheet
			open={open}
			onClose={onClose}
			ariaLabel={ariaLabel}
			overlayDismissLabel={content["results.filter.dismissOverlay"]}
			footer={
				<PrimaryButton
					onClick={onApply}
					ariaLabel={content["results.filter.apply"]}
					title={content["results.filter.apply"]}
					className="min-w-0 flex-1"
				>
					{content["results.filter.apply"]}
				</PrimaryButton>
			}
		>
			<div className="relative flex items-center justify-between py-2 px-4">
				<GhostIconButton
					className="relative z-10"
					onClick={onClose}
					ariaLabel={content["navigation.back"]}
					iconSrc="/icons/arrow-back-black.svg"
				/>

				<h2 className="pointer-events-none absolute inset-x-4 text-center text-lg font-semibold text-gray-900">
					{title}
				</h2>

				<button
					type="button"
					onClick={onReset}
					aria-label={content["results.filter.reset"]}
					title={content["results.filter.reset"]}
					className="relative z-10 shrink-0 px-4 text-base font-medium text-gray-400 transition-colors rounded-2xl h-12 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 md:hover:bg-gray-200 md:hover:text-gray-800 active:bg-gray-200 active:text-gray-800"
				>
					{content["results.filter.reset"]}
				</button>
			</div>

			{children}
		</BottomSheet>
	);
}
