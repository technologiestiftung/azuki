import { useLocation, useNavigate } from "react-router-dom";
import { GhostIconButton } from "../primitives/buttons/GhostIconButton";
import { content } from "../../content";
import { TabBar } from "../primitives/tab-bar/TabBar";
interface ResultsPageHeaderProps {
	title: string;
}

export function ResultsPageHeader({ title }: ResultsPageHeaderProps) {
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
				<h1 className="text-lg font-semibold text-gray-900 flex-1 text-center">
					{title}
				</h1>
			</div>
			<TabBar tabs={tabs} activeTab={pathname} />
		</>
	);
}
