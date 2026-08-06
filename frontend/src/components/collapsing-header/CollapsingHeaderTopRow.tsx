import type { CSSProperties, ReactNode } from "react";

export const COLLAPSED_THRESHOLD = 0.5;

/**
 * Gray (gray-300) action-button background that fades out as the header
 * collapses, so buttons read as SecondaryIconButtons while expanded and as
 * plain ghost buttons once collapsed.
 */
export function expandedButtonBackgroundStyle(progress: number): CSSProperties {
	return {
		backgroundColor: `rgba(209, 213, 219, ${Math.max(0, 1 - progress)})`,
	};
}

type GradientFrom = "white" | "sky-100";

interface CollapsingHeaderTopRowProps {
	title: ReactNode;
	progress: number;
	leading?: ReactNode;
	trailing?: ReactNode;
	collapsedFill?: boolean;
	collapsedBorder?: boolean;
	gradientFrom?: GradientFrom;
}

export function CollapsingHeaderTopRow({
	title,
	progress,
	leading,
	trailing,
	collapsedFill = true,
	collapsedBorder = true,
	gradientFrom = "white",
}: CollapsingHeaderTopRowProps) {
	const collapsed = progress > COLLAPSED_THRESHOLD;
	const fromClass = gradientFrom === "sky-100" ? "from-sky-100" : "from-white";

	return (
		// Zero-height sticky wrapper: lives inside the scroll container (so the
		// native scrollbar always paints on top) but takes no layout space, so the
		// large title still starts at the top and scrolls behind it.
		<div className="sticky top-0 z-30 h-0 pointer-events-none">
			<div className="relative w-full">
				{/* Always-present soft gradient so the large title fades behind it. */}
				<div
					className={`absolute inset-0 bg-gradient-to-b ${fromClass} from-[70%] to-transparent`}
					aria-hidden
				/>
				{/* Solid white fill + border, cross-faded in on collapse. */}
				{collapsedFill && (
					<div
						className={`absolute inset-0 bg-white transition-opacity duration-150 ease-[cubic-bezier(0.25,0,0.25,1)] ${
							collapsedBorder ? "border-b-2 border-sky-shade-20" : ""
						}`}
						style={{ opacity: collapsed ? 1 : 0 }}
						aria-hidden
					/>
				)}
				<div className="relative flex items-center gap-1.5 pt-3 px-4 pb-2 min-h-[60px]">
					{leading && (
						<div className="shrink-0 pointer-events-auto">{leading}</div>
					)}
					<div
						className={`flex-1 min-w-0 text-base font-semibold leading-[1.4] text-sky-900 text-left truncate transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.25,0,0.25,1)] ${
							collapsed
								? "opacity-100 translate-y-0"
								: "opacity-0 translate-y-2"
						}`}
						aria-hidden={!collapsed}
					>
						{title}
					</div>
					{trailing && (
						<div className="shrink-0 flex gap-1.5 items-center pointer-events-auto">
							{trailing}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
