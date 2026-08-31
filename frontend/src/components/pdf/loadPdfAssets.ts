import { Buffer } from "buffer";

const WHITE = "#FFFFFF";

const FETCH_TIMEOUT_MS = 6000;
/** Caps CTA/avatar rasters (~56–64pt at ~2–3×). */
const MAX_RASTER_EDGE = 192;
/** Matches Figma card image aspect (width / height ≈ 31/18). */
const CARD_IMAGE_ASPECT = 31 / 18;
/** ~1.5× the 92pt card frame — sharp enough, faster to encode/embed. */
const CARD_IMAGE_OUT_HEIGHT = 138;
/** ~5px radius on ~92pt-tall frame ≈ 0.05 of min edge. */
const CARD_IMAGE_CORNER_RATIO = 5 / 92;
const CARD_IMAGE_BG = "#F2F4F5";
/** Detail hero ~40% of content width × 172pt — ~2× for retina sharpness. */
const HERO_IMAGE_ASPECT = 1.27;
const HERO_IMAGE_OUT_HEIGHT = 344;
const HERO_JPEG_QUALITY = 0.78;
/** Matches occupation-placeholder.svg fill. */
const PLACEHOLDER_BG = "#BAE6FD";
const JPEG_QUALITY = 0.65;
const PLACEHOLDER_LOAD_TIMEOUT_MS = 12000;
const OCCUPATION_PLACEHOLDER_SRC = "/illustrations/occupation-placeholder.svg";
/** Primary gallery URL is almost always enough. */
const MAX_CARD_IMAGE_URL_CANDIDATES = 1;
const PDF_FONT_URLS = [
	"/fonts/asap/Asap-Regular.ttf",
	"/fonts/asap/Asap-Medium.ttf",
	"/fonts/asap/Asap-SemiBold.ttf",
	"/fonts/asap/Asap-Bold.ttf",
	"/fonts/asap/Asap-ExtraBold.ttf",
] as const;
const WARM_MASCOT_SRC = "/illustrations/star-neutral.svg";
const WARM_QR_SRC = "/illustrations/qr-code.svg";
const WARM_CTA_SURFACE_BG = "#DDF4FF";
/**
 * Rendered as a raster Image rather than react-pdf's Svg/Path — Svg content
 * inside the fixed page header's per-page `render` callback silently drops
 * whenever any ancestor uses `alignItems`/`alignSelf: "center"` (a react-pdf
 * Yoga-measurement bug), so a vector header logo is not reliable there.
 */
export const LOGO_WORDMARK_SRC = "/illustrations/azuki-wordmark.svg";
export const LOGO_LOCKUP_SRC = "/illustrations/azuki-lockup.svg";
export const LOGO_RASTER_EDGE = MAX_RASTER_EDGE;

export type PdfRasterOptions = {
	coverAspect?: number;
	cornerRadiusRatio?: number;
	format?: "jpeg" | "png";
	backgroundColor?: string;
	outHeight?: number;
};

/** @react-pdf expects Node's Buffer when decoding images in the browser. */
export function ensureBufferPolyfill(): void {
	const globalScope = globalThis as typeof globalThis & {
		Buffer?: typeof Buffer;
	};
	if (!globalScope.Buffer) {
		globalScope.Buffer = Buffer;
	}
}

export function yieldToBrowser(): Promise<void> {
	return new Promise((resolve) => {
		requestAnimationFrame(() => setTimeout(resolve, 0));
	});
}

export function triggerDownload(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	URL.revokeObjectURL(url);
}

/** Drop temporary blob: URLs created for card images after the PDF is built. */
export function revokePdfBlobUrls(
	urls: Array<string | null | undefined>,
): void {
	for (const url of urls) {
		if (url?.startsWith("blob:")) {
			URL.revokeObjectURL(url);
		}
	}
}

function resolveFetchableImageUrl(src: string): string {
	const absolute =
		src.startsWith("http://") || src.startsWith("https://")
			? src
			: new URL(src, window.location.origin).toString();

	if (absolute.startsWith(window.location.origin)) {
		return absolute;
	}

	try {
		const url = new URL(absolute);
		if (
			url.hostname === "rest.arbeitsagentur.de" &&
			url.pathname.startsWith("/infosysbub/berufepool-rest/")
		) {
			return `/api/image-proxy?url=${encodeURIComponent(absolute)}`;
		}
	} catch {
		// Keep the original absolute URL.
	}
	return absolute;
}

