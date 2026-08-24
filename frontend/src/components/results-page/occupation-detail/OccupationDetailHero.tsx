interface OccupationDetailHeroProps {
	displayName: string;
	heroImage: string | undefined;
	overlayOpacity: number;
	imageParallaxY: number;
}

export function OccupationDetailHero({
	displayName,
	heroImage,
	overlayOpacity,
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
		</div>
	);
}
