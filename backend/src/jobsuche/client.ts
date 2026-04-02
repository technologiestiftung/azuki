import type { AusbildungsplatzResult, AusbildungsplatzPreview } from "@azuki/shared";

const JOBSUCHE_BASE = "https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs";
const API_KEY = "jobboerse-jobsuche";
const DEFAULT_RADIUS_KM = 25;
const MAX_PREVIEWS = 3;

interface JobsucheJob {
	arbeitgeber: string;
	arbeitsort?: {
		ort?: string;
	};
}

interface JobsucheResponse {
	stellenangebote?: JobsucheJob[];
	maxErgebnisse: number;
}

function buildSearchUrl(beruf: string, plz: string, umkreis: number): string {
	const params = new URLSearchParams({
		was: beruf,
		wo: plz,
		umkreis: String(umkreis),
		angebotsart: "4",
	});
	return `https://www.arbeitsagentur.de/jobsuche/suche?${params.toString()}`;
}

export async function searchAusbildungsplaetze(
	beruf: string,
	plz: string,
	umkreis: number = DEFAULT_RADIUS_KM,
): Promise<AusbildungsplatzResult> {
	const params = new URLSearchParams({
		was: beruf,
		wo: plz,
		umkreis: String(umkreis),
		angebotsart: "4",
		size: String(MAX_PREVIEWS),
	});

	const res = await fetch(`${JOBSUCHE_BASE}?${params.toString()}`, {
		headers: { "X-API-Key": API_KEY },
	});

	if (!res.ok) {
		console.error(`Jobsuche API error for "${beruf}": ${res.status}`);
		return {
			beruf,
			totalCount: 0,
			previews: [],
			searchUrl: buildSearchUrl(beruf, plz, umkreis),
		};
	}

	const data: JobsucheResponse = await res.json();
	const jobs = data.stellenangebote ?? [];

	const previews: AusbildungsplatzPreview[] = jobs.slice(0, MAX_PREVIEWS).map((job) => ({
		employer: job.arbeitgeber || "Unbekannter Arbeitgeber",
		city: job.arbeitsort?.ort || "Unbekannter Ort",
	}));

	return {
		beruf,
		totalCount: data.maxErgebnisse ?? 0,
		previews,
		searchUrl: buildSearchUrl(beruf, plz, umkreis),
	};
}
