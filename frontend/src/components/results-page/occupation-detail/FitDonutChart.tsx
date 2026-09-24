import { useEffect, useId, useRef, useState } from "react";

interface FitDonutChartProps {
	percent: number;
	size?: number;
	strokeWidth?: number;
	className?: string;
	trackClassName?: string;
	roundedCaps?: boolean;
	capGapWidth?: number;
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
	capGapWidth = 2,
}: FitDonutChartProps) {
	const [phase, setPhase] = useState<"idle" | "intro" | "static">("idle");
	const svgRef = useRef<SVGSVGElement>(null);
	const maskId = `fit-donut-gap-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

	useEffect(() => {
		setPhase((current) => (current === "idle" ? current : "static"));
	}, [percent]);

	useEffect(() => {
		const element = svgRef.current;
		if (!element) {
			return undefined;
		}

		const reveal = () => {
			requestAnimationFrame(() => {
				setPhase((current) => (current === "idle" ? "intro" : current));
			});
		};

		if (typeof IntersectionObserver === "undefined") {
			reveal();
			return undefined;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) {
					return;
				}

				observer.disconnect();
				reveal();
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
	const started = phase !== "idle";
	const animating = phase === "intro";

	// The gap is cut out afterwards as a straight slot rather than trimmed off
	// the arcs: trimming works along the centre line, so the wedge it leaves
	// would be narrower at the inner edge of the ring and wider at the outer.
	const gap =
		clampedPercent > 0 && clampedPercent < 100 ? Math.max(0, capGapWidth) : 0;
	const arcLength = (sharePercent: number) =>
		sharePercent <= 0
			? 0
			: Math.max(0, (sharePercent / 100) * circumference - capOffset);

	const progressLength = started ? arcLength(clampedPercent) : 0;
	const trackLength = started ? arcLength(100 - clampedPercent) : 0;

	return (
		<svg
			ref={svgRef}
			width={size}
			height={size}
			viewBox={`0 0 ${size} ${size}`}
			className={className}
			aria-hidden
		>
			{gap > 0 && (
				<mask id={maskId} maskUnits="userSpaceOnUse">
					<circle
						cx={center}
						cy={center}
						r={radius}
						fill="none"
						stroke="white"
						strokeWidth={strokeWidth}
					/>
					{[0, progressAngle].map((angle) => (
						<rect
							key={angle}
							x={center}
							y={center - gap / 2}
							width={size}
							height={gap}
							fill="black"
							transform={`rotate(${angle - 90} ${center} ${center})`}
						/>
					))}
				</mask>
			)}
			<g mask={gap > 0 ? `url(#${maskId})` : undefined}>
				<circle
					cx={center}
					cy={center}
					r={radius}
					fill="none"
					className={`${trackClassName} ${animating ? "transition-[stroke-dashoffset] ease-out" : ""}`}
					style={
						animating
							? {
									transitionDuration: `${TRACK_DURATION_MS}ms`,
									transitionDelay: `${PROGRESS_DURATION_MS}ms`,
								}
							: undefined
					}
					strokeWidth={strokeWidth}
					strokeLinecap={roundedCaps ? "round" : "butt"}
					strokeDasharray={circumference}
					strokeDashoffset={circumference - trackLength}
					transform={`rotate(${progressAngle - 90} ${center} ${center})`}
				/>
				<circle
					cx={center}
					cy={center}
					r={radius}
					fill="none"
					className={`stroke-sky-300 ${animating ? "transition-[stroke-dashoffset] ease-out" : ""}`}
					style={
						animating
							? { transitionDuration: `${PROGRESS_DURATION_MS}ms` }
							: undefined
					}
					strokeWidth={strokeWidth}
					strokeLinecap={roundedCaps ? "round" : "butt"}
					strokeDasharray={circumference}
					strokeDashoffset={circumference - progressLength}
					transform={`rotate(-90 ${center} ${center})`}
				/>
			</g>
		</svg>
	);
}
