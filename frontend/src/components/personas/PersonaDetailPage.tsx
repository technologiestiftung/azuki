import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	POPULARITY_INDEX,
	formatPracticalExperiencesForApi,
	type EducationLevel,
	type Persona,
} from "@azuki/shared";
import { deletePersona, getPersona, updatePersona } from "../../api/client";
import { useEvalStore } from "../../store/useEvalStore";
import { EvalAuthGate } from "../eval/EvalAuthGate";
import { EvalNav } from "../eval/EvalNav";
import { OccupationPicker } from "./OccupationPicker";
import { ScoringExplainer } from "./ScoringExplainer";
import { InterestsEditor } from "./profile-editors/InterestsEditor";
import { SubjectsEditor } from "./profile-editors/SubjectsEditor";
import { WorkExpectationsEditor } from "./profile-editors/WorkExpectationsEditor";
import { StrengthsEditor } from "./profile-editors/StrengthsEditor";
import { CustomStrengthsEditor } from "./profile-editors/CustomStrengthsEditor";
import { WorkPreferencesEditor } from "./profile-editors/WorkPreferencesEditor";
import { NoGosEditor } from "./profile-editors/NoGosEditor";
import { CustomNoGosEditor } from "./profile-editors/CustomNoGosEditor";

export function PersonaDetailPage() {
	return (
		<EvalAuthGate>
			<PersonaDetailPageInner />
		</EvalAuthGate>
	);
}

const EDUCATION_LEVELS: { value: EducationLevel; label: string }[] = [
	{ value: "secondary", label: "Hauptschule" },
	{ value: "extended_secondary", label: "Hauptschule (qualifizierend)" },
	{ value: "intermediate", label: "Realschule / Mittlere Reife" },
	{ value: "university_entrance", label: "Abitur" },
	{ value: "vocational_diploma", label: "Fachabitur" },
	{ value: "none", label: "Kein Abschluss" },
	{ value: "foreign_degree", label: "Ausländischer Abschluss" },
	{ value: "unknown", label: "Unklar / weiß nicht" },
];

