export async function shareResultsLink(options: {
	title: string;
	text?: string;
	url: string;
}): Promise<"shared" | "copied"> {
	if (navigator.share) {
		try {
			await navigator.share({
				title: options.title,
				text: options.text,
				url: options.url,
			});
			return "shared";
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") {
				throw err;
			}
		}
	}

	if (navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(options.url);
		return "copied";
	}

	throw new Error("Sharing is not supported on this device");
}
