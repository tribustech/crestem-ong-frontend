import { z } from "zod";
import { sanitizeRichText } from "./sanitize";

/** Strip tags + entities to test whether the HTML carries any real text. */
function hasText(html: string): boolean {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length > 0;
}

export const richTextSchema = z
  .object({
    titlu: z.string().trim().default(""),
    /**
     * HTML produced by the TipTap editor. Sanitised on the way in so stored
     * data is always within the editor's allowlist, regardless of source.
     */
    continut: z
      .string()
      .default("")
      .transform((html) => sanitizeRichText(html)),
    aliniere: z.enum(["stanga", "centru", "dreapta"]).default("stanga"),
  })
  .refine((d) => hasText(d.continut), {
    path: ["continut"],
    message: "Conținutul nu poate fi gol",
  });

export type RichTextData = z.infer<typeof richTextSchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.refine` chain makes that throw.
 * `continut: ""` is intentionally invalid so a blank draft can't pass validation
 * when the admin clicks "Adaugă blocul".
 */
export const RICH_TEXT_DEFAULTS: RichTextData = {
  titlu: "",
  continut: "",
  aliniere: "stanga",
};
