import { Link, useSearchParams } from "react-router-dom";
import {
	type MatchedOccupation,
	fitPercent,
	formatOccupationDisplayName,
	isInWildcardPool,
} from "@azuki/shared";
import { useMatchResultsStore } from "../../store/useMatchResultsStore";
import { FavoriteButton } from "../favorite-button/FavoriteButton";
import { content } from "../../content";
import { buildResultsOccupationPath } from "../../routing/routes";
import { toWithShareSearch } from "../../routing/sessionGuard";
import { OccupationCardBody } from "./OccupationCardBody";
import { WildcardPoolBadge } from "./WildcardPoolBadge";

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
		<div className="relative bg-gray-100 rounded-2xl border border-sky-shade-20 overflow-hidden">
			<Link
				to={toWithShareSearch(
					buildResultsOccupationPath(occupation.id),
					searchParams,
				)}
				className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 rounded-2xl md:hover:bg-sky-shade-20/40 active:bg-sky-shade-20/40"
				aria-label={`${displayName}, ${content["results.moreInfo"]}`}
			>
				<OccupationCardBody
					displayName={displayName}
					images={occupation.images}
					occupationDuration={occupation.occupationDuration}
					salaryKnown={occupation.salaryKnown}
					salaryMonthlyMedian={occupation.salaryMonthlyMedian}
					shortDescription={occupation.shortDescription}
					badgeSlot={
						<>
							<div className="flex items-center justify-center bg-fill-primary text-white text-sm leading-5 font-medium px-2 h-[22px] rounded-lg whitespace-nowrap">
								{content["results.card.score.label"]}{" "}
								{fitPercent(occupation.score)}
								{"%"}
							</div>
							{(isWildcard || isInWildcardPool(occupation.id)) && (
								<WildcardPoolBadge />
							)}
						</>
					}
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
