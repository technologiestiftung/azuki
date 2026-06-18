import { useEffect, useRef } from "react";

type LoadingProgressBarProps = {
	durationMs: number;
	startTime?: number;
};

export function LoadingProgressBar({
	durationMs,
	startTime,
}: LoadingProgressBarProps) {
	const fillRef = useRef<HTMLDivElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const start = startTime ?? performance.now();
		let frame = 0;

		const setProgress = (ratio: number) => {
			const percent = ratio * 100;
			if (fillRef.current) {
				fillRef.current.style.width = `${percent}%`;
			}
			if (trackRef.current) {
				trackRef.current.setAttribute(
					"aria-valuenow",
					String(Math.round(percent)),
				);
			}
		};

		const tick = (now: number) => {
			const elapsed = now - start;
			if (elapsed >= durationMs) {
				setProgress(1);
				return;
			}
			setProgress(elapsed / durationMs);
			frame = requestAnimationFrame(tick);
		};

		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [durationMs, startTime]);

	return (
		<div
			ref={trackRef}
			className="h-2 w-full rounded-full bg-gray-200 overflow-hidden"
			role="progressbar"
			aria-valuenow={0}
			aria-valuemin={0}
			aria-valuemax={100}
		>
			<div
				ref={fillRef}
				className="h-full bg-sky-300 rounded-full"
				style={{ width: "0%" }}
			/>
		</div>
	);
}
