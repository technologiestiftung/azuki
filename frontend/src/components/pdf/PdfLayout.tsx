import { View, Text, Image } from "@react-pdf/renderer";
import { content } from "../../content";
import {
	COLOR,
	HEADER_TITLE_FONT_SIZE,
	HEADER_TITLE_GAP,
	HEADER_TITLE_LINE_HEIGHT,
	HEADER_TITLE_MIN_FONT_SIZE,
	PAGE_HEADER_HEIGHT,
	PAGE_PAD_X,
	PAGE_WIDTH,
	px,
	styles,
} from "./pdfTheme";

const HEADER_PAD_LEFT = 8;
const TITLE_AVG_CHAR_EM = 0.58;
const TITLE_WRAP_FILL = 0.92;
const TITLE_HEIGHT_SLACK = 0.94;
const TITLE_MAX_LINES = 2;

/**
 * Text cannot be measured from here, so a long title's size is estimated from
 * its character count and the room left beside the logo — without this it
 * overflows the header row and runs underneath the brand mark.
 */
function fitHeaderTitle(title: string, logoWidth: number) {
	const availableWidth =
		PAGE_WIDTH -
		2 * PAGE_PAD_X -
		HEADER_PAD_LEFT -
		HEADER_TITLE_GAP -
		logoWidth;
	const chars = Math.max(title.trim().length, 1);
	const widthAt = (fontSize: number) => chars * fontSize * TITLE_AVG_CHAR_EM;

	if (widthAt(HEADER_TITLE_FONT_SIZE) <= availableWidth) {
		return { fontSize: HEADER_TITLE_FONT_SIZE, availableWidth };
	}

	const byWidth =
		(availableWidth * TITLE_MAX_LINES * TITLE_WRAP_FILL) /
		(chars * TITLE_AVG_CHAR_EM);
	const byHeight =
		(PAGE_HEADER_HEIGHT * TITLE_HEIGHT_SLACK) /
		(TITLE_MAX_LINES * HEADER_TITLE_LINE_HEIGHT);
	const fontSize = Math.max(
		HEADER_TITLE_MIN_FONT_SIZE,
		Math.min(HEADER_TITLE_FONT_SIZE, byWidth, byHeight),
	);
	return { fontSize, availableWidth };
}

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
	const { fontSize, availableWidth } = fitHeaderTitle(title, logoWidth);
	return (
		<View style={styles.header}>
			<Text
				style={[
					styles.headerTitle,
					{
						fontSize,
						maxLines: TITLE_MAX_LINES,
						maxWidth: availableWidth,
						textOverflow: "ellipsis",
					},
				]}
			>
				{title}
			</Text>
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
