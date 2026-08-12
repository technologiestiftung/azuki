import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { formatOccupationDisplayName } from "@azuki/shared";
import { content } from "../../../content";
import { useVacancyDetail } from "./useVacancyDetail";
import { VacancyDetailHero } from "./VacancyDetailHero";
import { VacancyDetailHeaderCollapsed } from "./VacancyDetailHeaderCollapsed";
import { VacancyDetailBody } from "./VacancyDetailBody";
import { useOccupationDetailScroll } from "../occupation-detail/useOccupationDetailScroll";
import type { VacancyDetailNavState } from "./vacancyDetailNavState";

export function VacanciesDetailPage() {
	const referenznummer = decodeURIComponent(useParams().refnr ?? "");
	const { preview, detail, loading, error, isFavorite, toggleFavorite } =
		useVacancyDetail(referenznummer);
	const navState = useLocation().state as VacancyDetailNavState | null;

	const { onScroll, collapseProgress, overlayOpacity, heroControlsOpacity } =
		useOccupationDetailScroll();

	const displayName = formatOccupationDisplayName(
		navState?.occupationName ?? detail?.occupationName ?? "",
	);

	useEffect(() => {
		if (!displayName) {
			return undefined;
		}
		const previousTitle = document.title;
		document.title = displayName;
		return () => {
			document.title = previousTitle;
		};
	}, [displayName]);

	const statusMessage =
		error ?? (loading && !detail ? content["vacancies.detail.loading"] : null);

	return (
		<div className="flex flex-col h-full relative overflow-x-hidden">
			<div
				className="absolute top-0 inset-x-0 z-30 bg-white transition-opacity duration-150"
				style={{
					opacity: collapseProgress,
					pointerEvents: collapseProgress < 0.5 ? "none" : "auto",
				}}
				aria-hidden={collapseProgress < 0.5}
			>
				<VacancyDetailHeaderCollapsed
					displayName={displayName}
					isFavorite={isFavorite}
					onToggleFavorite={toggleFavorite}
				/>
			</div>
			<div
				className="relative flex-1 overflow-y-auto overflow-x-hidden"
				onScroll={onScroll}
			>
				<div className="sticky top-0 z-0">
					<VacancyDetailHero
						isFavorite={isFavorite}
						onToggleFavorite={toggleFavorite}
						overlayOpacity={overlayOpacity}
						controlsOpacity={heroControlsOpacity}
					/>
				</div>
				<div className="relative -mt-4 flex flex-col gap-8 bg-sky-white rounded-t-[20px] pb-8 z-10">
					<div className="flex flex-col gap-1 px-[18px] pt-4">
						<h1 className="text-3xl font-semibold text-sky-900">
							{displayName}
						</h1>
						{(detail?.employer ?? preview?.employer) && (
							<p className="text-lg text-sky-shade-110">
								{detail?.employer ?? preview?.employer}
							</p>
						)}
					</div>
					{statusMessage ? (
						<p className="px-[18px] text-lg text-sky-900">{statusMessage}</p>
					) : (
						detail && <VacancyDetailBody detail={detail} />
					)}
				</div>
			</div>
		</div>
	);
}
