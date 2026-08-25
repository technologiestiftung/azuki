import { forwardRef } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../routing/routes";
import { content } from "../../../content";
import { useMatchResultsStore } from "../../../store/useMatchResultsStore";
import { toWithShareSearch } from "../../../routing/sessionGuard";

interface OccupationDetailApplyLinkProps {
	hidden?: boolean;
	occupationVacanciesCount: number | undefined;
}

export const OccupationDetailApplyLink = forwardRef<
	HTMLAnchorElement,
	OccupationDetailApplyLinkProps
>(function OccupationDetailApplyLink(
	{ hidden = false, occupationVacanciesCount },
	ref,
) {
	const occupationId = Number(useParams().id);
	const [searchParams] = useSearchParams();

	const setVacancyOccupationFilterIds = useMatchResultsStore(
		(state) => state.setVacancyOccupationFilterIds,
	);

	const label =
		occupationVacanciesCount !== undefined && occupationVacanciesCount > 0
			? `${content["results.detail.apply.cta"]} (${occupationVacanciesCount})`
			: content["results.detail.apply.cta"];

	const handleApplyClick = () => {
		if (Number.isFinite(occupationId)) {
			setVacancyOccupationFilterIds([occupationId]);
		}
	};

	return (
		<Link
			ref={ref}
			to={toWithShareSearch(ROUTE_PATHS.resultsVacancies, searchParams)}
			onClick={handleApplyClick}
			aria-label={content["results.detail.apply.cta.ariaLabel"]}
			aria-hidden={hidden}
			tabIndex={hidden ? -1 : undefined}
			className={`h-12 flex items-center justify-center gap-2 w-full max-w-[374px] mx-auto py-2 px-5 rounded-2xl text-base font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 active:bg-sky-200 active:text-sky-900 bg-sky-300 text-sky-1000 md:hover:bg-sky-200 md:hover:text-sky-900 ${hidden ? "invisible pointer-events-none" : ""}`}
		>
			{label}
		</Link>
	);
});
