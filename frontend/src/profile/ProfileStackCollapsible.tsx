import { Children, useMemo, type ReactNode } from "react";

interface ProfileStackCollapsibleProps {
	title: string;
	children: ReactNode;
}

/** Stacked rows (e.g. strengths) that hide completely until expanded. */
export function ProfileStackCollapsible({
	title,
	children,
}: ProfileStackCollapsibleProps) {
	const items = useMemo(
		() => Children.toArray(children).filter(Boolean),
		[children],
	);

	return (
		<div className="flex flex-col gap-2 bg-sky-shade-10 rounded-xl p-4">
			<div className="flex w-full items-center justify-between">
				<h3 className="pl-1 font-semibold text-base text-sky-900">{title}</h3>
			</div>

			<div className="grid grid-cols-[max-content_auto_minmax(0,1fr)] items-center gap-x-1.5 gap-y-2">
				{items}
			</div>
		</div>
	);
}
