import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { formatOccupationDisplayName } from "@azuki/shared";
import { content } from "../../../content";
import { useVacancyDetail } from "./useVacancyDetail";
import { VacancyDetailHero } from "./VacancyDetailHero";
import { VacancyDetailHeaderCollapsed } from "./VacancyDetailHeaderCollapsed";
import { VacancyDetailBody } from "./VacancyDetailBody";
import {
	useOccupationDetailScroll,
	COLLAPSE_END,
} from "../occupation-detail/useOccupationDetailScroll";
import type { VacancyDetailNavState } from "./vacancyDetailNavState";
import { GhostIconButton } from "../../primitives/buttons/GhostIconButton";
import { ROUTE_PATHS } from "../../../routing/routes";

const TITLE_REVEAL_RANGE = 40;

export function VacanciesDetailPage() {
	const navigate = useNavigate();
	const referenznummer = decodeURIComponent(useParams().refnr ?? "");
	const { detail, preview, loading, error, isFavorite, toggleFavorite } =
		useVacancyDetail(referenznummer);
	const navState = useLocation().state as VacancyDetailNavState | null;

	const { onScroll, scrollY, collapseProgress, heroControlsOpacity } =
		useOccupationDetailScroll();

	const titleRevealProgress = Math.min(
		1,
		Math.max(0, (scrollY - COLLAPSE_END) / TITLE_REVEAL_RANGE),
	);

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
					titleOpacity={titleRevealProgress}
				/>
			</div>

			<div
				className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 pt-3 transition-opacity duration-150"
				style={{
					opacity: heroControlsOpacity,
					pointerEvents: heroControlsOpacity < 0.5 ? "none" : "auto",
				}}
				aria-hidden={heroControlsOpacity < 0.5}
			>
				<GhostIconButton
					iconSrc="/icons/arrow-back-black.svg"
					onClick={() => navigate(ROUTE_PATHS.resultsVacancies)}
					ariaLabel={content["navigation.back"]}
					title={content["navigation.back"]}
					iconSize="w-5 h-5"
					className="bg-sky-shade-10/50 rounded-xl backdrop-blur-[4.5px]"
				/>
				<button
					type="button"
					className="flex items-center justify-center w-10 h-10 bg-sky-shade-10/50 rounded-xl backdrop-blur-[4.5px]"
					onClick={toggleFavorite}
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
						className={isFavorite ? "block w-5 h-5" : "hidden"}
					/>
				</button>
			</div>

			<div
				className="relative flex-1 overflow-y-auto overflow-x-hidden"
				onScroll={onScroll}
			>
				<VacancyDetailHero
					displayName={displayName}
					employer={detail?.employer ?? preview?.employer}
				/>
				<div className="relative flex mt-8 flex-col gap-8 bg-sky-white rounded-t-[20px] pb-8 z-10">
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
