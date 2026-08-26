import { localApiFetch } from "./local";
import { apiFetch } from "./client";

export interface ActiveOng {
  documentId: string;
  name: string;
}

export function listActiveOngs() {
  return localApiFetch<{ data: ActiveOng[] }>("/api/ongs/active");
}

/**
 * An organization whose profile was deleted (`Șterge ONG`) keeps its reports,
 * evaluations and program enrollment (BR-33) and is shown as withdrawn wherever
 * it still appears. Lives here rather than in `programs.ts` because `ngoStatus`
 * is an attribute of the organization, and both the FDSC organizations list and
 * the program assignment table need the same predicate.
 */
export function isRetras(ong: { ngoStatus?: string }): boolean {
  return ong.ngoStatus === "deleted";
}

export interface Ong {
  documentId: string;
  name: string;
  cui: string;
  /** `"deleted"` once `Șterge ONG` has run — render the "Retras" badge. */
  ngoStatus?: string;
  website: string;
  adresa: string;
  dataInfiintare: string;
  domeniuActivitate: string;
  domeniuSecundar: string | null;
  socialMedia: string | null;
  descriere: string | null;
  memberCount: number;
  admin: {
    nume: string;
    email?: string;
    telefon?: string | null;
    createdAt?: string;
    lastLogin?: string | null;
  } | null;
  programs: { documentId: string; name: string }[];
  judet: { documentId: string; nume: string } | null;
  localitate: { documentId: string; nume: string } | null;
}

export function listOngs() {
  return localApiFetch<{ data: Ong[] }>("/api/ongs");
}

export interface Domain {
  documentId: string;
  name: string;
}

export function listDomains() {
  return apiFetch<{ data: Domain[] }>("/api/domains");
}

export interface MyOng {
  documentId: string;
  name: string;
  cui: string;
  judet: { documentId: string; nume: string } | null;
  localitate: { documentId: string; nume: string } | null;
  contact: { nume: string; email: string; telefon: string };
  website: string | null;
  logo: { url: string } | null;
  domeniuPrincipal: { documentId: string; name: string } | null;
  domeniuSecundar: { documentId: string; name: string } | null;
  socialMedia: string | null;
  descriere: string | null;
  cuvinteCheie: string | null;
}

export interface OngEvaluation {
  documentId: string;
  name: string;
  createdAt: string;
  finished: boolean;
  finishedAt: string | null;
  invitedCount: number;
  completedCount: number;
  scores: { dimensions: Record<string, number | null>; overall: number | null };
  phases: {
    documentId: string;
    title: string;
    startDate: string;
    endDate: string;
    program: { documentId: string; name: string } | null;
  }[];
}

export function listOngEvaluations(ongDocumentId: string, programDocumentId?: string) {
  const query = programDocumentId ? `?${new URLSearchParams({ program: programDocumentId })}` : "";
  return localApiFetch<{ data: OngEvaluation[] }>(`/api/ongs/${ongDocumentId}/evaluations${query}`);
}

export interface OngOverview {
  totalEvaluations: number;
  currentEvaluation: {
    documentId: string;
    invitedCount: number;
    completedCount: number;
    program: { documentId: string; name: string } | null;
  } | null;
  lastFinalizedDate: string | null;
}

export interface OngFdscReport {
  documentId: string;
  name: string;
  uploadedAt: string;
  evaluation: {
    documentId: string;
    name: string;
    program: { documentId: string; name: string } | null;
  } | null;
  file: { url: string; name: string; ext: string } | null;
}

export interface OngMentor {
  documentId: string;
  nume: string;
  email: string;
  mentorJobTitle: string | null;
  mentorOrganization: string | null;
  ariiDeExpertiza: string[];
  avatar: { documentId: string; name: string; url: string } | null;
  programs: { documentId: string; name: string }[];
}

export interface OngEvaluationDetail {
  documentId: string;
  name: string;
  createdAt: string;
  finished: boolean;
  finishedAt: string | null;
  closedBy: "manual" | "auto" | null;
  ong: { documentId: string; name: string };
  phases: {
    documentId: string;
    title: string;
    startDate: string;
    endDate: string;
    program: { documentId: string; name: string } | null;
  }[];
  invitedCount: number;
  completedCount: number;
  scores: { dimensions: Record<string, number | null>; overall: number | null };
}
