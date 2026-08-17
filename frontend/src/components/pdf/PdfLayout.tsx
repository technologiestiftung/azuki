import { View, Text, Image } from "@react-pdf/renderer";
import { content } from "../../content";
import { COLOR, styles } from "./pdfTheme";

export function PdfHeader({
	pageNumber,
	title,
	tagline,
}: {
	pageNumber: number;
	title: string;
	tagline?: string;
}) {
	const compact = pageNumber > 1 || !tagline;
	return (
		<View style={styles.header}>
			<Text style={styles.headerTitle}>{title}</Text>
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
				{tagline ? (
					<Text style={[styles.tagline, { opacity: pageNumber === 1 ? 1 : 0 }]}>
						{tagline}
					</Text>
				) : null}
			</View>
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
