import { content } from "../../../content";
import { EmptyState } from "../EmptyState";

interface VacanciesEmptyStateProps {
	detailed: boolean;
}

export function VacanciesEmptyState({ detailed }: VacanciesEmptyStateProps) {
	if (!detailed) {
		return <EmptyState message={content["vacancies.noResultsFound"]} />;
	}

	return (
		<div className="flex px-4 pb-4 items-center h-full">
			<div className="flex flex-col items-center justify-center gap-5 px-5">
				<div className="flex items-center justify-center object-contain p-2">
					<img
						src="/illustrations/no-results-star.svg"
						alt=""
						className="w-[200px]"
					/>
				</div>
				<div>
					<h3 className="text-lg font-bold text-gray-1000 mb-1.5 text-center">
						{content["vacancies.noResults.p1"]}
					</h3>
					<p className="text-lg font-medium text-gray-1000 text-center">
						{content["vacancies.noResults.p2"]}
					</p>
				</div>
			</div>
		</div>
	);
}
