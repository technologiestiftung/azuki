/**
 * Diffs the committed berufe.json against the working copy and prints the
 * refresh PR body. Exits 1 past MAX_CATALOG_SHRINK_RATE so a degraded fetch
 * cannot open a PR.
 *
 * Run: npx tsx scripts/report-data-refresh.ts > refresh-report.md
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Occupation } from "@azuki/shared";

export const MAX_CATALOG_REMOVAL_RATE = 0.1;

export interface RefreshContext {
	popularityIds: Set<number>;
	availabilityIds: Set<number>;
	unmatchedExclusionIds: number[];
	staleConditionOverrideIds: number[];
	staleAccessOverrideIds: number[];
}

export interface RefreshReport {
	markdown: string;
	blocking: string | null;
}

// Not BERUFENET fields: image urls are noisy, enrichment is generated downstream.
const UNTRACKED_FIELDS = new Set(["images", "shortDescription", "taskBullets"]);

function list(items: string[]): string {
	return items.length > 0 ? items.map((s) => `- ${s}`).join("\n") : "- none";
}

export function buildRefreshReport(
	before: Occupation[],
	after: Occupation[],
	context: RefreshContext,
): RefreshReport {
	const a = new Map(before.map((o) => [o.id, o]));
	const b = new Map(after.map((o) => [o.id, o]));

	const added = after.filter((o) => !a.has(o.id));
	const removed = before.filter((o) => !b.has(o.id));
	const renamed = after.filter((o) => {
		const prev = a.get(o.id);
		return prev !== undefined && prev.name !== o.name;
	});

	const churn = new Map<string, number>();
	for (const [id, next] of b) {
		const prev = a.get(id);
		if (!prev) continue;
		for (const field of Object.keys(next) as Array<keyof Occupation>) {
			if (UNTRACKED_FIELDS.has(field)) continue;
			if (JSON.stringify(prev[field]) !== JSON.stringify(next[field])) {
				churn.set(field, (churn.get(field) ?? 0) + 1);
			}
		}
	}

	const missingPopularity = after.filter(
		(o) => !context.popularityIds.has(o.id),
	);
	const missingAvailability = after.filter(
		(o) => !context.availabilityIds.has(o.id),
	);
	const missingEnrichment = after.filter(
		(o) =>
			!o.shortDescription?.trim() ||
			(o.taskBullets?.filter((t) => t.trim()).length ?? 0) === 0,
	);

	// Counts removals, not net size: BERUFENET reforms retire and add ids in the
	// same run, so a net count lets additions mask a mass retirement.
	const removalRate = a.size === 0 ? 0 : removed.length / a.size;
	const blocking =
		removalRate > MAX_CATALOG_REMOVAL_RATE
			? `Catalog lost ${removed.length} of ${a.size} occupations (${(removalRate * 100).toFixed(1)}% > ${(MAX_CATALOG_REMOVAL_RATE * 100).toFixed(0)}% limit). Refusing to open a PR.`
			: null;

	const markdown = [
		`## BERUFENET refresh`,
		``,
		`Catalog: **${before.length} → ${after.length}** (+${added.length} / −${removed.length})`,
		``,
		`### Added — needs a suitability decision and a popularity tier`,
		list(
			added.map(
				(o) =>
					`\`${o.id}\` ${o.name} — accessLevel \`${o.accessLevel ?? "null"}\`, KldB \`${o.germanOccupationCode ?? "null"}\``,
			),
		),
		``,
		`### Removed — check whether a successor exists under a new id`,
		list(removed.map((o) => `\`${o.id}\` ${o.name}`)),
		``,
		`### Renamed`,
		list(renamed.map((o) => `\`${o.id}\` ${a.get(o.id)?.name} → ${o.name}`)),
		``,
		`### Field churn`,
		``,
		`| Field | Records changed |`,
		`| --- | --- |`,
		...[...churn.entries()]
			.sort((x, y) => y[1] - x[1])
			.map(([field, count]) => `| \`${field}\` | ${count} |`),
		``,
		`### Coverage gaps`,
		``,
		`No popularity tier (scored as \`G_unknown\`, −2): ${missingPopularity.length}`,
		list(missingPopularity.map((o) => `\`${o.id}\` ${o.name}`)),
		``,
		`No availability record (\`traineeCountInState\` returns 0): ${missingAvailability.length}`,
		list(missingAvailability.map((o) => `\`${o.id}\` ${o.name}`)),
		``,
		`Missing enrichment (partial OpenRouter failure): ${missingEnrichment.length}`,
		list(missingEnrichment.map((o) => `\`${o.id}\` ${o.name}`)),
		``,
		`### Stale curation ids`,
		``,
		`Condition overrides not in catalog: ${context.staleConditionOverrideIds.join(", ") || "none"}`,
		``,
		`Access-level overrides not in catalog: ${context.staleAccessOverrideIds.join(", ") || "none"}`,
		``,
		`Joblinge exclusions that matched nothing: ${context.unmatchedExclusionIds.join(", ") || "none"}`,
	].join("\n");

	return { markdown, blocking };
}

function main() {
	const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
	const read = (rel: string) =>
		JSON.parse(readFileSync(resolve(root, rel), "utf-8"));

	const before: Occupation[] = JSON.parse(
		execFileSync("git", ["show", "HEAD:backend/src/data/berufe.json"], {
			cwd: root,
			encoding: "utf-8",
			maxBuffer: 64 * 1024 * 1024,
		}),
	);
	const after: Occupation[] = read("backend/src/data/berufe.json");
	const popularity: Array<{ id: number }> = read(
		"shared/data/popularity-index.json",
	);
	const availability: Record<string, unknown> = read(
		"shared/data/availability-by-state.json",
	);
	const summary = read("data-refresh-summary.json");

	const report = buildRefreshReport(before, after, {
		popularityIds: new Set(popularity.map((r) => r.id)),
		availabilityIds: new Set(Object.keys(availability).map(Number)),
		unmatchedExclusionIds: summary.unmatchedExclusionIds ?? [],
		staleConditionOverrideIds: summary.staleConditionOverrideIds ?? [],
		staleAccessOverrideIds: summary.staleAccessOverrideIds ?? [],
	});

	console.log(report.markdown);
	if (report.blocking) {
		console.error(report.blocking);
		process.exit(1);
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}
