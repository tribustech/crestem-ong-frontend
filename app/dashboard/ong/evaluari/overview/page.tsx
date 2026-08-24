import { serverApiFetch } from "@/lib/api/server";
import { findActiveReport, findCurrentProgramRound, getProgramOverviewStats } from "@/lib/api/reports";
import type { ReportsCurrent } from "@/lib/api/reports";
import type { AssignedMentor } from "@/lib/api/programs";
import { EvaluationTabs } from "@/components/features/overview/EvaluationTabs";
import { OverviewSections } from "@/components/features/overview/OverviewSections";

const BASE_PATH = "/dashboard/ong/evaluari";

export default async function OngEvaluariOverviewPage() {
  const currentRes = await serverApiFetch<{ data: ReportsCurrent }>("/api/reports/current");
  const round = findCurrentProgramRound(currentRes.data.programRounds);

  const mentors: AssignedMentor[] = round
    ? (
        await serverApiFetch<{ data: AssignedMentor[] }>(
          `/api/programs/${encodeURIComponent(round.program.documentId)}/ong-mentors`,
        )
      ).data
    : [];

  const stats = round ? getProgramOverviewStats(round) : null;
  const activeReport = findActiveReport(currentRes.data.programRounds, currentRes.data.standaloneReports);

  return (
    <div>
      <EvaluationTabs
        active="overview"
        basePath={BASE_PATH}
        currentEvaluationHref={
          activeReport ? `${BASE_PATH}/${activeReport.documentId}` : `${BASE_PATH}/curenta`
        }
        comparisonHref={`${BASE_PATH}/comparatie`}
      />

      <OverviewSections
        round={round}
        mentors={mentors}
        totalSessions={stats?.totalEvaluationSessions ?? 0}
        historyHref={BASE_PATH}
        currentEvaluationHref={
          stats?.currentReport ? `${BASE_PATH}/${stats.currentReport.documentId}` : null
        }
        showMentorMessage
      />
    </div>
  );
}
