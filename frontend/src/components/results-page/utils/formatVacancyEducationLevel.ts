import { content } from "../../../content";

const EDUCATION_LEVEL_LABELS: Record<string, string> = {
	KEIN_SCHULABSCHLUSS: content["schoolDegree.option.none.label"],
	OHNE_ABSCHLUSS: content["schoolDegree.option.none.label"],
	HAUPTSCHULABSCHLUSS: content["schoolDegree.option.secondary.label"],
	QUALIFIZIERENDER_ERWEITERTER_HAUPTSCHULABSCHLUSS:
		content["schoolDegree.option.extendedSecondary.label"],
	MITTLERE_REIFE_MITTLERER_BILDUNGSABSCHLUSS:
		content["schoolDegree.option.intermediate.label"],
	FACHHOCHSCHULREIFE: content["schoolDegree.option.vocationalDiploma.label"],
	FACHGEBUNDENE_HOCHSCHULREIFE:
		content["vacancies.detail.educationLevel.fachgebundeneHochschulreife"],
	ABITUR_HOCHSCHULREIFE: content["schoolDegree.option.universityEntrance.label"],
	ALLGEMEINE_HOCHSCHULREIFE:
		content["schoolDegree.option.universityEntrance.label"],
};

export function formatVacancyEducationLevel(
	educationLevel: string | null | undefined,
): string | null {
	if (!educationLevel) {
		return null;
	}
	return EDUCATION_LEVEL_LABELS[educationLevel] ?? null;
}
