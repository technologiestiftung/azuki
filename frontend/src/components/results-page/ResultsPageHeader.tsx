import { useNavigate } from "react-router-dom";
import { BackButton } from "../back-button/BackButton";
import { SecondaryIconButton } from "../primitives/buttons/SecondaryIconButton";
import { content } from "../../content/de";

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
	return (
		<div className="flex w-full items-center justify-between px-4 py-2">
			<BackButton onClick={() => navigate("/start")} />
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
	);
}
