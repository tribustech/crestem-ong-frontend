import { z } from "zod";

const ctaSchema = z.object({
  label: z.string().trim(),
  href: z.string().trim(),
});

export const heroLargeSplitSchema = z
  .object({
    supratitlu: z.string().trim().default(""),
    titlu: z.string().trim().min(1, "Titlul este obligatoriu"),
    subtitlu: z.string().trim().default(""),
    image: z
      .object({ id: z.number(), url: z.string(), name: z.string().default("") })
      .nullable()
      .default(null),
    imageAlt: z.string().trim().default(""),
    imagePosition: z.enum(["dreapta", "stanga"]).default("dreapta"),
    verticalAlign: z.enum(["centru", "sus"]).default("centru"),
    primaryCta: ctaSchema.default({ label: "", href: "" }),
    secondaryCta: ctaSchema.default({ label: "", href: "" }),
  })
  .refine((d) => !d.image || d.imageAlt.length > 0, {
    path: ["imageAlt"],
    message: "Adaugă un text alternativ pentru imagine",
  })
  .refine((d) => Boolean(d.primaryCta.label) === Boolean(d.primaryCta.href), {
    path: ["primaryCta"],
    message: "Completează și textul, și link-ul",
  })
  .refine((d) => Boolean(d.secondaryCta.label) === Boolean(d.secondaryCta.href), {
    path: ["secondaryCta"],
    message: "Completează și textul, și link-ul",
  });

export type HeroLargeSplitData = z.infer<typeof heroLargeSplitSchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.refine` chain makes that throw.
 * `titlu: ""` is intentionally invalid so a blank draft can't pass validation
 * when the admin clicks "Adaugă blocul".
 */
export const HERO_LARGE_SPLIT_DEFAULTS: HeroLargeSplitData = {
  supratitlu: "",
  titlu: "",
  subtitlu: "",
  image: null,
  imageAlt: "",
  imagePosition: "dreapta",
  verticalAlign: "centru",
  primaryCta: { label: "", href: "" },
  secondaryCta: { label: "", href: "" },
};
