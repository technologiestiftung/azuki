import { pdf } from "@react-pdf/renderer";
import type { MatchedOccupation } from "@azuki/shared";
import { content } from "../../../content";
import {
	ensureBufferPolyfill,
	getSolidPdfPlaceholderSrc,
	loadPdfIconSrc,
	loadPdfPlaceholderSrc,
	loadPdfTopCardImages,
	revokePdfBlobUrls,
	triggerDownload,
	warmPdfRuntime,
} from "../../pdf/loadPdfAssets";
import {
	OccupationsPdfDocument,
	type OccupationsPdfAssets,
} from "./OccupationsPdfDocument";

const MASCOT_SRC = "/illustrations/star-neutral.svg";
const QR_SRC = "/illustrations/qr-code.svg";
/** CTA card fill — used behind mascot/QR so transparent SVGs don't get a white box. */
const CTA_SURFACE_BG = "#DDF4FF";

export async function exportOccupationsPdf(
	occupations: MatchedOccupation[],
	wildcardOccupations: MatchedOccupation[] = [],
): Promise<void> {
	if (occupations.length === 0 && wildcardOccupations.length === 0) {
		return;
	}

	ensureBufferPolyfill();
	await warmPdfRuntime();

	const topOccupations = occupations.slice(0, 3);
	let placeholderPromise: Promise<string> | null = null;
	const resolvePlaceholder = () => {
		placeholderPromise ??= loadPdfPlaceholderSrc();
		return placeholderPromise;
	};

	const [mascotSrc, qrSrc, topImageSrcs] = await Promise.all([
		loadPdfIconSrc(MASCOT_SRC, CTA_SURFACE_BG),
		loadPdfIconSrc(QR_SRC, CTA_SURFACE_BG),
		loadPdfTopCardImages(topOccupations, resolvePlaceholder),
	]);

	const placeholderSrc = placeholderPromise
		? await placeholderPromise
		: getSolidPdfPlaceholderSrc();

	const assets: OccupationsPdfAssets = {
		mascotSrc,
		qrSrc,
		placeholderSrc,
		topImageSrcs,
	};

	try {
		const blob = await pdf(
			<OccupationsPdfDocument
				occupations={occupations}
				wildcardOccupations={wildcardOccupations}
				assets={assets}
			/>,
		).toBlob();

		triggerDownload(blob, content["results.export.filename"]);
	} finally {
		revokePdfBlobUrls(topImageSrcs);
	}
}
