import { describe, expect, test } from "vitest";
import type { EvalSnapshot } from "@azuki/shared";

describe("EvalSnapshot JSON round-trip", () => {
	test("populated snapshot survives JSON serialization", () => {
		const snapshot: EvalSnapshot = {
			timestamp: "2026-04-29T15:00:00.000Z",
			prompt: "Du bist ein Berufsberater.",
			model: "google/gemini-2.5-flash",
			results: {
				nico: {
					prefilter: [{ id: 1, name: "Lagerlogistik", score: 0.91 }],
					final: [
						{
							id: 1,
							name: "Lagerlogistik",
							score: 0.91,
							reasoning: "Passt zu deinem Wunsch …",
						},
					],
					generation: {
						model: "google/gemini-2.5-flash",
						tokensInput: 100,
						tokensOutput: 50,
						cost: 0.0012,
					},
				},
				elina: {
					prefilter: [],
					final: [],
				},
				karim: { error: "boom" },
			},
		};
		const round = JSON.parse(JSON.stringify(snapshot)) as EvalSnapshot;
		expect(round).toEqual(snapshot);
	});

	test("snapshot with undefined generation field round-trips cleanly", () => {
		const snapshot: EvalSnapshot = {
			timestamp: "2026-04-29T15:00:00.000Z",
			prompt: "x",
			model: "y",
			results: {
				nico: { prefilter: [], final: [] },
				elina: { prefilter: [], final: [] },
				karim: { prefilter: [], final: [] },
			},
		};
		const round = JSON.parse(JSON.stringify(snapshot)) as EvalSnapshot;
		expect(round).toEqual(snapshot);
	});
});
