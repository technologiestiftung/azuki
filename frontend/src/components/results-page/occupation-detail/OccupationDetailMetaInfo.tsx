import { useState } from "react";
import { content } from "../../../content";
import { formatOccupationSalary } from "../utils/formatOccupationSalary";
import { InfoBottomSheet } from "./InfoBottomSheet";
import type { Occupation } from "@azuki/shared";

type MetaInfoSheet = "salary" | "schoolDegree";

interface OccupationDetailMetaInfoProps {
	occupation: Occupation | null;
}

export function OccupationDetailMetaInfo({
	occupation,
}: OccupationDetailMetaInfoProps) {
	const salaryMedian = occupation?.salaryMonthlyMedian ?? 0;
	const [activeInfoSheet, setActiveInfoSheet] = useState<MetaInfoSheet | null>(
		null,
	);

	const handleSalaryInfoClick = () => {
		setActiveInfoSheet("salary");
	};
	const handleSchoolDegreeInfoClick = () => {
		setActiveInfoSheet("schoolDegree");
	};

	const getInfoSheetContent = () => {
		if (activeInfoSheet === "salary") {
			return {
				title: content["results.detail.salaryInfo.title"],
				description: content["results.detail.salaryInfo.description"],
			};
		}
		if (activeInfoSheet === "schoolDegree") {
			return {
				title: content["results.detail.schoolDegreeInfo.title"],
				description: content["results.detail.schoolDegreeInfo.description"],
			};
		}
		return null;
	};
	const infoSheetContent = getInfoSheetContent();

	return (
		<>
			<div className="flex flex-col gap-0.5">
				<div className="flex w-full gap-0.5">
					<div className="flex flex-col gap-1.5 rounded-tl-xl flex-1 px-4 py-3  bg-sky-50">
						<span className="sky-110 text-base font-normal">
							{content["results.detail.durationTitle"]}
						</span>
						<span className="text-sky-900 text-xl font-semibold text-start">
							{/* TODO: duration */}3 Jahre
						</span>
					</div>
					<button
						type="button"
						onClick={handleSalaryInfoClick}
						aria-label={`${content["results.detail.salaryTitle"]}, ${content["results.moreInfo"]}`}
						className="flex flex-col gap-1.5 flex-1 px-4 py-3 bg-sky-50 rounded-tr-xl text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
					>
						<span className="flex justify-between items-center sky-110 text-base font-normal">
							{content["results.detail.salaryTitle"]}
							<img
								src="/icons/info.svg"
								alt=""
								className="w-5 h-5"
								aria-hidden
							/>
						</span>
						<span className="text-sky-900 text-xl font-semibold text-start">
							{formatOccupationSalary(salaryMedian)}{" "}
							{content["results.detail.salarySuffix"]}
						</span>
					</button>
				</div>
				<button
					type="button"
					onClick={handleSchoolDegreeInfoClick}
					aria-label={`${content["results.detail.schoolDegreeTitle"]}, ${content["results.moreInfo"]}`}
					className="flex flex-col gap-1.5 flex-1 px-4 py-3 bg-sky-50 rounded-b-xl text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
				>
					<span className="flex justify-between items-center sky-110 text-base font-normal">
						{content["results.detail.schoolDegreeTitle"]}
						<img src="/icons/info.svg" alt="" className="w-5 h-5" aria-hidden />
					</span>
					<span className="text-sky-900 text-xl font-semibold text-start">
						{/* TODO: accessLevel content */}
						{occupation?.accessLevel ?? "Unbekannt"}
					</span>
				</button>
			</div>

			<InfoBottomSheet
				open={activeInfoSheet !== null}
				onClose={() => setActiveInfoSheet(null)}
				title={infoSheetContent?.title ?? ""}
				description={infoSheetContent?.description ?? ""}
			/>
		</>
	);
}
