import { View, Text, Image } from "@react-pdf/renderer";
import { content } from "../../content";
import { COLOR, px, styles } from "./pdfTheme";

/**
 * The brand mark is rendered as a raster Image rather than react-pdf's
 * Svg/Path: Svg content inside the fixed page header's per-page `render`
 * callback silently drops whenever any ancestor uses
 * `alignItems`/`alignSelf: "center"` — a react-pdf Yoga-measurement bug, not
 * something fixable from userland layout. `wordmarkSrc`/`lockupSrc` are
 * pre-rasterized via `loadPdfIconSrc` (see loadPdfAssets.ts) and passed down
 * from the exporter, same as the CTA mascot/QR icons.
 */
export function PdfHeader({
	pageNumber,
	title,
	tagline,
	wordmarkSrc,
	lockupSrc,
}: {
	pageNumber: number;
	title: string;
	tagline?: string;
	wordmarkSrc: string | null;
	lockupSrc: string | null;
}) {
	const compact = pageNumber > 1 || !tagline;
	const logoWidth = compact ? px(105) * 0.7361 : px(150);
	const logoHeight = compact ? px(31) * 0.7361 : px(70);
	const logoSrc = compact ? wordmarkSrc : lockupSrc;
	return (
		<View style={styles.header}>
			<Text style={styles.headerTitle}>{title}</Text>
			{logoSrc ? (
				<Image
					src={logoSrc}
					style={[styles.headerLogo, { width: logoWidth, height: logoHeight }]}
				/>
			) : null}
		</View>
	);
}

export function CtaCard({
	mascotSrc,
	qrSrc,
}: {
	mascotSrc: string | null;
	qrSrc: string | null;
}) {
	return (
		<View style={styles.cta} wrap={false}>
			{mascotSrc ? (
				<Image src={mascotSrc} style={styles.ctaMascot} />
			) : (
				<View
					style={[styles.ctaMascot, { backgroundColor: COLOR.skyShade10 }]}
				/>
			)}
			<View style={styles.ctaText}>
				<Text style={styles.ctaTitle}>
					{content["results.export.ctaTitle"]}
				</Text>
				<Text style={styles.ctaBody}>
					{content["results.export.ctaBody.before"]}
					<Text style={styles.ctaBodyBold}>
						{content["results.export.ctaBody.boldProgram"]}
					</Text>{" "}
					<Text style={styles.ctaBodyBold}>
						{content["results.export.ctaBody.planA"]}
					</Text>
					{content["results.export.ctaBody.after"]}
				</Text>
			</View>
			<View style={styles.ctaQrBlock}>
				{qrSrc ? (
					<Image src={qrSrc} style={styles.ctaQr} />
				) : (
					<View
						style={[
							styles.ctaQr,
							{ borderWidth: 1, borderColor: COLOR.sky900 },
						]}
					/>
				)}
				<Text style={styles.ctaQrLabel} wrap={false}>
					{content["results.export.ctaQrLabel"]}
				</Text>
			</View>
		</View>
	);
}

export function PageFooter() {
	return (
		<View style={styles.footer} fixed>
			<Text style={styles.footerText}>
				{content["results.export.footer.1"]}{" "}
				<Text style={styles.footerBold}>
					{content["results.export.footer.2"]}
				</Text>
			</Text>

			<Text
				render={({ pageNumber, totalPages }) =>
					content["results.export.page"]
						.replace("{page}", String(pageNumber))
						.replace("{total}", String(totalPages))
				}
			/>
		</View>
	);
}
