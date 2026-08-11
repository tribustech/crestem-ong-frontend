import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";
import { serverApiFetch } from "@/lib/api/server";
import type { Ong, OngEvaluation } from "@/lib/api/ongs";
import { OrgDetailTabs } from "@/components/features/organizatii/OrgDetailTabs";
import { OrgHeaderCard } from "@/components/features/organizatii/OrgHeaderCard";
import { OngEvaluationsTable } from "@/components/features/organizatii/OngEvaluationsTable";

export default async function OrganizatieDetailPage({
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

      <OrgDetailTabs documentId={documentId} active="info" />

      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h2 className="text-2xl font-heading font-extrabold" style={{ color: "#162040" }}>
          Evaluare organizațională
        </h2>
        <button
          type="button"
          disabled
          title="Disponibil în curând"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-border opacity-40 cursor-not-allowed"
          style={{ color: "#475569" }}
        >
          <Layers size={13} /> Vezi modelul matricei
        </button>
      </div>

      <OngEvaluationsTable ongDocumentId={documentId} evaluations={evaluationsRes.data} />
    </div>
  );
}