function loadHtmlImage(
	src: string,
	timeoutMs: number = FETCH_TIMEOUT_MS,
): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const timer = window.setTimeout(() => {
			img.src = "";
			reject(new Error("Image load timed out"));
		}, timeoutMs);
		img.onload = () => {
			window.clearTimeout(timer);
			if (img.naturalWidth < 1 || img.naturalHeight < 1) {
				reject(new Error("Image has zero dimensions"));
				return;
			}
			resolve(img);
		};
		img.onerror = () => {
			window.clearTimeout(timer);
			reject(new Error("Image load failed"));
		};
		img.src = src;
	});
}

async function fetchSvgAsSizedObjectUrl(
	src: string,
	targetEdge: number,
): Promise<string | null> {
	const response = await fetch(resolveFetchableImageUrl(src), {
		signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
	});
	if (!response.ok) {
		return null;
	}
	const text = await response.text();
	const doc = new DOMParser().parseFromString(text, "image/svg+xml");
	const svg = doc.documentElement;
	if (svg.querySelector("parsererror") || svg.tagName.toLowerCase() !== "svg") {
		return null;
	}

	const viewBox =
		svg
			.getAttribute("viewBox")
			?.trim()
			.split(/[\s,]+/) ?? [];
	const viewBoxWidth = Number(viewBox[2]);
	const viewBoxHeight = Number(viewBox[3]);
	const intrinsicWidth =
		parseFloat(svg.getAttribute("width") ?? "") || viewBoxWidth || targetEdge;
	const intrinsicHeight =
		parseFloat(svg.getAttribute("height") ?? "") || viewBoxHeight || targetEdge;
	const scale = targetEdge / Math.max(intrinsicWidth, intrinsicHeight);
	svg.setAttribute("width", String(Math.round(intrinsicWidth * scale)));
	svg.setAttribute("height", String(Math.round(intrinsicHeight * scale)));

	return URL.createObjectURL(
		new Blob([new XMLSerializer().serializeToString(svg)], {
			type: "image/svg+xml;charset=utf-8",
		}),
	);
}

function isSvgSrc(src: string): boolean {
	return src.split("?")[0].toLowerCase().endsWith(".svg");
}

function hasImageMagicBytes(bytes: Uint8Array): boolean {
	if (bytes.length < 4) {
		return false;
	}
	const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
	const isPng =
		bytes[0] === 0x89 &&
		bytes[1] === 0x50 &&
		bytes[2] === 0x4e &&
		bytes[3] === 0x47;
	const isGif = bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46;
	const isWebp =
		bytes[0] === 0x52 &&
		bytes[1] === 0x49 &&
		bytes[2] === 0x46 &&
		bytes[3] === 0x46;
	return isJpeg || isPng || isGif || isWebp;
}

async function fetchImageBlob(src: string): Promise<Blob | null> {
	try {
		const response = await fetch(resolveFetchableImageUrl(src), {
			signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
		});
		if (!response.ok) {
			return null;
		}
		const contentType = response.headers.get("content-type") || "";
		if (contentType.includes("json") || contentType.includes("text/html")) {
			return null;
		}
		const buffer = await response.arrayBuffer();
		if (buffer.byteLength < 32) {
			return null;
		}
		const bytes = new Uint8Array(buffer);
		if (!hasImageMagicBytes(bytes)) {
			return null;
		}
		return new Blob([buffer], {
			type: contentType || "application/octet-stream",
		});
	} catch {
		return null;
	}
}

async function fetchAsObjectUrl(src: string): Promise<string | null> {
	const blob = await fetchImageBlob(src);
	if (!blob) {
		return null;
	}
	return URL.createObjectURL(blob);
}

/**
 * Cover-crop and export as a JPEG blob URL.
 * Re-encoding strips broken BA JPEG metadata; blob URLs avoid base64 bloat.
 * A cheap variance check rejects near-blank truncated Arbeitsagentur decodes.
 */
