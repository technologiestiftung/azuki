interface VacancyDetailHeroProps {
	displayName: string;
	employer: string | undefined;
}

export function VacancyDetailHero({
	displayName,
	employer,
}: VacancyDetailHeroProps) {
	return (
		<div className="relative shrink-0 bg-sky-100 flex flex-col rounded-b-[20px]">
			<div className="flex flex-col gap-1 p-4 pt-[110px] justify-end grow">
				<h1 className="text-3xl font-semibold text-sky-900">{displayName}</h1>
				{employer && <p className="text-lg text-sky-shade-140">{employer}</p>}
			</div>
		</div>
	);
}
