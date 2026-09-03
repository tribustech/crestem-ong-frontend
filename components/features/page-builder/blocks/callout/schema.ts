import { z } from "zod";
import { sanitizeRichText, hasRichText } from "../../rich-text/sanitize";

/**
 * Fixed icon palette for a Callout. Stored as a string key (not a component
 * reference) so the schema stays serialisable and the renderer stays pure — it
 * maps the key back to a `lucide-react` icon at render time. Same approach as
 * `feature-cards/icons.ts`.
 */
export const CALLOUT_ICON_KEYS = [
  "megaphone",
  "sparkles",
  "rocket",
  "star",
  "heart",
  "hand-heart",
  "info",
  "bell",
  "gift",
  "party",
  "flag",
  "zap",
  "check",
  "alert",
  "thumbs-up",
  "users",
  "calendar",
  "mail",
  "message",
  "book",
  "graduation",
  "target",
  "trophy",
  "lightbulb",
  "shield",
  "globe",
] as const;

export type CalloutIconKey = (typeof CALLOUT_ICON_KEYS)[number];

const ctaSchema = z.object({
  label: z.string().trim().default(""),
  href: z.string().trim().default(""),
});

export const calloutSchema = z
  .object({
    icon: z.enum(CALLOUT_ICON_KEYS).default("megaphone"),
    afiseazaIcon: z.boolean().default(true),
    titlu: z.string().trim().default(""),
    /**
     * HTML produced by the shared TipTap editor. Sanitised on the way in so
     * stored data is always within the editor's allowlist, regardless of source.
     */
    text: z
      .string()
      .default("")
      .transform((html) => sanitizeRichText(html)),
    primaryCta: ctaSchema.default({ label: "", href: "" }),
    secondaryCta: ctaSchema.default({ label: "", href: "" }),
    aliniere: z.enum(["stanga", "centru", "dreapta"]).default("centru"),
  })
  .refine((d) => hasRichText(d.text), {
    path: ["text"],
    message: "Textul nu poate fi gol",
  })
  .refine((d) => Boolean(d.primaryCta.label) === Boolean(d.primaryCta.href), {
    path: ["primaryCta"],
    message: "Completează și textul, și link-ul",
  })
  .refine((d) => Boolean(d.secondaryCta.label) === Boolean(d.secondaryCta.href), {
    path: ["secondaryCta"],
    message: "Completează și textul, și link-ul",
  });

export type CalloutData = z.infer<typeof calloutSchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.refine` chain makes that throw.
 * `text: ""` is intentionally invalid so a blank draft can't pass validation
 * when the admin clicks "Adaugă blocul".
 */
export const CALLOUT_DEFAULTS: CalloutData = {
  icon: "megaphone",
  afiseazaIcon: true,
  titlu: "",
  text: "",
  primaryCta: { label: "", href: "" },
  secondaryCta: { label: "", href: "" },
  aliniere: "centru",
};
