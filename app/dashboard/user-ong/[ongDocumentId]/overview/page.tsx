import { notFound } from "next/navigation";
import { serverApiFetch } from "@/lib/api/server";
import { findActiveEvaluation } from "@/lib/api/evaluations";
import type { MyOng, OngEvaluationListItem } from "@/lib/api/evaluations";
import { findCurrentProgramRound } from "@/lib/api/reports";
import type { ProgramRound } from "@/lib/api/reports";
import type { AssignedMentor } from "@/lib/api/programs";
import type { Dimension } from "@/lib/api/dimensions";
import { MemberOngHeader } from "@/components/features/dashboard-member/MemberOngHeader";
import { PendingEvaluationBanner } from "@/components/features/dashboard-member/PendingEvaluationBanner";
import { EvaluationTabs } from "@/components/features/overview/EvaluationTabs";
import { OverviewSections } from "@/components/features/overview/OverviewSections";

export default async function MemberOngOverviewPage({
  params,
}: {
  params: Promise<{ ongDocumentId: string }>;
}) {
  const { ongDocumentId } = await params;
  const basePath = `/dashboard/${ongDocumentId}`;

  const [ongsRes, roundsRes, evaluationsRes, dimensionsRes] = await Promise.all([
    serverApiFetch<{ data: MyOng[] }>("/api/me/ongs"),
    serverApiFetch<{ data: { programRounds: ProgramRound[] } }>(
      `/api/me/ongs/${ongDocumentId}/rounds`,
    ),
    serverApiFetch<{ data: OngEvaluationListItem[] }>(
      `/api/evaluations/ong/${ongDocumentId}`,
    ),
    serverApiFetch<Dimension[]>("/api/dimensions"),
  ]);

  const ong = ongsRes.data.find((entry) => entry.documentId === ongDocumentId);
  if (!ong) {
    notFound();
  }

  const activeEvaluation = findActiveEvaluation(evaluationsRes.data);
  const round = findCurrentProgramRound(roundsRes.data.programRounds);
  const mentors: AssignedMentor[] = round
    ? (
        await serverApiFetch<{ data: AssignedMentor[] }>(
          `/api/me/ongs/${ongDocumentId}/mentors?program=${encodeURIComponent(
            round.program.documentId,
          )}`,
        )
      ).data
    : [];

  return (
    <div>
      <MemberOngHeader ongName={ong.name} />

      <EvaluationTabs
        active="overview"
        basePath={basePath}
        currentEvaluationHref={
          activeEvaluation
            ? `${basePath}/evaluari/${activeEvaluation.documentId}`
            : `${basePath}/curenta`
        }
        comparisonHref={`${basePath}/comparatie`}
      />

      {activeEvaluation && (
        <PendingEvaluationBanner
          evaluation={activeEvaluation}
          ongDocumentId={ongDocumentId}
          dimensionCount={dimensionsRes.length}
        />
      )}

      <OverviewSections
        round={round}
        mentors={mentors}
        showEvaluationCounters={false}
        showMentorMessage={false}
      />
    </div>
  );
}
