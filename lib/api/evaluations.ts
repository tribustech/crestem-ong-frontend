import type {
  EvaluationStatus,
  ReportPhaseInfo,
  ReportScores,
} from "./reports";

export interface MyOngProgram {
  documentId: string;
  name: string;
  programStatus: "Upcoming" | "Active" | "Finished";
}

export interface MyOng {
  documentId: string;
  name: string;
  cui: string;
  website: string | null;
  adresa: string | null;
  dataInfiintare: string | null;
  domeniuActivitate: string | null;
  programs: MyOngProgram[];
}

export interface EvaluationProgress {
  completedDimensions: string[];
  draftDimensions: string[];
  nextDimension: string | null;
  complete: boolean;
  status: EvaluationStatus;
}

export interface OngEvaluationListItem {
  documentId: string;
  name: string | null;
  completedAt: string | null;
  progress: EvaluationProgress;
  scores: ReportScores;
  report: {
    documentId: string;
    finished: boolean;
    phases: ReportPhaseInfo[];
  } | null;
}

export interface EvaluationAnswer {
  questionId: string;
  question: string | null;
  tag: string | null;
  answer: number | null;
  answerLabel: string | null;
}

export interface EvaluationDimensionBlock {
  dimensionKey: string;
  name: string | null;
  comment: string;
  submitted: boolean;
  quiz: EvaluationAnswer[];
}

export interface EvaluationDetail {
  documentId: string;
  user: { documentId: string; nume: string; email: string } | null;
  progress: EvaluationProgress;
  completedAt: string | null;
  scores: ReportScores;
  dimensions: EvaluationDimensionBlock[];
  report: {
    documentId: string;
    name: string;
    createdAt: string;
    finished: boolean;
    finishedAt: string | null;
    phases: ReportPhaseInfo[];
  } | null;
}

/**
 * The most recent evaluation this member has neither finished answering nor
 * had closed out from under them — the one the "Evaluare în așteptare" banner
 * and its CTA point at. Mirrors the ordering the backend already returns
 * (newest first), so the first match is the one to surface.
 */
export function findActiveEvaluation(
  evaluations: OngEvaluationListItem[],
): OngEvaluationListItem | null {
  return (
    evaluations.find(
      (evaluation) =>
        !evaluation.report?.finished &&
        evaluation.progress.status !== "completat",
    ) ?? null
  );
}
