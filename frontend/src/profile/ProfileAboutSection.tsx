import type { UserProfile } from "../common";
import { content } from "../content";
import { schoolDegrees } from "../components/competence-profile/steps/school-degree/school-degrees";
import { categories as subjectCategories } from "../components/competence-profile/steps/school-subject-step/school-subjects";
import { interests as interestCategories } from "../components/competence-profile/steps/interests-step/interests";
import { strengths as strengthOptions } from "../components/competence-profile/steps/strengths-step/strengths";
import { workExpectationOptions } from "../components/competence-profile/steps/work-expectation-options";
import { workPreferencePairs } from "../content/work-preference-pairs";
import { noGos as noGoOptions } from "../components/competence-profile/steps/no-gos-step/no-gos";
import { ProfileWrapCollapsible } from "./ProfileWrapCollapsible";
import { ProfileStackCollapsible } from "./ProfileStackCollapsible";
import { ProfileChip } from "./ProfileChip";

interface ProfileAboutSectionProps {
	profile: UserProfile;
}

function resolveSubjectLabel(id: string): string {
	for (const category of subjectCategories) {
		const match = category.subjects.find((subject) => subject.value === id);
		if (match) {
			return match.label;
		}
	}
	return id;
}

function resolveInterestLabel(id: string): string {
	for (const category of interestCategories) {
		const match = category.interests.find((interest) => interest.value === id);
		if (match) {
			return match.label;
		}
	}
	return id;
}

