import { localApiFetch } from "./local";

export interface ProgramPhase {
  documentId: string;
  title: string;
  startDate: string;
  endDate: string;
  hasEvaluation: boolean;
}

export interface Program {
  documentId: string;
  name: string;
  startDate: string;
  endDate: string;
  programStatus: "Upcoming" | "Active" | "Finished";
  phases: ProgramPhase[];
}

export interface ProgramDetail extends Program {
  entryPhase: { documentId: string; title: string } | null;
}

export interface PhaseInput {
  documentId?: string;
  title: string;
  startDate: string;
  endDate: string;
  hasEvaluation: boolean;
}

export interface CreateProgramPayload {
  name: string;
  startDate: string;
  endDate: string;
  phases: Omit<PhaseInput, "documentId">[];
}

export interface UpdateProgramPayload {
  name?: string;
  startDate?: string;
  endDate?: string;
  phases?: PhaseInput[];
  removePhases?: string[];
}

export function listPrograms() {
  return localApiFetch<{ data: Program[] }>("/api/programs");
}

export function getProgram(documentId: string) {
  return localApiFetch<{ data: ProgramDetail }>(`/api/programs/${documentId}`);
}

export function createProgram(payload: CreateProgramPayload) {
  return localApiFetch<{ data: ProgramDetail }>("/api/programs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProgram(documentId: string, payload: UpdateProgramPayload) {
  return localApiFetch<{ data: ProgramDetail }>(`/api/programs/${documentId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export interface AssignedMentor {
  documentId: string;
  /** `Anonim <documentId>` once the account is deleted. */
  nume: string;
  /** Null once the account is deleted — the stored address is a placeholder. */
  email: string | null;
  mentorJobTitle: string | null;
  mentorOrganization: string | null;
  avatar: { documentId: string; name: string; url: string } | null;
  /** Deleted accounts keep their assignment (BR-34); they render greyed and inert. */
  isDeleted: boolean;
}

export interface PhaseEvaluation {
  phaseDocumentId: string;
  phaseTitle: string;
  report: { documentId: string; name: string } | null;
}

export interface AssignedOng {
  documentId: string;
  name: string;
  ngoStatus?: string;
  evaluation: { documentId: string; name: string } | null;
  mentors: AssignedMentor[];
  phaseEvaluations: PhaseEvaluation[];
}

export function getProgramOngs(documentId: string) {
  return localApiFetch<{ data: { ongs: AssignedOng[] } }>(`/api/programs/${documentId}/ongs`);
}

export function getProgramMentors(documentId: string) {
  return localApiFetch<{ data: AssignedMentor[] }>(`/api/programs/${documentId}/mentors`);
}

export interface ProgramStats {
  ongsCount: number;
  mentorsCount: number;
  inEvaluation: number;
  finalizedEvaluation: number;
}

export function getProgramStats(documentId: string) {
  return localApiFetch<{ data: ProgramStats }>(`/api/programs/${documentId}/stats`);
}
