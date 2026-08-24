import { redirect } from "next/navigation";
import { serverApiFetch } from "@/lib/api/server";
import type { ReportListItem } from "@/lib/api/reports";
import { EvaluationTabs } from "@/components/features/overview/EvaluationTabs";

const BASE_PATH = "/dashboard/ong/evaluari";
const CURRENT_PATH = `${BASE_PATH}/curenta`;

/**
 * "Evaluare curentă" for the ngo-admin. There is no separate view for it: the
 * organization's unfinished report already has a detail page, so this route
 * only resolves which report that is and hands over to it.
 */
export default async function OngEvaluareCurentaPage() {
  const listRes = await serverApiFetch<{ data: ReportListItem[] }>("/api/reports");
  const current = (listRes.data ?? []).find((report) => !report.finished) ?? null;

  if (current) {
    redirect(`${BASE_PATH}/${current.documentId}`);
  }

  return (
    <div>
      <EvaluationTabs active="current" basePath={BASE_PATH} currentEvaluationHref={CURRENT_PATH} />

      <div className="bg-white rounded-xl border border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Nu există nicio evaluare în desfășurare pentru această organizație.
        </p>
      </div>
    </div>
  );
}
