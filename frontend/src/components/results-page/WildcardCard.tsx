import { Link } from "react-router-dom";
import {
	type MatchedOccupation,
	formatOccupationDisplayName,
} from "@azuki/shared";
import { content } from "../../content";
import { buildResultsOccupationPath } from "../../routing/routes";
import { OccupationCardBody } from "./OccupationCardBody";
import { WildcardPoolBadge } from "./WildcardPoolBadge";

interface WildcardCardProps {
	occupation: MatchedOccupation;
}

export function WildcardCard({ occupation }: WildcardCardProps) {
	const displayName = formatOccupationDisplayName(occupation.name);

	return (
		<Link
			to={buildResultsOccupationPath(occupation.id, { wildcard: true })}
			className="relative shrink-0 w-[300px] first:ml-4 last:mr-4 bg-sky-shade-10 rounded-2xl overflow-hidden block focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 md:hover:bg-sky-shade-20 active:bg-sky-shade-20"
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
	);
}
