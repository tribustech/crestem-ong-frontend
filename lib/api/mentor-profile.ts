import { serverApiFetch } from "./server";

export interface MentorProfile {
  nume: string | null;
  email: string;
  createdAt: string | null;
  bio: string | null;
  dimensiuni: string[];
  ariiDeExpertiza: string[];
  avatar: { id: number; url: string } | null;
}

export function getMentorProfile() {
  return serverApiFetch<{ data: MentorProfile }>("/api/mentors/me");
}
