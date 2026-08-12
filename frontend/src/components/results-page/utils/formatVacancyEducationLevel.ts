import { content } from "../../../content";

const EDUCATION_LEVEL_LABELS: Record<string, string> = {
	HAUPTSCHULABSCHLUSS:
		content["vacancies.detail.educationLevel.hauptschulabschluss"],
	MITTLERE_REIFE_MITTLERER_BILDUNGSABSCHLUSS:
		content["vacancies.detail.educationLevel.mittlereReife"],
	FACHHOCHSCHULREIFE:
		content["vacancies.detail.educationLevel.fachhochschulreife"],
	ABITUR_HOCHSCHULREIFE: content["vacancies.detail.educationLevel.abitur"],
	ALLGEMEINE_HOCHSCHULREIFE: content["vacancies.detail.educationLevel.abitur"],
	OHNE_ABSCHLUSS: content["vacancies.detail.educationLevel.ohneAbschluss"],
};

export function formatVacancyEducationLevel(
	educationLevel: string | null | undefined,
): string | null {
	if (!educationLevel) {
		return null;
	}
	return EDUCATION_LEVEL_LABELS[educationLevel] ?? null;
}
