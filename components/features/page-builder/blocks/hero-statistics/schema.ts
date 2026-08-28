import { z } from "zod";

const ctaSchema = z.object({
  label: z.string().trim(),
  href: z.string().trim(),
});

const statSchema = z.object({
  valoare: z.string().trim().default(""),
  eticheta: z.string().trim().default(""),
  descriere: z.string().trim().default(""),
});

export const heroStatisticsSchema = z
  .object({
    supratitlu: z.string().trim().default(""),
    titlu: z.string().trim().min(1, "Titlul este obligatoriu"),
    subtitlu: z.string().trim().default(""),
    primaryCta: ctaSchema.default({ label: "", href: "" }),
    secondaryCta: ctaSchema.default({ label: "", href: "" }),
    statistici: z.array(statSchema).default([]),
    coloane: z.enum(["1", "2", "3", "4"]).default("2"),
    separator: z.boolean().default(false),
  })
  .refine((d) => Boolean(d.primaryCta.label) === Boolean(d.primaryCta.href), {
    path: ["primaryCta"],
    message: "Completează și textul, și link-ul",
  })
  .refine((d) => Boolean(d.secondaryCta.label) === Boolean(d.secondaryCta.href), {
    path: ["secondaryCta"],
    message: "Completează și textul, și link-ul",
  })
  .refine((d) => d.statistici.every((s) => s.valoare && s.eticheta), {
    path: ["statistici"],
    message: "Fiecare statistică are nevoie de valoare și etichetă",
  });

export type HeroStatisticsData = z.infer<typeof heroStatisticsSchema>;
export type HeroStat = z.infer<typeof statSchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.refine` chain makes that throw.
 * `titlu: ""` is intentionally invalid so a blank draft can't pass validation
 * when the admin clicks "Adaugă blocul".
 */
export const HERO_STATISTICS_DEFAULTS: HeroStatisticsData = {
  supratitlu: "",
  titlu: "",
  subtitlu: "",
  primaryCta: { label: "", href: "" },
  secondaryCta: { label: "", href: "" },
  statistici: [],
  coloane: "2",
  separator: false,
};

export const EMPTY_STAT: HeroStat = { valoare: "", eticheta: "", descriere: "" };
