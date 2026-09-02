import { z } from "zod";

export const sectionSchema = z.object({
  fundal: z.enum(["alb", "gri", "navy", "teal"]).default("alb"),
  spatiere: z.enum(["mic", "mediu", "mare"]).default("mediu"),
  latime: z.enum(["ingust", "standard", "larg"]).default("standard"),
  titlu: z.string().trim().default(""),
  text: z.string().trim().default(""),
});

export type SectionData = z.infer<typeof sectionSchema>;

/**
 * Always valid — an empty coloured band is a legitimate spacer-with-background.
 * The page-builder has no nested-block model yet, so this is a standalone band,
 * not a container that wraps other blocks.
 */
export const SECTION_DEFAULTS: SectionData = {
  fundal: "alb",
  spatiere: "mediu",
  latime: "standard",
  titlu: "",
  text: "",
};
