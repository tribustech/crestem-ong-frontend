import type { OngEvaluationRespondent } from "@/lib/api/ongs";

/**
 * Mentors see who was invited only as a numbered list of evaluations: no name,
 * no email, and no attribution on the arguments. FDSC staff see the real people.
 * The number is the respondent's position in the report payload, so the table
 * and the single-respondent page always agree on which "Evaluare N" is which.
 */
export function respondentLabel(
  respondent: OngEvaluationRespondent,
  index: number,
  anonymous: boolean,
): string {
  if (anonymous) return `Evaluare ${index + 1}`;
  return respondent.user?.nume ?? "Membru șters";
}

export function respondentIndex(
  respondents: OngEvaluationRespondent[],
  documentId: string,
): number {
  return respondents.findIndex((respondent) => respondent.documentId === documentId);
}

export const RESPONDENTS_TABLE_TITLE = "Utilizatori invitați";
export const ANONYMOUS_RESPONDENTS_TABLE_TITLE = "Lista evaluări";
