import { useEffect, useRef, useState } from "react";

interface FitDonutChartProps {
	percent: number;
	size?: number;
	strokeWidth?: number;
	className?: string;
	trackClassName?: string;
	roundedCaps?: boolean;
	capBorderClassName?: string;
	capBorderWidth?: number;
}

const PROGRESS_DURATION_MS = 1500;
const TRACK_DURATION_MS = 1000;

export function FitDonutChart({
	percent,
	size = 102,
	strokeWidth = 24,
	className = "",
	trackClassName = "stroke-sky-50",
	roundedCaps = true,
	capBorderClassName,
	capBorderWidth = 2,
}: FitDonutChartProps) {
	const [started, setStarted] = useState(false);
	const hasAnimatedRef = useRef(false);
	const svgRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		const element = svgRef.current;
		if (!element) {
			return undefined;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting || hasAnimatedRef.current) {
					return;
				}

				hasAnimatedRef.current = true;
				observer.disconnect();
				requestAnimationFrame(() => {
					setStarted(true);
				});
			},
			{ threshold: 0.25 },
		);

		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const clampedPercent = Math.min(100, Math.max(0, percent));
	// Round caps extend the arc by half the stroke width at the end; subtract
	// that so the visible leading edge matches the displayed percentage.
	const capOffset = roundedCaps ? strokeWidth / 2 : 0;
	const center = size / 2;
	const progressAngle = (clampedPercent / 100) * 360;
	const showCapBorder =
		Boolean(capBorderClassName) && clampedPercent > 0 && clampedPercent < 100;

	const gap = showCapBorder ? capBorderWidth : 0;
	const halfGapAngle = (gap / 2 / circumference) * 360;
	const arcLength = (sharePercent: number) =>
		sharePercent <= 0
			? 0
			: Math.max(0, (sharePercent / 100) * circumference - capOffset - gap);

	const progressLength = started ? arcLength(clampedPercent) : 0;
	const trackLength = started ? arcLength(100 - clampedPercent) : 0;
	const cutOuter = center - radius - strokeWidth / 2 - 0.5;
	const cutInner = center - radius + strokeWidth / 2 + 0.5;
	const boundaryAngles = [0, progressAngle];

	return (
		<svg
			ref={svgRef}
			width={size}
			height={size}
			viewBox={`0 0 ${size} ${size}`}
			className={className}
			aria-hidden
		>
			<circle
				cx={center}
				cy={center}
				r={radius}
				fill="none"
				className={`${trackClassName} transition-[stroke-dashoffset] ease-out`}
				style={{
					transitionDuration: `${TRACK_DURATION_MS}ms`,
					transitionDelay: `${PROGRESS_DURATION_MS}ms`,
				}}
				strokeWidth={strokeWidth}
				strokeLinecap={roundedCaps ? "round" : "butt"}
				strokeDasharray={circumference}
				strokeDashoffset={circumference - trackLength}
				transform={`rotate(${progressAngle + halfGapAngle - 90} ${center} ${center})`}
			/>
			<circle
				cx={center}
				cy={center}
				r={radius}
				fill="none"
				className="stroke-sky-300 transition-[stroke-dashoffset] ease-out"
				style={{ transitionDuration: `${PROGRESS_DURATION_MS}ms` }}
				strokeWidth={strokeWidth}
				strokeLinecap={roundedCaps ? "round" : "butt"}
				strokeDasharray={circumference}
				strokeDashoffset={circumference - progressLength}
				transform={`rotate(${halfGapAngle - 90} ${center} ${center})`}
			/>
			{showCapBorder &&
				boundaryAngles.map((angle, index) => (
					<line
						key={index === 0 ? "start" : "end"}
						x1={center}
						y1={cutOuter}
						x2={center}
						y2={cutInner}
						className={capBorderClassName}
						strokeWidth={capBorderWidth}
						transform={`rotate(${angle} ${center} ${center})`}
					/>
				))}
		</svg>
	);
}
