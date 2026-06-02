import {
	useEffect,
	useRef,
	useState,
	type AnimationEvent,
	type CSSProperties,
	type PointerEvent,
	type ReactNode,
} from "react";
import { content } from "../../../content";
import {
	STACKED_BEHIND_SCALE,
	useBottomSheetStackMotion,
	type BottomSheetStackTier,
} from "./useBottomSheetStackMotion";

const DISMISS_DRAG_PX = 96;
const DISMISS_VELOCITY = 0.55; // px/ms downward

export type { BottomSheetStackTier };

export interface BottomSheetProps {
	open: boolean;
	onClose: () => void;
	children: ReactNode;
	footer?: ReactNode;
	ariaLabel?: string;
	overlayDismissLabel?: string;
	isStackedBehind?: boolean;
	stackTier?: BottomSheetStackTier;
	stackFrontHeight?: number;
	stackedBehindTranslateY?: number;
	onShellHeightChange?: (height: number) => void;
}

type DragSample = { t: number; y: number };

const STACK_TRANSITION =
	"transform 0.32s cubic-bezier(0.32, 0.72, 0, 1), border-radius 0.32s cubic-bezier(0.32, 0.72, 0, 1)";
const DRAG_SNAP_TRANSITION = "transform 0.22s cubic-bezier(0.32, 0.72, 0, 1)";

function stackedBehindTransform(translateYpx: number): string {
	return `scale(${STACKED_BEHIND_SCALE}) translateY(${translateYpx}px)`;
}

function getMotionShellStyle(args: {
	isClosing: boolean;
	enterComplete: boolean;
	isStackedBehind: boolean;
	isDragging: boolean;
	sheetDismissFromY: number;
	stackedBehindTranslateYpx: number;
}): CSSProperties | undefined {
	const origin: CSSProperties = { transformOrigin: "bottom center" };
	const behind = stackedBehindTransform(args.stackedBehindTranslateYpx);

	if (args.isClosing) {
		return {
			...origin,
			["--sheet-drag-y" as string]: `${args.sheetDismissFromY}px`,
		} as CSSProperties;
	}

	if (args.isStackedBehind) {
		return {
			...origin,
			transform: behind,
			transition: STACK_TRANSITION,
		};
	}

	if (!args.enterComplete) {
		return undefined;
	}

	const transition = args.isDragging ? "none" : DRAG_SNAP_TRANSITION;
	if (args.isDragging) {
		return { ...origin, transition };
	}

	return {
		...origin,
		transform: "translateY(0px)",
		transition,
	};
}

function BottomSheetBackdrop({
	isElevated,
	isStackedBehind,
	isClosing,
	overlayDismissLabel,
	onClose,
}: {
	isElevated: boolean;
	isStackedBehind: boolean;
	isClosing: boolean;
	overlayDismissLabel: string;
	onClose: () => void;
}) {
	if (isElevated) {
		return (
			<button
				type="button"
				className={`fixed inset-0 z-[55] bg-transparent ${
					isClosing ? "pointer-events-none" : ""
				}`}
				aria-label={overlayDismissLabel}
				onClick={onClose}
			/>
		);
	}

	return (
		<button
			type="button"
			className={`fixed inset-0 z-40 bg-sky-1000/80 bg-blur-[2px] ${
				isStackedBehind ? "pointer-events-none" : ""
			} ${isClosing ? "pointer-events-none animate-fadeOut" : "animate-fadeIn"}`}
			aria-label={overlayDismissLabel}
			onClick={onClose}
			tabIndex={isStackedBehind ? -1 : undefined}
		/>
	);
}

