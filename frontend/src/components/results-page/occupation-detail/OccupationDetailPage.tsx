import { useCallback, useEffect, useMemo, type UIEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
	buildOccupationShareText,
	displayFitPercent,
	formatOccupationDisplayName,
} from "@azuki/shared";
import {
	buildResultsOccupationPath,
	ROUTE_PATHS,
} from "../../../routing/routes";
import {
	hasShareQueryParams,
	toWithShareSearch,
} from "../../../routing/sessionGuard";
import { useOccupationDetail } from "./useOccupationDetail";
import { OccupationDetailHero } from "./OccupationDetailHero";
import { OccupationDetailHeaderCollapsed } from "./OccupationDetailHeaderCollapsed";
import { useOccupationDetailScroll } from "./useOccupationDetailScroll";
import { useAppStore } from "../../../store/useAppStore";
import { useMatchResultsStore } from "../../../store/useMatchResultsStore";
import { useFetchVacancies } from "../useFetchVacancies";
import { OccupationDetailBody } from "./OccupationDetailBody";
import {
	buildOccupationShareState,
	buildOccupationShareUrl,
	parseOccupationShareState,
} from "./occupationShareState";
import { shareOccupationLink } from "./shareOccupationLink";
import { useSharedNextOccupations } from "./useSharedNextOccupations";
import { useCollapsedTitleReveal } from "../../collapsing-header/useCollapsedTitleReveal";
import {
	resolveDetailSalaryLabel,
	resolveDetailSchoolDegreeLabel,
	resolveDetailStatusMessage,
	resolveDetailTaskItems,
	resolveHeroImageUrls,
} from "./occupationDetailPageHelpers";

