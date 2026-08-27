import { Link } from "react-router-dom";
import {
	formatOccupationDisplayName,
	displayFitPercent,
	type MatchedOccupation,
} from "@azuki/shared";
import { content } from "../content";
import { buildResultsOccupationPath } from "../routing/routes";

interface TopOccupationsCarouselProps {
	occupations: MatchedOccupation[];
}

export function TopOccupationsCarousel({
	occupations,
}: TopOccupationsCarouselProps) {
	return (
		<div className="flex flex-col gap-3 mb-11">
			<h2 className="text-xl font-semibold leading-7 text-sky-900 text-center">
				{content["profile.topOccupationsTitle"]}
			</h2>
			<div className="flex gap-2 w-full overflow-x-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{occupations.map((occupation) => {
					const displayName = formatOccupationDisplayName(occupation.name);
					const imageUrl =
						occupation.images[0]?.url ??
						"/illustrations/occupation-placeholder.svg";
					const matchPercent = displayFitPercent(occupation);

					return (
						<Link
							key={occupation.id}
							to={buildResultsOccupationPath(occupation.id)}
							className="flex flex-col min-w-[300px] gap-2 p-2.5 bg-white rounded-[20px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 last:mr-12 first:ml-12"
							aria-label={`${displayName}, ${content["results.moreInfo"]}`}
						>
							<img
								src={imageUrl}
								alt=""
								className="w-full h-[150px] object-cover rounded-xl aspect-[3/2]"
							/>
							<p className="text-base font-medium px-[3px]">{displayName}</p>
							<div className="flex items-center gap-2">
								<div className="h-5 rounded-lg bg-sky-900 w-fit px-2 text-sm text-white">
									{matchPercent} %
								</div>
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
