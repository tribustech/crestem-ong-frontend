import { notFound } from "next/navigation";
import { serverApiFetch } from "@/lib/api/server";
import type { MyOng } from "@/lib/api/evaluations";
import { findCurrentProgramRound } from "@/lib/api/reports";
import type { ProgramRound } from "@/lib/api/reports";
import type { AssignedMentor } from "@/lib/api/programs";
import { MemberOngHeader } from "@/components/features/dashboard-member/MemberOngHeader";
import { EvaluationTabs } from "@/components/features/overview/EvaluationTabs";
import { OverviewSections } from "@/components/features/overview/OverviewSections";

export default async function MemberOngOverviewPage({
  params,
}: {
  params: Promise<{ ongDocumentId: string }>;
}) {
  const { ongDocumentId } = await params;
  const basePath = `/dashboard/user-ong/${ongDocumentId}`;

  const [ongsRes, roundsRes] = await Promise.all([
    serverApiFetch<{ data: MyOng[] }>("/api/me/ongs"),
    serverApiFetch<{ data: { programRounds: ProgramRound[] } }>(
      `/api/me/ongs/${ongDocumentId}/rounds`,
    ),
  ]);

  const ong = ongsRes.data.find((entry) => entry.documentId === ongDocumentId);
  if (!ong) {
    notFound();
  }

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

      <EvaluationTabs active="overview" basePath={basePath} />

      <OverviewSections
        round={round}
        mentors={mentors}
        showEvaluationCounters={false}
        showMentorMessage={false}
      />
    </div>
  );
}
