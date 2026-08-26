import {
	Document,
	Page,
	View,
	Text,
	Image,
	StyleSheet,
} from "@react-pdf/renderer";
import {
	fitPercent,
	formatOccupationDisplayName,
	type MatchedOccupation,
	type UserProfile,
} from "@azuki/shared";
import { categories as subjectCategories } from "../components/competence-profile/steps/school-subject-step/school-subjects";
import { interests as interestCategories } from "../components/competence-profile/steps/interests-step/interests";
import { strengths as strengthOptions } from "../components/competence-profile/steps/strengths-step/strengths";
import { schoolDegrees } from "../components/competence-profile/steps/school-degree/school-degrees";
import { workExpectationOptions } from "../components/competence-profile/steps/work-expectation-options";
import { noGos as noGoOptions } from "../components/competence-profile/steps/no-gos-step/no-gos";
import { workPreferencePairs } from "../content/work-preference-pairs";
import { content } from "../content";
import { CtaCard, PageFooter, PdfHeader } from "../components/pdf/PdfLayout";
import { COLOR, px, styles } from "../components/pdf/pdfTheme";
import { formatOccupationSalary } from "@azuki/shared";

const profileStyles = StyleSheet.create({
	hero: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLOR.sky50,
		borderRadius: px(20),
		paddingHorizontal: 20,
		paddingVertical: 16,
		marginBottom: px(52.77),
	},
	heroAvatarWrap: {
		width: 64,
		height: 64,
		borderRadius: 32,
		overflow: "hidden",
		backgroundColor: COLOR.sky0,
		borderWidth: 4,
		borderStyle: "solid",
		borderColor: COLOR.sky100,
		marginRight: 16,
		flexShrink: 0,
		alignItems: "center",
		justifyContent: "center",
		padding: 8,
	},
	heroAvatar: {
		width: 93.379,
		height: 93.379,
		objectFit: "contain",
	},
	heroTextCol: {
		flex: 1,
		gap: 4,
	},
	heroName: {
		fontFamily: "Asap",
		fontWeight: 600,
		fontSize: px(32),
		lineHeight: 1.3,
		color: COLOR.sky900,
	},
	heroText: {
		fontFamily: "Asap",
		fontWeight: 400,
		fontSize: px(24),
		lineHeight: 1.3,
		color: COLOR.sky900,
	},
	cardsRow: {
		flexDirection: "row",
		gap: px(9),
		marginBottom: px(55.68),
		alignItems: "stretch",
	},
	card: {
		flex: 1,
		backgroundColor: COLOR.skyShade10,
		borderRadius: px(16),
		padding: px(8.101),
		flexDirection: "column",
	},
	cardImageFrame: {
		width: "100%",
		height: 92,
		borderRadius: 5,
		overflow: "hidden",
		backgroundColor: COLOR.skyShade10,
		marginBottom: px(9.721),
	},
	cardImage: {
		width: "100%",
		height: 92,
		objectFit: "cover",
	},
	cardBadgeRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: px(8.101),
		marginBottom: px(9.721),
	},
	pill: {
		backgroundColor: COLOR.sky900,
		borderRadius: px(8),
		paddingHorizontal: px(6.48),
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
		marginBottom: px(4.86),
		lineHeight: 1.3,
	},
	cardDescription: {
		fontFamily: "Asap",
		fontWeight: 400,
		fontSize: 10,
		color: COLOR.muted,
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
	aboutBlock: {
		marginTop: 0,
	},
	schoolDegreeBlock: {
		backgroundColor: COLOR.skyShade10,
		borderRadius: 13,
		padding: 12,
		marginBottom: px(8),
		marginLeft: 8,
		alignSelf: "flex-start",
	},
	schoolDegreeTitle: {
		fontFamily: "Asap",
		fontWeight: 700,
		fontSize: 12,
		lineHeight: 1.25,
		marginBottom: 8,
		color: COLOR.sky900,
	},
	schoolDegreeValue: {
		fontFamily: "Asap",
		fontWeight: 400,
		fontSize: 12,
		color: COLOR.sky900,
	},
	chipSubtitle: {
		fontFamily: "Asap",
		fontWeight: 700,
		fontSize: 12,
		lineHeight: 1.25,
		marginBottom: 8,
		paddingLeft: 8,
		color: COLOR.sky900,
	},
	columns: {
		flexDirection: "row",
		gap: px(28),
		marginBottom: px(8),
	},
	column: {
		flex: 1,
	},
	meterRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: px(12),
		marginBottom: px(8),
		paddingLeft: 8,
	},
	meterLabel: {
		fontFamily: "Asap",
		fontWeight: 400,
		fontSize: 10,
		color: COLOR.sky900,
		width: px(170),
	},
	meterPercent: {
		fontFamily: "Asap",
		fontWeight: 600,
		fontSize: 8,
		width: px(28),
		flexShrink: 0,
		textAlign: "right",
	},
	meterTrack: {
		flexGrow: 1,
		flexShrink: 1,
		flexBasis: 48,
		height: px(6),
		borderRadius: 100,
		overflow: "hidden",
		flexDirection: "row",
	},
	meterFill: {
		height: px(6),
		borderRadius: 100,
	},
	chipSection: {
		marginBottom: px(8),
	},
	chipRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: px(8),
		paddingLeft: 8,
	},
	chip: {
		borderWidth: px(2),
		borderRadius: 100,
		paddingHorizontal: px(14),
		paddingVertical: px(4),
	},
	chipDefault: {
		borderColor: COLOR.sky200,
		backgroundColor: COLOR.sky0,
	},
	chipNoGo: {
		borderColor: COLOR.orange200,
		backgroundColor: COLOR.orange0,
	},
	chipText: {
		fontFamily: "Asap",
		fontWeight: 400,
		fontSize: px(18),
		color: COLOR.sky900,
	},
});

