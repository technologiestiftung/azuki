import { describe, expect, it } from "vitest";
import { parseJobsucheResponse, toDetail } from "../../src/jobsuche/client.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(days: number): string {
	return new Date(Date.now() - days * DAY_MS).toISOString().slice(0, 10);
}

function ausbildungJob(overrides: Record<string, unknown> = {}) {
	return {
		stellenangebotsart: "AUSBILDUNG",
		ausbildungsart: "AUSBILDUNG",
		firma: "Beispiel GmbH",
		hauptberuf: "Fachinformatiker/in - Systemintegration",
		referenznummer: "10000-1000000000-S",
		stellenlokationen: [
			{
				adresse: {
					strasse: "Lützowstr.",
					hausnummer: "70",
					plz: "10785",
					ort: "Berlin",
					ortsteil: "Tiergarten",
				},
				breite: 52.5044028,
				laenge: 13.3577288,
			},
		],
		eintrittszeitraum: { von: "2026-09-01" },
		veroeffentlichungszeitraum: { von: daysAgo(3) },
		datumErsteVeroeffentlichung: daysAgo(3),
		...overrides,
	};
}

describe("parseJobsucheResponse", () => {
	it("maps a v6 posting to a preview", () => {
		const { previews } = parseJobsucheResponse({
			maxErgebnisse: 1,
			ergebnisliste: [ausbildungJob()],
		});

		expect(previews).toEqual([
			{
				referenznummer: "10000-1000000000-S",
				employer: "Beispiel GmbH",
				city: "Berlin",
				postcode: "10785",
				district: "Tiergarten",
				street: "Lützowstr. 70",
				latitude: 52.5044028,
				longitude: 13.3577288,
				startDate: "2026-09-01",
				publishedAt: daysAgo(3),
			},
		]);
	});

	it("reports maxErgebnisse as the total count", () => {
		const { totalCount } = parseJobsucheResponse({
			maxErgebnisse: 27,
			ergebnisliste: [ausbildungJob()],
		});

		expect(totalCount).toBe(27);
	});

	it("drops postings older than ten weeks", () => {
		const { previews } = parseJobsucheResponse({
			maxErgebnisse: 2,
			ergebnisliste: [
				ausbildungJob({
					veroeffentlichungszeitraum: { von: daysAgo(71) },
					datumErsteVeroeffentlichung: daysAgo(71),
				}),
				ausbildungJob(),
			],
		});

		expect(previews).toHaveLength(1);
		expect(previews[0].publishedAt).toBe(daysAgo(3));
	});

	it("drops Duales Studium postings", () => {
		const { previews } = parseJobsucheResponse({
			maxErgebnisse: 1,
			ergebnisliste: [
				ausbildungJob({
					ausbildungsart: "DUALES_STUDIUM",
					firma: "Duales Studium AG",
				}),
			],
		});

		expect(previews).toEqual([]);
	});

	it("sorts previews newest first", () => {
		const { previews } = parseJobsucheResponse({
			maxErgebnisse: 2,
			ergebnisliste: [
				ausbildungJob({
					firma: "Ältere GmbH",
					veroeffentlichungszeitraum: { von: daysAgo(20) },
				}),
				ausbildungJob({ firma: "Neuere GmbH" }),
			],
		});

		expect(previews.map((preview) => preview.employer)).toEqual([
			"Neuere GmbH",
			"Ältere GmbH",
		]);
	});

	it("falls back when optional fields are missing", () => {
		const { totalCount, previews } = parseJobsucheResponse({
			maxErgebnisse: 1,
			ergebnisliste: [
				{
					ausbildungsart: "AUSBILDUNG",
					datumErsteVeroeffentlichung: daysAgo(1),
				},
			],
		});

		expect(totalCount).toBe(1);
		expect(previews).toEqual([
			{
				referenznummer: "",
				employer: "Unbekannter Arbeitgeber",
				city: "Unbekannter Ort",
				postcode: undefined,
				district: undefined,
				street: undefined,
				latitude: undefined,
				longitude: undefined,
				startDate: undefined,
				publishedAt: daysAgo(1),
			},
		]);
	});

	it("returns an empty result when the response carries no list", () => {
		expect(parseJobsucheResponse({})).toEqual({
			totalCount: 0,
			previews: [],
		});
	});
});

