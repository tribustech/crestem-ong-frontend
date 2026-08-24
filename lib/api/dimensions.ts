import { apiFetch } from "./client";

export interface DimensionOption {
  value: number;
  label: string;
}

export interface DimensionQuestion {
  id: string;
  question: string;
  options: DimensionOption[];
  tag: string | null;
}

export interface Dimension {
  key: string;
  name: string;
  description: string;
  tips: string;
  action: string;
  quiz: DimensionQuestion[];
}

export function listDimensions() {
  return apiFetch<Dimension[]>("/api/dimensions");
}
