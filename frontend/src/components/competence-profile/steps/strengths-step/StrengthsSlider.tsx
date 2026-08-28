import {
	useRef,
	useCallback,
	type KeyboardEvent,
	type PointerEvent,
} from "react";

const ANCHOR_STOPS = [0, 0.25, 0.5, 0.75, 1];
const SNAP_THRESHOLD = 0.04;
const TRACK_PADDING = 20;

function snapToAnchor(value: number): number {
	for (const stop of ANCHOR_STOPS) {
		if (Math.abs(value - stop) <= SNAP_THRESHOLD) {
			return stop;
		}
	}
	return value;
}

function snapToNearestAnchor(value: number): number {
	return ANCHOR_STOPS.reduce((prev, curr) =>
		Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev,
	);
}

function clamp(value: number): number {
	return Math.max(0, Math.min(1, value));
}

interface StrengthsSliderProps {
	value: number;
	onChange: (value: number) => void;
	minLabel?: string;
	maxLabel?: string;
}

export function StrengthsSlider({
	value,
	onChange,
	minLabel,
	maxLabel,
}: StrengthsSliderProps) {
	const trackRef = useRef<HTMLDivElement>(null);
	const isDragging = useRef(false);

	const getValueFromPointer = useCallback((clientX: number) => {
		const track = trackRef.current;
		if (!track) {
			return 0.5;
		}
		const rect = track.getBoundingClientRect();
		const usableWidth = rect.width - TRACK_PADDING * 2;
		const raw = (clientX - rect.left - TRACK_PADDING) / usableWidth;
		return snapToAnchor(Math.max(0, Math.min(1, raw)));
	}, []);

	function onPointerDown(e: PointerEvent<HTMLDivElement>) {
		isDragging.current = true;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		onChange(getValueFromPointer(e.clientX));
	}

	function onPointerMove(e: PointerEvent<HTMLDivElement>) {
		if (!isDragging.current) {
			return;
		}
		onChange(getValueFromPointer(e.clientX));
	}

	function onPointerUp() {
		isDragging.current = false;
		onChange(snapToNearestAnchor(value));
	}

	function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
		const currentIndex = ANCHOR_STOPS.findIndex((stop) => stop === value);

		if (e.key === "ArrowRight" || e.key === "ArrowUp") {
			e.preventDefault();
			if (currentIndex >= 0) {
				const nextIndex = Math.min(ANCHOR_STOPS.length - 1, currentIndex + 1);
				onChange(ANCHOR_STOPS[nextIndex]);
				return;
			}
			onChange(clamp(value + 0.05));
			return;
		}

		if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
			e.preventDefault();
			if (currentIndex >= 0) {
				const prevIndex = Math.max(0, currentIndex - 1);
				onChange(ANCHOR_STOPS[prevIndex]);
				return;
			}
			onChange(clamp(value - 0.05));
			return;
		}

		if (e.key === "PageUp") {
			e.preventDefault();
			onChange(clamp(value + 0.25));
			return;
		}

		if (e.key === "PageDown") {
			e.preventDefault();
			onChange(clamp(value - 0.25));
			return;
		}

		if (e.key === "Home") {
			e.preventDefault();
			onChange(0);
			return;
		}

		if (e.key === "End") {
			e.preventDefault();
			onChange(1);
		}
	}

	return (
		<div className="w-full mb-1">
			<div
				ref={trackRef}
				className="relative h-12 rounded-xl bg-sky-shade-10 cursor-pointer touch-none select-none"
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				onPointerCancel={onPointerUp}
				onKeyDown={onKeyDown}
				role="slider"
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={Math.round(value * 100)}
				aria-valuetext={`${Math.round(value * 100)}%`}
				tabIndex={0}
			>
				{/* Filled track */}
				<div
					className="absolute inset-y-0 left-0 bg-sky-300 rounded-xl transition-[width] duration-75"
					style={{
						width: `calc(20px + ${value} * (100% - 40px) + 24px - 4px)`,
					}}
				/>
				{/* Thumb */}
				<div
					className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 p-2 border-4 border-sky-300 bg-sky-white rounded-xl transition-[left] duration-75 z-10"
					style={{
						left: `calc(24px + ${value} * (100% - 48px))`,
					}}
				/>
				{/* Anchor dots */}
				{ANCHOR_STOPS.map((stop) => {
					let dotColor = "bg-gray-400";
					if (stop < value) {
						dotColor = "bg-sky-600";
					} else if (stop === value) {
						dotColor = "bg-transparent";
					}
					return (
						<div
							key={stop}
							className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
							style={{
								left: `calc(20px + ${stop} * (100% - 40px))`,
							}}
						>
							<span
								className={`block w-1.5 h-1.5 rounded-full transition-colors ${dotColor}`}
							/>
						</div>
					);
				})}
			</div>
			<div className="flex justify-between text-base font-medium text-gray-600 py-2">
				<span>{minLabel}</span>
				<span>{maxLabel}</span>
			</div>
		</div>
	);
}
