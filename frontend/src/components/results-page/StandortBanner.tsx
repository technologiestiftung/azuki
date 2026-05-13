import { useEffect, useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import { content } from "../../content/de";

const RADIUS_OPTIONS = [10, 25, 50] as const;
const PLZ_REGEX = /^\d{5}$/;

export function StandortBanner() {
	const standort = useAppStore((state) => state.standort);
	const setStandort = useAppStore((state) => state.setStandort);

	const [draftPlz, setDraftPlz] = useState(standort.plz);

	useEffect(() => {
		setDraftPlz(standort.plz);
	}, [standort.plz]);

	const commitPlz = () => {
		if (PLZ_REGEX.test(draftPlz) && draftPlz !== standort.plz) {
			setStandort({ plz: draftPlz });
		} else if (!PLZ_REGEX.test(draftPlz)) {
			// Invalid input — snap back to last good value.
			setDraftPlz(standort.plz);
		}
	};

	return (
		<div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
			<div className="flex items-center gap-3">
				<label className="text-sm font-medium text-gray-700 shrink-0">
					{content["standort.label"]}
				</label>
				<input
					type="text"
					inputMode="numeric"
					maxLength={5}
					value={draftPlz}
					onChange={(e) => setDraftPlz(e.target.value.replace(/\D/g, ""))}
					onBlur={commitPlz}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.currentTarget.blur();
						}
					}}
					placeholder="10115"
					aria-label={content["standort.plzAriaLabel"]}
					className="w-20 h-9 px-3 text-sm font-medium rounded-lg border border-gray-300 focus:outline-none focus:border-gray-800 focus:ring-2 focus:ring-sky-300"
				/>
				<div className="flex gap-1 flex-1 overflow-x-auto">
					{RADIUS_OPTIONS.map((km) => (
						<button
							key={km}
							type="button"
							onClick={() => setStandort({ umkreis: km })}
							className={`h-9 px-3 rounded-lg text-sm font-medium transition-colors shrink-0 ${
								standort.umkreis === km
									? "bg-gray-900 text-white"
									: "bg-gray-100 text-gray-600 hover:bg-gray-200"
							}`}
							aria-pressed={standort.umkreis === km}
						>
							{km} km
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
