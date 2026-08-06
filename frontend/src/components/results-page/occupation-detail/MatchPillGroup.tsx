export interface OccupationMatchPill {
	id: string;
	label: string;
	icon: string;
	summary: string;
}

interface MatchPillGroupProps {
	pills: OccupationMatchPill[];
	selectedId: string | null;
	onSelect: (id: string) => void;
	variant: "match" | "notMatch";
	emptyMessage?: string;
	loading?: boolean;
	unavailable?: boolean;
	loadingMessage?: string;
	unavailableMessage?: string;
}

function MatchPillIcon({ icon }: { icon: string }) {
	if (icon.startsWith("/")) {
		return <img src={icon} alt="" className="w-5 h-5 shrink-0" />;
	}

	return <span className="text-lg leading-none shrink-0">{icon}</span>;
}

export function MatchPillGroup({
	pills,
	selectedId,
	onSelect,
	variant,
	emptyMessage,
	loading = false,
	unavailable = false,
	loadingMessage,
	unavailableMessage,
}: MatchPillGroupProps) {
	const selectedPill = pills.find((pill) => pill.id === selectedId);
	const selectedClassName =
		variant === "match"
			? "border-sky-300 bg-sky-100"
			: "border-orange-300 bg-orange-200";
	const unselectedClassName =
		variant === "match"
			? "border-sky-200 bg-sky-0"
			: "border-orange-200 bg-orange-0";

	if (loading) {
		return loadingMessage ? (
			<p className="text-center text-base text-sky-shade-110 px-[21px]">
				{loadingMessage}
			</p>
		) : null;
	}

	if (unavailable && pills.length === 0) {
		return unavailableMessage ? (
			<p className="text-center text-base text-sky-shade-110 px-[21px]">
				{unavailableMessage}
			</p>
		) : null;
	}

	if (pills.length === 0) {
		return emptyMessage ? (
			<p className="text-center text-base text-sky-shade-110 px-[21px]">
				{emptyMessage}
			</p>
		) : null;
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap gap-1.5 ">
				{pills.map((pill) => (
					<button
						key={pill.id}
						type="button"
						onClick={() => onSelect(pill.id)}
						aria-label={pill.label}
						aria-pressed={selectedId === pill.id}
						className={`h-9 flex min-w-0 max-w-full shrink-0 items-center px-[14px] py-1 rounded-[100px] border-2 text-lg text-sky-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 box-border ${
							selectedId === pill.id ? selectedClassName : unselectedClassName
						}`}
					>
						<span className="truncate">{pill.label}</span>
					</button>
				))}
			</div>
			{selectedPill && (
				<div className="px-[5px]" aria-live="polite">
					<h3 className="flex items-center gap-1.5 text-lg font-semibold text-sky-900 mb-[1px]">
						<MatchPillIcon icon={selectedPill.icon} />
						<span>{selectedPill.label}</span>
					</h3>
					<p className="text-lg text-sky-900">{selectedPill.summary}</p>
				</div>
			)}
		</div>
	);
}
