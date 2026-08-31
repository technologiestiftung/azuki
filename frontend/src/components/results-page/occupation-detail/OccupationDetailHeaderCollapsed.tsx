import { content } from "../../../content";
import { GhostIconButton } from "../../primitives/buttons/GhostIconButton";
import { OccupationDetailActionButtons } from "./OccupationDetailActionButtons";

interface OccupationDetailHeaderCollapsedProps {
	title: string;
	isFavorite: boolean;
	onToggleFavorite: () => void;
	onShare: () => void;
	onBack: () => void;
	onDownload: () => void;
	downloadDisabled: boolean;
	titleOpacity?: number;
}

export function OccupationDetailHeaderCollapsed({
	title,
	isFavorite,
	onToggleFavorite,
	onShare,
	onBack,
	onDownload,
	downloadDisabled,
	titleOpacity = 1,
}: OccupationDetailHeaderCollapsedProps) {
	return (
		<div className="flex w-full items-center justify-between px-4 pt-3 pb-2 shrink-0 border-b border-sky-shade-20">
			<GhostIconButton
				iconSrc="/icons/arrow-back-black.svg"
				onClick={onBack}
				ariaLabel={content["navigation.back"]}
				title={content["navigation.back"]}
				iconSize="w-5 h-5"
			/>
			<h1
				className="text-sm font-semibold text-sky-900 flex-1 text-center truncate transition-opacity duration-150 ease-[cubic-bezier(0.25,0,0.25,1)]"
				style={{ opacity: titleOpacity }}
				aria-hidden={titleOpacity < 0.5}
			>
				{title}
			</h1>
			<OccupationDetailActionButtons
				onDownload={onDownload}
				onShare={onShare}
				onToggleFavorite={onToggleFavorite}
				isFavorite={isFavorite}
				downloadDisabled={downloadDisabled}
			/>
		</div>
	);
}
