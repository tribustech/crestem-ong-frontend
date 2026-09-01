import { serverApiFetch } from "@/lib/api/server";
import type { OngEvaluation, OngEvaluationDetail } from "@/lib/api/ongs";
import type { Dimension } from "@/lib/api/dimensions";
import { EvaluationDetailContent } from "@/components/features/organizatii/EvaluationDetailContent";

export default async function MentorOrganizatieEvaluareCurentaPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  const evaluationsRes = await serverApiFetch<{ data: OngEvaluation[] }>(
    `/api/ongs/${documentId}/evaluations`,
  );

  const current = (evaluationsRes.data ?? []).find((evaluation) => !evaluation.finished) ?? null;

  const [evaluationDetail, dimensions] = current
    ? await Promise.all([
        serverApiFetch<{ data: OngEvaluationDetail }>(
          `/api/ongs/${documentId}/evaluations/${current.documentId}`,
        ),
        serverApiFetch<Dimension[]>("/api/dimensions"),
      ])
    : [null, null];

  return (
    <div>
      {evaluationDetail && dimensions ? (
        <EvaluationDetailContent
          evaluation={evaluationDetail.data}
          dimensions={dimensions}
          anonymous
        />
      ) : (
        <div className="bg-white rounded-xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nu există nicio evaluare în desfășurare pentru această organizație.
          </p>
        </div>
      )}
    </div>
  );
}
