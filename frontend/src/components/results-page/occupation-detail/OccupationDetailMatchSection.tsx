import { useEffect, useId, useState } from "react";
import type { Occupation, UserProfile } from "@azuki/shared";
import {
	fetchMatchExplanations,
	getCachedMatchExplanations,
} from "../../../api/client";
import { content } from "../../../content";
import { FitDonutChart } from "./FitDonutChart";
import { InfoBottomSheet } from "./InfoBottomSheet";
import {
	MatchExplanationCards,
	type OccupationMatchExplanation,
} from "./MatchExplanationCards";

interface OccupationDetailMatchSectionProps {
	matchPercent?: number;
	occupation: Occupation | null;
	profile: UserProfile;
}

interface AiExplanationGroups {
	matching: OccupationMatchExplanation[];
	notMatching: OccupationMatchExplanation[];
}

function toExplanations(
	items: Array<{ id: string; label: string; icon: string; summary: string }>,
): OccupationMatchExplanation[] {
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
): AiExplanationGroups {
	return {
		matching: toExplanations(matching),
		notMatching: toExplanations(notMatching),
	};
}

export function OccupationDetailMatchSection({
	matchPercent,
	occupation,
	profile,
}: OccupationDetailMatchSectionProps) {
	const [isMatchInfoOpen, setIsMatchInfoOpen] = useState(false);
	const matchingHeadingId = useId();
	const notMatchingHeadingId = useId();
	const [explanations, setExplanations] = useState<AiExplanationGroups>({
		matching: [],
		notMatching: [],
	});
	const [loading, setLoading] = useState(false);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		setExplanations({ matching: [], notMatching: [] });
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
			setExplanations(groupsFromResponse(cached.matching, cached.notMatching));
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
				setExplanations(
					groupsFromResponse(result.matching, result.notMatching),
				);
				setFailed(false);
			} catch (err) {
				if (controller.signal.aborted) {
					return;
				}
				console.error("Failed to load match explanations:", err);
				setExplanations({ matching: [], notMatching: [] });
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

	const { matching, notMatching } = explanations;

	return (
		<>
			<div className="flex flex-col px-4">
				<div className="flex flex-col overflow-hidden rounded-[20px]">
					<div className="flex flex-col gap-6 px-4 pt-3 pb-4 bg-sky-50 border-b-2 border-white">
						<div className="flex flex-col gap-0.5">
							<h2 className="text-sky-900 text-2xl font-semibold leading-8">
								{content["results.detail.tasks.matchTitle"]}
							</h2>
							<button
								type="button"
								aria-label={content["results.detail.tasks.matchInfo.ariaLabel"]}
								onClick={() => setIsMatchInfoOpen(true)}
								className="h-8 flex gap-1 items-center justify-start text-sky-shade-140 text-base font-medium underline underline-offset-2 text-start"
							>
								{content["results.detail.tasks.matchInfo.title"]}
								<img src="/icons/info.svg" alt="" className="w-5 h-5" />
							</button>
						</div>
						{matchPercent !== undefined && (
							<div className="flex items-center justify-between gap-4">
								<span className="text-sky-900 text-[85px] font-medium leading-none">
									{matchPercent}
									<span className="text-[40px]"> </span>%
								</span>
								<FitDonutChart
									percent={matchPercent}
									trackClassName="stroke-orange-400"
									roundedCaps={false}
								/>
							</div>
						)}
					</div>
					<div className="flex flex-col gap-3.5 px-4 pt-3 pb-4 bg-sky-50">
						<h3
							id={matchingHeadingId}
							className="pl-1.5 text-sky-900 text-base font-semibold"
						>
							{content["results.detail.whyItMatches.title"]}
						</h3>
						<MatchExplanationCards
							labelledBy={matchingHeadingId}
							explanations={matching}
							emptyMessage={content["results.detail.whyItMatches.empty"]}
							loading={loading}
							unavailable={failed}
							loadingMessage={
								content["results.detail.matchExplanations.loading"]
							}
							unavailableMessage={
								content["results.detail.matchExplanations.unavailable"]
							}
						/>
					</div>
					<div className="flex flex-col gap-3.5 px-4 pt-3 pb-4 bg-orange-100">
						<h3
							id={notMatchingHeadingId}
							className="pl-1.5 text-sky-900 text-base font-semibold"
						>
							{content["results.detail.whyItMatches.notMatchTitle"]}
						</h3>
						<MatchExplanationCards
							labelledBy={notMatchingHeadingId}
							explanations={notMatching}
							emptyMessage={
								content["results.detail.whyItMatches.notMatchEmpty"]
							}
							loading={loading}
							unavailable={failed}
							loadingMessage={
								content["results.detail.matchExplanations.loading"]
							}
							unavailableMessage={
								content["results.detail.matchExplanations.unavailable"]
							}
						/>
					</div>
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
