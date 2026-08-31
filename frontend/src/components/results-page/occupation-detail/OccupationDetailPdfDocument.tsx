import {
	Document,
	Page,
	View,
	Text,
	Image,
	StyleSheet,
} from "@react-pdf/renderer";
import type { MatchExplanationsResponse } from "../../../api/client";
import { content } from "../../../content";
import { CtaCard, PageFooter, PdfHeader } from "../../pdf/PdfLayout";
import { PdfFitDonutChart } from "../../pdf/PdfFitDonutChart";
import {
	COLOR,
	PAGE_PAD_BOTTOM,
	PAGE_PAD_TOP,
	PAGE_HEADER_HEIGHT,
	PAGE_HEADER_GAP,
	styles,
} from "../../pdf/pdfTheme";

const HERO_HEIGHT = 172;
/** Extra room above the footer so match sections break earlier. */
const DETAIL_PAGE_PAD_BOTTOM = PAGE_PAD_BOTTOM + 24;
/** Extra space under the fixed header (helps continued grey boxes on page 2+). */
const DETAIL_HEADER_EXTRA = 10;

const detailStyles = StyleSheet.create({
	page: {
		paddingTop:
			PAGE_PAD_TOP + PAGE_HEADER_HEIGHT + PAGE_HEADER_GAP + DETAIL_HEADER_EXTRA,
		paddingBottom: DETAIL_PAGE_PAD_BOTTOM,
	},
	heroRow: {
		flexDirection: "row",
		alignItems: "stretch",
		height: HERO_HEIGHT,
		marginBottom: 22,
		backgroundColor: COLOR.sky50,
		borderRadius: 16,
		overflow: "hidden",
	},
	heroImageCol: {
		width: "40%",
		height: HERO_HEIGHT,
		backgroundColor: COLOR.sky100,
	},
	heroImage: {
		width: "100%",
		height: HERO_HEIGHT,
		objectFit: "cover",
	},
	metaPanel: {
		flex: 1,
		height: HERO_HEIGHT,
		paddingHorizontal: 12,
		paddingTop: 12,
		paddingBottom: 10,
		justifyContent: "flex-start",
		gap: 8,
	},
	metaGridRow: {
		flexDirection: "row",
		gap: 6,
	},
	metaCell: {
		flex: 1,
		minWidth: 0,
	},
	metaCellFull: {
		minWidth: 0,
	},
	metaLabel: {
		fontFamily: "Asap",
		fontWeight: 700,
		fontSize: 12,
		color: COLOR.sky900,
		marginBottom: 2,
	},
	metaValue: {
		fontFamily: "Asap",
		fontWeight: 400,
		fontSize: 10,
		color: COLOR.sky900,
		lineHeight: 1.25,
		marginBottom: 2,
	},
	metaDescription: {
		fontFamily: "Asap",
		fontWeight: 400,
		fontSize: 7.5,
		color: COLOR.skyShade120,
		lineHeight: 1.3,
	},
	taskList: {
		gap: 6,
		paddingLeft: 8,
		marginBottom: 20,
	},
	taskItem: {
		flexDirection: "row",
		gap: 8,
	},
	taskBullet: {
		fontFamily: "Asap",
		fontWeight: 400,
		fontSize: 11,
		color: COLOR.sky900,
		width: 8,
	},
	taskText: {
		flex: 1,
		fontFamily: "Asap",
		fontWeight: 400,
		fontSize: 11,
		color: COLOR.sky900,
		lineHeight: 1.4,
	},
	matchBlock: {
		backgroundColor: COLOR.sky50,
		borderRadius: 16,
		paddingHorizontal: 16,
		paddingVertical: 14,
		marginBottom: 10,
	},
	matchSectionTitle: {
		fontFamily: "Asap",
		fontWeight: 700,
		fontSize: 16,
		lineHeight: 1.25,
		color: COLOR.sky900,
		flex: 1,
		paddingRight: 12,
	},
	matchHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	matchPercentRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	matchPercent: {
		fontFamily: "Asap",
		fontWeight: 500,
		fontSize: 48,
		color: COLOR.sky900,
		lineHeight: 1,
	},
	matchSubsection: {
		backgroundColor: COLOR.skyShade10,
		borderRadius: 12,
		paddingHorizontal: 14,
		paddingTop: 12,
		paddingBottom: 12,
		marginBottom: 10,
	},
	matchSubsectionTitle: {
		fontFamily: "Asap",
		fontWeight: 600,
		fontSize: 12,
		color: COLOR.sky900,
		marginBottom: 6,
	},
	/**
	 * Top inset on every row — when a grey box continues after a page break,
	 * react-pdf often drops the parent paddingTop on the next fragment; this
	 * keeps the first continued row clear of the container edge.
	 */
	explanationItem: {
		flexDirection: "row",
		alignItems: "flex-start",
		paddingTop: 14,
		marginBottom: 2,
	},
	pillCol: {
		width: 112,
		flexShrink: 0,
		paddingRight: 0,
	},
	pill: {
		alignSelf: "flex-start",
		borderWidth: 1.5,
		borderRadius: 100,
		paddingHorizontal: 10,
		paddingVertical: 4,
	},
	pillMatch: {
		borderColor: COLOR.sky200,
		backgroundColor: COLOR.sky0,
	},
	pillNotMatch: {
		borderColor: COLOR.orange200,
		backgroundColor: COLOR.orange0,
	},
	pillText: {
		fontFamily: "Asap",
		fontWeight: 400,
		fontSize: 9,
		color: COLOR.sky900,
	},
	explanationSummary: {
		flexGrow: 1,
		flexShrink: 1,
		flexBasis: 0,
		minWidth: 0,
		fontFamily: "Asap",
		fontWeight: 400,
		fontSize: 10,
		color: COLOR.sky900,
		lineHeight: 1.35,
		paddingTop: 3,
	},
	emptyMessage: {
		fontFamily: "Asap",
		fontWeight: 400,
		fontSize: 10,
		color: COLOR.muted,
		lineHeight: 1.35,
	},
	ctaSpacer: {
		flexGrow: 1,
		minHeight: 12,
	},
});

