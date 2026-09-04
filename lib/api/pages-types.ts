/**
 * Types and labels for pages, kept apart from `pages.ts` so client
 * components can import them without pulling in `serverApiFetch` — and with it
 * `next/headers`, which only server code may touch.
 */

export const VISIBILITY_AUDIENCES = [
  "public",
  "fdsc",
  "mentor",
  "ngo-admin",
  "ngo-member",
  "individual",
] as const;

export type VisibilityAudience = (typeof VISIBILITY_AUDIENCES)[number];

export const AUDIENCE_LABEL: Record<VisibilityAudience, string> = {
  public: "Public",
  fdsc: "FDSC",
  mentor: "Persoană resursă",
  "ngo-admin": "Admin ONG",
  "ngo-member": "Membru ONG",
  individual: "Cont individual",
};

/** One placed block. Matches `BlockInstance` in the page builder. */
export interface PageBlock {
  id: string;
  type: string;
  data: unknown;
}

export interface PageSummary {
  documentId: string;
  titlu: string;
  slug: string;
  publicat: boolean;
  vizibilitate: VisibilityAudience[];
  actualizat: string;
}

export interface PageDetail extends PageSummary {
  blocuri: PageBlock[];
}

export interface PageListResult {
  data: PageSummary[];
  meta: { pagination: { page: number; pageSize: number; total: number; pageCount: number } };
}
