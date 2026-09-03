import { z } from "zod";

const ctaSchema = z.object({
  label: z.string().trim().default(""),
  href: z.string().trim().default(""),
});

const statSchema = z.object({
  valoare: z.string().trim().default(""),
  eticheta: z.string().trim().default(""),
  descriere: z.string().trim().default(""),
});

export const statisticsSchema = z
  .object({
    titlu: z.string().trim().default(""),
    subtitlu: z.string().trim().default(""),
    descriere: z.string().trim().default(""),
    statistici: z.array(statSchema).default([]),
    // Text spec says 1-4; the screenshot shows a 2-wide grid.
    coloane: z.enum(["1", "2", "3", "4"]).default("2"),
    separator: z.boolean().default(false),
    primaryCta: ctaSchema.default({ label: "", href: "" }),
    secondaryCta: ctaSchema.default({ label: "", href: "" }),
  })
  .refine((d) => d.statistici.length > 0, {
    path: ["statistici"],
    message: "Adaugă cel puțin o statistică",
  })
  .refine((d) => d.statistici.every((s) => s.valoare && s.eticheta), {
    path: ["statistici"],
    message: "Fiecare statistică are nevoie de valoare și etichetă",
  })
  .refine((d) => Boolean(d.primaryCta.label) === Boolean(d.primaryCta.href), {
    path: ["primaryCta"],
    message: "Completează și textul, și link-ul",
  })
  .refine((d) => Boolean(d.secondaryCta.label) === Boolean(d.secondaryCta.href), {
    path: ["secondaryCta"],
    message: "Completează și textul, și link-ul",
  });

export type StatisticsData = z.infer<typeof statisticsSchema>;
export type Stat = z.infer<typeof statSchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.refine` chain makes that throw.
 * `statistici: []` is intentionally invalid so a blank draft can't pass
 * validation when the admin clicks "Adaugă blocul".
 */
export const STATISTICS_DEFAULTS: StatisticsData = {
  titlu: "",
  subtitlu: "",
  descriere: "",
  statistici: [],
  coloane: "2",
  separator: false,
  primaryCta: { label: "", href: "" },
  secondaryCta: { label: "", href: "" },
};

export const EMPTY_STAT: Stat = { valoare: "", eticheta: "", descriere: "" };
