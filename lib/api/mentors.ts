export interface ActiveMentor {
  documentId: string;
  nume: string;
  email: string;
  mentorJobTitle: string | null;
  mentorOrganization: string | null;
  avatar: { documentId: string; name: string; url: string } | null;
}
