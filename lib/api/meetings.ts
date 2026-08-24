import { serverApiFetch } from "./server";

export interface OngMeeting {
  documentId: string;
  dataOra: string;
  format: "online" | "fata_in_fata";
  status: "programata" | "efectuata" | "anulata";
  subiect: string;
  linkIntalnire: string | null;
  mentor: { documentId: string; nume: string } | null;
  program: { documentId: string; name: string } | null;
  activityType: { documentId: string; name: string } | null;
  dimensiuni: string[];
  comentarii: string | null;
  report: { url: string; name: string; ext: string } | null;
}

export interface ListOngMeetingsParams {
  mentor?: string;
  program?: string;
  status?: string;
  format?: string;
}

export function listOngMeetings(documentId: string, params: ListOngMeetingsParams = {}) {
  const query = new URLSearchParams();
  if (params.mentor) query.set("mentor", params.mentor);
  if (params.program) query.set("program", params.program);
  if (params.status) query.set("status", params.status);
  if (params.format) query.set("format", params.format);
  const qs = query.toString();
  return serverApiFetch<{ data: OngMeeting[] }>(
    `/api/ongs/${documentId}/meetings${qs ? `?${qs}` : ""}`,
  );
}
