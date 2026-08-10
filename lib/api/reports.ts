export type EvaluationStatus = "neinceput" | "in_lucru" | "completat" | "nefinalizat";

export interface RoundSummary {
  documentId: string;
  name: string;
  finished: boolean;
  invitedCount: number;
  completedCount: number;
  score: number | null;
}

export interface RoundPhase {
  documentId: string;
  title: string;
  startDate: string;
  endDate: string;
  hasEvaluation: boolean;
  active: boolean;
  report: RoundSummary | null;
}

export interface ProgramRound {
  program: {
    documentId: string;
    name: string;
    startDate: string;
    endDate: string;
    programStatus: "Upcoming" | "Active" | "Finished";
    ongsCount: number;
  };
  phases: RoundPhase[];
}

export interface ReportsCurrent {
  programRounds: ProgramRound[];
  standaloneReports: RoundSummary[];
}

/**
 * An ONG can have at most one active (unfinished) evaluation at a time (BR-19),
 * whether it's tied to a program phase or independent. Finds that report, if any.
 */
export function findActiveReport(
  programRounds: ProgramRound[],
  standaloneReports: RoundSummary[],
): RoundSummary | null {
  const standalone = standaloneReports.find((report) => !report.finished);
  if (standalone) return standalone;
  for (const { phases } of programRounds) {
    for (const phase of phases) {
      if (phase.report && !phase.report.finished) return phase.report;
    }
  }
  return null;
}

export type EvaluationLock =
  | { reason: "active-phase"; programName: string }
  | { reason: "active-report"; report: RoundSummary };

/**
 * BR-19: while any of the ONG's programs has an evaluation phase currently in
 * its date window, the ONG cannot start an independent evaluation — it must
 * start the program's evaluation instead. Failing that, it's blocked by any
 * other active report. Mirrors the checks in the backend `report.start` action.
 */
export function getIndependentStartLock(
  programRounds: ProgramRound[],
  standaloneReports: RoundSummary[],
): EvaluationLock | null {
  const activePhaseProgram = programRounds.find(({ phases }) =>
    phases.some((phase) => phase.hasEvaluation && phase.active && !phase.report?.finished),
  )?.program;
  if (activePhaseProgram) {
    return { reason: "active-phase", programName: activePhaseProgram.name };
  }
  const activeReport = findActiveReport(programRounds, standaloneReports);
  return activeReport ? { reason: "active-report", report: activeReport } : null;
}

export interface ReportPhaseInfo {
  documentId: string;
  title: string;
  startDate: string;
  endDate: string;
  program: { documentId: string; name: string } | null;
}

export interface ReportListItem {
  documentId: string;
  name: string;
  createdAt: string;
  finished: boolean;
  finishedAt: string | null;
  closedBy: "manual" | "auto" | null;
  phases: ReportPhaseInfo[];
  invitedCount: number;
  completedCount: number;
}

export interface ReportScores {
  dimensions: Record<string, number | null>;
  overall: number | null;
}

export interface ReportDetail {
  documentId: string;
  name: string;
  finished: boolean;
  finishedAt: string | null;
  closedBy: "manual" | "auto" | null;
  canDelete: boolean;
  phases: ReportPhaseInfo[];
  invitedCount: number;
  completedCount: number;
  scores: ReportScores;
}

export interface ReportMember {
  documentId: string;
  user: { documentId: string; nume: string; email: string } | null;
  status: EvaluationStatus;
  completedAt: string | null;
  notificationSentAt: string | null;
}

export interface ReportMembers {
  invited: ReportMember[];
  invitedCount: number;
  completedCount: number;
}

export interface OngMember {
  documentId: string;
  nume: string;
  email: string;
  accountStatus: "pending" | "active";
}
