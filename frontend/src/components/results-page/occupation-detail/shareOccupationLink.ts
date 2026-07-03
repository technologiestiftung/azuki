interface ShareOccupationLinkOptions {
	url: string;
	title: string;
	text?: string;
}

export type ShareOccupationLinkResult = "shared" | "copied" | "cancelled";

export async function shareOccupationLink(
	options: ShareOccupationLinkOptions,
): Promise<ShareOccupationLinkResult> {
	const { url, title, text } = options;
	const sharePayload = { title, text: text ?? title, url };

	if (
		typeof navigator.share === "function" &&
		(typeof navigator.canShare !== "function" ||
			navigator.canShare(sharePayload))
	) {
		try {
			await navigator.share(sharePayload);
			return "shared";
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") {
				return "cancelled";
			}
		}
	}

	await navigator.clipboard.writeText(url);
	return "copied";
}
