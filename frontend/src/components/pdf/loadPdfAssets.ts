import { Buffer } from "buffer";

const FETCH_TIMEOUT_MS = 8000;
const PLACEHOLDER_TIMEOUT_MS = 20000;
const MAX_RASTER_EDGE = 512;
const PLACEHOLDER_SRC = "/illustrations/occupation-placeholder.svg";
/** Matches Figma card image aspect (width / height ≈ 31/18). */
const CARD_IMAGE_ASPECT = 31 / 18;
const CARD_IMAGE_OUT_HEIGHT = 220;
/** ~5px radius on ~92pt-tall frame ≈ 0.05 of min edge. */
const CARD_IMAGE_CORNER_RATIO = 5 / 92;
const CARD_IMAGE_BG = "#F2F4F5";

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

export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function triggerDownload(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	URL.revokeObjectURL(url);
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

async function fetchAsObjectUrl(src: string): Promise<string | null> {
	const fetchUrl = resolveFetchableImageUrl(src);
	const response = await fetch(fetchUrl, {
		signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
	});
	if (!response.ok) {
		return null;
	}
	const contentType = response.headers.get("content-type") || "";
	if (contentType.includes("json") || contentType.includes("text/html")) {
		return null;
	}
	const blob = await response.blob();
	if (blob.size < 32) {
		return null;
	}
	return URL.createObjectURL(blob);
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
			? canvas.toDataURL("image/jpeg", 0.75)
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
		? canvas.toDataURL("image/jpeg", 0.75)
		: canvas.toDataURL("image/png");
}

export async function loadPdfImageSrc(
	src: string,
	options: PdfRasterOptions = {},
	timeoutMs: number = FETCH_TIMEOUT_MS,
): Promise<string | null> {
	let objectUrl: string | null = null;
	try {
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
export async function loadPdfIconSrc(
	src: string,
	backgroundColor: string,
): Promise<string | null> {
	return loadPdfImageSrc(src, { format: "png", backgroundColor });
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
	ctx.fillStyle = CARD_IMAGE_BG;
	ctx.fillRect(0, 0, outWidth, outHeight);
	return canvas.toDataURL("image/jpeg", 0.9);
}

export async function loadPdfPlaceholderSrc(): Promise<string> {
	const loaded = await loadPdfImageSrc(
		PLACEHOLDER_SRC,
		{
			coverAspect: CARD_IMAGE_ASPECT,
			cornerRadiusRatio: CARD_IMAGE_CORNER_RATIO,
			format: "png",
			backgroundColor: CARD_IMAGE_BG,
		},
		PLACEHOLDER_TIMEOUT_MS,
	);
	return loaded ?? createSolidPlaceholderDataUrl();
}

export async function loadPdfCardImageSrc(
	imageUrl: string | undefined,
	placeholderSrc: string,
): Promise<string> {
	const options: PdfRasterOptions = {
		coverAspect: CARD_IMAGE_ASPECT,
		cornerRadiusRatio: CARD_IMAGE_CORNER_RATIO,
		format: "jpeg",
		backgroundColor: CARD_IMAGE_BG,
	};
	if (imageUrl) {
		const loaded = await loadPdfImageSrc(imageUrl, options);
		if (loaded) {
			return loaded;
		}
	}
	return placeholderSrc;
}
