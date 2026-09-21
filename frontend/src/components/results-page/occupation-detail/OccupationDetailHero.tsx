import { content } from "../../../content";
import { GhostIconButton } from "../../primitives/buttons/GhostIconButton";
import { OccupationDetailActionButtons } from "./OccupationDetailActionButtons";

interface OccupationDetailHeroProps {
	displayName: string;
	heroImage: string | undefined;
	isFavorite: boolean;
	onToggleFavorite: () => void;
	onShare: () => void;
	onBack: () => void;
	onDownload: () => void;
	downloadDisabled: boolean;
	overlayOpacity: number;
	controlsOpacity: number;
	imageParallaxY: number;
}

export function OccupationDetailHero({
	displayName,
	heroImage,
	isFavorite,
	onToggleFavorite,
	onShare,
	onBack,
	onDownload,
	downloadDisabled,
	overlayOpacity,
	controlsOpacity,
	imageParallaxY,
}: OccupationDetailHeroProps) {
	return (
		<div className="relative h-[260px] shrink-0 overflow-hidden">
			<img
				src={heroImage ?? "/illustrations/occupation-placeholder.svg"}
				alt={displayName}
				className="absolute inset-0 w-full h-full object-cover will-change-transform"
				style={{
					transform: `translate3d(0, ${-imageParallaxY}px, 0) scale(${1 + imageParallaxY * 0.003})`,
				}}
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
					onClick={onBack}
					ariaLabel={content["navigation.back"]}
					title={content["navigation.back"]}
					iconSize="w-5 h-5"
					className="bg-sky-shade-10/50 rounded-xl backdrop-blur-[4.5px]"
				/>
				<OccupationDetailActionButtons
					onDownload={onDownload}
					onShare={onShare}
					onToggleFavorite={onToggleFavorite}
					isFavorite={isFavorite}
					downloadDisabled={downloadDisabled}
					buttonClassName="bg-sky-shade-10/50 rounded-xl backdrop-blur-[4.5px]"
				/>
			</div>
		</div>
	);
}
