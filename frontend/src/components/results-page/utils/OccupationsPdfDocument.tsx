import {
	Document,
	Page,
	View,
	Text,
	Image,
	StyleSheet,
	Font,
} from "@react-pdf/renderer";
import {
	fitPercent,
	formatOccupationDisplayName,
	type MatchedOccupation,
} from "@azuki/shared";
import { content } from "../../../content";

const COLOR = {
	sky900: "#002842",
	sky300: "#38BDF8",
	sky50: "#DDF4FF",
	skyShade10: "#F2F4F5",
	skyShade30: "#D7DDE1",
	skyShade120: "#5E7788",
	sky100: "#BAE6FD",
	white: "#FFFFFF",
	muted: "#6B7280",
};

/** Page chrome — fixed headers need reserved padding so wrapped pages don't overlap. */
const PAGE_PAD_X = 24;
const PAGE_PAD_TOP = 28;
const PAGE_PAD_BOTTOM = 48;
const PAGE_HEADER_HEIGHT = 72;
const PAGE_HEADER_GAP = 16;
const TABLE_HEADER_BLOCK = 44;

/** Same-origin TTFs — @react-pdf cannot use the browser Google Fonts CSS. */
Font.register({
	family: "Asap",
	fonts: [
		{ src: "/fonts/asap/Asap-Regular.ttf", fontWeight: 400 },
		{ src: "/fonts/asap/Asap-Medium.ttf", fontWeight: 500 },
		{ src: "/fonts/asap/Asap-SemiBold.ttf", fontWeight: 600 },
		{ src: "/fonts/asap/Asap-Bold.ttf", fontWeight: 700 },
		{ src: "/fonts/asap/Asap-ExtraBold.ttf", fontWeight: 800 },
	],
});