async function coverRasterizeToJpeg(
	source: ImageBitmap | HTMLImageElement,
	options: {
		outHeight?: number;
		aspect?: number;
		quality?: number;
		backgroundColor?: string;
	} = {},
): Promise<string | null> {
	const width = Math.max(
		1,
		"naturalWidth" in source ? source.naturalWidth : source.width,
	);
	const height = Math.max(
		1,
		"naturalHeight" in source ? source.naturalHeight : source.height,
	);
	const outHeight = options.outHeight ?? CARD_IMAGE_OUT_HEIGHT;
	const aspect = options.aspect ?? CARD_IMAGE_ASPECT;
	const outWidth = Math.max(1, Math.round(outHeight * aspect));
	const canvas = document.createElement("canvas");
	canvas.width = outWidth;
	canvas.height = outHeight;
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	if (!ctx) {
		return null;
	}

	ctx.fillStyle = options.backgroundColor ?? CARD_IMAGE_BG;
	ctx.fillRect(0, 0, outWidth, outHeight);

	const scale = Math.max(outWidth / width, outHeight / height);
	const drawWidth = width * scale;
	const drawHeight = height * scale;
	try {
		ctx.drawImage(
			source,
			(outWidth - drawWidth) / 2,
			(outHeight - drawHeight) / 2,
			drawWidth,
			drawHeight,
		);
	} catch {
		return null;
	}

	if (isNearBlankRaster(ctx, outWidth, outHeight)) {
		return null;
	}

	const quality = options.quality ?? JPEG_QUALITY;
	const blob = await new Promise<Blob | null>((resolve) => {
		canvas.toBlob(resolve, "image/jpeg", quality);
	});
	if (!blob || blob.size < 32) {
		return null;
	}
	return URL.createObjectURL(blob);
}

/** One getImageData + stride sampling (cheaper than many 1×1 reads). */
function isNearBlankRaster(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
): boolean {
	const { data } = ctx.getImageData(0, 0, width, height);
	let sum = 0;
	let sumSq = 0;
	let samples = 0;
	for (let i = 0; i < data.length; i += 4 * 96) {
		const y = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
		sum += y;
		sumSq += y * y;
		samples += 1;
	}
	const mean = sum / Math.max(1, samples);
	return sumSq / Math.max(1, samples) - mean * mean < 40;
}

/** Load a remote photo via blob → HTMLImage (handles truncated BA JPEGs) → JPEG. */
async function loadRemoteCardImageDataUrl(src: string): Promise<string | null> {
	const blob = await fetchImageBlob(src);
	if (!blob) {
		return null;
	}

	const objectUrl = URL.createObjectURL(blob);
	try {
		const image = await loadHtmlImage(objectUrl);
		return await coverRasterizeToJpeg(image);
	} catch {
		return null;
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
}

async function loadRemoteHeroImageDataUrl(src: string): Promise<string | null> {
	const blob = await fetchImageBlob(src);
	if (!blob) {
		return null;
	}

	const objectUrl = URL.createObjectURL(blob);
	try {
		const image = await loadHtmlImage(objectUrl);
		return await coverRasterizeToJpeg(image, {
			outHeight: HERO_IMAGE_OUT_HEIGHT,
			aspect: HERO_IMAGE_ASPECT,
			quality: HERO_JPEG_QUALITY,
			backgroundColor: PLACEHOLDER_BG,
		});
	} catch {
		return null;
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
}

function rasterizeToDataUrl(
	image: HTMLImageElement,
	options: PdfRasterOptions = {},
): string | null {
	const naturalW = Math.max(1, image.naturalWidth || 320);
	const naturalH = Math.max(1, image.naturalHeight || 320);
	const format = options.format ?? "png";
	const backgroundColor = options.backgroundColor;

	if (options.coverAspect && options.coverAspect > 0) {
		const outHeight = options.outHeight ?? CARD_IMAGE_OUT_HEIGHT;
		const outWidth = Math.max(1, Math.round(outHeight * options.coverAspect));
		const canvas = document.createElement("canvas");
		canvas.width = outWidth;
		canvas.height = outHeight;
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			return null;
		}
		const fill = backgroundColor ?? CARD_IMAGE_BG;
		ctx.fillStyle = fill;
		ctx.fillRect(0, 0, outWidth, outHeight);

		const cornerRatio = options.cornerRadiusRatio ?? 0;
		if (cornerRatio > 0) {
			const radius = cornerRatio * Math.min(outWidth, outHeight);
			ctx.beginPath();
			ctx.moveTo(radius, 0);
			ctx.lineTo(outWidth - radius, 0);
			ctx.quadraticCurveTo(outWidth, 0, outWidth, radius);
			ctx.lineTo(outWidth, outHeight - radius);
			ctx.quadraticCurveTo(outWidth, outHeight, outWidth - radius, outHeight);
			ctx.lineTo(radius, outHeight);
			ctx.quadraticCurveTo(0, outHeight, 0, outHeight - radius);
			ctx.lineTo(0, radius);
			ctx.quadraticCurveTo(0, 0, radius, 0);
			ctx.closePath();
			ctx.clip();
			ctx.fillStyle = fill;
			ctx.fillRect(0, 0, outWidth, outHeight);
		}

		const scale = Math.max(outWidth / naturalW, outHeight / naturalH);
		const drawWidth = naturalW * scale;
		const drawHeight = naturalH * scale;
		ctx.drawImage(
			image,
			(outWidth - drawWidth) / 2,
			(outHeight - drawHeight) / 2,
			drawWidth,
			drawHeight,
		);
		return format === "jpeg"
			? canvas.toDataURL("image/jpeg", JPEG_QUALITY)
			: canvas.toDataURL("image/png");
	}

	const scale = Math.min(1, MAX_RASTER_EDGE / Math.max(naturalW, naturalH));
	const width = Math.max(1, Math.round(naturalW * scale));
	const height = Math.max(1, Math.round(naturalH * scale));
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		return null;
	}
	if (backgroundColor) {
		ctx.fillStyle = backgroundColor;
		ctx.fillRect(0, 0, width, height);
	} else {
		ctx.clearRect(0, 0, width, height);
	}
	ctx.drawImage(image, 0, 0, width, height);
	return format === "jpeg"
		? canvas.toDataURL("image/jpeg", JPEG_QUALITY)
		: canvas.toDataURL("image/png");
}

