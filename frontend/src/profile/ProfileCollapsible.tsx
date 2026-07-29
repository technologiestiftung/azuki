import { Children, type ReactNode, useState } from "react";

interface ProfileCollapsibleProps {
	title: string;
	children: ReactNode;
	previewCount?: number;
	fullyCollapsible?: boolean;
	layout?: "wrap" | "stack";
}

const LAYOUT_CLASS = {
	wrap: "flex flex-wrap items-center gap-2",
	stack:
		"grid grid-cols-[max-content_auto_minmax(0,1fr)] items-center gap-x-[5px] gap-y-2",
} as const;

export function ProfileCollapsible({
	title,
	children,
	previewCount = 3,
	fullyCollapsible = false,
	layout = "wrap",
}: ProfileCollapsibleProps) {
	const [isOpen, setIsOpen] = useState(fullyCollapsible);
	const items = Children.toArray(children).filter(Boolean);
	const hiddenCount = fullyCollapsible
		? 0
		: Math.max(0, items.length - previewCount);

	let visibleItems = items;
	if (!isOpen) {
		visibleItems = fullyCollapsible ? [] : items.slice(0, previewCount);
	}

	const canCollapse = fullyCollapsible
		? items.length > 0
		: items.length > previewCount;

	return (
		<div className="flex flex-col gap-2 bg-sky-shade-10 rounded-xl p-4">
			<button
				type="button"
				className="flex w-full items-center justify-between"
				onClick={() => {
					if (canCollapse) {
						setIsOpen((open) => !open);
					}
				}}
				aria-expanded={isOpen}
				disabled={!canCollapse}
			>
				<h3 className="pl-1 font-semibold text-base text-sky-900">{title}</h3>
				{canCollapse && (
					<img
						src={
							isOpen
								? "/icons/chevron-up-light.svg"
								: "/icons/chevron-down-light.svg"
						}
						alt=""
						className="w-8 h-8"
					/>
				)}
			</button>
			{(isOpen || !fullyCollapsible) && (
				<div className={LAYOUT_CLASS[layout]}>
					{visibleItems}
					{!isOpen && hiddenCount > 0 && (
						<span
							className={`text-base text-sky-shade-100 ${
								layout === "stack" ? "col-span-full" : ""
							}`}
						>
							+{hiddenCount}
						</span>
					)}
				</div>
			)}
		</div>
	);
}
