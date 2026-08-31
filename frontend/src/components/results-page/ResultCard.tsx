import { Link, useSearchParams } from "react-router-dom";
import {
	type MatchedOccupation,
	displayFitPercent,
	formatOccupationDisplayName,
} from "@azuki/shared";
import { useMatchResultsStore } from "../../store/useMatchResultsStore";
import { content } from "../../content";
import { buildResultsOccupationPath } from "../../routing/routes";
import { toWithShareSearch } from "../../routing/sessionGuard";
import { OccupationCardBody } from "./OccupationCardBody";

interface ResultCardProps {
	occupation: MatchedOccupation;
	isWildcard?: boolean;
}

export function ResultCard({
	occupation,
	isWildcard = false,
}: ResultCardProps) {
	const [searchParams] = useSearchParams();
	const isFavorite = useMatchResultsStore((state) =>
		state.favoriteOccupationIds.includes(occupation.id),
	);
	const toggleFavorite = useMatchResultsStore((state) => state.toggleFavorite);

	const displayName = formatOccupationDisplayName(occupation.name);

	return (
		<div className="relative flex h-full flex-col bg-sky-shade-10 rounded-2xl">
			<Link
				to={toWithShareSearch(
					buildResultsOccupationPath(occupation.id),
					searchParams,
				)}
				className="flex flex-1 flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 rounded-2xl p-2.5"
				aria-label={`${displayName}, ${content["results.moreInfo"]}`}
			>
				<OccupationCardBody
					displayName={displayName}
					images={occupation.images}
					occupationDuration={occupation.occupationDuration}
					occupationId={occupation.id}
					matchPercent={displayFitPercent(occupation)}
					salaryKnown={occupation.salaryKnown}
					salaryMonthlyMedian={occupation.salaryMonthlyMedian}
					shortDescription={occupation.shortDescription}
					isFavorite={isFavorite}
					toggleFavorite={() => toggleFavorite(occupation.id)}
					isWildCard={isWildcard}
				/>
			</Link>
		</div>
	);
}