export async function loadPdfImageSrc(
	src: string,
	options: PdfRasterOptions = {},
	timeoutMs: number = FETCH_TIMEOUT_MS,
): Promise<string | null> {
	let objectUrl: string | null = null;
	try {
		if (options.outHeight && isSvgSrc(src)) {
			const targetEdge =
				options.coverAspect && options.coverAspect > 0
					? Math.max(
							options.outHeight,
							Math.round(options.outHeight * options.coverAspect),
						)
					: options.outHeight;
			objectUrl = await fetchSvgAsSizedObjectUrl(src, targetEdge);
			if (!objectUrl) {
				return null;
			}
			const image = await loadHtmlImage(objectUrl, timeoutMs);
			return rasterizeToDataUrl(image, options);
		}

		const absolute = new URL(src, window.location.origin).toString();
		if (absolute.startsWith(window.location.origin)) {
			try {
				const image = await loadHtmlImage(absolute, timeoutMs);
				const dataUrl = rasterizeToDataUrl(image, options);
				if (dataUrl) {
					return dataUrl;
				}
			} catch {
				// Fall through to fetch + object URL.
			}
		}

		objectUrl = await fetchAsObjectUrl(src);
		if (!objectUrl) {
			return null;
		}
		const image = await loadHtmlImage(objectUrl, timeoutMs);
		return rasterizeToDataUrl(image, options);
	} catch {
		return null;
	} finally {
		if (objectUrl) {
			URL.revokeObjectURL(objectUrl);
		}
	}
}

/** Rasterize a same-origin SVG/PNG onto an opaque fill for react-pdf. */
const iconCache = new Map<string, Promise<string | null>>();

export async function loadPdfIconSrc(
	src: string,
	backgroundColor: string,
	outHeight?: number,
): Promise<string | null> {
	const cacheKey = `${src}|${backgroundColor}|${outHeight ?? ""}`;
	let pending = iconCache.get(cacheKey);
	if (!pending) {
		pending = loadPdfImageSrc(src, {
			format: "jpeg",
			backgroundColor,
			outHeight,
		});
		iconCache.set(cacheKey, pending);
	}
	return pending;
}

function createSolidPlaceholderDataUrl(): string {
	const outHeight = CARD_IMAGE_OUT_HEIGHT;
	const outWidth = Math.max(1, Math.round(outHeight * CARD_IMAGE_ASPECT));
	const canvas = document.createElement("canvas");
	canvas.width = outWidth;
	canvas.height = outHeight;
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		return "";
	}
	ctx.fillStyle = PLACEHOLDER_BG;
	ctx.fillRect(0, 0, outWidth, outHeight);
	return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

let solidPlaceholderCache: string | null = null;

/** Instant sky-blue fallback when the illustration SVG is not needed. */
export function getSolidPdfPlaceholderSrc(): string {
	return (solidPlaceholderCache ??= createSolidPlaceholderDataUrl());
}

let placeholderCache: Promise<string> | null = null;

