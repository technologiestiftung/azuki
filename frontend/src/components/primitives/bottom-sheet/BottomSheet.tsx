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

const DISMISS_DRAG_PX = 96;
const DISMISS_VELOCITY = 0.55; // px/ms downward

export interface BottomSheetProps {
	open: boolean;
	onClose: () => void;
	children: ReactNode;
	header?: ReactNode;
	footer?: ReactNode;
	ariaLabel?: string;
	overlayDismissLabel?: string;
	initialFocus?: "first" | "container";
	onScroll?: (container: HTMLDivElement) => void;
}

type DragSample = { t: number; y: number };

function readVisualViewportLayout() {
	const vv = window.visualViewport;
	const height = vv?.height ?? window.innerHeight;
	const bottomInset = vv
		? Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
		: 0;
	return { height, bottomInset };
}

export function BottomSheet({
	open,
	onClose,
	children,
	header,
	footer,
	ariaLabel = content["common.bottomSheet.ariaLabel"],
	overlayDismissLabel = content["common.bottomSheet.overlayDismissLabel"],
	initialFocus = "first",
	onScroll,
}: BottomSheetProps) {
	const [visible, setVisible] = useState(open);
	const [isClosing, setIsClosing] = useState(false);
	const [enterComplete, setEnterComplete] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [viewportLayout, setViewportLayout] = useState(
		readVisualViewportLayout,
	);

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

	onCloseRef.current = onClose;
	openRef.current = open;
	isClosingRef.current = isClosing;

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

	useEffect(() => {
		if (!visible) {
			return () => {};
		}
		const visualViewport = window.visualViewport;
		if (!visualViewport) {
			return () => {};
		}

		const update = () => {
			setViewportLayout(readVisualViewportLayout());
		};

		update();
		visualViewport.addEventListener("resize", update);
		visualViewport.addEventListener("scroll", update);
		return () => {
			visualViewport.removeEventListener("resize", update);
			visualViewport.removeEventListener("scroll", update);
		};
	}, [visible]);

	useEffect(() => {
		if (!visible) {
			return () => {};
		}
		const container = dialogRef.current;
		if (!container) {
			return () => {};
		}

		const prevBodyOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

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

		if (initialFocus === "container") {
			container.setAttribute("tabindex", "-1");
			container.focus();
		} else {
			const focusables = getFocusable();
			if (focusables.length > 0) {
				focusables[0]?.focus();
			} else {
				container.setAttribute("tabindex", "-1");
				container.focus();
			}
		}

		const onKeyDown = (e: KeyboardEvent) => {
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
			document.body.style.overflow = prevBodyOverflow;
			const toRestore = previouslyFocusedElementRef.current;
			previouslyFocusedElementRef.current = null;
			container.removeAttribute("tabindex");
			if (toRestore && typeof toRestore.focus === "function") {
				toRestore.focus();
			}
		};
	}, [visible, initialFocus]);

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
		if (!enterComplete || isClosing) {
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

	let motionShellStyle: CSSProperties | undefined = undefined;
	if (isClosing) {
		motionShellStyle = {
			["--sheet-drag-y" as string]: `${sheetDismissFromYRef.current}px`,
		} as CSSProperties;
	} else if (enterComplete && !isClosing) {
		const transition = isDragging
			? "none"
			: "transform 0.22s cubic-bezier(0.32, 0.72, 0, 1)";
		motionShellStyle = isDragging
			? { transition }
			: {
					transform: "translateY(0px)",
					transition,
				};
	}

	const baseMotionShellClass =
		"pointer-events-auto flex min-h-0 max-h-full w-full flex-1 flex-col overflow-hidden rounded-t-3xl bg-white pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_30px_rgba(17,24,39,0.12)]";
	let motionAnimClass = "";
	if (!enterComplete && !isClosing) {
		motionAnimClass = "animate-slideInBottom";
	} else if (isClosing) {
		motionAnimClass = "pointer-events-none animate-slideOutBottom";
	}
	const motionShellClass = `${baseMotionShellClass} ${motionAnimClass}`.trim();

	return (
		<>
			<button
				type="button"
				className={`z-50 fixed inset-0 bg-sky-900/80 bg-blur-[2px] ${
					isClosing ? "pointer-events-none animate-fadeOut" : "animate-fadeIn"
				}`}
				aria-label={overlayDismissLabel}
				onClick={onClose}
			/>
			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-label={ariaLabel}
				className="pointer-events-none fixed left-0 right-0 z-50 mx-auto flex max-w-[430px] flex-col"
				style={{
					bottom: viewportLayout.bottomInset,
					maxHeight: Math.min(viewportLayout.height * 0.9, 900),
				}}
			>
				<div
					ref={motionShellRef}
					onAnimationEnd={handleSheetAnimationEnd}
					className={motionShellClass}
					style={motionShellStyle}
				>
					<div
						className="flex shrink-0 cursor-grab touch-none flex-col items-center py-[5px] select-none active:cursor-grabbing"
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
					{header ? <div className="shrink-0">{header}</div> : null}
					<div
						className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
						onScroll={onScroll ? (e) => onScroll(e.currentTarget) : undefined}
					>
						{children}
					</div>
					{footer ? (
						<div className="shrink-0 border-t-2 border-sky-shade-20 p-4">
							{footer}
						</div>
					) : null}
				</div>
			</div>
		</>
	);
}