export function BottomSheet({
	open,
	onClose,
	children,
	footer,
	ariaLabel = content["common.bottomSheet.ariaLabel"],
	overlayDismissLabel = content["common.bottomSheet.overlayDismissLabel"],
	isStackedBehind = false,
	stackTier = "default",
	stackFrontHeight = 0,
	stackedBehindTranslateY,
	onShellHeightChange,
}: BottomSheetProps) {
	const [visible, setVisible] = useState(open);
	const [isClosing, setIsClosing] = useState(false);
	const [enterComplete, setEnterComplete] = useState(false);
	const [isDragging, setIsDragging] = useState(false);

	const motionShellRef = useRef<HTMLDivElement>(null);
	const dialogRef = useRef<HTMLDivElement>(null);
	const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
	const liveDragOffsetRef = useRef(0);
	const sheetDismissFromYRef = useRef(0);
	const dragStartYRef = useRef(0);
	const activePointerIdRef = useRef<number | null>(null);
	const dragSamplesRef = useRef<DragSample[]>([]);
	const onCloseRef = useRef(onClose);
	const openRef = useRef(open);
	const isClosingRef = useRef(isClosing);
	const isStackedBehindRef = useRef(isStackedBehind);

	onCloseRef.current = onClose;
	openRef.current = open;
	isClosingRef.current = isClosing;
	isStackedBehindRef.current = isStackedBehind;

	useEffect(() => {
		if (open) {
			setVisible(true);
			setIsClosing(false);
			setEnterComplete(false);
			liveDragOffsetRef.current = 0;
			setIsDragging(false);
			activePointerIdRef.current = null;
			dragSamplesRef.current = [];
		} else if (visible) {
			sheetDismissFromYRef.current = liveDragOffsetRef.current;
			setIsClosing(true);
		}
	}, [open, visible]);

	const { stackedBehindTranslateYpx } = useBottomSheetStackMotion({
		motionShellRef,
		isStackedBehind,
		stackTier,
		visible,
		enterComplete,
		stackFrontHeight,
		stackedBehindTranslateY,
		onShellHeightChange,
	});

	useEffect(() => {
		if (!visible) {
			return () => {};
		}
		const prevBodyOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prevBodyOverflow;
		};
	}, [visible]);

	useEffect(() => {
		if (!visible || isStackedBehind) {
			return () => {};
		}
		const container = dialogRef.current;
		if (!container) {
			return () => {};
		}

		const previouslyFocused = document.activeElement as HTMLElement | null;
		previouslyFocusedElementRef.current =
			previouslyFocused && previouslyFocused !== document.body
				? previouslyFocused
				: null;

		const selector =
			'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
		const getFocusable = () =>
			Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
				(el) =>
					!el.hasAttribute("disabled") &&
					el.tabIndex !== -1 &&
					el.offsetParent !== null,
			);

		const focusables = getFocusable();
		if (focusables.length > 0) {
			focusables[0]?.focus();
		} else {
			container.setAttribute("tabindex", "-1");
			container.focus();
		}

		const onKeyDown = (e: KeyboardEvent) => {
			if (isStackedBehindRef.current) {
				return;
			}
			if (e.key === "Escape") {
				if (!isClosingRef.current) {
					onCloseRef.current();
				}
				return;
			}
			if (e.key !== "Tab") {
				return;
			}
			const nodes = getFocusable();
			if (nodes.length === 0) {
				e.preventDefault();
				return;
			}
			const first = nodes[0];
			const last = nodes[nodes.length - 1];
			const active = document.activeElement as HTMLElement | null;
			if (!container.contains(active)) {
				e.preventDefault();
				(e.shiftKey ? last : first).focus();
				return;
			}
			if (e.shiftKey && active === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && active === last) {
				e.preventDefault();
				first.focus();
			}
		};

		document.addEventListener("keydown", onKeyDown, true);
		return () => {
			document.removeEventListener("keydown", onKeyDown, true);
			if (isStackedBehindRef.current) {
				return;
			}
			const toRestore = previouslyFocusedElementRef.current;
			previouslyFocusedElementRef.current = null;
			container.removeAttribute("tabindex");
			if (toRestore && typeof toRestore.focus === "function") {
				toRestore.focus();
			}
		};
	}, [visible, isStackedBehind]);

	const pushDragSample = (clientY: number) => {
		const t = performance.now();
		const arr = dragSamplesRef.current;
		arr.push({ t, y: clientY });
		if (arr.length > 6) {
			arr.shift();
		}
	};

	const endDragVelocity = (): number => {
		const arr = dragSamplesRef.current;
		if (arr.length < 2) {
			return 0;
		}
		const first = arr[0];
		const last = arr[arr.length - 1];
		const dt = last.t - first.t;
		if (dt < 8) {
			return 0;
		}
		return (last.y - first.y) / dt;
	};

	const finishDrag = () => {
		const offset = liveDragOffsetRef.current;
		const v = endDragVelocity();
		if (offset > DISMISS_DRAG_PX || v > DISMISS_VELOCITY) {
			onCloseRef.current();
		} else {
			liveDragOffsetRef.current = 0;
			const shell = motionShellRef.current;
			if (shell) {
				shell.style.transition =
					"transform 0.22s cubic-bezier(0.32, 0.72, 0, 1)";
				shell.style.transform = "translateY(0px)";
			}
		}
		dragSamplesRef.current = [];
	};

	const handleGrabPointerDown = (e: PointerEvent<HTMLDivElement>) => {
		if (!enterComplete || isClosing || isStackedBehind) {
			return;
		}
		if (e.button !== 0) {
			return;
		}
		e.preventDefault();
		activePointerIdRef.current = e.pointerId;
		liveDragOffsetRef.current = 0;
		dragStartYRef.current = e.clientY;
		dragSamplesRef.current = [{ t: performance.now(), y: e.clientY }];
		const shell = motionShellRef.current;
		if (shell) {
			shell.style.transition = "none";
			shell.style.transform = `translateY(${liveDragOffsetRef.current}px)`;
		}
		setIsDragging(true);
		e.currentTarget.setPointerCapture(e.pointerId);
	};

	const handleGrabPointerMove = (e: PointerEvent<HTMLDivElement>) => {
		if (
			activePointerIdRef.current !== e.pointerId ||
			!enterComplete ||
			isClosing
		) {
			return;
		}
		const delta = e.clientY - dragStartYRef.current;
		const raw = Math.max(0, delta);
		const shell = motionShellRef.current;
		const cap = shell
			? Math.min(shell.offsetHeight, window.innerHeight * 0.7)
			: window.innerHeight * 0.5;
		const next = Math.min(raw, cap);
		liveDragOffsetRef.current = next;
		if (shell) {
			shell.style.transition = "none";
			shell.style.transform = `translateY(${next}px)`;
		}
		pushDragSample(e.clientY);
	};

	const handleGrabPointerUp = (e: PointerEvent<HTMLDivElement>) => {
		if (activePointerIdRef.current !== e.pointerId) {
			return;
		}
		try {
			e.currentTarget.releasePointerCapture(e.pointerId);
		} catch {
			// ignore if capture already released
		}
		activePointerIdRef.current = null;
		setIsDragging(false);
		finishDrag();
	};

	const handleGrabLostPointerCapture = (e: PointerEvent<HTMLDivElement>) => {
		if (activePointerIdRef.current !== e.pointerId) {
			return;
		}
		activePointerIdRef.current = null;
		setIsDragging(false);
		finishDrag();
	};

	const handleGrabPointerCancel = (e: PointerEvent<HTMLDivElement>) => {
		if (activePointerIdRef.current !== e.pointerId) {
			return;
		}
		try {
			e.currentTarget.releasePointerCapture(e.pointerId);
		} catch {
			// ignore if capture already released
		}
		activePointerIdRef.current = null;
		liveDragOffsetRef.current = 0;
		dragSamplesRef.current = [];
		setIsDragging(false);
		const shell = motionShellRef.current;
		if (shell) {
			shell.style.transition = "transform 0.22s cubic-bezier(0.32, 0.72, 0, 1)";
			shell.style.transform = "translateY(0px)";
		}
	};

	const handleSheetAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
		if (e.target !== e.currentTarget) {
			return;
		}
		const name = e.animationName;
		if (name.includes("slideInBottom") && openRef.current) {
			setEnterComplete(true);
		}
		if (name.includes("slideOutBottom")) {
			setVisible(false);
			setIsClosing(false);
			setEnterComplete(false);
			liveDragOffsetRef.current = 0;
		}
	};

	if (!visible) {
		return null;
	}

	const motionShellStyle = getMotionShellStyle({
		isClosing,
		enterComplete,
		isStackedBehind,
		isDragging,
		sheetDismissFromY: sheetDismissFromYRef.current,
		stackedBehindTranslateYpx,
	});

	const isElevated = stackTier === "elevated";
	const dialogZ = isElevated ? "z-[60]" : "z-50";

	const baseMotionShellClass = isElevated
		? "pointer-events-auto flex w-full flex-col overflow-hidden rounded-t-3xl bg-white pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-12px_40px_rgba(17,24,39,0.16)]"
		: "pointer-events-auto flex min-h-0 max-h-full w-full flex-1 flex-col overflow-hidden rounded-t-3xl bg-white pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_30px_rgba(17,24,39,0.12)]";
	const stackedBehindShellClass = isStackedBehind
		? "pointer-events-none bg-gray-300 shadow-[0_15px_75px_0_rgba(1,12,19,0.18)]"
		: "";
	let motionAnimClass = "";
	if (!enterComplete && !isClosing) {
		motionAnimClass = "animate-slideInBottom";
	} else if (isClosing) {
		motionAnimClass = "pointer-events-none animate-slideOutBottom";
	}
	const motionShellClass =
		`${baseMotionShellClass} ${stackedBehindShellClass} ${motionAnimClass}`.trim();

	return (
		<>
			<BottomSheetBackdrop
				isElevated={isElevated}
				isStackedBehind={isStackedBehind}
				isClosing={isClosing}
				overlayDismissLabel={overlayDismissLabel}
				onClose={onClose}
			/>
			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-label={ariaLabel}
				aria-hidden={isStackedBehind ? true : undefined}
				className={`pointer-events-none fixed bottom-0 left-0 right-0 ${dialogZ} mx-auto flex max-w-[430px] flex-col overflow-visible ${
					isElevated
						? "h-auto max-h-[min(90vh,900px)] shadow-[0_15px_75px_0_rgba(1,12,19,0.18)]"
						: "max-h-[min(90vh,900px)]"
				}`}
			>
				<div
					ref={motionShellRef}
					onAnimationEnd={handleSheetAnimationEnd}
					className={motionShellClass}
					style={motionShellStyle}
				>
					<div
						className="flex shrink-0 cursor-grab touch-none flex-col items-center py-3 select-none active:cursor-grabbing"
						onPointerDown={handleGrabPointerDown}
						onPointerMove={handleGrabPointerMove}
						onPointerUp={handleGrabPointerUp}
						onPointerCancel={handleGrabPointerCancel}
						onLostPointerCapture={handleGrabLostPointerCapture}
					>
						<div
							className="pointer-events-none h-[5px] w-9 shrink-0 rounded-full bg-gray-300 mix-blend-plus-darker"
							aria-hidden
						/>
					</div>
					<div
						className={
							isElevated
								? "overflow-y-auto overscroll-contain"
								: "min-h-0 flex-1 overflow-y-auto overscroll-contain"
						}
					>
						{children}
					</div>
					{footer ? (
						<div className="shrink-0 border-t-2 border-gray-200 p-4">
							{footer}
						</div>
					) : null}
				</div>
			</div>
		</>
	);
}