export interface OccupationDetailPdfAssets {
	mascotSrc: string | null;
	qrSrc: string | null;
	heroImageSrc: string;
	wordmarkSrc: string | null;
	lockupSrc: string | null;
}

export interface OccupationDetailPdfDocumentProps {
	displayName: string;
	occupationDuration: string;
	salaryLabel: string;
	schoolDegreeLabel: string;
	taskItems: string[];
	matchPercent?: number;
	matchExplanations: MatchExplanationsResponse | null;
	assets: OccupationDetailPdfAssets;
}

function MetaCell({
	label,
	value,
	description,
	fullWidth = false,
}: {
	label: string;
	value: string;
	description?: string;
	fullWidth?: boolean;
}) {
	return (
		<View style={fullWidth ? detailStyles.metaCellFull : detailStyles.metaCell}>
			<Text style={detailStyles.metaLabel}>{label}</Text>
			<Text style={detailStyles.metaValue}>{value}</Text>
			{description ? (
				<Text style={detailStyles.metaDescription}>{description}</Text>
			) : null}
		</View>
	);
}

function ExplanationList({
	items,
	emptyMessage,
	variant,
}: {
	items: MatchExplanationsResponse["matching"];
	emptyMessage: string;
	variant: "match" | "notMatch";
}) {
	if (items.length === 0) {
		return <Text style={detailStyles.emptyMessage}>{emptyMessage}</Text>;
	}

	return (
		<View>
			{items.map((item) => (
				<View key={item.id} style={detailStyles.explanationItem} wrap={false}>
					<View style={detailStyles.pillCol}>
						<View
							style={[
								detailStyles.pill,
								variant === "match"
									? detailStyles.pillMatch
									: detailStyles.pillNotMatch,
							]}
						>
							<Text style={detailStyles.pillText}>{item.label}</Text>
						</View>
					</View>
					<Text style={detailStyles.explanationSummary}>{item.summary}</Text>
				</View>
			))}
		</View>
	);
}

