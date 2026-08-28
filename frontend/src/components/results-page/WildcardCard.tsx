import { Link } from "react-router-dom";
import {
	type MatchedOccupation,
	formatOccupationDisplayName,
} from "@azuki/shared";
import { content } from "../../content";
import { buildResultsOccupationPath } from "../../routing/routes";
import { OccupationCardBody } from "./OccupationCardBody";
import { useMatchResultsStore } from "../../store/useMatchResultsStore";

interface WildcardCardProps {
	occupation: MatchedOccupation;
}

export function WildcardCard({ occupation }: WildcardCardProps) {
	const displayName = formatOccupationDisplayName(occupation.name);

	const isFavorite = useMatchResultsStore((state) =>
		state.favoriteOccupationIds.includes(occupation.id),
	);
	const toggleFavorite = useMatchResultsStore((state) => state.toggleFavorite);

	return (
		<div className="relative flex flex-col shrink-0 w-[300px] first:ml-4 last:mr-4">
			<Link
				to={buildResultsOccupationPath(occupation.id, { wildcard: true })}
				className="relative flex flex-1 flex-col p-2.5 bg-sky-shade-10 rounded-2xl overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
				aria-label={`${displayName}, ${content["results.moreInfo"]}`}
			>
				<OccupationCardBody
					displayName={displayName}
					images={occupation.images}
					occupationDuration={occupation.occupationDuration}
					occupationId={occupation.id}
					salaryKnown={occupation.salaryKnown}
					salaryMonthlyMedian={occupation.salaryMonthlyMedian}
					shortDescription={occupation.shortDescription}
					toggleFavorite={() => toggleFavorite(occupation.id)}
					isFavorite={isFavorite}
					isWildCard={true}
				/>
			</Link>
		</div>
	);
}
