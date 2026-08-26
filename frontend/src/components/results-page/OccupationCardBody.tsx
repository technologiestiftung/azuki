import type { ReactNode } from "react";
import { formatOccupationSalary } from "@azuki/shared";
import { Badge } from "../primitives/badge/Badge";

interface OccupationCardBodyProps {
	displayName: string;
	images: { url: string }[];
	occupationDuration: string;
	salaryKnown: boolean;
	salaryMonthlyMedian: number | null;
	shortDescription: string;
	badgeSlot?: ReactNode;
}

export function OccupationCardBody({
	displayName,
	images,
	occupationDuration,
	salaryKnown,
	salaryMonthlyMedian,
	shortDescription,
	badgeSlot,
}: OccupationCardBodyProps) {
	return (
		<>
			{badgeSlot && (
				<div className="absolute top-3 left-3 z-[1] flex items-center gap-2">
					{badgeSlot}
				</div>
			)}

			<div className="relative w-full">
				{images.length > 0 ? (
					<img
						src={images[0].url}
						alt=""
						className="w-full h-40 object-cover"
					/>
				) : (
					<img
						src="/illustrations/occupation-placeholder.svg"
						alt=""
						className="w-full h-40 object-cover border-t border-x border-sky-shade-10 rounded-t-2xl"
					/>
				)}
			</div>

			<div className="p-3 pt-4">
				<h3 className="text-xl font-semibold text-sky-900 mb-3">
					{displayName}
				</h3>
				{(occupationDuration || salaryKnown) && (
					<div className="mb-[9px] flex min-w-0 flex-wrap items-center gap-2">
						{occupationDuration && <Badge label={occupationDuration} />}

						{salaryKnown && salaryMonthlyMedian !== null && (
							<Badge label={formatOccupationSalary(salaryMonthlyMedian)} />
						)}
					</div>
				)}

				{shortDescription && (
					<p className="text-base text-gray-700 line-clamp-3">
						{shortDescription}
					</p>
				)}
			</div>
		</>
	);
}
