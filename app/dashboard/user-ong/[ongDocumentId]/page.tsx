import Link from "next/link";
import { notFound } from "next/navigation";
import { Rows3 } from "lucide-react";
import { serverApiFetch } from "@/lib/api/server";
import { findActiveEvaluation } from "@/lib/api/evaluations";
import type { MyOng, OngEvaluationListItem } from "@/lib/api/evaluations";
import type { Dimension } from "@/lib/api/dimensions";
import { OrgEvaluationsTable } from "@/components/features/dashboard-member/OrgEvaluationsTable";
import { MatrixModelButton } from "@/components/features/evaluari/MatrixModelButton";
import { MemberOngHeader } from "@/components/features/dashboard-member/MemberOngHeader";
import { EvaluationTabs } from "@/components/features/overview/EvaluationTabs";

export default async function MemberOngPage({
  params,
}: {
  params: Promise<{ ongDocumentId: string }>;
}) {
  const { ongDocumentId } = await params;

  const [ongsRes, evaluationsRes, dimensionsRes] = await Promise.all([
    serverApiFetch<{ data: MyOng[] }>("/api/me/ongs"),
    serverApiFetch<{ data: OngEvaluationListItem[] }>(
      `/api/evaluations/ong/${ongDocumentId}`,
    ),
    serverApiFetch<Dimension[]>("/api/dimensions"),
  ]);

  const ong = ongsRes.data.find((entry) => entry.documentId === ongDocumentId);
  if (!ong) {
    notFound();
  }

  const evaluations = evaluationsRes.data;
  const activeEvaluation = findActiveEvaluation(evaluations);

  return (
    <div>
      <MemberOngHeader ongName={ong.name} />

      <EvaluationTabs
        active="evaluations"
        basePath={`/dashboard/user-ong/${ongDocumentId}`}
      />

      {activeEvaluation && (
        <div
          className="rounded-2xl p-6 mb-6 flex items-center justify-between gap-4"
          style={{ background: "#162040" }}
        >
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "#2dbe8f" }}
            >
              Evaluare în așteptare
            </p>
            <p className="text-sm text-white/80 max-w-xl">
              Ai fost adăugat de organizație în procesul de evaluare
              organizațională. Dă click pe butonul de pornire pentru a începe.
            </p>
          </div>
          <Link
            href={`/dashboard/user-ong/${ongDocumentId}/evaluari/${activeEvaluation.documentId}`}
            className="shrink-0 inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{
              background: "#2dbe8f",
              boxShadow: "0 4px 16px rgba(45,190,143,0.3)",
            }}
          >
            {activeEvaluation.progress.status === "neinceput"
              ? "Pornește evaluarea"
              : "Continuă evaluarea"}
          </Link>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Evaluările la care ai participat personal ca membru al ONG-ului.
        </p>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/user-ong/${ongDocumentId}/model`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-border hover:bg-slate-50 transition-colors"
            style={{ color: "#475569" }}
          >
            <Layers size={13} /> Vezi modelul matricei
          </Link>
          <button
            type="button"
            disabled
            title="Disponibil în curând"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white opacity-40 cursor-not-allowed"
            style={{ background: "#162040" }}
          >
            <Rows3 size={13} /> Compară evaluări
          </button>
        </div>
      </div>

      <OrgEvaluationsTable
        ongDocumentId={ongDocumentId}
        evaluations={evaluations}
      />
    </div>
  );
}