function jobDetailsFixture(overrides: Record<string, unknown> = {}) {
	return {
		stellenangebotsTitel: "Kaufmann Büromanagement (m/w/d)",
		stellenangebotsBeschreibung: "Zur Verstärkung unseres Teams...",
		geforderterBildungsabschluss: "MITTLERE_REIFE_MITTLERER_BILDUNGSABSCHLUSS",
		arbeitszeitVollzeit: true,
		eintrittszeitraum: { von: "2026-08-12" },
		stellenlokationen: [
			{
				adresse: {
					strasse: "Wilhelmstr.",
					hausnummer: "50",
					plz: "52146",
					ort: "Würselen",
				},
				breite: 50.82066,
				laenge: 6.138243,
			},
		],
		hauptberuf: "Kaufmann/-frau - Büromanagement",
		firma: "K H S Steuerberater Kaulhausen Helmel Spirovski PartGmbB",
		referenznummer: "10000-1207517553-S",
		...overrides,
	};
}

describe("toDetail", () => {
	it("maps a full jobdetails response", () => {
		expect(toDetail(jobDetailsFixture(), "10000-1207517553-S")).toEqual({
			referenznummer: "10000-1207517553-S",
			occupationName: "Kaufmann/-frau - Büromanagement",
			title: "Kaufmann Büromanagement (m/w/d)",
			employer: "K H S Steuerberater Kaulhausen Helmel Spirovski PartGmbB",
			description: "Zur Verstärkung unseres Teams...",
			isFullTime: true,
			educationLevel: "MITTLERE_REIFE_MITTLERER_BILDUNGSABSCHLUSS",
			startDate: "2026-08-12",
			addresses: [
				{
					street: "Wilhelmstr. 50",
					postcode: "52146",
					city: "Würselen",
					latitude: 50.82066,
					longitude: 6.138243,
				},
			],
		});
	});

	it("maps NICHT_RELEVANT and missing education level through as-is", () => {
		expect(
			toDetail(
				jobDetailsFixture({ geforderterBildungsabschluss: "NICHT_RELEVANT" }),
				"10000-1207517553-S",
			).educationLevel,
		).toBe("NICHT_RELEVANT");

		expect(
			toDetail(
				jobDetailsFixture({ geforderterBildungsabschluss: undefined }),
				"10000-1207517553-S",
			).educationLevel,
		).toBeNull();
	});

	it("maps multiple stellenlokationen entries", () => {
		const { addresses } = toDetail(
			jobDetailsFixture({
				stellenlokationen: [
					{
						adresse: {
							strasse: "Bahnhofstr.",
							hausnummer: "1",
							plz: "10115",
							ort: "Berlin",
						},
					},
					{
						adresse: {
							strasse: "Hauptstr.",
							hausnummer: "2",
							plz: "10245",
							ort: "Berlin",
						},
					},
				],
			}),
			"10000-1207517553-S",
		);

		expect(addresses).toEqual([
			{
				street: "Bahnhofstr. 1",
				postcode: "10115",
				city: "Berlin",
				latitude: undefined,
				longitude: undefined,
			},
			{
				street: "Hauptstr. 2",
				postcode: "10245",
				city: "Berlin",
				latitude: undefined,
				longitude: undefined,
			},
		]);
	});

	it("falls back when optional fields are missing", () => {
		expect(toDetail({}, "10000-0000000000-S")).toEqual({
			referenznummer: "10000-0000000000-S",
			occupationName: "",
			title: "",
			employer: "Unbekannter Arbeitgeber",
			description: "",
			isFullTime: null,
			educationLevel: null,
			startDate: undefined,
			addresses: [],
		});
	});
});
