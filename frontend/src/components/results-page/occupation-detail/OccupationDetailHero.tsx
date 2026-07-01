import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../routing/routes";
import { content } from "../../../content";
import { GhostIconButton } from "../../primitives/buttons/GhostIconButton";

interface OccupationDetailHeroProps {
	displayName: string;
	heroImage: string | undefined;
	isFavorite: boolean;
	onToggleFavorite: () => void;
	overlayOpacity: number;
	controlsOpacity: number;
}

export function OccupationDetailHero({
	displayName,
	heroImage,
	isFavorite,
	onToggleFavorite,
	overlayOpacity,
	controlsOpacity,
}: OccupationDetailHeroProps) {
	const navigate = useNavigate();
	return (
		<div className="relative h-[260px] shrink-0 overflow-hidden">
			<img
				src={heroImage ?? "/illustrations/occupation-placeholder.svg"}
				alt={displayName}
				className="w-full h-full object-cover"
			/>
			<div
				className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-150"
				style={{ opacity: overlayOpacity }}
				aria-hidden
			/>
			<div
				className="absolute inset-x-4 top-3 z-[1] flex items-center justify-between transition-opacity duration-150"
				style={{
					opacity: controlsOpacity,
					pointerEvents: controlsOpacity < 0.5 ? "none" : "auto",
				}}
			>
				<GhostIconButton
					iconSrc="/icons/arrow-back-black.svg"
					onClick={() => navigate(ROUTE_PATHS.resultsList)}
					ariaLabel={content["navigation.back"]}
					title={content["navigation.back"]}
					className="bg-[#F2F4F580]/50  rounded-xl backdrop-blur-[4.5px]"
				/>

				<div className="flex gap-1.5 items-center">
					<GhostIconButton
						iconSrc="/icons/share.svg"
						onClick={() => {}}
						ariaLabel={content["results.share"]}
						title={content["results.share"]}
						className="bg-[#F2F4F580]/50 rounded-xl backdrop-blur-[4.5px]"
					/>
					<button
						type="button"
						className="flex items-center justify-center z-10 w-10 h-10 bg-[#F2F4F580]/50 rounded-xl backdrop-blur-[4.5px]"
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
							className={isFavorite ? "hidden" : "block w-5 h-5"}
						/>
						<img
							src="/icons/favorite-star-filled.svg"
							alt=""
							className={isFavorite ? "block  w-5 h-5" : "hidden"}
						/>
					</button>
				</div>
			</div>
		</div>
	);
}
