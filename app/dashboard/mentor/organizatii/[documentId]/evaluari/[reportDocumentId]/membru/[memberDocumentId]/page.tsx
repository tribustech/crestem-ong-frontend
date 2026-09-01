import { notFound } from "next/navigation";
import { serverApiFetch } from "@/lib/api/server";
import type { OngEvaluationDetail } from "@/lib/api/ongs";
import type { Dimension } from "@/lib/api/dimensions";
import { EvaluationRespondentContent } from "@/components/features/organizatii/EvaluationRespondentContent";

export default async function MentorOrganizatieEvaluareMembruPage({
  params,
}: {
  params: Promise<{ documentId: string; reportDocumentId: string; memberDocumentId: string }>;
}) {
  const { documentId, reportDocumentId, memberDocumentId } = await params;

  const [evaluationRes, dimensionsRes] = await Promise.all([
    serverApiFetch<{ data: OngEvaluationDetail }>(
      `/api/ongs/${documentId}/evaluations/${reportDocumentId}`,
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
      backHref={`/dashboard/organizatii/${documentId}/evaluari/${reportDocumentId}`}
      anonymous
    />
  );
}
