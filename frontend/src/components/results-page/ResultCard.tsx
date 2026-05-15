import { type MatchedOccupation } from "@azuki/shared";
import { Badge } from "../primitives/badge/Badge";
import { useMatchResultsStore } from "../../store/useMatchResultsStore";
import { FavoriteButton } from "../favorite-button/FavoriteButton";
import { content } from "../../content/de";

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

	return (
		<div className="relative bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden">
			<div className="absolute w-full inset-0 flex items-center justify-between z-10">
				<div className="absolute top-3 left-3 bg-fill-primary text-white text-xs leading-5 font-medium p-2 rounded-lg">
					{content["results.card.score.label"]} {occupation.score}
				</div>
				<FavoriteButton
					onClick={() => toggleFavorite(occupation.id)}
					isFavorite={isFavorite}
				/>
			</div>

			<div className="relative w-full">
				{occupation.images.length > 0 ? (
					<img
						src={occupation.images[0].url}
						alt={occupation.name}
						className="w-full h-40 object-cover"
					/>
				) : (
					<div className="w-full h-40 bg-gray-200" />
				)}
			</div>

			<div className="p-3 pt-4">
				<h3 className="text-lg font-semibold text-sky-1000 mb-3">
					{occupation.name}
				</h3>
				{(occupationTypeBadge ||
					occupation.occupationDuration ||
					occupation.occupationEarnings) && (
					<div className="flex items-center gap-2 mb-[9px]">
						{occupationTypeBadge && <Badge label={occupationTypeBadge} />}
						{occupation.occupationDuration && (
							<Badge label={occupation.occupationDuration} />
						)}
						{occupation.occupationEarnings && (
							<Badge label={occupation.occupationEarnings} />
						)}
					</div>
				)}

				{occupation.taskSummary && (
					<p className="text-sm text-gray-700 line-clamp-3">
						{occupation.taskSummary}
					</p>
				)}
			</div>
		</div>
	);
}
