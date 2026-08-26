import { Font, StyleSheet } from "@react-pdf/renderer";

export const COLOR = {
	sky900: "#002842",
	sky300: "#38BDF8",
	sky200: "#7DD3FC",
	sky50: "#DDF4FF",
	sky0: "#F0F9FF",
	skyShade10: "#F2F4F5",
	skyShade30: "#D7DDE1",
	skyShade120: "#5E7788",
	sky100: "#BAE6FD",
	orange400: "#FB9541",
	orange200: "#FED7AA",
	orange0: "#FFFAF5",
	white: "#FFFFFF",
	muted: "#6B7280",
};

/** Figma mockup frame is 935×1322.36 px representing an A4 (595.28×841.89 pt) page. */
export const FIGMA_PX_TO_PT = 595.28 / 935;
/** Converts a Figma dev-mode px value to the pt value react-pdf expects. */
export const px = (figmaPx: number) =>
	Math.round(figmaPx * FIGMA_PX_TO_PT * 100) / 100;

/** Page chrome — fixed headers need reserved padding so wrapped pages don't overlap. */
export const PAGE_PAD_X = 24;
export const PAGE_PAD_TOP = 28;
export const PAGE_PAD_BOTTOM = 48;
export const PAGE_HEADER_HEIGHT = 72;
export const PAGE_HEADER_HEIGHT_COMPACT = 42;
export const PAGE_HEADER_GAP = 16;

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

Font.registerHyphenationCallback((word) => [word]);

export const styles = StyleSheet.create({
	page: {
		paddingTop: PAGE_PAD_TOP + PAGE_HEADER_HEIGHT + PAGE_HEADER_GAP,
		paddingBottom: PAGE_PAD_BOTTOM,
		paddingHorizontal: PAGE_PAD_X,
		fontFamily: "Asap",
		fontWeight: 400,
		fontSize: 10,
		color: COLOR.sky900,
	},
	pageCompactHeader: {
		paddingTop: PAGE_PAD_TOP + PAGE_HEADER_HEIGHT_COMPACT + PAGE_HEADER_GAP,
	},
	fixedPageHeader: {
		position: "absolute",
		top: PAGE_PAD_TOP,
		left: PAGE_PAD_X,
		right: PAGE_PAD_X,
		height: PAGE_HEADER_HEIGHT,
	},
	fixedPageHeaderCompact: {
		height: PAGE_HEADER_HEIGHT_COMPACT,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingLeft: 8,
		backgroundColor: COLOR.white,
	},
	headerLogo: {
		marginTop: "auto",
		marginBottom: "auto",
	},
	headerTitle: {
		marginTop: "auto",
		marginBottom: "auto",
		fontFamily: "Asap",
		fontWeight: 600,
		lineHeight: 1.2,
		color: COLOR.sky900,
		fontSize: 26.5,
	},
	sectionTitle: {
		fontFamily: "Asap",
		fontWeight: 700,
		fontSize: 18,
		lineHeight: 1.25,
		marginBottom: px(14.78),
		paddingLeft: 8,
	},
	cta: {
		marginTop: 24,
		backgroundColor: COLOR.sky50,
		borderRadius: px(20),
		paddingHorizontal: 20,
		paddingVertical: px(24),
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
	ctaBodyBold: {
		fontFamily: "Asap",
		fontWeight: 700,
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
