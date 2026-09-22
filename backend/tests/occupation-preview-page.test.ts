import { describe, expect, test } from "vitest";
import {
	buildOccupationPageMeta,
	buildOccupationPreviewTitle,
	injectPageMetaIntoSpaHtml,
	renderPageMetaTags,
} from "../src/occupationPreviewPage.js";
import { makeOccupation } from "./scoring/helpers.js";

const SPA_TEMPLATE = `<!doctype html>
<html lang="de">
<head>
<meta charset="UTF-8" />
<title>Azuki</title>
<meta name="description" content="Default" />
<meta property="og:title" content="Azuki" />
</head>
<body><div id="root"></div></body>
</html>`;

describe("occupationPreviewPage", () => {
	test("buildOccupationPreviewTitle uses display name only", () => {
		expect(buildOccupationPreviewTitle("Mechaniker/in")).toBe("Mechaniker/in");
	});

	test("buildOccupationPageMeta uses occupation fields", () => {
		const occupation = makeOccupation({
			name: "Anlagenmechaniker/in",
			descriptionShort:
				"Ausbildungsdauer 3 Jahre Lernorte Betrieb und Berufsschule",
			salaryKnown: true,
			salaryMonthlyMedian: 2800,
			salaryEntryKnown: true,
			salaryMonthlyEntry: 2800,
			images: [
				{ url: "https://example.com/hero.jpg", caption: "", imageGroup: "" },
			],
		});

		const meta = buildOccupationPageMeta(
			occupation,
			"https://azuki.example/results/15164",
		);

		expect(meta.title).toBe("Anlagenmechaniker/in");
		expect(meta.description).toBe("Dauer: 3 Jahre · Einstiegsgehalt: 2.800 €");
		expect(meta.imageUrl).toBe("https://example.com/hero.jpg");
		expect(meta.pageUrl).toBe("https://azuki.example/results/15164");
	});

	test("buildOccupationPageMeta ignores fit percent in share URL", () => {
		const occupation = makeOccupation({
			name: "Anlagenmechaniker/in",
			descriptionShort:
				"Ausbildungsdauer 3 Jahre Lernorte Betrieb und Berufsschule",
			salaryKnown: true,
			salaryMonthlyMedian: 2800,
			salaryEntryKnown: true,
			salaryMonthlyEntry: 2800,
		});

		const meta = buildOccupationPageMeta(
			occupation,
			"https://azuki.example/results/15164?fit=72",
		);

		expect(meta.description).toBe("Dauer: 3 Jahre · Einstiegsgehalt: 2.800 €");
	});

	test("injectPageMetaIntoSpaHtml replaces social meta tags", () => {
		const html = injectPageMetaIntoSpaHtml(SPA_TEMPLATE, {
			title: "Test Beruf",
			description: "Kurzbeschreibung",
			imageUrl: "https://example.com/image.jpg",
			pageUrl: "https://azuki.example/results/1",
		});

		expect(html).toContain("<title>Test Beruf</title>");
		expect(html).toContain('property="og:title" content="Test Beruf"');
		expect(html).toContain(
			'property="og:image" content="https://example.com/image.jpg"',
		);
		expect(html).not.toContain('content="Azuki"');
		expect(html).not.toContain('content="Default"');
	});

	test("renderPageMetaTags escapes html entities", () => {
		const tags = renderPageMetaTags({
			title: 'A & B "C"',
			description: "Test <desc>",
			imageUrl: "https://example.com/a.jpg",
			pageUrl: "https://example.com/results/1",
		});

		expect(tags).toContain("A &amp; B &quot;C&quot;");
		expect(tags).toContain("Test &lt;desc&gt;");
	});
});
