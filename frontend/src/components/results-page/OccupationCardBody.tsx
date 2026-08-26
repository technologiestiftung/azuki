import { formatOccupationSalary } from "@azuki/shared";
import { FavoriteButton } from "../favorite-button/FavoriteButton";
import { WildcardPoolBadge } from "./WildcardPoolBadge";
import { fitPercent, isInWildcardPool } from "@azuki/shared";

interface OccupationCardBodyProps {
	displayName: string;
	images: { url: string }[];
	occupationDuration: string;
	occupationId: number;
	occupationScore?: number;
	salaryKnown: boolean;
	salaryMonthlyMedian: number | null;
	shortDescription: string;
	toggleFavorite: (id: number) => void;
	isFavorite: boolean;
	isWildCard: boolean;
}

export function OccupationCardBody({
	displayName,
	images,
	occupationDuration,
	occupationId,
	occupationScore,
	salaryKnown,
	salaryMonthlyMedian,
	shortDescription,
	toggleFavorite,
	isFavorite,
	isWildCard,
}: OccupationCardBodyProps) {
	return (
		<>
			<div className="w-full mb-3">
				{images.length > 0 ? (
					<img
						src={images[0].url}
						alt=""
						className="w-full h-[196px] object-cover rounded-md"
					/>
				) : (
					<img
						src="/illustrations/occupation-placeholder.svg"
						alt=""
						className="w-full h-[196px] object-cover"
					/>
				)}
			</div>

			<div className="flex flex-col gap-3">
				<div className="flex justify-between items-center w-full">
					{occupationScore && (
						<div className="w-fit flex items-center justify-center bg-sky-900 text-sky-white text-sm leading-5 font-medium px-2 h-[22px] rounded-lg whitespace-nowrap">
							{fitPercent(occupationScore)} {"%"}
						</div>
					)}
					{(isWildCard || isInWildcardPool(occupationId)) && (
						<WildcardPoolBadge />
					)}
					<div className="w-full flex justify-end z-50">
						<FavoriteButton
							onClick={() => toggleFavorite(occupationId)}
							isFavorite={isFavorite}
						/>
					</div>
				</div>
				<div className="flex flex-col gap-1.5">
					<h3 className="text-xl leading-[26px] font-semibold text-sky-900">
						{displayName}
					</h3>
					{shortDescription && (
						<p className="text-base sky-shade-170 line-clamp-3">
							{shortDescription}
						</p>
					)}
				</div>
				{(occupationDuration || salaryKnown) && (
					<div className="flex min-w-0 flex-wrap items-center gap-1">
						{occupationDuration && (
							<div className="text-sm font-semibold text-sky-shade-170">
								{occupationDuration}
							</div>
						)}
						<div className="text-sm text-sky-shade-170 text-center">•</div>

						{salaryKnown && salaryMonthlyMedian !== null && (
							<div className="text-sm font-semibold text-sky-shade-170">
								{formatOccupationSalary(salaryMonthlyMedian)}
							</div>
						)}
					</div>
				)}
			</div>
		</>
	);
}