export function OccupationDetailPdfDocument({
	displayName,
	occupationDuration,
	salaryLabel,
	schoolDegreeLabel,
	taskItems,
	matchPercent,
	matchExplanations,
	assets,
}: OccupationDetailPdfDocumentProps) {
	const matching = matchExplanations?.matching ?? [];
	const notMatching = matchExplanations?.notMatching ?? [];
	const showMatchSection = matchPercent !== undefined;

	return (
		<Document
			title={displayName}
			author="AzuKi"
			subject={content["results.detail.export.tagline"]}
		>
			<Page size="A4" style={[styles.page, detailStyles.page]}>
				<View
					style={styles.fixedPageHeader}
					fixed
					render={({ pageNumber }) => (
						<PdfHeader
							pageNumber={pageNumber}
							title={displayName}
							tagline={content["results.detail.export.tagline"]}
							wordmarkSrc={assets.wordmarkSrc}
							lockupSrc={assets.lockupSrc}
						/>
					)}
				/>

				<View style={detailStyles.heroRow} wrap={false}>
					<View style={detailStyles.heroImageCol}>
						<Image
							src={assets.heroImageSrc}
							style={detailStyles.heroImage}
							cache={false}
						/>
					</View>
					<View style={detailStyles.metaPanel}>
						<View style={detailStyles.metaGridRow}>
							<MetaCell
								label={content["results.detail.durationTitle"]}
								value={occupationDuration}
							/>
							<MetaCell
								label={content["results.detail.salaryTitle"]}
								value={salaryLabel}
								description={content["results.detail.salaryInfo.description"]}
							/>
						</View>
						<MetaCell
							label={content["results.detail.schoolDegreeTitle"]}
							value={schoolDegreeLabel}
							description={
								content["results.detail.schoolDegreeInfo.description"]
							}
							fullWidth
						/>
					</View>
				</View>

				{taskItems.length > 0 ? (
					<View>
						<Text style={styles.sectionTitle}>
							{content["results.detail.tasksTitle"]}
						</Text>
						<View style={detailStyles.taskList}>
							{taskItems.map((task) => (
								<View key={task} style={detailStyles.taskItem} wrap={false}>
									<Text style={detailStyles.taskBullet}>•</Text>
									<Text style={detailStyles.taskText}>{task}</Text>
								</View>
							))}
						</View>
					</View>
				) : null}

				{showMatchSection ? (
					<>
						<View style={detailStyles.matchBlock} wrap={false}>
							<View style={detailStyles.matchHeader}>
								<Text style={detailStyles.matchSectionTitle}>
									{content["results.detail.tasks.matchTitle"]}
								</Text>
								<View style={detailStyles.matchPercentRow}>
									<Text style={detailStyles.matchPercent}>{matchPercent}%</Text>
									<PdfFitDonutChart
										percent={matchPercent}
										size={56}
										strokeWidth={12}
									/>
								</View>
							</View>
						</View>

						<View style={detailStyles.matchSubsection} wrap>
							<Text
								style={detailStyles.matchSubsectionTitle}
								minPresenceAhead={48}
							>
								{content["results.detail.whyItMatches.title"]}
							</Text>
							<ExplanationList
								items={matching}
								emptyMessage={content["results.detail.whyItMatches.empty"]}
								variant="match"
							/>
						</View>

						<View style={detailStyles.matchSubsection} wrap>
							<Text
								style={detailStyles.matchSubsectionTitle}
								minPresenceAhead={48}
							>
								{content["results.detail.whyItMatches.notMatchTitle"]}
							</Text>
							<ExplanationList
								items={notMatching}
								emptyMessage={
									content["results.detail.whyItMatches.notMatchEmpty"]
								}
								variant="notMatch"
							/>
						</View>
					</>
				) : null}

				<View style={detailStyles.ctaSpacer} />
				<CtaCard mascotSrc={assets.mascotSrc} qrSrc={assets.qrSrc} />
				<PageFooter />
			</Page>
		</Document>
	);
}
