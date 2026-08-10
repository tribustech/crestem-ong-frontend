import { localApiFetch } from "./local";

export interface ActiveMentor {
  documentId: string;
  nume: string;
  email: string;
  mentorJobTitle: string | null;
  mentorOrganization: string | null;
  avatar: { documentId: string; name: string; url: string } | null;
}

export function listActiveMentors() {
  return localApiFetch<{ data: ActiveMentor[] }>("/api/mentors/active");
}