const styles = StyleSheet.create({
	page: {
		paddingTop: PAGE_PAD_TOP + PAGE_HEADER_HEIGHT + PAGE_HEADER_GAP,
		paddingBottom: PAGE_PAD_BOTTOM,
		paddingHorizontal: PAGE_PAD_X,
		fontFamily: "Asap",
		fontWeight: 400,
		fontSize: 10,
		color: COLOR.sky900,
	},
	pageWithTable: {
		paddingTop:
			PAGE_PAD_TOP + PAGE_HEADER_HEIGHT + PAGE_HEADER_GAP + TABLE_HEADER_BLOCK,
	},
	fixedPageHeader: {
		position: "absolute",
		top: PAGE_PAD_TOP,
		left: PAGE_PAD_X,
		right: PAGE_PAD_X,
		height: PAGE_HEADER_HEIGHT,
	},
	fixedTableHeader: {
		position: "absolute",
		top: PAGE_PAD_TOP + PAGE_HEADER_HEIGHT + PAGE_HEADER_GAP,
		left: PAGE_PAD_X,
		right: PAGE_PAD_X,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingLeft: 8,
		backgroundColor: COLOR.white,
	},
	headerTitle: {
		fontFamily: "Asap",
		fontWeight: 600,
		lineHeight: 1.2,
		color: COLOR.sky900,
		fontSize: 26.5,
	},
	brandBlock: {
		alignItems: "flex-end",
	},
	brandRow: {
		flexDirection: "row",
	},
	brandAzu: {
		fontFamily: "Asap",
		fontWeight: 800,
		letterSpacing: 0.36,
		color: COLOR.sky900,
		fontSize: 36,
	},
	brandKi: {
		fontFamily: "Asap",
		fontWeight: 800,
		letterSpacing: 0.36,
		color: COLOR.sky300,
		fontSize: 36,
	},
	brandCompact: {
		fontSize: 26.5,
		letterSpacing: 0.27,
	},
	tagline: {
		fontFamily: "Asap",
		fontSize: 9,
		fontWeight: 500,
		lineHeight: 1.2,
		letterSpacing: 0.09,
		marginTop: 2,
		color: COLOR.skyShade120,
	},
	sectionTitle: {
		fontFamily: "Asap",
		fontWeight: 700,
		fontSize: 18,
		lineHeight: 1.25,
		marginBottom: 14,
		paddingLeft: 8,
	},
	cardsRow: {
		flexDirection: "row",
		gap: 8,
		marginBottom: 46,
		alignItems: "stretch",
	},
	card: {
		flex: 1,
		backgroundColor: COLOR.skyShade10,
		borderRadius: 13,
		padding: 8,
		flexDirection: "column",
	},
	cardImageFrame: {
		width: "100%",
		height: 92,
		borderRadius: 5,
		overflow: "hidden",
		backgroundColor: COLOR.skyShade10,
		marginBottom: 10,
	},
	cardImage: {
		width: "100%",
		height: 92,
	},
	badgesRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 6,
		marginBottom: 10,
	},
	pill: {
		backgroundColor: COLOR.sky900,
		borderRadius: 6.48,
		paddingHorizontal: 8,
		paddingVertical: 3,
	},
	pillSoft: {
		backgroundColor: COLOR.sky100,
	},
	pillText: {
		fontFamily: "Asap",
		fontWeight: 700,
		fontSize: 8,
		color: COLOR.white,
	},
	pillTextDark: {
		color: COLOR.sky900,
	},
	cardTitle: {
		fontFamily: "Asap",
		fontWeight: 700,
		fontSize: 11.5,
		color: COLOR.sky900,
		marginBottom: 5,
		lineHeight: 1.3,
	},
	cardDescription: {
		fontFamily: "Asap",
		fontWeight: 400,
		fontSize: 10,
		color: COLOR.sky900,
		lineHeight: 1.35,
		marginBottom: 8,
	},
	cardMeta: {
		fontFamily: "Asap",
		fontWeight: 400,
		fontSize: 7,
		color: COLOR.sky900,
		marginTop: "auto",
	},
	tableHeader: {
		flexDirection: "row",
		backgroundColor: COLOR.sky50,
		borderRadius: 8,
		marginBottom: 12,
	},
	tableHeaderCell: {
		fontFamily: "Asap",
		fontWeight: 700,
		fontSize: 10,
		color: COLOR.sky900,
		paddingHorizontal: 10,
		paddingVertical: 8,
	},
	tableHeaderDivider: {
		width: 2,
		backgroundColor: COLOR.white,
		alignSelf: "stretch",
	},
	colOccupation: { flex: 3.2 },
	colFit: { flex: 1.15, alignItems: "center" },
	colDuration: { flex: 1.35, alignItems: "center" },
	colEarnings: { flex: 1.35, alignItems: "center" },
	tableRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		borderRadius: 8,
		padding: 12,
		marginBottom: 8,
	},
	tableRowAlt: {
		backgroundColor: COLOR.skyShade10,
	},
	tableRowTitle: {
		fontFamily: "Asap",
		fontWeight: 700,
		fontSize: 10,
		marginBottom: 2,
		lineHeight: 1.3,
	},
	tableRowDescription: {
		fontFamily: "Asap",
		fontWeight: 400,
		fontSize: 10,
		color: COLOR.muted,
		lineHeight: 1.35,
	},
	tableCellText: {
		fontFamily: "Asap",
		fontWeight: 400,
		fontSize: 10,
		textAlign: "center",
	},
	demandBanner: {
		backgroundColor: COLOR.skyShade30,
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 12,
		marginTop: 8,
		marginBottom: 8,
	},
	demandBannerText: {
		fontFamily: "Asap",
		fontWeight: 700,
		fontSize: 11.5,
		color: COLOR.sky900,
	},
	cta: {
		marginTop: 24,
		backgroundColor: COLOR.sky50,
		borderRadius: 16,
		paddingHorizontal: 20,
		paddingVertical: 20,
		flexDirection: "row",
		alignItems: "center",
	},
	ctaMascot: {
		width: 56,
		height: 56,
		objectFit: "contain",
		marginRight: 29.51,
	},
	ctaText: {
		flex: 1,
		marginRight: 16,
	},
	ctaTitle: {
		fontFamily: "Asap",
		fontWeight: 700,
		fontSize: 18,
		marginBottom: 8,
		lineHeight: 1.25,
	},
	ctaBody: {
		fontFamily: "Asap",
		fontWeight: 400,
		fontSize: 11.5,
		lineHeight: 1.3,
	},
	ctaQrBlock: {
		alignItems: "center",
		width: 110,
		flexShrink: 0,
	},
	ctaQr: {
		width: 52,
		height: 52,
		objectFit: "contain",
		marginBottom: 6,
	},
	ctaQrLabel: {
		fontFamily: "Asap",
		fontWeight: 600,
		fontSize: 8,
		textAlign: "center",
	},
	footer: {
		position: "absolute",
		left: 20,
		right: 20,
		bottom: 20,
		flexDirection: "row",
		justifyContent: "space-between",
		fontFamily: "Asap",
		fontWeight: 400,
		fontSize: 10,
		color: COLOR.skyShade120,
	},
	footerText: {
		fontFamily: "Asap",
		fontWeight: 400,
		fontSize: 10,
		color: COLOR.skyShade120,
	},
	footerBold: {
		fontFamily: "Asap",
		fontWeight: 600,
	},
});