function PersonaDetailPageInner() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const replacePersona = useEvalStore((s) => s.replacePersona);
	const removePersona = useEvalStore((s) => s.removePersona);
	const [persona, setPersona] = useState<Persona | null>(null);
	const [draft, setDraft] = useState<Persona | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!id) {
			return;
		}
		getPersona(id)
			.then((p) => {
				setPersona(p);
				setDraft(p);
			})
			.catch((err) =>
				setError(err instanceof Error ? err.message : String(err)),
			);
	}, [id]);

	function patch(partial: Partial<Persona>) {
		setDraft((d) => (d ? { ...d, ...partial } : d));
	}

	async function handleSave() {
		if (!draft || !id) {
			return;
		}
		setSaving(true);
		setError(null);
		try {
			const updated = await updatePersona(id, {
				name: draft.name,
				description: draft.description,
				profile: draft.profile,
				tierS: draft.tierS,
				tierA: draft.tierA,
				tierC: draft.tierC,
			});
			setPersona(updated);
			setDraft(updated);
			replacePersona(updated);
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete() {
		if (!id) {
			return;
		}
		if (!window.confirm(`Persona "${persona?.name ?? id}" wirklich löschen?`)) {
			return;
		}
		try {
			await deletePersona(id);
			removePersona(id);
			navigate("/personas");
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		}
	}

	if (!persona || !draft) {
		return (
			<div className="max-w-none w-full p-6 bg-white min-h-[100dvh]">
				<EvalNav />
				<div className="text-sm text-gray-500">Lädt…</div>
				{error && (
					<div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2 mt-2">
						{error}
					</div>
				)}
			</div>
		);
	}

	const dirty = JSON.stringify(persona) !== JSON.stringify(draft);

	return (
		<div className="max-w-3xl w-full mx-auto p-6 bg-white min-h-[100dvh]">
			<EvalNav />
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-xl font-semibold">{persona.name}</h1>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={handleSave}
						disabled={!dirty || saving}
						className="bg-blue-600 text-white px-4 py-1 rounded text-sm disabled:opacity-50"
					>
						{saving ? "Speichert…" : "Speichern"}
					</button>
					<button
						type="button"
						onClick={handleDelete}
						className="border border-red-400 text-red-700 px-4 py-1 rounded text-sm"
					>
						Löschen
					</button>
				</div>
			</div>

			{error && (
				<div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2 mb-4">
					{error}
				</div>
			)}

			<BasicInfoSection draft={draft} patch={patch} />
			<ProfileEditorSection draft={draft} patch={patch} />
			<ScoringExplainer storageKey="personaDetail" defaultOpen={true} />
			<TierEditorSection draft={draft} patch={patch} />
		</div>
	);
}

function BasicInfoSection({
	draft,
	patch,
}: {
	draft: Persona;
	patch: (p: Partial<Persona>) => void;
}) {
	return (
		<section className="mb-6">
			<h2 className="text-base font-medium mb-2">Basisinfo</h2>
			<div className="flex flex-col gap-2 text-sm">
				<label className="flex flex-col gap-1">
					<span className="text-gray-600">Name</span>
					<input
						type="text"
						value={draft.name}
						onChange={(e) => patch({ name: e.target.value })}
						className="border border-gray-300 rounded px-2 py-1"
					/>
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-gray-600">Beschreibung</span>
					<textarea
						value={draft.description ?? ""}
						onChange={(e) => patch({ description: e.target.value || null })}
						rows={3}
						className="border border-gray-300 rounded px-2 py-1"
					/>
				</label>
			</div>
		</section>
	);
}

function resolveSelectedCustomStrengths(
	raw: Persona["profile"],
	customStrengths: string[],
): string[] {
	if ((raw.selectedCustomStrengths?.length ?? 0) > 0) {
		return raw.selectedCustomStrengths;
	}
	return customStrengths;
}

function resolvePracticalExperiences(raw: Persona["profile"]): {
	practicalExperiences: Persona["profile"]["practicalExperiences"];
	selectedPracticalExperienceIds: string[];
} {
	const practicalExperiences = raw.practicalExperiences ?? [];
	const selectedPracticalExperienceIds =
		raw.selectedPracticalExperienceIds ?? [];
	const legacyText = (
		raw as { practicalExperience?: string }
	).practicalExperience?.trim();

	if (practicalExperiences.length === 0 && legacyText) {
		const id = "legacy";
		return {
			practicalExperiences: [
				{
					id,
					description: legacyText,
					selectedExperienceId: null,
					selectedExperienceLabel: null,
					rating: 0,
				},
			],
			selectedPracticalExperienceIds: [id],
		};
	}

	return { practicalExperiences, selectedPracticalExperienceIds };
}

function normalizePersonaProfile(raw: Persona["profile"]): Persona["profile"] {
	const customStrengths = raw.customStrengths ?? [];
	const { practicalExperiences, selectedPracticalExperienceIds } =
		resolvePracticalExperiences(raw);

	return {
		inSchool: raw.inSchool ?? null,
		educationLevel: raw.educationLevel ?? null,
		favoriteSubjects: raw.favoriteSubjects ?? [],
		customSubjects: raw.customSubjects ?? [],
		interests: raw.interests ?? [],
		preferredJobs: raw.preferredJobs ?? [],
		customInterests: raw.customInterests ?? [],
		workExpectations: raw.workExpectations ?? [],
		customWorkExpectations: raw.customWorkExpectations ?? [],
		strengths: raw.strengths ?? {},
		customStrengths,
		selectedCustomStrengths: resolveSelectedCustomStrengths(
			raw,
			customStrengths,
		),
		practicalExperiences,
		selectedPracticalExperienceIds,
		workPreferences: raw.workPreferences ?? {},
		noGos: raw.noGos ?? {},
		customNoGos: raw.customNoGos ?? [],
	};
}

function ProfileEditorSection({
	draft,
	patch,
}: {
	draft: Persona;
	patch: (p: Partial<Persona>) => void;
}) {
	const profile = normalizePersonaProfile(draft.profile);

	function patchProfile(partial: Partial<Persona["profile"]>) {
		patch({ profile: { ...profile, ...partial } });
	}

	return (
		<section className="mb-6">
			<h2 className="text-base font-medium mb-2">Profil</h2>
			<div className="flex flex-col gap-3 text-sm">
				<label className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={profile.inSchool ?? false}
						onChange={(e) => patchProfile({ inSchool: e.target.checked })}
					/>
					<span>Aktuell in der Schule</span>
				</label>

				<label className="flex flex-col gap-1">
					<span className="text-gray-600">Schulabschluss</span>
					<select
						value={profile.educationLevel ?? ""}
						onChange={(e) =>
							patchProfile({
								educationLevel: (e.target.value ||
									null) as EducationLevel | null,
							})
						}
						className="border border-gray-300 rounded px-2 py-1"
					>
						<option value="">— nicht angegeben —</option>
						{EDUCATION_LEVELS.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
				</label>

				<InterestsEditor
					interests={profile.interests}
					customInterests={profile.customInterests}
					onChange={(next) =>
						patchProfile({
							interests: next.interests,
							customInterests: next.customInterests,
						})
					}
				/>

				<SubjectsEditor
					favoriteSubjects={profile.favoriteSubjects}
					customSubjects={profile.customSubjects}
					onChange={(next) =>
						patchProfile({
							favoriteSubjects: next.favoriteSubjects,
							customSubjects: next.customSubjects,
						})
					}
				/>

				<WorkExpectationsEditor
					workExpectations={profile.workExpectations}
					onChange={(next) => patchProfile({ workExpectations: next })}
				/>

				<StrengthsEditor
					strengths={profile.strengths}
					onChange={(next) => patchProfile({ strengths: next })}
				/>

				<CustomStrengthsEditor
					customStrengths={profile.customStrengths}
					onChange={(next) =>
						patchProfile({
							customStrengths: next,
							selectedCustomStrengths: next,
						})
					}
				/>

				<WorkPreferencesEditor
					workPreferences={profile.workPreferences}
					onChange={(next) => patchProfile({ workPreferences: next })}
				/>

				<NoGosEditor
					noGos={profile.noGos}
					onChange={(next) => patchProfile({ noGos: next })}
				/>

				<CustomNoGosEditor
					customNoGos={profile.customNoGos}
					noGos={profile.noGos}
					onChange={(next) => patchProfile(next)}
				/>

				<label className="flex flex-col gap-1">
					<span className="text-gray-600">
						Praktische Erfahrungen (freier Text)
					</span>
					<textarea
						value={formatPracticalExperiencesForApi(
							profile.practicalExperiences,
							profile.selectedPracticalExperienceIds,
						)}
						onChange={(e) =>
							patchProfile({
								practicalExperiences: e.target.value
									? [
											{
												id: "eval-draft",
												description: e.target.value,
												selectedExperienceId: null,
												selectedExperienceLabel: null,
												rating: 0,
											},
										]
									: [],
								selectedPracticalExperienceIds: e.target.value
									? ["eval-draft"]
									: [],
							})
						}
						rows={4}
						className="border border-gray-300 rounded px-2 py-1"
					/>
				</label>
			</div>
		</section>
	);
}

function TierEditorSection({
	draft,
	patch,
}: {
	draft: Persona;
	patch: (p: Partial<Persona>) => void;
}) {
	const nameById = new Map(POPULARITY_INDEX.map((r) => [r.id, r.name]));
	const allTierIds = new Set([...draft.tierS, ...draft.tierA, ...draft.tierC]);

	function addTo(tier: "S" | "A" | "C", id: number) {
		const next = { ...draft };
		if (tier === "S" && !next.tierS.includes(id)) {
			next.tierS = [...next.tierS, id];
		}
		if (tier === "A" && !next.tierA.includes(id)) {
			next.tierA = [...next.tierA, id];
		}
		if (tier === "C" && !next.tierC.includes(id)) {
			next.tierC = [...next.tierC, id];
		}
		patch(next);
	}

	function removeFrom(tier: "S" | "A" | "C", id: number) {
		const next = { ...draft };
		if (tier === "S") {
			next.tierS = next.tierS.filter((x) => x !== id);
		}
		if (tier === "A") {
			next.tierA = next.tierA.filter((x) => x !== id);
		}
		if (tier === "C") {
			next.tierC = next.tierC.filter((x) => x !== id);
		}
		patch(next);
	}

	return (
		<section className="mb-6">
			<h2 className="text-base font-medium mb-2">Rubrik-Tiers</h2>

			<OccupationPicker
				excludeIds={allTierIds}
				actions={[
					{ label: "+ S", onPick: (id) => addTo("S", id) },
					{ label: "+ A", onPick: (id) => addTo("A", id) },
					{ label: "+ C", onPick: (id) => addTo("C", id) },
				]}
			/>

			<div className="grid grid-cols-3 gap-3 mt-3 text-xs">
				<TierColumn
					title={`Tier S (${draft.tierS.length})`}
					ids={draft.tierS}
					nameById={nameById}
					onRemove={(id) => removeFrom("S", id)}
				/>
				<TierColumn
					title={`Tier A (${draft.tierA.length})`}
					ids={draft.tierA}
					nameById={nameById}
					onRemove={(id) => removeFrom("A", id)}
				/>
				<TierColumn
					title={`Tier C (${draft.tierC.length})`}
					ids={draft.tierC}
					nameById={nameById}
					onRemove={(id) => removeFrom("C", id)}
				/>
			</div>
		</section>
	);
}

function TierColumn({
	title,
	ids,
	nameById,
	onRemove,
}: {
	title: string;
	ids: number[];
	nameById: Map<number, string>;
	onRemove: (id: number) => void;
}) {
	return (
		<div className="border border-gray-200 rounded p-2">
			<div className="font-medium mb-1">{title}</div>
			{ids.length === 0 && <div className="text-gray-400">Leer</div>}
			<ul className="space-y-0.5">
				{ids.map((id) => (
					<li key={id} className="flex gap-1 items-baseline">
						<span className="flex-1 truncate" title={nameById.get(id) ?? ""}>
							{nameById.get(id) ?? `#${id}`}
						</span>
						<button
							type="button"
							onClick={() => onRemove(id)}
							className="text-red-600 underline text-[10px]"
						>
							entf.
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
