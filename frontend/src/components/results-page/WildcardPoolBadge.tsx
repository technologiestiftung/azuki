import { content } from "../../content";

export function WildcardPoolBadge() {
	return (
		<div className="flex items-center justify-center w-fit bg-sky-200 text-sky-900 text-sm leading-5 font-normal px-2 h-[22px] rounded-lg whitespace-nowrap">
			{content["results.wildcard.badge"]}
		</div>
	);
}
