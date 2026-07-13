import React from "react";
import { GhostIconButton } from "../primitives/buttons/GhostIconButton";
interface ResultsPageHeaderCollapsedProps {
	title: string | React.ReactNode;
	shareAriaLabel: string;
	downloadAriaLabel: string;
}

export const ResultsPageHeaderCollapsed = ({
	title,
	shareAriaLabel,
	downloadAriaLabel,
}: ResultsPageHeaderCollapsedProps) => {
	return (
		<div className="h-[60px] flex w-full items-center justify-between px-4 pt-3 pb-2 shrink-0 border-b border-sky-20 z-50">
			<h1 className="text-base font-semibold text-sky-900 text-left pr-1.5">
				{title}
			</h1>
			<div className="flex gap-2 justify-end">
				<div className="flex gap-1.5 items-center">
					<GhostIconButton
						iconSrc="/icons/share.svg"
						ariaLabel={shareAriaLabel}
					/>
					<GhostIconButton
						iconSrc="/icons/download.svg"
						ariaLabel={downloadAriaLabel}
					/>
				</div>
			</div>
		</div>
	);
};
