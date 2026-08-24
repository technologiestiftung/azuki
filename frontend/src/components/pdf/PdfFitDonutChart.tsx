import { Svg, Circle, Path } from "@react-pdf/renderer";
import { COLOR } from "./pdfTheme";

interface PdfFitDonutChartProps {
	percent: number;
	size?: number;
	strokeWidth?: number;
}

function polarToCartesian(
	center: number,
	radius: number,
	angleInDegrees: number,
): { x: number; y: number } {
	const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
	return {
		x: center + radius * Math.cos(angleInRadians),
		y: center + radius * Math.sin(angleInRadians),
	};
}

function describeArc({
	center,
	radius,
	startAngle,
	endAngle,
}: {
	center: number;
	radius: number;
	startAngle: number;
	endAngle: number;
}): string {
	const start = polarToCartesian(center, radius, endAngle);
	const end = polarToCartesian(center, radius, startAngle);
	const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

	return [
		"M",
		start.x,
		start.y,
		"A",
		radius,
		radius,
		0,
		largeArcFlag,
		0,
		end.x,
		end.y,
	].join(" ");
}

export function PdfFitDonutChart({
	percent,
	size = 72,
	strokeWidth = 14,
}: PdfFitDonutChartProps) {
	const center = size / 2;
	const radius = (size - strokeWidth) / 2;
	const clampedPercent = Math.min(100, Math.max(0, percent));
	/**
	 * Match FitDonutChart: round caps extend the arc by ~half the stroke at the
	 * leading edge, so shorten the sweep or 98% reads as a full ring.
	 */
	const capAngleDegrees =
		clampedPercent > 0 && clampedPercent < 100
			? (strokeWidth / 2 / radius) * (180 / Math.PI)
			: 0;
	const sweepDegrees = Math.max(
		0,
		(clampedPercent / 100) * 360 - capAngleDegrees,
	);
	let progressPath = "";
	if (clampedPercent >= 100) {
		progressPath = describeArc({
			center,
			radius,
			startAngle: 0,
			endAngle: 359.99,
		});
	} else if (sweepDegrees > 0) {
		progressPath = describeArc({
			center,
			radius,
			startAngle: 0,
			endAngle: sweepDegrees,
		});
	}
	return (
		<Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
			<Circle
				cx={center}
				cy={center}
				r={radius}
				stroke={COLOR.sky100}
				strokeWidth={strokeWidth}
				fill="none"
			/>
			{progressPath ? (
				<Path
					d={progressPath}
					stroke={COLOR.sky300}
					strokeWidth={strokeWidth}
					fill="none"
					strokeLinecap="round"
				/>
			) : null}
		</Svg>
	);
}
