import { content } from "../../../content";
import { buildBerufenetUrl } from "../utils/buildBerufenetUrl";
import { formatBerufenetDate } from "../utils/formatBerufenetDate";

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
			className={`flex flex-col gap-3 px-[22px] py-5 bg-sky-900 ${className}`}
		>
			<div className="flex flex-col text-sm">
				<p className="font-semibold leading-[1.4] text-sky-0">
					{content["results.detail.sourceFooter.title"]}
				</p>
				<p className="leading-[1.3] text-sky-0">
					{content["results.detail.sourceFooter.provider"]}
				</p>
				<p className="leading-[1.3] text-sky-0">
					{content["results.detail.sourceFooter.website"]}{" "}
					<span className="text-sky-shade-70">
						{content["results.detail.sourceFooter.date"].replace(
							"{date}",
							formatBerufenetDate(),
						)}
					</span>
				</p>
			</div>
			<a
				href={buildBerufenetUrl(occupationId)}
				target="_blank"
				rel="noopener noreferrer"
				className="flex items-center gap-2 self-start rounded-xl text-base leading-[1.4] font-medium text-sky-400 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
			>
				{content["results.detail.sourceFooter.link"]}
				<img
					src="/icons/arrow-outward-sky.svg"
					alt=""
					aria-hidden
					className="w-5 h-5"
				/>
			</a>
		</footer>
	);
}
