import { Link } from "../../primitives/links/Link";
import { content } from "../../../content";
import { buildBerufenetUrl } from "../utils/buildBerufenetUrl";

interface OccupationDetailSourceFooterProps {
	occupationId: number;
	className?: string;
}

export function OccupationDetailSourceFooter({
	occupationId,
	className = "",
}: OccupationDetailSourceFooterProps) {
	return (
		<footer
			className={`flex flex-col gap-3 px-[22px] py-5 bg-sky-900 text-sm ${className}`}
		>
			<div className="flex flex-col">
				<p className="font-semibold text-sky-0">
					{content["results.detail.sourceFooter.title"]}
				</p>
				<p className="leading-[1.3] text-sky-0">
					{content["results.detail.sourceFooter.provider"]}
				</p>
				<p className="leading-[1.3] text-sky-0">
					{content["results.detail.sourceFooter.website"]}{" "}
					<span className="text-sky-shade-70">
						{content["results.detail.sourceFooter.date"]}
					</span>
				</p>
			</div>
			<Link
				href={buildBerufenetUrl(occupationId)}
				label={content["results.detail.sourceFooter.link"]}
				variant="primary"
				showIcon
			/>
		</footer>
	);
}
