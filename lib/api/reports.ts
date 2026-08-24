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
 * The program the Overview tab reports on: the one with a phase running today,
 * falling back to the most recently started `Active` program. An ONG enrolled
 * only in finished/upcoming programs has no current program at all.
 */
export function findCurrentProgramRound(programRounds: ProgramRound[]): ProgramRound | null {
  const running = programRounds.find(({ phases }) => phases.some((phase) => phase.active));
  if (running) return running;
  const active = programRounds.filter(({ program }) => program.programStatus === "Active");
  if (active.length === 0) return null;
  return active.reduce((latest, round) =>
    `${round.program.startDate}` > `${latest.program.startDate}` ? round : latest,
  );
}

export interface ProgramOverviewStats {
  /** Distinct reports the ONG ran inside this program. */
  totalEvaluationSessions: number;
  /** The evaluation to surface as "Evaluare curentă", if one is under way. */
  currentReport: RoundSummary | null;
  /** End of the evaluation phase in play — the deadline shown on the card. */
  evaluationEndDate: string | null;
}

/** Counters for the Overview tab, all scoped to a single program round. */
export function getProgramOverviewStats({ phases }: ProgramRound): ProgramOverviewStats {
  // A report can be attached to more than one phase, so count report ids, not phases.
  const reportIds = new Set(
    phases.map((phase) => phase.report?.documentId).filter((id): id is string => Boolean(id)),
  );
  const evaluationPhases = phases.filter((phase) => phase.hasEvaluation);
  const currentPhase =
    evaluationPhases.find((phase) => phase.active) ??
    evaluationPhases.find((phase) => phase.report && !phase.report.finished) ??
    null;
  const currentReport =
    currentPhase?.report ??
    phases.find((phase) => phase.report && !phase.report.finished)?.report ??
    null;
  return {
    totalEvaluationSessions: reportIds.size,
    currentReport,
    evaluationEndDate:
      currentPhase?.endDate ?? evaluationPhases.at(-1)?.endDate ?? null,
  };
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
  createdAt: string;
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
  /** `email` is `null` once the respondent anonymized their account (BR-27). */
  user: { documentId: string; nume: string; email: string | null } | null;
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
  /** Numeric id — required by the resend-invitation endpoint. */
  id: number;
  /** String id — required by the remove-member endpoint. */
  documentId: string;
  nume: string;
  email: string;
  /** Function inside the organization, set by the admin. Null for members added before roles existed. */
  rol: string | null;
  accountStatus: "pending" | "active";
  createdAt: string;
  /**
   * Temporary: the API returns the raw activation URL only while invitation
   * emails are not wired up yet, and omits the key entirely otherwise. Guard on
   * the field being present, never on `accountStatus`, so the UI degrades
   * cleanly the day the backend stops sending it.
   */
  activationLink?: string;
}
