/** Formats a date as "DD.MM.YY", e.g. 1 Oct 2026 → "01.10.26". */
export function formatJobsucheDate(date: Date) {
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = String(date.getFullYear()).slice(2);
	return `${day}.${month}.${year}`;
}
