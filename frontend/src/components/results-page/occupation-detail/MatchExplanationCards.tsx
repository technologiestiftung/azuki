export interface OccupationMatchExplanation {
	id: string;
	label: string;
	icon: string;
	summary: string;
}

interface MatchExplanationCardsProps {
	explanations: OccupationMatchExplanation[];
	emptyMessage?: string;
	loading?: boolean;
	unavailable?: boolean;
	loadingMessage?: string;
	unavailableMessage?: string;
}

export function MatchExplanationCards({
	explanations,
	emptyMessage,
	loading = false,
	unavailable = false,
	loadingMessage,
	unavailableMessage,
}: MatchExplanationCardsProps) {
	if (loading) {
		return loadingMessage ? (
			<p className="text-center text-base text-sky-shade-110 px-[21px]">
				{loadingMessage}
			</p>
		) : null;
	}

	if (unavailable && explanations.length === 0) {
		return unavailableMessage ? (
			<p className="text-center text-base text-sky-shade-110 px-[21px]">
				{unavailableMessage}
			</p>
		) : null;
	}

	if (explanations.length === 0) {
		return emptyMessage ? (
			<p className="text-center text-base text-sky-shade-110 px-[21px]">
				{emptyMessage}
			</p>
		) : null;
	}

	return (
		<ul className="flex items-stretch gap-2 -mx-4 px-4 overflow-x-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
			{explanations.map((explanation) => (
				<li
					key={explanation.id}
					className="flex shrink-0 w-[291px] flex-col gap-3 px-2 py-3 rounded-lg bg-white"
				>
					<div className="flex flex-col gap-1 px-[5px] text-sky-900">
						<h4 className="flex items-center gap-1 text-2xl font-semibold leading-8">
							{explanation.icon.startsWith("/") ? (
								<img
									src={explanation.icon}
									alt=""
									className="w-5 h-5 shrink-0"
								/>
							) : (
								<span className="text-xl leading-[22px] shrink-0">
									{explanation.icon}
								</span>
							)}
							<span>{explanation.label}</span>
						</h4>
						<p className="text-lg leading-6">{explanation.summary}</p>
					</div>
				</li>
			))}
		</ul>
	);
}
