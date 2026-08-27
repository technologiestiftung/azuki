import {
	Document,
	Page,
	View,
	Text,
	Image,
	StyleSheet,
} from "@react-pdf/renderer";
import {
	displayFitPercent,
	formatOccupationDisplayName,
	formatOccupationSalary,
	type MatchedOccupation,
} from "@azuki/shared";
import { content } from "../../../content";
import { CtaCard, PageFooter, PdfHeader } from "../../pdf/PdfLayout";
import {
	COLOR,
	PAGE_HEADER_GAP,
	PAGE_HEADER_HEIGHT,
	PAGE_PAD_TOP,
	PAGE_PAD_X,
	styles,
} from "../../pdf/pdfTheme";

const TABLE_HEADER_BLOCK = 44;

const resultsListStyles = StyleSheet.create({
	pageWithTable: {
		paddingTop:
			PAGE_PAD_TOP + PAGE_HEADER_HEIGHT + PAGE_HEADER_GAP + TABLE_HEADER_BLOCK,
	},
	fixedTableHeader: {
		position: "absolute",
		top: PAGE_PAD_TOP + PAGE_HEADER_HEIGHT + PAGE_HEADER_GAP,
		left: PAGE_PAD_X,
		right: PAGE_PAD_X,
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
		objectFit: "cover",
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
	colOccupation: {
		flexGrow: 3.2,
		flexShrink: 1,
		flexBasis: 0,
		minWidth: 0,
		paddingRight: 10,
	},
	colFit: {
		flexGrow: 1.15,
		flexShrink: 0,
		flexBasis: 0,
		alignItems: "flex-start",
		paddingRight: 6,
	},
	colDuration: {
		flexGrow: 1.35,
		flexShrink: 0,
		flexBasis: 0,
		alignItems: "flex-start",
		paddingRight: 6,
	},
	colEarnings: {
		flexGrow: 1.35,
		flexShrink: 0,
		flexBasis: 0,
		alignItems: "flex-start",
	},
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
		width: "100%",
	},
	tableRowDescription: {
		fontFamily: "Asap",
		fontWeight: 400,
		fontSize: 10,
		color: COLOR.muted,
		lineHeight: 1.35,
		width: "100%",
	},
	tableCellText: {
		fontFamily: "Asap",
		fontWeight: 400,
		fontSize: 10,
		textAlign: "left",
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
});

export interface OccupationsPdfAssets {
	mascotSrc: string | null;
	qrSrc: string | null;
	placeholderSrc: string;
	topImageSrcs: string[];
}

export interface OccupationsPdfDocumentProps {
	occupations: MatchedOccupation[];
	wildcardOccupations?: MatchedOccupation[];
	assets: OccupationsPdfAssets;
}

function formatMatchLabel(occupation: MatchedOccupation): string {
	return `${displayFitPercent(occupation)} %`;
}

function formatSalaryLabel(occupation: MatchedOccupation): string {
	if (occupation.salaryKnown && occupation.salaryMonthlyMedian !== null) {
		return formatOccupationSalary(occupation.salaryMonthlyMedian);
	}
	return content["results.detail.salary.unknown"];
}

function formatTopMeta(occupation: MatchedOccupation): string {
	const parts: string[] = [];
	if (occupation.occupationDuration) {
		parts.push(occupation.occupationDuration);
	}
	if (occupation.salaryKnown && occupation.salaryMonthlyMedian !== null) {
		parts.push(formatOccupationSalary(occupation.salaryMonthlyMedian));
	}
	return parts.join(" · ");
}

function MatchPill({ occupation }: { occupation: MatchedOccupation }) {
	return (
		<View style={resultsListStyles.pill}>
			<Text style={resultsListStyles.pillText}>
				{formatMatchLabel(occupation)}
			</Text>
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
		<View style={resultsListStyles.card} wrap={false}>
			<View style={resultsListStyles.cardImageFrame}>
				<Image
					src={imageSrc}
					style={resultsListStyles.cardImage}
					cache={false}
				/>
			</View>
			<View style={resultsListStyles.badgesRow}>
				<MatchPill occupation={occupation} />
			</View>
			<Text style={resultsListStyles.cardTitle}>
				{formatOccupationDisplayName(occupation.name)}
			</Text>
			{description ? (
				<Text style={resultsListStyles.cardDescription}>{description}</Text>
			) : null}
			{meta ? <Text style={resultsListStyles.cardMeta}>{meta}</Text> : null}
		</View>
	);
}

function TableHeader() {
	return (
		<View style={resultsListStyles.tableHeader} wrap={false}>
			<Text
				style={[
					resultsListStyles.tableHeaderCell,
					resultsListStyles.colOccupation,
				]}
			>
				{content["results.export.occupation"]}
			</Text>
			<View style={resultsListStyles.tableHeaderDivider} />
			<Text
				style={[resultsListStyles.tableHeaderCell, resultsListStyles.colFit]}
			>
				{content["results.export.fit"]}
			</Text>
			<View style={resultsListStyles.tableHeaderDivider} />
			<Text
				style={[
					resultsListStyles.tableHeaderCell,
					resultsListStyles.colDuration,
				]}
			>
				{content["results.export.duration"]}
			</Text>
			<View style={resultsListStyles.tableHeaderDivider} />
			<Text
				style={[
					resultsListStyles.tableHeaderCell,
					resultsListStyles.colEarnings,
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
	showFit = true,
}: {
	occupation: MatchedOccupation;
	rowIndex: number;
	showFit?: boolean;
}) {
	const description = truncateText(occupation.shortDescription || "", 180);
	return (
		<View
			style={
				rowIndex % 2 === 1
					? [resultsListStyles.tableRow, resultsListStyles.tableRowAlt]
					: resultsListStyles.tableRow
			}
			wrap={false}
		>
			<View style={resultsListStyles.colOccupation}>
				<Text style={resultsListStyles.tableRowTitle}>
					{formatOccupationDisplayName(occupation.name)}
				</Text>
				{description ? (
					<Text style={resultsListStyles.tableRowDescription}>
						{description}
					</Text>
				) : null}
			</View>
			<View style={resultsListStyles.colFit}>
				{showFit ? (
					<MatchPill occupation={occupation} />
				) : (
					<Text style={resultsListStyles.tableCellText}>–</Text>
				)}
			</View>
			<View style={resultsListStyles.colDuration}>
				<Text style={resultsListStyles.tableCellText}>
					{occupation.occupationDuration || "–"}
				</Text>
			</View>
			<View style={resultsListStyles.colEarnings}>
				<Text style={resultsListStyles.tableCellText}>
					{formatSalaryLabel(occupation)}
				</Text>
			</View>
		</View>
	);
}

export function OccupationsPdfDocument({
	occupations,
	wildcardOccupations = [],
	assets,
}: OccupationsPdfDocumentProps) {
	const topOccupations = occupations.slice(0, 3);
	const remaining = occupations.slice(3);
	const hasTable = remaining.length > 0;
	const hasWildcards = wildcardOccupations.length > 0;

	return (
		<Document
			title={content["results.title"]}
			author="AzuKi"
			subject={content["results.export.tagline"]}
		>
			<Page
				size="A4"
				style={
					hasTable
						? [styles.page, resultsListStyles.pageWithTable]
						: styles.page
				}
			>
				<View
					style={styles.fixedPageHeader}
					fixed
					render={({ pageNumber }) => (
						<PdfHeader
							pageNumber={pageNumber}
							title={content["results.title"]}
							tagline={content["results.export.tagline"]}
						/>
					)}
				/>

				{hasTable ? (
					<View
						style={resultsListStyles.fixedTableHeader}
						fixed
						render={({ pageNumber, ...rest }) => {
							// View typings omit totalPages; runtime matches Text's render props.
							const totalPages = (rest as { totalPages?: number }).totalPages;
							const visible =
								pageNumber > 1 &&
								(totalPages === undefined || pageNumber < totalPages);
							return (
								<View style={{ opacity: visible ? 1 : 0 }}>
									<TableHeader />
								</View>
							);
						}}
					/>
				) : null}

				{topOccupations.length > 0 ? (
					<View
						style={hasTable ? { marginTop: -TABLE_HEADER_BLOCK } : undefined}
					>
						<Text style={styles.sectionTitle}>
							{content["results.export.topTitle"]}
						</Text>
						<View style={resultsListStyles.cardsRow} wrap={false}>
							{topOccupations.map((occupation, index) => (
								<TopCard
									key={occupation.id}
									occupation={occupation}
									imageSrc={assets.topImageSrcs[index] || assets.placeholderSrc}
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
					</>
				) : null}

				{hasWildcards ? (
					<>
						<View style={resultsListStyles.demandBanner} wrap={false}>
							<Text style={resultsListStyles.demandBannerText}>
								{content["results.export.inDemandBanner"]} ↓
							</Text>
						</View>
						{!hasTable ? <TableHeader /> : null}
						{wildcardOccupations.map((occupation, index) => (
							<TableRow
								key={`wildcard-${occupation.id}`}
								occupation={occupation}
								rowIndex={index}
								showFit={false}
							/>
						))}
					</>
				) : null}

				<CtaCard mascotSrc={assets.mascotSrc} qrSrc={assets.qrSrc} />
				<PageFooter />
			</Page>
		</Document>
	);
}
