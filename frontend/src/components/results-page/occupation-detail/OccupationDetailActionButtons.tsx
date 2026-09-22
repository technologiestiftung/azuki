import { content } from "../../../content";
import { GhostIconButton } from "../../primitives/buttons/GhostIconButton";

interface OccupationDetailActionButtonsProps {
	onDownload: () => void;
	onShare: () => void;
	onToggleFavorite: () => void;
	isFavorite: boolean;
	downloadDisabled?: boolean;
	showDownload?: boolean;
	buttonClassName?: string;
	tabIndex?: number;
}

export function OccupationDetailActionButtons({
	onDownload,
	onShare,
	onToggleFavorite,
	isFavorite,
	downloadDisabled = false,
	showDownload = true,
	buttonClassName,
	tabIndex,
}: OccupationDetailActionButtonsProps) {
	return (
		<div className="flex items-center gap-1.5">
			{showDownload && (
				<GhostIconButton
					iconSrc="/icons/download.svg"
					onClick={onDownload}
					disabled={downloadDisabled}
					ariaLabel={content["results.detail.download.ariaLabel"]}
					title={content["results.download"]}
					iconSize="w-5 h-5"
					className={buttonClassName}
					tabIndex={tabIndex}
				/>
			)}
			<GhostIconButton
				iconSrc="/icons/share.svg"
				onClick={onShare}
				ariaLabel={content["results.share"]}
				title={content["results.share"]}
				iconSize="w-5 h-5"
				className={buttonClassName}
				tabIndex={tabIndex}
			/>
			<button
				type="button"
				className={`inline-flex h-10 w-10 items-center justify-center p-2 ${buttonClassName ?? ""}`}
				onClick={onToggleFavorite}
				aria-pressed={isFavorite}
				aria-label={
					isFavorite
						? content["results.favorite.remove"]
						: content["results.favorite.add"]
				}
				tabIndex={tabIndex}
			>
				<img
					src="/icons/favorite-star.svg"
					alt=""
					className={`w-5 h-5 ${isFavorite ? "hidden" : "block"}`}
				/>
				<img
					src="/icons/favorite-star-filled.svg"
					alt=""
					className={`w-5 h-5 ${isFavorite ? "block" : "hidden"}`}
				/>
			</button>
		</div>
	);
}
