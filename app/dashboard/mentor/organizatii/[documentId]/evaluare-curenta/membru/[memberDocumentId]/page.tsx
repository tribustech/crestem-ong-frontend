import { notFound } from "next/navigation";
import { serverApiFetch } from "@/lib/api/server";
import type { OngEvaluation, OngEvaluationDetail } from "@/lib/api/ongs";
import type { Dimension } from "@/lib/api/dimensions";
import { EvaluationRespondentContent } from "@/components/features/organizatii/EvaluationRespondentContent";

export default async function MentorOrganizatieEvaluareCurentaMembruPage({
  params,
}: {
  params: Promise<{ documentId: string; memberDocumentId: string }>;
}) {
  const { documentId, memberDocumentId } = await params;

  const evaluationsRes = await serverApiFetch<{ data: OngEvaluation[] }>(
    `/api/ongs/${documentId}/evaluations`,
  );
  const current = (evaluationsRes.data ?? []).find((evaluation) => !evaluation.finished) ?? null;
  if (!current) notFound();

  const [evaluationRes, dimensionsRes] = await Promise.all([
    serverApiFetch<{ data: OngEvaluationDetail }>(
      `/api/ongs/${documentId}/evaluations/${current.documentId}`,
    ),
    serverApiFetch<Dimension[]>("/api/dimensions"),
  ]);

  // Only finished respondents have a matrix worth showing; anything else is a
  // hand-typed URL.
  const respondent = (evaluationRes.data.evaluations ?? []).find(
    (entry) => entry.documentId === memberDocumentId && entry.progress?.complete,
  );
  if (!respondent) notFound();

  return (
    <EvaluationRespondentContent
      evaluation={evaluationRes.data}
      respondent={respondent}
      dimensions={dimensionsRes}
      backHref={`/dashboard/organizatii/${documentId}/evaluare-curenta`}
      anonymous
    />
  );
}
