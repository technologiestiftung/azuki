import { content } from "../../../content/de";
import { useAppStore } from "../../../store/useAppStore";
import { StepLayout } from "./StepLayout";
import { useFlowNavigation } from "../../../routing/useFlowNavigation";

export function InSchoolStep() {
	const profile = useAppStore((state) => state.profile);
	const setInSchool = useAppStore((state) => state.setInSchool);
	const { goNext } = useFlowNavigation();

	const inSchoolOptions: { value: boolean; label: string }[] = [
		{ value: true, label: content["inSchool.option.yes.label"] },
		{ value: false, label: content["inSchool.option.no.label"] },
	];
	return (
		<StepLayout
			question={content["inSchool.question"]}
			onNext={goNext}
			onSkip={goNext}
			hasSkipButton={false}
			isSkipConfirmDialogOpen={profile.inSchool === null}
		>
			<div className="flex flex-col gap-3">
				{inSchoolOptions.map((option) => (
					<button
						className={`h-[52px] text-left p-3 w-full rounded-xl border-2 text-gray-700 text-lg font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
							profile.inSchool === option.value
								? "border-sky-300 bg-sky-50 text-sky-700"
								: "border-gray-200 bg-transparent"
						}`}
						key={option.value.toString()}
						onClick={() => setInSchool(option.value)}
					>
						{option.label}
					</button>
				))}
			</div>
		</StepLayout>
	);
}
