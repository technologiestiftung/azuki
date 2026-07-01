import { Link } from "react-router-dom";
import {
	type MatchedOccupation,
	formatOccupationDisplayName,
} from "@azuki/shared";
import { Badge } from "../primitives/badge/Badge";
import { useMatchResultsStore } from "../../store/useMatchResultsStore";
import { FavoriteButton } from "../favorite-button/FavoriteButton";
import { content } from "../../content";
import { buildResultsOccupationPath } from "../../routing/routes";
import { fitPercent } from "./utils/fitPercent";

interface ResultCardProps {
	occupation: MatchedOccupation;
}

export function ResultCard({ occupation }: ResultCardProps) {
	const isFavorite = useMatchResultsStore((state) =>
		state.favoriteOccupationIds.includes(occupation.id),
	);
	const toggleFavorite = useMatchResultsStore((state) => state.toggleFavorite);
	const occupationTypeLabels: Record<string, string> = {
		dual: content["results.occupationType.dual"],
		school: content["results.occupationType.school"],
	};
	const occupationTypeBadge = occupation.occupationType
		? (occupationTypeLabels[occupation.occupationType] ??
			occupation.occupationType)
		: "";
	const displayName = formatOccupationDisplayName(occupation.name);

	return (
		<div className="relative bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden">
			<Link
				to={buildResultsOccupationPath(occupation.id)}
				className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 rounded-2xl md:hover:bg-gray-200/40 active:bg-gray-200/40"
				aria-label={`${displayName}, ${content["results.moreInfo"]}`}
			>
				<div className="absolute top-3 left-3 z-[1] flex items-center justify-center bg-fill-primary text-white text-sm leading-5 font-medium px-2 h-[22px] rounded-lg">
					{content["results.card.score.label"]} {fitPercent(occupation.score)}
					{"%"}
				</div>

				<div className="relative w-full">
					{occupation.images.length > 0 ? (
						<img
							src={occupation.images[0].url}
							alt=""
							className="w-full h-40 object-cover"
						/>
					) : (
						<img
							src="/illustrations/occupation-placeholder.svg"
							alt=""
							className="w-full h-40 object-cover"
						/>
					)}
				</div>

				<div className="p-3 pt-4">
					<h3 className="text-xl font-semibold text-sky-1000 mb-3">
						{displayName}
					</h3>
					{(occupationTypeBadge ||
						occupation.occupationDuration ||
						occupation.occupationEarnings) && (
						<div className="mb-[9px] flex min-w-0 flex-wrap items-center gap-2">
							{occupationTypeBadge && <Badge label={occupationTypeBadge} />}
							{occupation.occupationDuration && (
								<Badge label={occupation.occupationDuration} />
							)}
							{occupation.occupationEarnings && (
								<Badge label={occupation.occupationEarnings} />
							)}
						</div>
					)}

					{occupation.shortDescription && (
						<p className="text-base text-gray-700 line-clamp-3">
							{occupation.shortDescription}
						</p>
					)}
				</div>
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
