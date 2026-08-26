import { serverApiFetch } from "./server";

export interface OngMeeting {
  documentId: string;
  dataOra: string;
  format: "online" | "fata_in_fata";
  status: "programata" | "efectuata" | "anulata";
  subiect: string;
  linkIntalnire: string | null;
  /** Only populated on the mentor's own meetings list — a mentor's meetings span multiple ONGs. */
  ong?: { documentId: string; name: string } | null;
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

export interface MentorOng {
  documentId: string;
  name: string;
  programs: { documentId: string; name: string }[];
}

export function listMentorOngs() {
  return serverApiFetch<{ data: MentorOng[] }>("/api/mentor/ongs");
}

export interface ListMentorMeetingsParams {
  ong?: string;
  program?: string;
  status?: string;
  format?: string;
}

export function listMentorMeetings(params: ListMentorMeetingsParams = {}) {
  const query = new URLSearchParams();
  if (params.ong) query.set("ong", params.ong);
  if (params.program) query.set("program", params.program);
  if (params.status) query.set("status", params.status);
  if (params.format) query.set("format", params.format);
  const qs = query.toString();
  return serverApiFetch<{ data: OngMeeting[] }>(`/api/mentor/meetings${qs ? `?${qs}` : ""}`);
}

export interface MentorProgramOng {
  documentId: string;
  name: string;
  memberCount: number;
  admin: { nume: string; email: string } | null;
}

export interface MentorProgram {
  documentId: string;
  name: string;
  startDate: string;
  endDate: string;
  programStatus: "Upcoming" | "Active" | "Finished";
  ongs: MentorProgramOng[];
}

export function listMentorPrograms() {
  return serverApiFetch<{ data: MentorProgram[] }>("/api/mentor/programs");
}
