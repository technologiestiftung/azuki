/**
 * Fetches all Ausbildungsberufe from the BERUFENET API,
 * extracts structured fields, and saves them as data/berufe.json.
 *
 * Usage: npx tsx scripts/fetch-berufe.ts
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type {
	Occupation,
	WorkConditions,
	DegreeDistribution,
	OccupationImage,
} from "@azuki/shared";
import { SUBJECTS } from "@azuki/shared";

// --- API response types (model the external Arbeitsagentur API) ---

interface Infofeld {
	id: string;
	content?: string;
}

interface ApiBild {
	url?: string;
	unterschrift?: string;
	bildgruppe?: string;
}

interface ApiSteckbrief {
	kurz?: string;
	lang?: string;
}

interface ApiBerufItem {
	id: number;
	kurzBezeichnungNeutral?: string;
	steckbrief?: ApiSteckbrief;
	infofelder?: Infofeld[];
	bilder?: ApiBild[];
}

interface BerufeListResponse {
	page: {
		totalPages: number;
	};
	_embedded: {
		berufSucheList: Array<{
			id: number;
		}>;
	};
}

// --- Constants ---

const API_BASE = "https://rest.arbeitsagentur.de/infosysbub/bnet/pc/v1";
const API_KEY = "infosysbub-berufenet";
const DELAY_MS = 150;
const INFOFELD_IDS = {
	bedingungen: "b16-3",
	interessen: "b20-1",
	schulabschluss: "a31-12",
	schulfaecher: "a20-31",
	aufgabenKompakt: "b11-0",
	arbeitsorte: "b12-02",
	kompetenzenText: "b20-32",
} as const;

// --- Helpers ---

function sleep(ms: number) {
	return new Promise((r) => setTimeout(r, ms));
}

function decodeHtmlEntities(html: string): string {
	return html
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&auml;/g, "ä")
		.replace(/&ouml;/g, "ö")
		.replace(/&uuml;/g, "ü")
		.replace(/&Auml;/g, "Ä")
		.replace(/&Ouml;/g, "Ö")
		.replace(/&Uuml;/g, "Ü")
		.replace(/&szlig;/g, "ß")
		.replace(/&ndash;/g, "–")
		.replace(/&mdash;/g, "—")
		.replace(/&nbsp;/g, " ");
}

function stripHtml(html: string): string {
	let text = decodeHtmlEntities(html);
	text = text.replace(/&#\d+;/g, "");
	text = text.replace(/<[^>]+>/g, " ");
	text = text.replace(/\s+/g, " ").trim();
	return text;
}

async function apiFetch<T>(path: string): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		headers: { "X-API-Key": API_KEY },
	});
	if (!res.ok) {
		throw new Error(`API ${res.status}: ${path}`);
	}
	return res.json() as Promise<T>;
}

// --- Extraction functions ---

function extractConditions(infofelder: Infofeld[]): WorkConditions {
	const field = infofelder.find((f) => f.id === INFOFELD_IDS.bedingungen);
	const text = field ? stripHtml(field.content || "") : "";

	return {
		outdoor: /im Freien/i.test(text),
		office: /Büroräumen/i.test(text),
		workshop: /Werkstätten|Produktionshallen/i.test(text),
		constructionSite: /Baustellen/i.test(text),
		screenWork: /Bildschirmarbeit/i.test(text),
		manualLabor: /Handarbeit/i.test(text),
		machinery: /technischen Geräten, Maschinen/i.test(text),
		noise: /Lärm/i.test(text),
		dirt: /Rauch, Staub|Schmutz/i.test(text),
		heavyLifting: /schweres Heben/i.test(text),
		heights: /Höhen/i.test(text),
		shiftWork: /Schichtarbeit/i.test(text),
		customerContact: /Kundenkontakt/i.test(text),
		teamwork: /Gruppen-, Teamarbeit/i.test(text),
		standingWalking: /Gehen und Stehen/i.test(text),
	};
}

function extractInterests(infofelder: Infofeld[]): string[] {
	const field = infofelder.find((f) => f.id === INFOFELD_IDS.interessen);
	if (!field?.content) return [];

	const decoded = decodeHtmlEntities(field.content);
	const matches = decoded.matchAll(/name="Interesse an ([^"]+)"/g);
	const map: Record<string, string> = {
		"praktisch-konkreten Tätigkeiten": "praktisch-konkret",
		"theoretisch-abstrakten Tätigkeiten": "theoretisch-abstrakt",
		"kreativ-gestaltenden Tätigkeiten": "kreativ-gestaltend",
		"sozial-beratenden Tätigkeiten": "sozial-beratend",
		"organisatorisch-prüfenden Tätigkeiten": "organisatorisch-pruefend",
	};

	const result: string[] = [];
	for (const m of matches) {
		const mapped = map[m[1]];
		if (mapped && !result.includes(mapped)) {
			result.push(mapped);
		}
	}
	return result;
}

function extractDegreeStats(
	infofelder: Infofeld[],
): DegreeDistribution | null {
	const field = infofelder.find((f) => f.id === INFOFELD_IDS.schulabschluss);
	if (!field?.content) return null;

	const text = stripHtml(field.content);

	const result: DegreeDistribution = {
		noQualification: 0,
		secondary: 0,
		intermediate: 0,
		universityEntrance: 0,
	};

	const pctMatches = [...text.matchAll(/([^[]{0,120}?)\[(\d+\.?\d*)%\]/g)];

	for (const m of pctMatches) {
		const context = m[1].toLowerCase();
		const pct = parseFloat(m[2]);

		if (/ohne.*schulabschluss|ohne.*hauptschul/i.test(context)) {
			result.noQualification = pct;
		} else if (
			/hauptschul|berufsreife|erster.*schulabschluss/i.test(context)
		) {
			result.secondary = pct;
		} else if (
			/mittlerer|realschul|fachoberschul|sekundar.*i\b/i.test(context)
		) {
			result.intermediate = pct;
		} else if (/hochschulreife|abitur|fachhochschul/i.test(context)) {
			result.universityEntrance = pct;
		}
	}

	if (
		result.noQualification +
			result.secondary +
			result.intermediate +
			result.universityEntrance ===
		0
	) {
		return null;
	}
	return result;
}

function extractSubjects(infofelder: Infofeld[]): string[] {
	const field = infofelder.find((f) => f.id === INFOFELD_IDS.schulfaecher);
	if (!field?.content) return [];

	const text = stripHtml(field.content);
	return SUBJECTS.filter((s) => text.includes(s.dataLabel)).map((s) => s.id);
}

function findInfofeld(infofelder: Infofeld[], id: string): string {
	const field = infofelder.find((f) => f.id === id);
	return field?.content ? stripHtml(field.content) : "";
}

function extractImages(item: ApiBerufItem): OccupationImage[] {
	if (!item.bilder || !Array.isArray(item.bilder)) return [];
	return item.bilder.map((b) => ({
		url: b.url || "",
		caption: b.unterschrift || "",
		imageGroup: b.bildgruppe || "",
	}));
}

// --- Main pipeline ---

async function fetchAllOccupationIds(): Promise<number[]> {
	const ids: number[] = [];
	let page = 0;
	let totalPages = 1;

	while (page < totalPages) {
		console.log(`  Loading occupation list page ${page}/${totalPages - 1}...`);
		const data = await apiFetch<BerufeListResponse>(
			`/berufe?suchwoerter=*&bg=100,102,105&page=${page}`,
		);

		totalPages = data.page.totalPages;
		for (const beruf of data._embedded.berufSucheList) {
			ids.push(beruf.id);
		}
		page++;
		await sleep(DELAY_MS);
	}

	return ids;
}

function processOccupationDetail(data: ApiBerufItem[]): Occupation | null {
	if (!data || data.length === 0) return null;

	const ausbildung = data[0];
	const taetigkeit = data.length > 1 ? data[1] : data[0];

	const ausbildungInfofelder = ausbildung.infofelder || [];
	const taetigkeitInfofelder = taetigkeit.infofelder || [];

	const allImages = [
		...extractImages(ausbildung),
		...extractImages(taetigkeit),
	];
	const seenUrls = new Set<string>();
	const images = allImages.filter((img) => {
		if (seenUrls.has(img.url)) return false;
		seenUrls.add(img.url);
		return true;
	});

	const descriptionShort = ausbildung.steckbrief?.kurz
		? stripHtml(ausbildung.steckbrief.kurz)
		: null;
	const descriptionLong = ausbildung.steckbrief?.lang
		? stripHtml(ausbildung.steckbrief.lang)
		: null;

	return {
		id: ausbildung.id,
		name: ausbildung.kurzBezeichnungNeutral || "Unbekannt",
		descriptionShort,
		descriptionLong,
		taskSummary:
			findInfofeld(taetigkeitInfofelder, INFOFELD_IDS.aufgabenKompakt) || null,
		images,
		degreeStats: extractDegreeStats(ausbildungInfofelder),
		subjects: extractSubjects(ausbildungInfofelder),
		interests: extractInterests(taetigkeitInfofelder),
		conditions: extractConditions(taetigkeitInfofelder),
		workLocations: findInfofeld(
			taetigkeitInfofelder,
			INFOFELD_IDS.arbeitsorte,
		),
		competenciesText: findInfofeld(
			taetigkeitInfofelder,
			INFOFELD_IDS.kompetenzenText,
		),
	};
}

async function main() {
	console.log("=== BERUFENET Fetch Script ===\n");

	console.log("Step 1: Fetching all occupation IDs...");
	const ids = await fetchAllOccupationIds();
	console.log(`  -> ${ids.length} IDs loaded.\n`);

	console.log("Step 2: Fetching details for each occupation...");
	const occupations: Occupation[] = [];
	let errors = 0;

	for (let i = 0; i < ids.length; i++) {
		const id = ids[i];
		if (i % 50 === 0) {
			console.log(`  ${i}/${ids.length} processed...`);
		}

		try {
			const data = await apiFetch<ApiBerufItem[]>(`/berufe/${id}`);
			const occupation = processOccupationDetail(data);
			if (occupation) {
				occupations.push(occupation);
			}
		} catch (err) {
			errors++;
			console.error(`  Error for ID ${id}: ${err}`);
		}

		await sleep(DELAY_MS);
	}

	console.log(
		`  -> ${occupations.length} occupations processed, ${errors} errors.\n`,
	);

	const __dirname = dirname(fileURLToPath(import.meta.url));
	const outDir = resolve(__dirname, "../backend/data");
	mkdirSync(outDir, { recursive: true });
	const outPath = resolve(outDir, "berufe.json");
	writeFileSync(outPath, JSON.stringify(occupations, null, 2), "utf-8");
	console.log(`Step 3: Saved to ${outPath}`);

	const withDescription = occupations.filter((o) => o.descriptionLong).length;
	const withDegreeStats = occupations.filter((o) => o.degreeStats).length;
	const withInterests = occupations.filter(
		(o) => o.interests.length > 0,
	).length;
	console.log(`\nStats:`);
	console.log(
		`  With description:  ${withDescription}/${occupations.length}`,
	);
	console.log(
		`  With degree stats: ${withDegreeStats}/${occupations.length}`,
	);
	console.log(`  With interests:    ${withInterests}/${occupations.length}`);
}

main().catch(console.error);
