import { useEffect, useMemo, useState } from "react";
import type { Occupation, UserProfile } from "@azuki/shared";
import { content } from "../../../content";
import { FitDonutChart } from "./FitDonutChart";
import { InfoBottomSheet } from "./InfoBottomSheet";
import { buildOccupationMatchPills } from "../utils/occupationMatchPills";
import { MatchPillGroup } from "./MatchPillGroup";

interface OccupationDetailMatchSectionProps {
	matchPercent?: number;
	occupation: Occupation | null;
	profile: UserProfile;
}

export function OccupationDetailMatchSection({
	matchPercent,
	occupation,
	profile,
}: OccupationDetailMatchSectionProps) {
	const [isMatchInfoOpen, setIsMatchInfoOpen] = useState(false);
	const [selectedMatchPillId, setSelectedMatchPillId] = useState<string | null>(
		null,
	);
	const [selectedNotMatchPillId, setSelectedNotMatchPillId] = useState<
		string | null
	>(null);

	const { matching, notMatching } = useMemo(() => {
		if (!occupation) {
			return { matching: [], notMatching: [] };
		}
		return buildOccupationMatchPills(profile, occupation);
	}, [occupation, profile]);

	useEffect(() => {
		setSelectedMatchPillId(null);
		setSelectedNotMatchPillId(null);
	}, [occupation?.id]);

	const activeMatchPillId =
		matching.find((pill) => pill.id === selectedMatchPillId)?.id ??
		matching[0]?.id ??
		null;
	const activeNotMatchPillId =
		notMatching.find((pill) => pill.id === selectedNotMatchPillId)?.id ??
		notMatching[0]?.id ??
		null;

	return (
		<>
			<div className="flex flex-col px-4 gap-0.5">
				<div className="px-[18px] pt-3 pb-4 flex flex-col gap-6 rounded-t-[20px] bg-sky-50">
					<div className="flex flex-col gap-0.5">
						<h2 className="text-sky-900 text-2xl font-semibold">
							{content["results.detail.tasks.matchTitle"]}
						</h2>
						<button
							type="button"
							aria-label={content["results.detail.tasks.matchInfo.ariaLabel"]}
							onClick={() => setIsMatchInfoOpen(true)}
							className="h-10 flex gap-1 items-center justify-start text-sky-140 text-base font-medium underline underline-offset-2 text-start"
						>
							{content["results.detail.tasks.matchInfo.title"]}
							<img src="/icons/info.svg" alt="" className="w-5 h-5" />
						</button>
					</div>
					{matchPercent !== undefined && (
						<div className="flex items-center justify-between gap-4">
							<span className="text-sky-900 text-[85px] font-medium leading-none">
								{matchPercent}%
							</span>
							<FitDonutChart percent={matchPercent} />
						</div>
					)}
				</div>
				<div className="flex flex-col gap-6 px-4 pt-5 pb-4 bg-sky-10">
					<div className="flex gap-[9px]">
						<div className="flex items-center justify-center w-[30px] h-[30px] bg-sky-300 rounded-md px-[5px] pt-[5px] pb-[7px]">
							<img src="/icons/thumb-up.svg" alt="" className="w-4 h-4" />
						</div>
						<h2 className="text-sky-900 text-xl font-semibold self-center">
							{content["results.detail.whyItMatches.title"]}
						</h2>
					</div>
					<MatchPillGroup
						pills={matching}
						selectedId={activeMatchPillId}
						onSelect={setSelectedMatchPillId}
						variant="match"
						emptyMessage={content["results.detail.whyItMatches.empty"]}
					/>
				</div>
				<div className="flex flex-col gap-6 px-4 pt-5 pb-4 rounded-b-[20px] bg-sky-10">
					<div className="flex gap-[9px]">
						<div className="flex items-center justify-center w-[30px] h-[30px] bg-orange-400 rounded-md px-[5px] pt-[5px] pb-[7px]">
							<img src="/icons/thumb-down.svg" alt="" className="w-4 h-4" />
						</div>
						<h2 className="text-sky-900 text-xl font-semibold self-center">
							{content["results.detail.whyItMatches.notMatchTitle"]}
						</h2>
					</div>
					<MatchPillGroup
						pills={notMatching}
						selectedId={activeNotMatchPillId}
						onSelect={setSelectedNotMatchPillId}
						variant="notMatch"
						emptyMessage={content["results.detail.whyItMatches.notMatchEmpty"]}
					/>
				</div>
			</div>
			<InfoBottomSheet
				open={isMatchInfoOpen}
				onClose={() => setIsMatchInfoOpen(false)}
				title={content["results.detail.tasks.matchInfo.title"]}
				description={content["results.detail.tasks.matchInfo.description"]}
			/>
		</>
	);
}
