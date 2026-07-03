import { content } from "../../../content";
import { GhostIconButton } from "../../primitives/buttons/GhostIconButton";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../routing/routes";

interface OccupationDetailHeaderCollapsedProps {
	displayName: string;
	isFavorite: boolean;
	onToggleFavorite: () => void;
	onShare: () => void;
}

export function OccupationDetailHeaderCollapsed({
	displayName,
	isFavorite,
	onToggleFavorite,
	onShare,
}: OccupationDetailHeaderCollapsedProps) {
	const navigate = useNavigate();
	return (
		<div className="flex w-full items-center justify-between px-4 pt-3 pb-2 shrink-0 border-b border-sky-20">
			<GhostIconButton
				iconSrc="/icons/arrow-back-black.svg"
				onClick={() => navigate(ROUTE_PATHS.resultsList)}
				ariaLabel={content["navigation.back"]}
				title={content["navigation.back"]}
				iconSize="w-5 h-5"
			/>
			<h1 className="text-sm font-semibold text-gray-900 flex-1 text-center truncate">
				{displayName}
			</h1>
			<div className="flex items-center">
				<GhostIconButton
					iconSrc="/icons/share.svg"
					onClick={onShare}
					ariaLabel={content["results.share.ariaLabel"]}
					title={content["results.share"]}
					iconSize="w-5 h-5"
				/>
				<button
					type="button"
					className="inline-flex h-10 w-10 items-center justify-center p-2"
					onClick={onToggleFavorite}
					aria-pressed={isFavorite}
					aria-label={
						isFavorite
							? content["results.favorite.remove"]
							: content["results.favorite.add"]
					}
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
		</div>
	);
}
