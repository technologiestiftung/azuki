import { useLocation, useNavigate } from "react-router-dom";
import { GhostIconButton } from "../primitives/buttons/GhostIconButton";
import { SecondaryIconButton } from "../primitives/buttons/SecondaryIconButton";
import { content } from "../../content";
import { TabBar } from "../primitives/tab-bar/TabBar";
interface ResultsPageHeaderProps {
	title: string;
	hasFilterButton?: boolean;
	activeFilterCount?: number;
	onFilterClick?: () => void;
}

export function ResultsPageHeader({
	title,
	hasFilterButton,
	activeFilterCount = 0,
	onFilterClick,
}: ResultsPageHeaderProps) {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const tabs = [
		{
			label: content["results.tab.results"],
			href: "/results/list",
			ariaLabel: content["results.tab.results"],
		},
		{
			label: content["results.tab.freeSpots"],
			href: "/results/free-spots",
			ariaLabel: content["results.tab.freeSpots.ariaLabel"],
		},
	];

	return (
		<>
			<div className="flex w-full items-center justify-between px-4 py-2">
				<GhostIconButton
					iconSrc="/icons/arrow-back-black.svg"
					onClick={() => navigate("/NoGos")}
					ariaLabel={content["navigation.back"]}
					title={content["navigation.back"]}
				/>
				<h1 className="text-2xl font-semibold text-gray-900 flex-1 text-center">
					{title}
				</h1>
				{hasFilterButton && (
					<div className="relative">
						<SecondaryIconButton
							iconSrc="/icons/filter.svg"
							onClick={onFilterClick}
							ariaLabel={content["results.filter.title"]}
							title={content["results.filter.title"]}
						/>
						{activeFilterCount > 0 && (
							<div
								className="absolute -right-1.5 -top-1 flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full bg-gray-900 text-xs font-semibold text-gray-0"
								aria-hidden
							>
								{activeFilterCount}
							</div>
						)}
					</div>
				)}
			</div>
			<TabBar tabs={tabs} activeTab={pathname} />
		</>
	);
}
