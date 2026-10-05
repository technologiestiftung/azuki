import { useState } from "react";
import { content } from "../../../content";
import { formatOccupationSchoolDegree } from "../utils/formatOccupationSchoolDegree";
import { buildBerufenetUrl } from "../utils/buildBerufenetUrl";
import { InfoBottomSheet } from "./InfoBottomSheet";
import { resolveDetailSalaryLabel } from "./occupationDetailPageHelpers";
import type { Occupation } from "@azuki/shared";

type MetaInfoSheet = "salary" | "schoolDegree";

interface OccupationDetailMetaInfoProps {
	occupation: Occupation | null;
	occupationDuration: string;
}

export function OccupationDetailMetaInfo({
	occupation,
	occupationDuration,
}: OccupationDetailMetaInfoProps) {
	const salaryLabel = resolveDetailSalaryLabel(occupation);
	const [activeInfoSheet, setActiveInfoSheet] = useState<MetaInfoSheet | null>(
		null,
	);

	const handleSalaryInfoClick = () => {
		setActiveInfoSheet("salary");
	};
	const handleSchoolDegreeInfoClick = () => {
		setActiveInfoSheet("schoolDegree");
	};

	const getSchoolDegreeSource = () => {
		if (occupation?.degreeStats) {
			return {
				label: content["results.detail.schoolDegreeInfo.dazubiSourceLabel"],
				href: content["results.detail.schoolDegreeInfo.dazubiSourceHref"],
			};
		}
		return occupation
			? {
					label:
						content["results.detail.schoolDegreeInfo.berufenetSourceLabel"],
					href: buildBerufenetUrl(occupation.id),
				}
			: undefined;
	};

	const getInfoSheetContent = () => {
		if (activeInfoSheet === "salary") {
			return {
				title: content["results.detail.salaryInfo.title"],
				description: content["results.detail.salaryInfo.description"],
				source: occupation
					? {
							label: content["results.detail.salaryInfo.sourceLabel"],
							href: buildBerufenetUrl(occupation.id),
						}
					: undefined,
			};
		}
		if (activeInfoSheet === "schoolDegree") {
			return {
				title: content["results.detail.schoolDegreeInfo.title"],
				description: content["results.detail.schoolDegreeInfo.description"],
				source: getSchoolDegreeSource(),
			};
		}
		return null;
	};
	const infoSheetContent = getInfoSheetContent();
	const schoolDegreeLabel = formatOccupationSchoolDegree(
		occupation?.degreeStats,
		occupation?.accessLevel,
	);

	return (
		<>
			<div className="flex flex-col gap-0.5">
				<div className="flex w-full gap-0.5">
					<div className="flex flex-col gap-1.5 rounded-tl-xl flex-1 px-4 py-3  bg-sky-50">
						<span className="text-sky-shade-110 text-base font-normal">
							{content["results.detail.durationTitle"]}
						</span>
						<span className="text-sky-900 text-xl font-semibold text-start">
							{occupationDuration}
						</span>
					</div>
					<button
						type="button"
						onClick={handleSalaryInfoClick}
						aria-label={`${content["results.detail.salaryTitle"]}, ${content["results.moreInfo"]}`}
						className="flex flex-col gap-1.5 flex-1 px-4 py-3 bg-sky-50 rounded-tr-xl text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
					>
						<span className="flex justify-between items-center text-sky-shade-110 text-base font-normal">
							{content["results.detail.salaryTitle"]}
							<img
								src="/icons/info.svg"
								alt=""
								className="w-5 h-5"
								aria-hidden
							/>
						</span>
						<span className="text-sky-900 text-xl font-semibold text-start">
							{salaryLabel}
						</span>
					</button>
				</div>
				<button
					type="button"
					onClick={handleSchoolDegreeInfoClick}
					aria-label={`${content["results.detail.schoolDegreeTitle"]}: ${schoolDegreeLabel}, ${content["results.moreInfo"]}`}
					className="flex flex-col gap-1.5 flex-1 px-4 py-3 bg-sky-50 rounded-b-xl text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
				>
					<span className="flex justify-between items-center text-sky-shade-110 text-base font-normal">
						{content["results.detail.schoolDegreeTitle"]}
						<img src="/icons/info.svg" alt="" className="w-5 h-5" aria-hidden />
					</span>
					<span className="text-sky-900 text-xl font-semibold text-start">
						{schoolDegreeLabel}
					</span>
				</button>
			</div>

			<InfoBottomSheet
				open={activeInfoSheet !== null}
				onClose={() => setActiveInfoSheet(null)}
				title={infoSheetContent?.title ?? ""}
				description={infoSheetContent?.description ?? ""}
				source={infoSheetContent?.source}
			/>
		</>
	);
}
