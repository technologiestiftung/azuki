/**
 * Fetches all Ausbildungsberufe from the BERUFENET API,
 * extracts structured fields, and saves them as data/berufe.json.
 *
 * Usage: npx tsx scripts/fetch-berufe.ts
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

interface Bedingungen {
	draussen: boolean;
	buero: boolean;
	werkstatt: boolean;
	baustelle: boolean;
	bildschirm: boolean;
	handarbeit: boolean;
	maschinen: boolean;
	laerm: boolean;
	schmutz: boolean;
	schweresHeben: boolean;
	hoehe: boolean;
	schichtarbeit: boolean;
	kundenkontakt: boolean;
	teamarbeit: boolean;
	stehenGehen: boolean;
}

interface Schulabschluss {
	ohne: number;
	hauptschule: number;
	mittel: number;
	hochschulreife: number;
}

interface BerufBild {
	url: string;
	unterschrift: string;
	bildgruppe: string;
}

interface Beruf {
	id: number;
	name: string;
	steckbriefKurz: string | null;
	steckbriefLang: string | null;
	aufgabenKompakt: string | null;
	bilder: BerufBild[];
	schulabschluss: Schulabschluss | null;
	schulfaecher: string[];
	interessen: string[];
	bedingungen: Bedingungen;
	arbeitsorte: string;
	kompetenzenText: string;
}

const API_BASE = "https://rest.arbeitsagentur.de/infosysbub/bnet/pc/v1";
const API_KEY = "infosysbub-berufenet";
const DELAY_MS = 150;

function sleep(ms: number) {
	return new Promise((r) => setTimeout(r, ms));
}

function stripHtml(html: string): string {
	let text = html
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
		.replace(/&nbsp;/g, " ")
		.replace(/&#\d+;/g, "");
	text = text.replace(/<[^>]+>/g, " ");
	text = text.replace(/\s+/g, " ").trim();
	return text;
}

async function apiFetch(path: string): Promise<unknown> {
	const res = await fetch(`${API_BASE}${path}`, {
		headers: { "X-API-Key": API_KEY },
	});
	if (!res.ok) {
		throw new Error(`API ${res.status}: ${path}`);
	}
	return res.json();
}

function extractBedingungen(infofelder: any[]): Bedingungen {
	const field = infofelder.find((f: any) => f.id === "b16-3");
	const text = field ? stripHtml(field.content || "") : "";

	return {
		draussen: /im Freien/i.test(text),
		buero: /Büroräumen/i.test(text),
		werkstatt: /Werkstätten|Produktionshallen/i.test(text),
		baustelle: /Baustellen/i.test(text),
		bildschirm: /Bildschirmarbeit/i.test(text),
		handarbeit: /Handarbeit/i.test(text),
		maschinen: /technischen Geräten, Maschinen/i.test(text),
		laerm: /Lärm/i.test(text),
		schmutz: /Rauch, Staub|Schmutz/i.test(text),
		schweresHeben: /schweres Heben/i.test(text),
		hoehe: /Höhen/i.test(text),
		schichtarbeit: /Schichtarbeit/i.test(text),
		kundenkontakt: /Kundenkontakt/i.test(text),
		teamarbeit: /Gruppen-, Teamarbeit/i.test(text),
		stehenGehen: /Gehen und Stehen/i.test(text),
	};
}

function decodeEntities(html: string): string {
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

function extractInteressen(infofelder: any[]): string[] {
	const field = infofelder.find((f: any) => f.id === "b20-1");
	if (!field?.content) return [];

	const decoded = decodeEntities(field.content);
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

function extractSchulabschluss(infofelder: any[]): Schulabschluss | null {
	const field = infofelder.find((f: any) => f.id === "a31-12");
	if (!field?.content) return null;

	const text = stripHtml(field.content);

	const result: Schulabschluss = {
		ohne: 0,
		hauptschule: 0,
		mittel: 0,
		hochschulreife: 0,
	};

	const pctMatches = [...text.matchAll(/([^[]{0,120}?)\[(\d+\.?\d*)%\]/g)];

	for (const m of pctMatches) {
		const context = m[1].toLowerCase();
		const pct = parseFloat(m[2]);

		if (/ohne.*schulabschluss|ohne.*hauptschul/i.test(context)) {
			result.ohne = pct;
		} else if (
			/hauptschul|berufsreife|erster.*schulabschluss/i.test(context)
		) {
			result.hauptschule = pct;
		} else if (
			/mittlerer|realschul|fachoberschul|sekundar.*i\b/i.test(context)
		) {
			result.mittel = pct;
		} else if (/hochschulreife|abitur|fachhochschul/i.test(context)) {
			result.hochschulreife = pct;
		}
	}

	if (
		result.ohne + result.hauptschule + result.mittel + result.hochschulreife ===
		0
	) {
		return null;
	}
	return result;
}

function extractSchulfaecher(infofelder: any[]): string[] {
	const field = infofelder.find((f: any) => f.id === "a20-31");
	if (!field?.content) return [];

	const text = stripHtml(field.content);
	const faecher = [
		"Mathematik",
		"Deutsch",
		"Englisch",
		"Physik",
		"Chemie",
		"Biologie",
		"Informatik",
		"Wirtschaft",
		"Werken/Technik",
		"Kunst",
		"Sport",
		"Musik",
		"Ethik",
		"Religion",
	];
	return faecher.filter((f) => text.includes(f));
}

function findInfofeld(infofelder: any[], id: string): string {
	const field = infofelder.find((f: any) => f.id === id);
	return field?.content ? stripHtml(field.content) : "";
}

function extractBilder(item: any): BerufBild[] {
	if (!item.bilder || !Array.isArray(item.bilder)) return [];
	return item.bilder.map((b: any) => ({
		url: b.url || "",
		unterschrift: b.unterschrift || "",
		bildgruppe: b.bildgruppe || "",
	}));
}

async function fetchAllAusbildungsberufeIds(): Promise<number[]> {
	const ids: number[] = [];
	let page = 0;
	let totalPages = 1;

	while (page < totalPages) {
		console.log(`  Loading Berufe list page ${page}/${totalPages - 1}...`);
		const data = (await apiFetch(
			`/berufe?suchwoerter=*&bg=100,102,105&page=${page}`,
		)) as any;

		totalPages = data.page.totalPages;
		for (const beruf of data._embedded.berufSucheList) {
			ids.push(beruf.id);
		}
		page++;
		await sleep(DELAY_MS);
	}

	return ids;
}

function processBerufDetail(data: any[]): Beruf | null {
	if (!data || data.length === 0) return null;

	const ausbildung = data[0];
	const taetigkeit = data.length > 1 ? data[1] : data[0];

	const ausbildungInfofelder = ausbildung.infofelder || [];
	const taetigkeitInfofelder = taetigkeit.infofelder || [];

	const alleBilder = [
		...extractBilder(ausbildung),
		...extractBilder(taetigkeit),
	];
	const seenUrls = new Set<string>();
	const bilder = alleBilder.filter((b) => {
		if (seenUrls.has(b.url)) return false;
		seenUrls.add(b.url);
		return true;
	});

	const steckbriefKurz = ausbildung.steckbrief?.kurz
		? stripHtml(ausbildung.steckbrief.kurz)
		: null;
	const steckbriefLang = ausbildung.steckbrief?.lang
		? stripHtml(ausbildung.steckbrief.lang)
		: null;

	return {
		id: ausbildung.id,
		name: ausbildung.kurzBezeichnungNeutral || "Unbekannt",
		steckbriefKurz,
		steckbriefLang,
		aufgabenKompakt: findInfofeld(taetigkeitInfofelder, "b11-0") || null,
		bilder,
		schulabschluss: extractSchulabschluss(ausbildungInfofelder),
		schulfaecher: extractSchulfaecher(ausbildungInfofelder),
		interessen: extractInteressen(taetigkeitInfofelder),
		bedingungen: extractBedingungen(taetigkeitInfofelder),
		arbeitsorte: findInfofeld(taetigkeitInfofelder, "b12-02"),
		kompetenzenText: findInfofeld(taetigkeitInfofelder, "b20-32"),
	};
}

async function main() {
	console.log("=== BERUFENET Fetch Script ===\n");

	console.log("Step 1: Fetching all Ausbildungsberuf IDs...");
	const ids = await fetchAllAusbildungsberufeIds();
	console.log(`  -> ${ids.length} IDs loaded.\n`);

	console.log("Step 2: Fetching details for each Beruf...");
	const berufe: Beruf[] = [];
	let errors = 0;

	for (let i = 0; i < ids.length; i++) {
		const id = ids[i];
		if (i % 50 === 0) {
			console.log(`  ${i}/${ids.length} processed...`);
		}

		try {
			const data = (await apiFetch(`/berufe/${id}`)) as any[];
			const beruf = processBerufDetail(data);
			if (beruf) {
				berufe.push(beruf);
			}
		} catch (err) {
			errors++;
			console.error(`  Error for ID ${id}: ${err}`);
		}

		await sleep(DELAY_MS);
	}

	console.log(`  -> ${berufe.length} Berufe processed, ${errors} errors.\n`);

	const __dirname = dirname(fileURLToPath(import.meta.url));
	const outDir = resolve(__dirname, "../data");
	mkdirSync(outDir, { recursive: true });
	const outPath = resolve(outDir, "berufe.json");
	writeFileSync(outPath, JSON.stringify(berufe, null, 2), "utf-8");
	console.log(`Step 3: Saved to ${outPath}`);

	const withSteckbrief = berufe.filter((b) => b.steckbriefLang).length;
	const withSchulabschluss = berufe.filter((b) => b.schulabschluss).length;
	const withInteressen = berufe.filter((b) => b.interessen.length > 0).length;
	console.log(`\nStats:`);
	console.log(`  With Steckbrief:     ${withSteckbrief}/${berufe.length}`);
	console.log(`  With Schulabschluss: ${withSchulabschluss}/${berufe.length}`);
	console.log(`  With Interessen:     ${withInteressen}/${berufe.length}`);
}

main().catch(console.error);
