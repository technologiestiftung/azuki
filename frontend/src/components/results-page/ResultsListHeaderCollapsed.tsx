import { content } from "../../content";

export function ResultsListHeaderCollapsed() {
	return (
		<div className="h-[60px] flex w-full items-center justify-between px-4 pt-3 pb-2 shrink-0 border-b border-sky-20">
			<h1 className="text-base font-semibold text-sky-900 text-left pr-1.5">
				{content["results.title"]}
			</h1>
		</div>
	);
}
