import { Link } from "react-router-dom";
import {
	type MatchedOccupation,
	formatOccupationDisplayName,
} from "@azuki/shared";
import { content } from "../../content";
import { buildResultsOccupationPath } from "../../routing/routes";
import { OccupationCardBody } from "./OccupationCardBody";
import { WildcardPoolBadge } from "./WildcardPoolBadge";
import { FavoriteButton } from "../favorite-button/FavoriteButton";
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
		<div className="relative shrink-0 w-[300px] first:ml-4 last:mr-4">
			<Link
				to={buildResultsOccupationPath(occupation.id, { wildcard: true })}
				className="relative block h-full bg-sky-shade-10 rounded-2xl overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 md:hover:bg-sky-shade-20 active:bg-sky-shade-20"
				aria-label={`${displayName}, ${content["results.moreInfo"]}`}
			>
				<OccupationCardBody
					displayName={displayName}
					images={occupation.images}
					occupationDuration={occupation.occupationDuration}
					salaryKnown={occupation.salaryKnown}
					salaryMonthlyMedian={occupation.salaryMonthlyMedian}
					shortDescription={occupation.shortDescription}
					badgeSlot={<WildcardPoolBadge />}
				/>
			</Link>

			<div className="absolute top-3 inset-0 h-fit">
				<FavoriteButton
					onClick={() => toggleFavorite(occupation.id)}
					isFavorite={isFavorite}
				/>
			</div>
		</div>
	);
}
