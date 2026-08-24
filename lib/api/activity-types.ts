import { serverApiFetch } from "./server";

export interface ActivityType {
  documentId: string;
  name: string;
}

export function listActivityTypes() {
  return serverApiFetch<{ data: ActivityType[] }>("/api/activity-types");
}
