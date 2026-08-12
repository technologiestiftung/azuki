import type { ReactNode, RefObject } from "react";
import { GhostIconButton } from "../primitives/buttons/GhostIconButton";

interface ResultsPageHeaderCollapsedProps {
	title: ReactNode;
	titleSlotRef: RefObject<HTMLDivElement>;
	shareAriaLabel: string;
	downloadAriaLabel?: string;
	onDownload?: () => void;
	onShare: () => void;
	downloadDisabled?: boolean;
	shareDisabled?: boolean;
}

export const ResultsPageHeaderCollapsed = ({
	title,
	titleSlotRef,
	shareAriaLabel,
	downloadAriaLabel,
	onDownload,
	onShare,
	downloadDisabled = false,
	shareDisabled = false,
}: ResultsPageHeaderCollapsedProps) => {
	return (
		<div className="h-[60px] flex w-full items-center justify-between px-4 pt-3 pb-2 shrink-0 border-b border-sky-20 z-50">
			{/* Invisible slot for morph target; visible title lives in ResultsPageHeader */}
			<div
				ref={titleSlotRef}
				className="text-base font-semibold leading-6 text-sky-900 flex-1 text-left truncate pr-1.5 opacity-0"
				aria-hidden
			>
				{title}
			</div>
			<div className="flex gap-2 justify-end shrink-0">
				<div className="flex gap-1.5 items-center">
					{onDownload && (
						<GhostIconButton
							iconSrc="/icons/download.svg"
							iconSize="w-5 h-5"
							ariaLabel={downloadAriaLabel}
							onClick={onDownload}
							disabled={downloadDisabled}
						/>
					)}
					<GhostIconButton
						iconSrc="/icons/share.svg"
						iconSize="w-5 h-5"
						ariaLabel={shareAriaLabel}
						onClick={onShare}
						disabled={shareDisabled}
					/>
				</div>
			</div>
		</div>
	);
};
