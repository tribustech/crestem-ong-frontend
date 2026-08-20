import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { serverApiFetch } from "@/lib/api/server";
import type { Ong, OngEvaluation } from "@/lib/api/ongs";
import type { Dimension } from "@/lib/api/dimensions";
import { OrgDetailTabs } from "@/components/features/organizatii/OrgDetailTabs";
import { OrgHeaderCard } from "@/components/features/organizatii/OrgHeaderCard";
import { EvaluationComparisonTable } from "@/components/features/organizatii/EvaluationComparisonTable";
import { ExportPdfButton } from "@/components/features/organizatii/ExportPdfButton";

export default async function OrganizatieComparatiePage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  const [ongRes, evaluationsRes, dimensionsRes] = await Promise.all([
    serverApiFetch<{ data: Ong }>(`/api/ongs/${documentId}`),
    serverApiFetch<{ data: OngEvaluation[] }>(`/api/ongs/${documentId}/evaluations`),
    serverApiFetch<Dimension[]>("/api/dimensions"),
  ]);

  const ong = ongRes.data;
  const finishedEvaluations = evaluationsRes.data.filter((evaluation) => evaluation.finished);

  return (
    <div>
      <Link
        href="/dashboard/fdsc/organizatii"
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 print:hidden"
        style={{ color: "#94a3b8" }}
      >
        <ArrowLeft size={14} /> Înapoi la organizații
      </Link>

      <OrgHeaderCard ong={ong} />

      <div className="print:hidden">
        <OrgDetailTabs documentId={documentId} active="comparatie" />
      </div>

      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h2 className="text-2xl font-heading font-extrabold" style={{ color: "#162040" }}>
          Comparație evaluări
        </h2>
        <div className="flex items-center gap-3 print:hidden">
          <ExportPdfButton />
          <Link
            href={`/dashboard/fdsc/organizatii/${documentId}/evaluari`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-slate-50 transition-colors"
            style={{ color: "#334155" }}
          >
            <ArrowLeft size={14} /> Înapoi la istoric
          </Link>
        </div>
      </div>

      <EvaluationComparisonTable evaluations={finishedEvaluations} dimensions={dimensionsRes} />
    </div>
  );
}