export interface ProfilePdfAssets {
	mascotSrc: string | null;
	qrSrc: string | null;
	avatarSrc: string | null;
	placeholderSrc: string;
	topImageSrcs: string[];
}

export interface ProfilePdfDocumentProps {
	profile: UserProfile;
	topOccupations: MatchedOccupation[];
	shortDescription: string;
	profileName: string;
	assets: ProfilePdfAssets;
}

interface MeterItem {
	id: string;
	label: string;
	percent: number;
}

interface ChipItem {
	id: string;
	label: string;
}

function resolveSubjectLabel(id: string): string {
	for (const category of subjectCategories) {
		const match = category.subjects.find((subject) => subject.value === id);
		if (match) {
			return match.label;
		}
	}
	return id;
}

function resolveInterestLabel(id: string): string {
	for (const category of interestCategories) {
		const match = category.interests.find((interest) => interest.value === id);
		if (match) {
			return match.label;
		}
	}
	return id;
}

function strengthLabel(strengthId: string): string {
	return (
		strengthOptions.find((strength) => strength.id === strengthId)?.title ??
		strengthId
	);
}

function formatMatchLabel(score: number): string {
	return `${fitPercent(score)} %`;
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

function PdfPageHeader() {
	return (
		<View
			style={styles.fixedPageHeader}
			fixed
			render={({ pageNumber }) => (
				<PdfHeader
					pageNumber={pageNumber}
					title={content["profile.title"]}
					tagline={content["results.export.tagline"]}
				/>
			)}
		/>
	);
}

function HeroCard({
	profileName,
	shortDescription,
	avatarSrc,
}: {
	profileName: string;
	shortDescription: string;
	avatarSrc: string | null;
}) {
	if (!profileName && !shortDescription && !avatarSrc) {
		return null;
	}
	return (
		<View style={profileStyles.hero} wrap={false}>
			<View style={profileStyles.heroAvatarWrap}>
				{avatarSrc ? (
					<Image src={avatarSrc} style={profileStyles.heroAvatar} />
				) : null}
			</View>
			<View style={profileStyles.heroTextCol}>
				{profileName ? (
					<Text style={profileStyles.heroName}>{profileName}</Text>
				) : null}
				{shortDescription ? (
					<Text style={profileStyles.heroText}>{shortDescription}</Text>
				) : null}
			</View>
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
		<View style={profileStyles.card} wrap={false}>
			<View style={profileStyles.cardImageFrame}>
				<Image src={imageSrc} style={profileStyles.cardImage} cache={false} />
			</View>
			<View style={profileStyles.cardBadgeRow}>
				<View style={profileStyles.pill}>
					<Text style={profileStyles.pillText}>
						{formatMatchLabel(occupation.score)}
					</Text>
				</View>
			</View>
			<Text style={profileStyles.cardTitle}>
				{formatOccupationDisplayName(occupation.name)}
			</Text>
			{description ? (
				<Text style={profileStyles.cardDescription}>{description}</Text>
			) : null}
			{meta ? <Text style={profileStyles.cardMeta}>{meta}</Text> : null}
		</View>
	);
}

function MeterBar({
	item,
	tone,
}: {
	item: MeterItem;
	tone: "strength" | "hardship";
}) {
	const accent = tone === "strength" ? COLOR.sky300 : COLOR.orange400;
	const track = tone === "strength" ? COLOR.sky100 : COLOR.orange200;
	const width = Math.max(0, Math.min(100, item.percent));
	return (
		<View style={profileStyles.meterRow} wrap={false}>
			<Text style={profileStyles.meterLabel}>{item.label}</Text>
			<Text style={[profileStyles.meterPercent, { color: accent }]}>
				{item.percent} %
			</Text>
			<View style={[profileStyles.meterTrack, { backgroundColor: track }]}>
				<View
					style={[
						profileStyles.meterFill,
						{
							flexGrow: width,
							flexShrink: 1,
							flexBasis: 0,
							backgroundColor: accent,
						},
					]}
				/>
				<View
					style={{
						flexGrow: Math.max(0, 100 - width),
						flexShrink: 1,
						flexBasis: 0,
					}}
				/>
			</View>
		</View>
	);
}

function Chip({
	label,
	variant = "default",
}: {
	label: string;
	variant?: "default" | "noGo";
}) {
	return (
		<View
			style={[
				profileStyles.chip,
				variant === "noGo" ? profileStyles.chipNoGo : profileStyles.chipDefault,
			]}
			wrap={false}
		>
			<Text style={profileStyles.chipText}>{label}</Text>
		</View>
	);
}

function ChipSection({
	title,
	items,
	variant = "default",
	heading = "section",
}: {
	title: string;
	items: ChipItem[];
	variant?: "default" | "noGo";
	heading?: "section" | "subtitle";
}) {
	if (items.length === 0) {
		return null;
	}
	return (
		<View style={profileStyles.chipSection} wrap={false}>
			<Text
				style={
					heading === "subtitle"
						? profileStyles.chipSubtitle
						: styles.sectionTitle
				}
			>
				{title}
			</Text>
			<View style={profileStyles.chipRow}>
				{items.map((item) => (
					<Chip key={item.id} label={item.label} variant={variant} />
				))}
			</View>
		</View>
	);
}

function MeterColumn({
	title,
	items,
	tone,
}: {
	title: string;
	items: MeterItem[];
	tone: "strength" | "hardship";
}) {
	if (items.length === 0) {
		return null;
	}
	return (
		<View style={profileStyles.column}>
			<Text style={styles.sectionTitle}>{title}</Text>
			{items.map((item) => (
				<MeterBar key={item.id} item={item} tone={tone} />
			))}
		</View>
	);
}

function buildMeterItems(profile: UserProfile): {
	strengths: MeterItem[];
	hardships: MeterItem[];
} {
	const strengthScores = Object.entries(profile.strengths);
	const strengths: MeterItem[] = strengthScores
		.filter(([, value]) => value >= 0.5)
		.map(([strengthId, value]) => ({
			id: strengthId,
			label: strengthLabel(strengthId),
			percent: Math.round(value * 100),
		}));
	const selectedCustomStrengths = profile.selectedCustomStrengths.filter(
		(strength) => profile.customStrengths.includes(strength),
	);
	for (const label of selectedCustomStrengths) {
		strengths.push({ id: `custom-${label}`, label, percent: 100 });
	}
	const hardships: MeterItem[] = strengthScores
		.filter(([, value]) => value < 0.5)
		.map(([strengthId, value]) => ({
			id: strengthId,
			label: strengthLabel(strengthId),
			percent: Math.round(value * 100),
		}));
	return { strengths, hardships };
}

function buildAboutChipSections(profile: UserProfile): Array<{
	title: string;
	items: ChipItem[];
}> {
	return [
		{
			title: content["profile.favoriteSubjects"],
			items: profile.favoriteSubjects.map((subject) => ({
				id: subject,
				label: resolveSubjectLabel(subject),
			})),
		},
		{
			title: content["profile.interests"],
			items: profile.interests.map((interest) => ({
				id: interest,
				label: resolveInterestLabel(interest),
			})),
		},
		{
			title: content["profile.preferredJobs"],
			items: profile.preferredJobs.map((job) => ({
				id: job,
				label: job,
			})),
		},
	];
}

function resolveSchoolDegreeLabel(profile: UserProfile): string | null {
	if (!profile.educationLevel) {
		return null;
	}
	return (
		schoolDegrees.find((degree) => degree.value === profile.educationLevel)
			?.label ?? null
	);
}

function SchoolDegreeSection({ profile }: { profile: UserProfile }) {
	const label = resolveSchoolDegreeLabel(profile);
	if (!label) {
		return null;
	}
	const title = profile.inSchool
		? content["profile.schoolDegreeLabel.planned"]
		: content["profile.schoolDegreeLabel.inSchool"];
	return (
		<View style={profileStyles.schoolDegreeBlock} wrap={false}>
			<Text style={profileStyles.schoolDegreeTitle}>{title}</Text>
			<Text style={profileStyles.schoolDegreeValue}>{label}</Text>
		</View>
	);
}

function buildDetailChipSections(profile: UserProfile): Array<{
	title: string;
	items: ChipItem[];
	variant: "default" | "noGo";
}> {
	const workPreferences = Object.entries(profile.workPreferences)
		.filter(
			(entry): entry is [string, "a" | "b"] =>
				entry[1] === "a" || entry[1] === "b",
		)
		.map(([preferenceId, choice]) => {
			const pair = workPreferencePairs.find((item) => item.id === preferenceId);
			let label = preferenceId;
			if (pair) {
				label = choice === "a" ? pair.a : pair.b;
			}
			return { id: preferenceId, label };
		});

	return [
		{
			title: content["profile.workExpectations"],
			items: profile.workExpectations.map((expectation) => ({
				id: expectation,
				label:
					workExpectationOptions.find((option) => option.value === expectation)
						?.label ?? expectation,
			})),
			variant: "default",
		},
		{
			title: content["profile.practicalExperiences"],
			items: profile.practicalExperiences.map((experience) => ({
				id: experience.id,
				label: experience.description,
			})),
			variant: "default",
		},
		{
			title: content["profile.workPreferences"],
			items: workPreferences,
			variant: "default",
		},
		{
			title: content["profile.noGos"],
			items: Object.entries(profile.noGos)
				.filter(([, value]) => value === "rejected")
				.map(([noGoId]) => ({
					id: noGoId,
					label:
						noGoOptions.find((entry) => entry.id === noGoId)?.title ?? noGoId,
				})),
			variant: "noGo",
		},
	];
}

export function ProfilePdfDocument({
	profile,
	topOccupations,
	shortDescription,
	profileName,
	assets,
}: ProfilePdfDocumentProps) {
	const { strengths, hardships } = buildMeterItems(profile);
	const aboutSections = buildAboutChipSections(profile);
	const detailSections = buildDetailChipSections(profile);
	const hasMeters = strengths.length > 0 || hardships.length > 0;
	const schoolDegreeLabel = resolveSchoolDegreeLabel(profile);
	const hasAbout =
		Boolean(schoolDegreeLabel) ||
		aboutSections.some((section) => section.items.length > 0);

	return (
		<Document
			title={content["profile.title"]}
			author="AzuKi"
			subject={content["results.export.tagline"]}
		>
			<Page size="A4" style={styles.page}>
				<PdfPageHeader />
				<HeroCard
					profileName={profileName}
					shortDescription={shortDescription}
					avatarSrc={assets.avatarSrc}
				/>

				{topOccupations.length > 0 ? (
					<View>
						<Text style={styles.sectionTitle}>
							{content["results.export.topTitle"]}
						</Text>
						<View style={profileStyles.cardsRow} wrap={false}>
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

				{hasAbout ? (
					<View style={profileStyles.aboutBlock}>
						<Text style={styles.sectionTitle}>
							{content["profile.aboutYou"]}
						</Text>
						<SchoolDegreeSection profile={profile} />
						{aboutSections.map((section) => (
							<ChipSection
								key={section.title}
								title={section.title}
								items={section.items}
								heading="subtitle"
							/>
						))}
					</View>
				) : null}

				{hasMeters ? (
					<View style={profileStyles.columns} wrap={false}>
						<MeterColumn
							title={content["profile.strengths"]}
							items={strengths}
							tone="strength"
						/>
						<MeterColumn
							title={content["profile.hardships"]}
							items={hardships}
							tone="hardship"
						/>
					</View>
				) : null}

				{detailSections.map((section) => (
					<ChipSection
						key={section.title}
						title={section.title}
						items={section.items}
						variant={section.variant}
					/>
				))}

				<CtaCard mascotSrc={assets.mascotSrc} qrSrc={assets.qrSrc} />
				<PageFooter />
			</Page>
		</Document>
	);
}
