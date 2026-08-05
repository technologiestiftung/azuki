import type { MatchResult, VacanciesResponse } from "@azuki/shared";

export const MOCK_MATCH_RESULT: MatchResult = {
	occupations: [
		{
			id: 10001,
			name: "Fachinformatiker/in Anwendungsentwicklung",
			rawName: "Fachinformatikerin Anwendungsentwicklung",
			score: 0.94,
			images: [],
			shortDescription:
				"Du entwickelst Software und Apps – von der Idee über Planung und Programmierung bis zum fertigen Produkt.",
			reasoning:
				"Deine Stärken in logischem Denken und dein Interesse an Technik passen perfekt zu diesem Beruf.",
			occupationType: "dual",
			occupationTag: "computer-it",
			occupationDuration: "3 Jahre",
			occupationEarnings: "620-800 € / Monat",
			salaryKnown: true,
			salaryMonthlyMedian: 3200,
		},
		{
			id: 10002,
			name: "Kaufmann/-frau für Büromanagement",
			rawName: "Kauffrau für Büromanagement",
			score: 0.87,
			images: [],
			shortDescription:
				"Du organisierst Büroabläufe, koordinierst Termine und bist die Schaltstelle zwischen Abteilungen und Kunden.",
			reasoning:
				"Dein Organisationstalent und deine Kommunikationsstärke machen dich zur perfekten Besetzung für diesen Beruf.",
			occupationType: "dual",
			occupationTag: "buero-verwaltung-logistik",
			occupationDuration: "3 Jahre",
			occupationEarnings: "550-700 € / Monat",
			salaryKnown: true,
			salaryMonthlyMedian: 2600,
		},
		{
			id: 10003,
			name: "Elektroniker/in Energie- und Gebäudetechnik",
			rawName: "Elektroniker Energie- und Gebäudetechnik",
			score: 0.82,
			images: [],
			shortDescription:
				"Du installierst und wartest elektrische Anlagen in Gebäuden – von der Steckdose bis zur Heizungssteuerung.",
			reasoning:
				"Handwerkliches Geschick und technisches Interesse zeichnen dich aus – ideal für diesen Ausbildungsberuf.",
			occupationType: "dual",
			occupationTag: "elektro-energie",
			occupationDuration: "3,5 Jahre",
			occupationEarnings: "700-850 € / Monat",
			salaryKnown: true,
			salaryMonthlyMedian: 3100,
		},
		{
			id: 10004,
			name: "Medizinische/r Fachangestellte/r",
			rawName: "Medizinische Fachangestellte",
			score: 0.78,
			images: [],
			shortDescription:
				"Du unterstützt Ärzte bei der Patientenversorgung, nimmst Blut ab, verwaltest Patientendaten und koordinierst Praxisabläufe.",
			reasoning:
				"Deine Empathie und dein Interesse an Gesundheitsthemen passen gut zu diesem Beruf.",
			occupationType: "dual",
			occupationTag: "gesundheit",
			occupationDuration: "3 Jahre",
			occupationEarnings: "600-750 € / Monat",
			salaryKnown: true,
			salaryMonthlyMedian: 2800,
		},
		{
			id: 10005,
			name: "Koch/Köchin",
			rawName: "Koch",
			score: 0.73,
			images: [],
			shortDescription:
				"Du bereitest täglich frische Gerichte zu, planst Menüs und arbeitest in einem Team – ob im Restaurant, Hotel oder in der Gemeinschaftsverpflegung.",
			reasoning:
				"Kreativität in der Küche und Freude an Teamarbeit sind deine Stärken.",
			occupationType: "dual",
			occupationTag: "essen-gastronomie",
			occupationDuration: "3 Jahre",
			occupationEarnings: "650-800 € / Monat",
			salaryKnown: true,
			salaryMonthlyMedian: 2400,
		},
		{
			id: 10006,
			name: "Kaufmann/-frau im Einzelhandel",
			rawName: "Kauffrau im Einzelhandel",
			score: 0.69,
			images: [],
			shortDescription:
				"Du berätst Kunden, pflegst das Warensortiment und sorgst dafür, dass der Laden reibungslos läuft.",
			reasoning:
				"Deine Kundenorientierung und Kommunikationsfreude kommen im Einzelhandel täglich zum Einsatz.",
			occupationType: "dual",
			occupationTag: "verkaufen-beraten",
			occupationDuration: "3 Jahre",
			occupationEarnings: "550-700 € / Monat",
			salaryKnown: true,
			salaryMonthlyMedian: 2300,
		},
		{
			id: 10007,
			name: "Tischler/in",
			rawName: "Tischler",
			score: 0.65,
			images: [],
			shortDescription:
				"Du entwirfst und fertigst Möbel, Fenster und Treppen aus Holz – handwerklich präzise und mit Sinn für Gestaltung.",
			reasoning:
				"Dein handwerkliches Geschick und dein Sinn für Ästhetik passen gut zur Tischlerei.",
			occupationType: "dual",
			occupationTag: "bauen-handwerk",
			occupationDuration: "3 Jahre",
			occupationEarnings: "600-750 € / Monat",
			salaryKnown: true,
			salaryMonthlyMedian: 2700,
		},
		{
			id: 10008,
			name: "Erzieher/in",
			rawName: "Erzieherin",
			score: 0.61,
			images: [],
			shortDescription:
				"Du begleitest Kinder in ihrer Entwicklung, planst pädagogische Angebote und arbeitest eng mit Familien zusammen.",
			reasoning:
				"Deine Empathie und Freude am Arbeiten mit Menschen machen dich zu einem wertvollen Teil jedes pädagogischen Teams.",
			occupationType: "school",
			occupationTag: "soziales-betreuen",
			occupationDuration: "3 Jahre",
			occupationEarnings: "",
			salaryKnown: false,
			salaryMonthlyMedian: null,
		},
	],
};

export const MOCK_VACANCIES_RESPONSE: VacanciesResponse = {
	results: [
		{
			occupation: "Fachinformatikerin Anwendungsentwicklung",
			totalCount: 42,
			previews: [
				{
					employer: "Muster GmbH",
					city: "Berlin",
					postcode: "10115",
					district: "Mitte",
					startDate: "2025-09-01",
					publishedAt: "2025-03-15",
				},
				{
					employer: "Tech Solutions AG",
					city: "Berlin",
					postcode: "10587",
					district: "Charlottenburg",
					startDate: "2025-08-01",
					publishedAt: "2025-03-10",
				},
			],
			searchUrl:
				"https://www.arbeitsagentur.de/jobsuche/suche?was=Fachinformatiker+Anwendungsentwicklung&wo=Berlin",
		},
		{
			occupation: "Kauffrau für Büromanagement",
			totalCount: 28,
			previews: [
				{
					employer: "Verwaltungs GmbH",
					city: "Berlin",
					postcode: "12043",
					district: "Neukölln",
					startDate: "2025-09-01",
					publishedAt: "2025-03-08",
				},
			],
			searchUrl:
				"https://www.arbeitsagentur.de/jobsuche/suche?was=Kaufmann+Bueromanagement&wo=Berlin",
		},
		{
			occupation: "Elektroniker Energie- und Gebäudetechnik",
			totalCount: 19,
			previews: [
				{
					employer: "Energie Plus GmbH",
					city: "Berlin",
					postcode: "13347",
					district: "Wedding",
					startDate: "2025-09-01",
					publishedAt: "2025-02-28",
				},
			],
			searchUrl:
				"https://www.arbeitsagentur.de/jobsuche/suche?was=Elektroniker+Energie&wo=Berlin",
		},
	],
};
