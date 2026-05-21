import { type CSSProperties, type Ref } from "react";
import { PrimaryThemedButton } from "../primitives/buttons/PrimaryThemedButton";
import { Pill } from "../primitives/buttons/Pill";

export interface CustomSwipeStepCardLabels {
	listLabel: string;
	pillAriaPostfix: string;
	addMore: string;
	addLabel: string;
	addAriaLabel: string;
	customTitle: string;
	customDescription: string;
}

export interface CustomSwipeStepCardProps {
	sectionRef?: Ref<HTMLDivElement>;
	stackGhostLayerScale: number;
	items: string[];
	isSelected: (item: string) => boolean;
	onToggle: (item: string) => void;
	onAddClick: () => void;
	labels: CustomSwipeStepCardLabels;
	illustrationSrc: string;
}

export function CustomSwipeStepCard({
	sectionRef,
	stackGhostLayerScale,
	items,
	isSelected,
	onToggle,
	onAddClick,
	labels,
	illustrationSrc,
}: CustomSwipeStepCardProps) {
	return (
		<div
			ref={sectionRef}
			className="flex h-full min-h-0 w-full flex-1 flex-col origin-top animate-customStrengthCardExpand"
			style={
				{
					"--stack-ghost-scale": String(stackGhostLayerScale),
				} as CSSProperties
			}
		>
			<div className="flex h-full min-h-0 w-full flex-1 flex-col rounded-3xl bg-gray-200 py-5 px-6 mb-3">
				{items.length > 0 ? (
					<>
						<h3 className="text-lg font-semibold text-gray-500 mb-2 shrink-0">
							{labels.listLabel}
						</h3>
						<div className="min-h-0 flex-1 overflow-y-auto">
							<ul className="flex flex-wrap gap-x-2 gap-y-2">
								{items.map((item) => (
									<Pill
										key={item}
										label={item}
										selected={isSelected(item)}
										onClick={() => onToggle(item)}
										ariaLabel={`${item} ${labels.pillAriaPostfix}`}
										className="text-left w-fit"
									/>
								))}
							</ul>
						</div>
						<PrimaryThemedButton className="mt-9 shrink-0" onClick={onAddClick}>
							<div className="flex items-center gap-2 justify-center">
								<img src="/icons/plus-black.svg" alt="" className="w-6 h-6" />
								{labels.addMore}
							</div>
						</PrimaryThemedButton>
					</>
				) : (
					<div className="flex h-full min-h-0 flex-1 flex-col gap-2 items-center justify-center">
						<div className="flex min-h-0 w-full flex-1 items-center justify-center p-2">
							<img
								src={illustrationSrc}
								alt=""
								className="max-h-full w-full max-w-full object-contain"
								draggable={false}
							/>
						</div>
						<div className="flex flex-col gap-0.5 items-center justify-center text-center mb-2 shrink-0">
							<h3 className="text-2xl font-semibold text-gray-700">
								{labels.customTitle}
							</h3>
							<p className="text-base text-gray-700">
								{labels.customDescription}
							</p>
						</div>
						<PrimaryThemedButton
							className="text-lg shrink-0"
							ariaLabel={labels.addAriaLabel}
							onClick={onAddClick}
						>
							<div className="flex items-center gap-2 justify-center">
								<img src="/icons/plus-black.svg" alt="" className="w-6 h-6" />
								{labels.addLabel}
							</div>
						</PrimaryThemedButton>
					</div>
				)}
			</div>
		</div>
	);
}