export function OccupationDetailPage() {
	const navigate = useNavigate();
	const occupationId = Number(useParams().id);
	const [searchParams] = useSearchParams();
	const isWildcard = searchParams.get("wildcard") === "1";
	const shareState = useMemo(
		() => parseOccupationShareState(searchParams),
		[searchParams],
	);
	const detail = useOccupationDetail(occupationId);
	useFetchVacancies();
	const vacancies = useAppStore((state) => state.vacancies);
	const matchResults = useMatchResultsStore((state) => state.matchResults);
	const profile = useAppStore((state) => state.profile);

	const handleBack = useCallback(() => {
		if (hasShareQueryParams(searchParams) && !matchResults) {
			navigate(ROUTE_PATHS.start, { replace: true });
			return;
		}
		navigate(toWithShareSearch(ROUTE_PATHS.resultsList, searchParams));
	}, [matchResults, navigate, searchParams]);

	const {
		onScroll,
		collapseProgress,
		overlayOpacity,
		heroControlsOpacity,
		heroImageParallaxY,
	} = useOccupationDetailScroll();

	const { titleRef, titleRevealProgress, updateTitleReveal } =
		useCollapsedTitleReveal();

	const handleScroll = (event: UIEvent<HTMLDivElement>) => {
		onScroll(event);
		updateTitleReveal(event.currentTarget);
	};

	const liveMatchPercent =
		detail.matchedOccupation !== undefined
			? displayFitPercent(detail.matchedOccupation)
			: undefined;
	const matchPercent = shareState?.fitPercent ?? liveMatchPercent;
	const taskItems = resolveDetailTaskItems(
		detail.occupation,
		detail.matchedOccupation,
	);
	const salaryLabel = resolveDetailSalaryLabel(detail.occupation);
	const schoolDegreeLabel = resolveDetailSchoolDegreeLabel(detail.occupation);
	const downloadDisabled =
		detail.loading || !detail.occupation || Boolean(detail.error);
	const statusMessage = resolveDetailStatusMessage(detail);

	const occupationVacanciesCount = useMemo(() => {
		const occupationName =
			detail.matchedOccupation?.rawName ?? detail.occupation?.name;
		if (!occupationName || !vacancies) {
			return undefined;
		}
		return (
			vacancies.results.find((result) => result.occupation === occupationName)
				?.previews.length ?? 0
		);
	}, [detail.matchedOccupation?.rawName, detail.occupation?.name, vacancies]);

	const liveNextOccupations = useMemo(() => {
		if (!matchResults) {
			return [];
		}
		const { occupations } = matchResults;
		const currentIndex = occupations.findIndex(
			(occupation) => occupation.id === occupationId,
		);
		if (currentIndex === -1) {
			return [];
		}
		const count = Math.min(3, occupations.length - 1);
		return Array.from(
			{ length: count },
			(_, offset) =>
				occupations[(currentIndex + 1 + offset) % occupations.length],
		);
	}, [matchResults, occupationId]);

	const sharedNextOccupations = useSharedNextOccupations(
		shareState?.nextOccupationIds,
	);

	const nextOccupationCards = useMemo(() => {
		if (shareState) {
			return sharedNextOccupations;
		}
		return liveNextOccupations.map((occupation) => ({
			id: occupation.id,
			displayName: formatOccupationDisplayName(occupation.name),
			imageUrl:
				occupation.images[0]?.url ??
				"/illustrations/occupation-placeholder.svg",
		}));
	}, [shareState, sharedNextOccupations, liveNextOccupations]);

	const handleShare = useCallback(() => {
		if (!Number.isFinite(occupationId)) {
			return;
		}

		const state = buildOccupationShareState(
			matchPercent,
			liveNextOccupations.map((occupation) => occupation.id),
		);

		const url = state
			? buildOccupationShareUrl(occupationId, state)
			: new URL(
					buildResultsOccupationPath(occupationId, { wildcard: isWildcard }),
					window.location.origin,
				).toString();

		void shareOccupationLink({
			url,
			title: detail.displayName,
			text: buildOccupationShareText(
				detail.occupation,
				detail.occupationDuration,
			),
		});
	}, [
		occupationId,
		detail.occupation,
		detail.displayName,
		detail.occupationDuration,
		matchPercent,
		liveNextOccupations,
		isWildcard,
	]);

	const handleDownload = useCallback(async () => {
		if (!detail.occupation || downloadDisabled) {
			return;
		}
		try {
			const { exportOccupationDetailPdf } = await import(
				"./exportOccupationDetailPdf"
			);
			await exportOccupationDetailPdf({
				displayName: detail.displayName,
				occupationDuration: detail.occupationDuration,
				salaryLabel,
				schoolDegreeLabel,
				taskItems,
				matchPercent: isWildcard ? undefined : matchPercent,
				heroImageUrls: resolveHeroImageUrls(detail.occupation),
				occupationId: detail.occupation.id,
				profile,
			});
		} catch (err) {
			console.error("Failed to export occupation detail PDF:", err);
		}
	}, [
		detail.occupation,
		detail.displayName,
		detail.occupationDuration,
		downloadDisabled,
		salaryLabel,
		schoolDegreeLabel,
		taskItems,
		matchPercent,
		profile,
		isWildcard,
	]);

	useEffect(() => {
		if (!detail.displayName) {
			return undefined;
		}
		const previousTitle = document.title;
		document.title = detail.displayName;
		return () => {
			document.title = previousTitle;
		};
	}, [detail.displayName]);

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
				<OccupationDetailHeaderCollapsed
					title={detail.displayName}
					isFavorite={detail.isFavorite}
					onToggleFavorite={detail.toggleFavorite}
					onShare={handleShare}
					onBack={handleBack}
					onDownload={handleDownload}
					downloadDisabled={downloadDisabled}
					titleOpacity={titleRevealProgress}
				/>
			</div>
			<div
				className="relative flex-1 overflow-y-auto overflow-x-hidden"
				onScroll={handleScroll}
			>
				<div className="sticky top-0 z-0">
					<OccupationDetailHero
						displayName={detail.displayName}
						heroImage={detail.heroImage}
						isFavorite={detail.isFavorite}
						onToggleFavorite={detail.toggleFavorite}
						onShare={handleShare}
						onBack={handleBack}
						onDownload={handleDownload}
						downloadDisabled={downloadDisabled}
						overlayOpacity={overlayOpacity}
						controlsOpacity={heroControlsOpacity}
						imageParallaxY={heroImageParallaxY}
					/>
				</div>
				<div className="relative -mt-4 flex flex-col gap-8 bg-sky-white rounded-t-[20px] pb-8 z-10">
					<h1
						ref={titleRef}
						className="text-3xl font-semibold text-sky-900 px-[18px] pt-4 "
					>
						{detail.displayName}
					</h1>
					{statusMessage ? (
						<p className="px-[18px] text-lg text-sky-900">{statusMessage}</p>
					) : (
						<OccupationDetailBody
							occupation={detail.occupation}
							matchPercent={matchPercent}
							taskItems={taskItems}
							profile={profile}
							occupationDuration={detail.occupationDuration}
							occupationVacanciesCount={occupationVacanciesCount}
							nextOccupationCards={nextOccupationCards}
							isWildcard={isWildcard}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
