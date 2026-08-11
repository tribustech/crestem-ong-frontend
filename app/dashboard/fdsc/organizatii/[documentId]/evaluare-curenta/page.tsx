import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { serverApiFetch } from "@/lib/api/server";
import type { Ong, OngEvaluation, OngEvaluationDetail } from "@/lib/api/ongs";
import type { Dimension } from "@/lib/api/dimensions";
import { OrgDetailTabs } from "@/components/features/organizatii/OrgDetailTabs";
import { OrgHeaderCard } from "@/components/features/organizatii/OrgHeaderCard";
import { EvaluationDetailContent } from "@/components/features/organizatii/EvaluationDetailContent";

export default async function OrganizatieEvaluareCurentaPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  const [ongRes, evaluationsRes] = await Promise.all([
    serverApiFetch<{ data: Ong }>(`/api/ongs/${documentId}`),
    serverApiFetch<{ data: OngEvaluation[] }>(`/api/ongs/${documentId}/evaluations`),
  ]);

  const ong = ongRes.data;
  const current = evaluationsRes.data.find((evaluation) => !evaluation.finished) ?? null;

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
      <Link
        href="/dashboard/fdsc/organizatii"
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-6"
        style={{ color: "#94a3b8" }}
      >
        <ArrowLeft size={14} /> Înapoi la organizații
      </Link>

      <OrgHeaderCard ong={ong} />

      <OrgDetailTabs documentId={documentId} active="evaluare-curenta" />

      {evaluationDetail && dimensions ? (
        <EvaluationDetailContent evaluation={evaluationDetail.data} dimensions={dimensions} />
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