export interface OccupationsPdfAssets {
	mascotSrc: string | null;
	qrSrc: string | null;
	placeholderSrc: string;
	topImageSrcs: string[];
}

export interface OccupationsPdfDocumentProps {
	occupations: MatchedOccupation[];
	assets: OccupationsPdfAssets;
}

function formatMatchLabel(score: number): string {
	return `${fitPercent(score)} %`;
}

function formatSalaryLabel(occupation: MatchedOccupation): string {
	return (
		occupation.occupationEarnings || content["results.detail.salary.unknown"]
	);
}

function formatTopMeta(occupation: MatchedOccupation): string {
	const parts: string[] = [];
	if (occupation.occupationDuration) {
		parts.push(occupation.occupationDuration);
	}
	if (occupation.occupationEarnings) {
		parts.push(occupation.occupationEarnings);
	}
	return parts.join(" · ");
}

function PdfHeader({ pageNumber }: { pageNumber: number }) {
	const compact = pageNumber > 1;
	return (
		<View style={styles.header}>
			<Text style={styles.headerTitle}>{content["results.title"]}</Text>
			<View style={styles.brandBlock}>
				<View style={styles.brandRow}>
					<Text
						style={
							compact ? [styles.brandAzu, styles.brandCompact] : styles.brandAzu
						}
					>
						{content["results.brand.azu"]}
					</Text>
					<Text
						style={
							compact ? [styles.brandKi, styles.brandCompact] : styles.brandKi
						}
					>
						{content["results.brand.ki"]}
					</Text>
				</View>

				<Text style={[styles.tagline, { opacity: pageNumber === 1 ? 1 : 0 }]}>
					{content["results.export.tagline"]}
				</Text>
			</View>
		</View>
	);
}

function MatchPill({ score }: { score: number }) {
	return (
		<View style={styles.pill}>
			<Text style={styles.pillText}>{formatMatchLabel(score)}</Text>
		</View>
	);
}

function TopCard({
	occupation,
	imageSrc,
}: {
	occupation: MatchedOccupation;
	imageSrc: string;
}) {
	const description = (occupation.shortDescription || "").trim();
	const meta = formatTopMeta(occupation);
	return (
		<View style={styles.card} wrap={false}>
			<View style={styles.cardImageFrame}>
				<Image src={imageSrc} style={styles.cardImage} cache={false} />
			</View>
			<Text style={styles.cardTitle}>
				{formatOccupationDisplayName(occupation.name)}
			</Text>
			{description ? (
				<Text style={styles.cardDescription}>{description}</Text>
			) : null}
			{meta ? <Text style={styles.cardMeta}>{meta}</Text> : null}
		</View>
	);
}

function TableHeader() {
	return (
		<View style={styles.tableHeader} wrap={false}>
			<Text style={[styles.tableHeaderCell, styles.colOccupation]}>
				{content["results.export.occupation"]}
			</Text>
			<View style={styles.tableHeaderDivider} />
			<Text
				style={[styles.tableHeaderCell, styles.colFit, { textAlign: "center" }]}
			>
				{content["results.export.fit"]}
			</Text>
			<View style={styles.tableHeaderDivider} />
			<Text
				style={[
					styles.tableHeaderCell,
					styles.colDuration,
					{ textAlign: "center" },
				]}
			>
				{content["results.export.duration"]}
			</Text>
			<View style={styles.tableHeaderDivider} />
			<Text
				style={[
					styles.tableHeaderCell,
					styles.colEarnings,
					{ textAlign: "center" },
				]}
			>
				{content["results.export.earnings"]}
			</Text>
		</View>
	);
}

