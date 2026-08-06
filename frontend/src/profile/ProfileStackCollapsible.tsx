import { Children, useMemo, useState, type ReactNode } from "react";

interface ProfileStackCollapsibleProps {
	title: string;
	children: ReactNode;
}

/** Stacked rows (e.g. strengths) that hide completely until expanded. */
export function ProfileStackCollapsible({
	title,
	children,
}: ProfileStackCollapsibleProps) {
	const [isOpen, setIsOpen] = useState(true);
	const items = useMemo(
		() => Children.toArray(children).filter(Boolean),
		[children],
	);
	const canCollapse = items.length > 0;

	return (
		<div className="flex flex-col gap-2 bg-sky-shade-10 rounded-xl p-4">
			<button
				type="button"
				className="flex w-full items-center justify-between"
				onClick={() => setIsOpen((open) => !open)}
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

			{isOpen && (
				<div className="grid grid-cols-[max-content_auto_minmax(0,1fr)] items-center gap-x-[5px] gap-y-2">
					{items}
				</div>
			)}
		</div>
	);
}
