import {
	Children,
	cloneElement,
	isValidElement,
	useEffect,
	useMemo,
	useRef,
	useState,
	type CSSProperties,
	type ReactElement,
	type ReactNode,
} from "react";

const GAP_PX = 8;
const MIN_TRUNCATED_PILL_PX = 72;
const OVERFLOW_WIDTH_FALLBACK_PX = 28;

type WrapRowLayout = {
	visibleCount: number;
	truncateLast: boolean;
	truncatedMaxWidth?: number;
	hiddenCount: number;
};

type ChipProps = {
	className?: string;
	style?: CSSProperties;
	constrained?: boolean;
};

function fitChipCount(
	chipWidths: number[],
	budget: number,
): { count: number; used: number } {
	let used = 0;
	let count = 0;
	for (const width of chipWidths) {
		const next = count === 0 ? width : used + GAP_PX + width;
		if (next > budget) {
			break;
		}
		used = next;
		count += 1;
	}
	return { count, used };
}

/** Pack as many chips as possible on one row, optionally truncating the last. */
function computeWrapRowLayout(
	containerWidth: number,
	chipWidths: number[],
	overflowWidth: number,
): WrapRowLayout {
	if (chipWidths.length === 0 || containerWidth <= 0) {
		return { visibleCount: 0, truncateLast: false, hiddenCount: 0 };
	}

	const allFit = fitChipCount(chipWidths, containerWidth);
	if (allFit.count === chipWidths.length) {
		return {
			visibleCount: chipWidths.length,
			truncateLast: false,
			hiddenCount: 0,
		};
	}

	const pillsBudget = Math.max(0, containerWidth - overflowWidth - GAP_PX);
	const { count: fullCount, used } = fitChipCount(chipWidths, pillsBudget);
	const remaining = chipWidths.length - fullCount;

	if (remaining === 0) {
		return {
			visibleCount: fullCount,
			truncateLast: false,
			hiddenCount: 0,
		};
	}

	const hiddenAfterTruncate = remaining - 1;

	const rowBudget = hiddenAfterTruncate > 0 ? pillsBudget : containerWidth;
	const spaceForTruncated =
		fullCount === 0 ? rowBudget : rowBudget - used - GAP_PX;

	if (spaceForTruncated >= MIN_TRUNCATED_PILL_PX) {
		return {
			visibleCount: fullCount + 1,
			truncateLast: true,
			truncatedMaxWidth: spaceForTruncated,
			hiddenCount: hiddenAfterTruncate,
		};
	}

	return {
		visibleCount: fullCount,
		truncateLast: false,
		hiddenCount: remaining,
	};
}

function cloneChip(
	item: ReactNode,
	key: string,
	props: ChipProps = {},
): ReactNode {
	if (!isValidElement(item)) {
		return item;
	}

	const previous = item.props as ChipProps;
	return cloneElement(item as ReactElement<ChipProps>, {
		key,
		...props,
		className: [previous.className, props.className].filter(Boolean).join(" "),
		style: { ...previous.style, ...props.style },
	});
}

interface ProfileWrapCollapsibleProps {
	title: string;
	children: ReactNode;
}

/** Chip section that collapses to a single measured row with optional "+n". */
export function ProfileWrapCollapsible({
	title,
	children,
}: ProfileWrapCollapsibleProps) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const measureRef = useRef<HTMLDivElement>(null);
	const overflowMeasureRef = useRef<HTMLSpanElement>(null);

	const items = useMemo(
		() => Children.toArray(children).filter(Boolean),
		[children],
	);
	const itemsKey = useMemo(
		() =>
			items
				.map((item, index) =>
					isValidElement(item) ? String(item.key ?? index) : String(index),
				)
				.join("|"),
		[items],
	);

	const [wrapLayout, setWrapLayout] = useState<WrapRowLayout>({
		visibleCount: items.length,
		truncateLast: false,
		hiddenCount: 0,
	});

	useEffect(() => {
		if (isOpen) {
			return undefined;
		}

		const update = () => {
			const container = containerRef.current;
			const measureEl = measureRef.current;
			if (!container || !measureEl) {
				return;
			}

			const chipWidths = Array.from(
				measureEl.children,
				(child) => (child as HTMLElement).getBoundingClientRect().width,
			);
			const overflowWidth =
				overflowMeasureRef.current?.getBoundingClientRect().width ??
				OVERFLOW_WIDTH_FALLBACK_PX;

			setWrapLayout(
				computeWrapRowLayout(container.clientWidth, chipWidths, overflowWidth),
			);
		};

		update();
		const container = containerRef.current;
		if (!container) {
			return undefined;
		}

		const observer = new ResizeObserver(update);
		observer.observe(container);
		return () => observer.disconnect();
	}, [isOpen, itemsKey]);

	const canCollapse = wrapLayout.hiddenCount > 0 || wrapLayout.truncateLast;
	const visibleItems = isOpen ? items : items.slice(0, wrapLayout.visibleCount);
	const hiddenCount = isOpen ? 0 : wrapLayout.hiddenCount;
	const truncatedMaxWidth =
		!isOpen && wrapLayout.truncateLast
			? wrapLayout.truncatedMaxWidth
			: undefined;

	return (
		<button
			className="flex flex-col gap-2 bg-sky-shade-10 rounded-xl p-4"
			type="button"
			onClick={() => setIsOpen((open) => !open)}
			aria-expanded={isOpen}
			disabled={!canCollapse}
		>
			<div className="flex w-full items-center justify-between">
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
			</div>

			<div
				ref={containerRef}
				className={`relative flex items-center gap-2 ${
					isOpen ? "flex-wrap" : "flex-nowrap"
				}`}
			>
				{!isOpen && (
					<>
						<div
							ref={measureRef}
							aria-hidden
							className="pointer-events-none invisible absolute left-0 top-0 flex flex-nowrap items-center gap-2"
						>
							{items.map((item, index) =>
								cloneChip(item, `measure-${index}`, {
									style: { maxWidth: "none" },
									className: "whitespace-nowrap",
								}),
							)}
						</div>
						<span
							ref={overflowMeasureRef}
							aria-hidden
							className="pointer-events-none invisible absolute left-0 top-0 text-base text-sky-shade-100"
						>
							+{Math.max(1, items.length - 1)}
						</span>
					</>
				)}

				{visibleItems.map((item, index) => {
					const shouldTruncate =
						index === visibleItems.length - 1 &&
						typeof truncatedMaxWidth === "number";

					return cloneChip(
						item,
						`visible-${index}`,
						shouldTruncate
							? {
									constrained: true,
									style: {
										width: truncatedMaxWidth,
										maxWidth: truncatedMaxWidth,
									},
								}
							: {},
					);
				})}

				{hiddenCount > 0 && (
					<span className="shrink-0 text-base text-sky-shade-100">
						+{hiddenCount}
					</span>
				)}
			</div>
		</button>
	);
}
