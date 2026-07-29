import { useEffect, useState } from "react";
import type { Occupation, UserProfile } from "@azuki/shared";
import {
	fetchMatchExplanations,
	getCachedMatchExplanations,
} from "../../../api/client";
import { content } from "../../../content";
import { FitDonutChart } from "./FitDonutChart";
import { InfoBottomSheet } from "./InfoBottomSheet";
import { MatchPillGroup, type OccupationMatchPill } from "./MatchPillGroup";

interface OccupationDetailMatchSectionProps {
	matchPercent?: number;
	occupation: Occupation | null;
	profile: UserProfile;
}

interface AiPillGroups {
	matching: OccupationMatchPill[];
	notMatching: OccupationMatchPill[];
}

function toPills(
	items: Array<{ id: string; label: string; icon: string; summary: string }>,
): OccupationMatchPill[] {
	return items.map((item) => ({
		id: item.id,
		label: item.label,
		icon: item.icon,
		summary: item.summary,
	}));
}

function groupsFromResponse(
	matching: Array<{ id: string; label: string; icon: string; summary: string }>,
	notMatching: Array<{
		id: string;
		label: string;
		icon: string;
		summary: string;
	}>,
): AiPillGroups {
	return {
		matching: toPills(matching),
		notMatching: toPills(notMatching),
	};
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
	const [pills, setPills] = useState<AiPillGroups>({
		matching: [],
		notMatching: [],
	});
	const [loading, setLoading] = useState(false);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		setSelectedMatchPillId(null);
		setSelectedNotMatchPillId(null);
		setPills({ matching: [], notMatching: [] });
		setLoading(false);
		setFailed(false);
	}, [occupation?.id]);

	const profileKey = JSON.stringify(profile);

	useEffect(() => {
		if (!occupation) {
			return undefined;
		}

		const occupationId = occupation.id;
		const cached = getCachedMatchExplanations(occupationId, profile);
		if (cached) {
			setPills(groupsFromResponse(cached.matching, cached.notMatching));
			setLoading(false);
			setFailed(false);
			return undefined;
		}

		const controller = new AbortController();
		setLoading(true);
		setFailed(false);

		void (async () => {
			try {
				const result = await fetchMatchExplanations(
					occupationId,
					profile,
					controller.signal,
				);
				if (controller.signal.aborted) {
					return;
				}
				setPills(groupsFromResponse(result.matching, result.notMatching));
				setFailed(false);
			} catch (err) {
				if (controller.signal.aborted) {
					return;
				}
				console.error("Failed to load match explanations:", err);
				setPills({ matching: [], notMatching: [] });
				setFailed(true);
			} finally {
				if (!controller.signal.aborted) {
					setLoading(false);
				}
			}
		})();

		return () => {
			controller.abort();
		};
	}, [occupation?.id, profileKey]);

	const { matching, notMatching } = pills;

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
							className="h-10 flex gap-1 items-center justify-start text-sky-shade-140 text-base font-medium underline underline-offset-2 text-start"
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
				<div className="flex flex-col gap-6 px-4 pt-5 pb-4 bg-sky-shade-10">
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
						loading={loading}
						unavailable={failed}
						loadingMessage={content["results.detail.matchExplanations.loading"]}
						unavailableMessage={
							content["results.detail.matchExplanations.unavailable"]
						}
					/>
				</div>
				<div className="flex flex-col gap-6 px-4 pt-5 pb-4 rounded-b-[20px] bg-sky-shade-10">
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
						loading={loading}
						unavailable={failed}
						loadingMessage={content["results.detail.matchExplanations.loading"]}
						unavailableMessage={
							content["results.detail.matchExplanations.unavailable"]
						}
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
