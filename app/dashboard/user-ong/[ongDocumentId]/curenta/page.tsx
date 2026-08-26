import { notFound, redirect } from "next/navigation";
import { serverApiFetch } from "@/lib/api/server";
import { findActiveEvaluation } from "@/lib/api/evaluations";
import type { MyOng, OngEvaluationListItem } from "@/lib/api/evaluations";
import { MemberOngHeader } from "@/components/features/dashboard-member/MemberOngHeader";
import { EvaluationTabs } from "@/components/features/overview/EvaluationTabs";

/**
 * "Evaluare curentă" for the ngo-member. Like the ngo-admin route of the same
 * name it has no view of its own: the member's unfinished evaluation is
 * already the wizard page, so this only resolves which one that is and hands
 * over. Everything here stays the member's own — `/api/evaluations/ong/:id`
 * returns only the evaluations the caller filled in themselves. The ONG is
 * fetched after the redirect check so the common case costs one request.
 */
export default async function MemberEvaluareCurentaPage({
  params,
}: {
  params: Promise<{ ongDocumentId: string }>;
}) {
  const { ongDocumentId } = await params;
  const basePath = `/dashboard/${ongDocumentId}`;

  const evaluationsRes = await serverApiFetch<{ data: OngEvaluationListItem[] }>(
    `/api/evaluations/ong/${ongDocumentId}`,
  );
  const active = findActiveEvaluation(evaluationsRes.data);

  if (active) {
    redirect(`${basePath}/evaluari/${active.documentId}`);
  }

  const ongsRes = await serverApiFetch<{ data: MyOng[] }>("/api/me/ongs");
  const ong = ongsRes.data.find((entry) => entry.documentId === ongDocumentId);
  if (!ong) {
    notFound();
  }

  return (
    <div>
      <MemberOngHeader ongName={ong.name} />

      <EvaluationTabs
        active="current"
        basePath={basePath}
        currentEvaluationHref={`${basePath}/curenta`}
        comparisonHref={`${basePath}/comparatie`}
      />

      <div className="bg-white rounded-xl border border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Nu ai nicio evaluare în desfășurare în această organizație.
        </p>
      </div>
    </div>
  );
}
