import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { BackButton } from "../../src/components/back-button/BackButton";
import { content } from "../../src/content";

describe("BackButton", () => {
	test("exposes an accessible name", () => {
		const markup = renderToStaticMarkup(
			createElement(BackButton, { onClick: () => {} }),
		);
		expect(markup).toContain(`aria-label="${content["navigation.back"]}"`);
	});
});
