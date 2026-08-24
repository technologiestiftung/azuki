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
		alignItems: "flex-start",
		gap: 12,
		paddingLeft: 8,
		backgroundColor: COLOR.white,
	},
	headerTitleWrap: {
		flexGrow: 1,
		flexShrink: 1,
		flexBasis: 0,
		minWidth: 0,
		paddingRight: 4,
	},
	headerTitle: {
		fontFamily: "Asap",
		fontWeight: 600,
		lineHeight: 1.2,
		color: COLOR.sky900,
		fontSize: 26.5,
	},
	brandBlock: {
		flexShrink: 0,
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
