interface ResultsPageHeaderCollapsedProps {
	title: string;
}

export const ResultsPageHeaderCollapsed = ({
	title,
}: ResultsPageHeaderCollapsedProps) => {
	return (
		<div className="h-[60px] flex w-full items-center justify-between px-4 pt-3 pb-2 shrink-0 border-b border-sky-20 z-50">
			<h1 className="text-base font-semibold text-sky-900 text-left pr-1.5">
				{title}
			</h1>
		</div>
	);
};