export async function loadPdfPlaceholderSrc(): Promise<string> {
	if (!placeholderCache) {
		placeholderCache = (async () => {
			const loaded = await loadPdfImageSrc(
				OCCUPATION_PLACEHOLDER_SRC,
				{
					coverAspect: CARD_IMAGE_ASPECT,
					cornerRadiusRatio: CARD_IMAGE_CORNER_RATIO,
					format: "jpeg",
					backgroundColor: PLACEHOLDER_BG,
					outHeight: CARD_IMAGE_OUT_HEIGHT,
				},
				PLACEHOLDER_LOAD_TIMEOUT_MS,
			);
			return loaded || getSolidPdfPlaceholderSrc();
		})();
	}
	return placeholderCache;
}

type PlaceholderSource =
	| string
	| Promise<string>
	| (() => string | Promise<string>);

async function resolvePlaceholderSource(
	placeholderSrc: PlaceholderSource,
): Promise<string> {
	const value =
		typeof placeholderSrc === "function" ? placeholderSrc() : placeholderSrc;
	return (await value) || getSolidPdfPlaceholderSrc();
}

/** Try gallery URLs in order until one rasterizes. */
export async function loadPdfCardImageSrc(
	imageUrls: string[],
	placeholderSrc: PlaceholderSource,
): Promise<string> {
	const urls = imageUrls
		.map((url) => url.trim())
		.filter(Boolean)
		.slice(0, MAX_CARD_IMAGE_URL_CANDIDATES);

	for (const imageUrl of urls) {
		const loaded = await loadRemoteCardImageDataUrl(imageUrl);
		if (loaded) {
			return loaded;
		}
	}
	return resolvePlaceholderSource(placeholderSrc);
}

/** Higher-res cover for the occupation detail PDF hero (~2× display size). */
export async function loadPdfHeroImageSrc(
	imageUrls: string[],
	placeholderSrc: PlaceholderSource,
): Promise<string> {
	const urls = imageUrls
		.map((url) => url.trim())
		.filter(Boolean)
		.slice(0, MAX_CARD_IMAGE_URL_CANDIDATES);

	for (const imageUrl of urls) {
		const loaded = await loadRemoteHeroImageDataUrl(imageUrl);
		if (loaded) {
			return loaded;
		}
	}

	const placeholder = await resolvePlaceholderSource(placeholderSrc);
	const heroPlaceholder = await loadPdfImageSrc(
		OCCUPATION_PLACEHOLDER_SRC,
		{
			coverAspect: HERO_IMAGE_ASPECT,
			format: "jpeg",
			backgroundColor: PLACEHOLDER_BG,
			outHeight: HERO_IMAGE_OUT_HEIGHT,
		},
		PLACEHOLDER_LOAD_TIMEOUT_MS,
	);
	return heroPlaceholder || placeholder;
}

/** Load Top card covers in parallel; placeholder may resolve lazily on miss. */
export async function loadPdfTopCardImages(
	occupations: Array<{ images: Array<{ url: string }> }>,
	placeholderSrc: PlaceholderSource,
): Promise<string[]> {
	return Promise.all(
		occupations.map((occupation) => {
			const urls = occupation.images
				.map((image) => image.url?.trim())
				.filter((url): url is string => Boolean(url));
			return loadPdfCardImageSrc(urls, placeholderSrc);
		}),
	);
}

let pdfWarmPromise: Promise<void> | null = null;

/**
 * Prefetch fonts, CTA icons, and react-pdf/theme while the user browses —
 * so the first download click spends less time on cold setup.
 */
export function warmPdfRuntime(): Promise<void> {
	if (!pdfWarmPromise) {
		pdfWarmPromise = (async () => {
			ensureBufferPolyfill();
			await Promise.all([
				import("./pdfTheme"),
				import("@react-pdf/renderer"),
				...PDF_FONT_URLS.map((src) =>
					fetch(src)
						.then((response) => (response.ok ? response.arrayBuffer() : null))
						.catch(() => null),
				),
				loadPdfIconSrc(WARM_MASCOT_SRC, WARM_CTA_SURFACE_BG),
				loadPdfIconSrc(WARM_QR_SRC, WARM_CTA_SURFACE_BG),
				loadPdfIconSrc(LOGO_WORDMARK_SRC, WHITE, LOGO_RASTER_EDGE),
				loadPdfIconSrc(LOGO_LOCKUP_SRC, WHITE, LOGO_RASTER_EDGE),
			]);
		})().catch(() => {
			pdfWarmPromise = null;
		});
	}
	return pdfWarmPromise ?? Promise.resolve();
}
