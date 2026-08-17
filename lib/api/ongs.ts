import { localApiFetch } from "./local";
import { apiFetch } from "./client";

export interface ActiveOng {
  documentId: string;
  name: string;
}

export function listActiveOngs() {
  return localApiFetch<{ data: ActiveOng[] }>("/api/ongs/active");
}

export interface Ong {
  documentId: string;
  name: string;
  cui: string;
  website: string;
  adresa: string;
  dataInfiintare: string;
  domeniuActivitate: string;
  memberCount: number;
  admin: { nume: string } | null;
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
  contact: { nume: string; prenume: string; email: string; telefon: string };
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
  scores: { overall: number | null };
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