export function ProfileAboutSection({ profile }: ProfileAboutSectionProps) {
	const favoriteSubjects = profile.favoriteSubjects;
	const interests = profile.interests;
	const strengthScores = Object.entries(profile.strengths);
	const strongStrengths = strengthScores.filter(([, value]) => value >= 0.5);
	const hardships = strengthScores.filter(([, value]) => value < 0.5);
	const selectedCustomStrengths = profile.selectedCustomStrengths.filter(
		(strength) => profile.customStrengths.includes(strength),
	);
	const workExpectations = profile.workExpectations;
	const workPreferences = Object.entries(profile.workPreferences).filter(
		(entry): entry is [string, "a" | "b"] =>
			entry[1] === "a" || entry[1] === "b",
	);
	const rejectedNoGos = Object.entries(profile.noGos)
		.filter(([, value]) => value === "rejected")
		.map(([noGoId]) => noGoId);

	return (
		<div className="flex flex-col gap-5 pt-4 px-4 pb-[28px] bg-white rounded-t-[20px]">
			<h2 className="text-3xl font-semibold leading-10 text-sky-900 px-0.5">
				{content["profile.aboutYou"]}
			</h2>
			<div className="flex flex-col gap-3 pl-0.5">
				<div className="flex flex-col gap-3 bg-sky-shade-10 rounded-xl p-4">
					<h3 className="pl-1 font-semibold text-base text-sky-900">
						{profile.inSchool
							? content["profile.schoolDegreeLabel.inSchool"]
							: content["profile.schoolDegreeLabel.planned"]}
					</h3>
					<div className="flex gap-2 items-center justify-start">
						<img src="/icons/school.svg" alt="" className="w-5 h-5" />
						<div className="text-lg text-sky-900">
							{
								schoolDegrees.find(
									(degree) => degree.value === profile.educationLevel,
								)?.label
							}
						</div>
					</div>
				</div>
			</div>
			{favoriteSubjects.length > 0 && (
				<ProfileWrapCollapsible title={content["profile.favoriteSubjects"]}>
					{favoriteSubjects.map((subject) => (
						<ProfileChip key={subject}>
							{resolveSubjectLabel(subject)}
						</ProfileChip>
					))}
				</ProfileWrapCollapsible>
			)}
			{interests.length > 0 && (
				<ProfileWrapCollapsible title={content["profile.interests"]}>
					{interests.map((interest) => (
						<ProfileChip key={interest}>
							{resolveInterestLabel(interest)}
						</ProfileChip>
					))}
				</ProfileWrapCollapsible>
			)}
			{(strongStrengths.length > 0 || selectedCustomStrengths.length > 0) && (
				<ProfileStackCollapsible title={content["profile.strengths"]}>
					{strongStrengths.map(([strengthId, value]) => {
						const label =
							strengthOptions.find((strength) => strength.id === strengthId)
								?.title ?? strengthId;
						const percent = Math.round(value * 100);
						return (
							<div key={strengthId} className="contents">
								<span className="text-base text-sky-900 pl-1">{label}</span>
								<span className="text-xs font-semibold text-sky-300">
									{percent} %
								</span>
								<div className="h-2 min-w-0 rounded-full bg-sky-100 overflow-hidden mr-8">
									<div
										className="h-full bg-sky-300 rounded-full transition-all duration-500 ease-out"
										style={{ width: `${percent}%` }}
									/>
								</div>
							</div>
						);
					})}
					{selectedCustomStrengths.map((label) => (
						<div key={label} className="contents">
							<span className="text-base text-sky-900 pl-1">{label}</span>
							<span className="text-xs font-semibold text-sky-300">100 %</span>
							<div className="h-2 min-w-0 rounded-full bg-sky-100 overflow-hidden mr-8">
								<div className="h-full w-full bg-sky-300 rounded-full" />
							</div>
						</div>
					))}
				</ProfileStackCollapsible>
			)}
			{hardships.length > 0 && (
				<ProfileStackCollapsible title={content["profile.hardships"]}>
					{hardships.map(([strengthId, value]) => {
						const label =
							strengthOptions.find((strength) => strength.id === strengthId)
								?.title ?? strengthId;
						const percent = Math.round(value * 100);
						return (
							<div key={strengthId} className="contents">
								<span className="text-base text-sky-900 pl-1">{label}</span>
								<span className="text-xs font-semibold text-orange-400">
									{percent} %
								</span>
								<div className="h-2 min-w-0 rounded-full bg-orange-200 overflow-hidden mr-8">
									<div
										className="h-full bg-orange-400 rounded-full transition-all duration-500 ease-out"
										style={{ width: `${percent}%` }}
									/>
								</div>
							</div>
						);
					})}
				</ProfileStackCollapsible>
			)}
			{workExpectations.length > 0 && (
				<ProfileWrapCollapsible title={content["profile.workExpectations"]}>
					{workExpectations.map((expectation) => (
						<ProfileChip key={expectation}>
							{workExpectationOptions.find(
								(option) => option.value === expectation,
							)?.label ?? expectation}
						</ProfileChip>
					))}
				</ProfileWrapCollapsible>
			)}
			{profile.practicalExperiences.length > 0 && (
				<ProfileWrapCollapsible title={content["profile.practicalExperiences"]}>
					{profile.practicalExperiences.map((experience) => (
						<ProfileChip key={experience.id} className="gap-1.5">
							<span data-chip-label className="min-w-0">
								{experience.description}
							</span>
							<span className="flex shrink-0 items-center justify-center text-sm text-sky-300">
								{experience.rating}
								<img
									src="/icons/theme-colored-star.svg"
									alt=""
									className="w-3 h-3 shrink-0"
								/>
							</span>
						</ProfileChip>
					))}
				</ProfileWrapCollapsible>
			)}
			{workPreferences.length > 0 && (
				<ProfileWrapCollapsible title={content["profile.workPreferences"]}>
					{workPreferences.map(([preferenceId, choice]) => {
						const pair = workPreferencePairs.find(
							(item) => item.id === preferenceId,
						);
						let label = preferenceId;
						if (pair) {
							label = choice === "a" ? pair.a : pair.b;
						}

						return (
							<ProfileChip key={preferenceId} className="gap-1.5">
								{label}
							</ProfileChip>
						);
					})}
				</ProfileWrapCollapsible>
			)}
			{rejectedNoGos.length > 0 && (
				<ProfileWrapCollapsible title={content["profile.noGos"]}>
					{rejectedNoGos.map((noGoId) => (
						<ProfileChip key={noGoId} variant="noGo" className="gap-1.5">
							{noGoOptions.find((entry) => entry.id === noGoId)?.title ??
								noGoId}
						</ProfileChip>
					))}
				</ProfileWrapCollapsible>
			)}
		</div>
	);
}
