import { z } from "zod";

const columnSchema = z.object({
  titlu: z.string().trim().default(""),
  text: z.string().trim().default(""),
});

export const columnsSchema = z
  .object({
    numarColoane: z.enum(["2", "3"]).default("2"),
    coloane: z.array(columnSchema).default([]),
  })
  .refine((d) => d.coloane.length > 0, {
    path: ["coloane"],
    message: "Adaugă cel puțin o coloană",
  })
  .refine((d) => d.coloane.every((c) => c.text), {
    path: ["coloane"],
    message: "Fiecare coloană are nevoie de text",
  });

export type ColumnsData = z.infer<typeof columnsSchema>;
export type Column = z.infer<typeof columnSchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.refine` chain makes that throw.
 * `coloane: []` is intentionally invalid so a blank draft can't pass validation
 * when the admin clicks "Adaugă blocul". The page-builder has no nested-block
 * model yet, so each column holds text, not other blocks.
 */
export const COLUMNS_DEFAULTS: ColumnsData = {
  numarColoane: "2",
  coloane: [],
};

export const EMPTY_COLUMN: Column = { titlu: "", text: "" };
