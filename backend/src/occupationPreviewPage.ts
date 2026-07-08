import type { Context } from "hono";
import {
	buildOccupationShareText,
	formatOccupationDisplayName,
	type Occupation,
} from "@azuki/shared";
import { SPA_INDEX_HTML } from "./generated/spaIndexTemplate.js";

const DEFAULT_SITE_TITLE = "Azuki";
const DEFAULT_SITE_DESCRIPTION =
	"Entdecke Ausbildungsberufe, die zu dir passen, und finde freie Plätze in deiner Nähe.";
const PLACEHOLDER_IMAGE_PATH = "/illustrations/occupation-placeholder.svg";

export interface PageMetaTags {
	title: string;
	description: string;
	imageUrl: string;
	pageUrl: string;
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function resolveRequestOrigin(requestUrl: string): string {
	return new URL(requestUrl).origin;
}

function resolvePublicRequestUrl(
	c: Context,
	occupationId: number | undefined,
): string {
	const incoming = new URL(c.req.url);
	const protocol =
		c.req.header("x-forwarded-proto") ?? incoming.protocol.replace(":", "");
	const host =
		c.req.header("x-forwarded-host") ?? c.req.header("host") ?? incoming.host;
	const pathname =
		occupationId !== undefined && incoming.pathname.startsWith("/api/results/")
			? `/results/${occupationId}`
			: incoming.pathname;

	return new URL(
		`${protocol}://${host}${pathname}${incoming.search}`,
	).toString();
}

function resolveAbsoluteImageUrl(
	imageUrl: string | undefined,
	origin: string,
): string {
	if (!imageUrl) {
		return `${origin}${PLACEHOLDER_IMAGE_PATH}`;
	}
	if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
		return imageUrl;
	}
	return `${origin}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
}

export function buildOccupationPreviewTitle(displayName: string): string {
	return displayName;
}

export function parseFitPercentParam(
	value: string | undefined,
): number | undefined {
	if (value === undefined) {
		return undefined;
	}
	const fitPercent = Number(value);
	if (!Number.isFinite(fitPercent) || fitPercent < 0 || fitPercent > 100) {
		return undefined;
	}
	return Math.round(fitPercent);
}

export function buildOccupationPageMeta(
	occupation: Occupation,
	requestUrl: string,
): PageMetaTags {
	const origin = resolveRequestOrigin(requestUrl);
	const displayName = formatOccupationDisplayName(occupation.name);
	const description =
		buildOccupationShareText(occupation) || DEFAULT_SITE_DESCRIPTION;

	return {
		title: buildOccupationPreviewTitle(displayName),
		description,
		imageUrl: resolveAbsoluteImageUrl(occupation.images[0]?.url, origin),
		pageUrl: requestUrl,
	};
}

export function buildDefaultPageMeta(requestUrl: string): PageMetaTags {
	const origin = resolveRequestOrigin(requestUrl);
	return {
		title: DEFAULT_SITE_TITLE,
		description: DEFAULT_SITE_DESCRIPTION,
		imageUrl: resolveAbsoluteImageUrl(PLACEHOLDER_IMAGE_PATH, origin),
		pageUrl: requestUrl,
	};
}

export function renderPageMetaTags(meta: PageMetaTags): string {
	const title = escapeHtml(meta.title);
	const description = escapeHtml(meta.description);
	const imageUrl = escapeHtml(meta.imageUrl);
	const pageUrl = escapeHtml(meta.pageUrl);

	return `<title>${title}</title>
		<meta name="description" content="${description}" />
		<meta property="og:title" content="${title}" />
		<meta property="og:description" content="${description}" />
		<meta property="og:image" content="${imageUrl}" />
		<meta property="og:url" content="${pageUrl}" />
		<meta property="og:type" content="website" />
		<meta property="og:locale" content="de_DE" />
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:title" content="${title}" />
		<meta name="twitter:description" content="${description}" />
		<meta name="twitter:image" content="${imageUrl}" />`;
}

export function injectPageMetaIntoSpaHtml(
	spaIndexHtml: string,
	meta: PageMetaTags,
): string {
	const metaTags = renderPageMetaTags(meta);
	const withoutSocialMeta = spaIndexHtml
		.replace(/<title>[^<]*<\/title>\s*/i, "")
		.replace(/<meta\s+name="description"[^>]*>\s*/gi, "")
		.replace(/<meta\s+property="og:[^"]+"[^>]*>\s*/gi, "")
		.replace(/<meta\s+name="twitter:[^"]+"[^>]*>\s*/gi, "");
	return withoutSocialMeta.replace("</head>", `\t\t${metaTags}\n\t</head>`);
}

export function renderOccupationPreviewPage(
	c: Context,
	occupations: Occupation[],
): Response {
	const occupationId = Number.parseInt(c.req.param("id"), 10);
	const occupation = Number.isFinite(occupationId)
		? occupations.find((entry) => entry.id === occupationId)
		: undefined;
	const publicRequestUrl = resolvePublicRequestUrl(
		c,
		occupation?.id ??
			(Number.isFinite(occupationId) ? occupationId : undefined),
	);
	const meta = occupation
		? buildOccupationPageMeta(occupation, publicRequestUrl)
		: buildDefaultPageMeta(publicRequestUrl);
	const html = injectPageMetaIntoSpaHtml(SPA_INDEX_HTML, meta);
	return c.html(html);
}