function truncateText(value: string, maxChars: number): string {
	const trimmed = value.trim();
	if (trimmed.length <= maxChars) {
		return trimmed;
	}
	return `${trimmed.slice(0, maxChars - 1).trimEnd()}…`;
}

function TableRow({
	occupation,
	rowIndex,
}: {
	occupation: MatchedOccupation;
	rowIndex: number;
}) {
	const description = truncateText(occupation.shortDescription || "", 180);
	return (
		<View
			style={
				rowIndex % 2 === 1
					? [styles.tableRow, styles.tableRowAlt]
					: styles.tableRow
			}
			wrap={false}
		>
			<View style={styles.colOccupation}>
				<Text style={styles.tableRowTitle}>
					{formatOccupationDisplayName(occupation.name)}
				</Text>
				{description ? (
					<Text style={styles.tableRowDescription}>{description}</Text>
				) : null}
			</View>
			<View style={styles.colFit}>
				<MatchPill score={occupation.score} />
			</View>
			<View style={styles.colDuration}>
				<Text style={styles.tableCellText}>
					{occupation.occupationDuration || "–"}
				</Text>
			</View>
			<View style={styles.colEarnings}>
				<Text style={styles.tableCellText}>
					{formatSalaryLabel(occupation)}
				</Text>
			</View>
		</View>
	);
}

function CtaCard({
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
				<Text style={styles.ctaBody}>{content["results.export.ctaBody"]}</Text>
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

function PageFooter() {
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

export function OccupationsPdfDocument({
	occupations,
	assets,
}: OccupationsPdfDocumentProps) {
	const topOccupations = occupations.slice(0, 3);
	const remaining = occupations.slice(3);
	const hasTable = remaining.length > 0;

	return (
		<Document
			title={content["results.title"]}
			author="AzuKi"
			subject={content["results.export.tagline"]}
		>
			<Page
				size="A4"
				style={hasTable ? [styles.page, styles.pageWithTable] : styles.page}
			>
				<View
					style={styles.fixedPageHeader}
					fixed
					render={({ pageNumber }) => <PdfHeader pageNumber={pageNumber} />}
				/>

				{hasTable ? (
					<View
						style={styles.fixedTableHeader}
						fixed
						render={({ pageNumber }) => (
							<View style={{ opacity: pageNumber > 1 ? 1 : 0 }}>
								<TableHeader />
							</View>
						)}
					/>
				) : null}

				{topOccupations.length > 0 ? (
					<View
						style={hasTable ? { marginTop: -TABLE_HEADER_BLOCK } : undefined}
					>
						<Text style={styles.sectionTitle}>
							{content["results.export.topTitle"]}
						</Text>
						<View style={styles.cardsRow} wrap={false}>
							{topOccupations.map((occupation, index) => (
								<TopCard
									key={occupation.id}
									occupation={occupation}
									imageSrc={assets.topImageSrcs[index] ?? assets.placeholderSrc}
								/>
							))}
						</View>
					</View>
				) : null}

				{hasTable ? (
					<>
						<View
							style={
								topOccupations.length === 0
									? { marginTop: -TABLE_HEADER_BLOCK }
									: undefined
							}
						>
							<TableHeader />
						</View>
						{remaining.map((occupation, index) => (
							<TableRow
								key={occupation.id}
								occupation={occupation}
								rowIndex={index}
							/>
						))}
						{/* In-demand rows will come from a separate source later. */}
						<View style={styles.demandBanner} wrap={false}>
							<Text style={styles.demandBannerText}>
								{content["results.export.inDemandBanner"]} ↓
							</Text>
						</View>
					</>
				) : null}

				<CtaCard mascotSrc={assets.mascotSrc} qrSrc={assets.qrSrc} />
				<PageFooter />
			</Page>
		</Document>
	);
}
