import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GhostIconButton } from "../primitives/buttons/GhostIconButton";
import { content } from "../../content";
import { useAppStore } from "../../store/useAppStore";
import { useMatchResultsStore } from "../../store/useMatchResultsStore";
import { TabBar } from "../primitives/tab-bar/TabBar";
interface ResultsPageHeaderProps {
	title: string;
}

export function ResultsPageHeader({ title }: ResultsPageHeaderProps) {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const matchResults = useMatchResultsStore((state) => state.matchResults);
	const ausbildungsplaetze = useAppStore((state) => state.ausbildungsplaetze);

	const vacanciesCount = useMemo(() => {
		if (!matchResults || !ausbildungsplaetze) {
			return undefined;
		}
		const vacanciesByName = new Map(
			ausbildungsplaetze.results.map((result) => [result.occupation, result]),
		);
		return matchResults.occupations.reduce((count, occupation) => {
			const previews = vacanciesByName.get(occupation.rawName)?.previews.length ?? 0;
			return count + previews;
		}, 0);
	}, [matchResults, ausbildungsplaetze]);

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
			vacanciesCount,
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
