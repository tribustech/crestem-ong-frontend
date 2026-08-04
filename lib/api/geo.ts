import { apiFetch } from "./client";

export interface County {
  documentId: string;
  nume: string;
  abreviere: string;
}

export interface City {
  documentId: string;
  nume: string;
}

export function listCounties() {
  return apiFetch<{ data: County[] }>("/api/counties");
}

export function listCities(countyDocumentId: string) {
  return apiFetch<{ data: City[] }>(`/api/counties/${countyDocumentId}/cities`);
}
