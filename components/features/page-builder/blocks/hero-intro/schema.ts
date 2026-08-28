import { z } from "zod";

const ctaSchema = z.object({
  label: z.string().trim(),
  href: z.string().trim(),
});

export const heroIntroSchema = z
  .object({
    supratitlu: z.string().trim().default(""),
    titlu: z.string().trim().min(1, "Titlul este obligatoriu"),
    textIntroductiv: z.string().trim().default(""),
    horizontalAlign: z.enum(["stanga", "centru", "dreapta"]).default("centru"),
    background: z.enum(["default", "light", "accent"]).default("default"),
    primaryCta: ctaSchema.default({ label: "", href: "" }),
    secondaryCta: ctaSchema.default({ label: "", href: "" }),
  })
  .refine((d) => Boolean(d.primaryCta.label) === Boolean(d.primaryCta.href), {
    path: ["primaryCta"],
    message: "Completează și textul, și link-ul",
  })
  .refine((d) => Boolean(d.secondaryCta.label) === Boolean(d.secondaryCta.href), {
    path: ["secondaryCta"],
    message: "Completează și textul, și link-ul",
  });

export type HeroIntroData = z.infer<typeof heroIntroSchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.refine` chain makes that throw.
 * `titlu: ""` is intentionally invalid so a blank draft can't pass validation
 * when the admin clicks "Adaugă blocul".
 */
export const HERO_INTRO_DEFAULTS: HeroIntroData = {
  supratitlu: "",
  titlu: "",
  textIntroductiv: "",
  horizontalAlign: "centru",
  background: "default",
  primaryCta: { label: "", href: "" },
  secondaryCta: { label: "", href: "" },
};
