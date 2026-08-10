import { localApiFetch } from "./local";

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
  judet: { documentId: string; nume: string } | null;
  localitate: { documentId: string; nume: string } | null;
}

export function listOngs() {
  return localApiFetch<{ data: Ong[] }>("/api/ongs");
}

export interface OngEvaluation {
  documentId: string;
  name: string;
  createdAt: string;
  finished: boolean;
  finishedAt: string | null;
  invitedCount: number;
  completedCount: number;
}

export function listOngEvaluations(ongDocumentId: string, programDocumentId: string) {
  const query = new URLSearchParams({ program: programDocumentId });
  return localApiFetch<{ data: OngEvaluation[] }>(`/api/ongs/${ongDocumentId}/evaluations?${query}`);
}
