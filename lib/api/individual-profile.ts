import { serverApiFetch } from "./server";

export interface IndividualProfile {
  nume: string | null;
  email: string;
  createdAt: string | null;
  judet: { documentId: string; nume: string } | null;
  localitate: { documentId: string; nume: string } | null;
}

export function getIndividualProfile() {
  return serverApiFetch<{ data: IndividualProfile }>("/api/individuals/me");
}
