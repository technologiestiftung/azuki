import { pdf } from "@react-pdf/renderer";
import type { MatchedOccupation } from "@azuki/shared";
import { content } from "../../../content";
import {
	ensureBufferPolyfill,
	loadPdfCardImageSrc,
	loadPdfIconSrc,
	loadPdfPlaceholderSrc,
	triggerDownload,
	yieldToBrowser,
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
): Promise<void> {
	if (occupations.length === 0) {
		return;
	}

	ensureBufferPolyfill();
	await yieldToBrowser();

	const placeholderSrc = await loadPdfPlaceholderSrc();
	await yieldToBrowser();

	const topOccupations = occupations.slice(0, 3);
	const topImageSrcs = await Promise.all(
		topOccupations.map((occupation) => {
			const imageUrl = occupation.images[0]?.url?.trim() || undefined;
			return loadPdfCardImageSrc(imageUrl, placeholderSrc);
		}),
	);
	await yieldToBrowser();

	const [mascotSrc, qrSrc] = await Promise.all([
		loadPdfIconSrc(MASCOT_SRC, CTA_SURFACE_BG),
		loadPdfIconSrc(QR_SRC, CTA_SURFACE_BG),
	]);

	await yieldToBrowser();

	const assets: OccupationsPdfAssets = {
		mascotSrc,
		qrSrc,
		placeholderSrc,
		topImageSrcs,
	};

	const blob = await pdf(
		<OccupationsPdfDocument occupations={occupations} assets={assets} />,
	).toBlob();

	triggerDownload(blob, content["results.export.filename"]);
}
