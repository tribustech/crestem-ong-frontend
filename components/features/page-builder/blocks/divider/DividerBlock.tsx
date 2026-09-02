import type { DividerData } from "./schema";

/** Full literal classes so the Tailwind scanner picks them up. */
const STYLE_CLASS: Record<DividerData["stil"], string> = {
  solid: "border-solid",
  dashed: "border-dashed",
  dotted: "border-dotted",
};

const WIDTH_CLASS: Record<DividerData["latime"], string> = {
  complet: "max-w-none",
  ingust: "max-w-3xl",
};

const SPACING_CLASS: Record<DividerData["spatiere"], string> = {
  mic: "py-6",
  mediu: "py-12",
  mare: "py-20",
};

/**
 * "Structure – Divider" — a horizontal rule with a configurable line style,
 * width and surrounding space. Pure (no hooks, no `"use client"`) so it renders
 * on the public page unchanged once a backend feeds it the same data shape.
 */
export function DividerBlock({ data }: { data: DividerData }) {
  const { stil, latime, spatiere } = data;

  return (
    <div className={`px-6 ${SPACING_CLASS[spatiere]}`}>
      <hr
        className={`mx-auto border-0 border-t border-border ${STYLE_CLASS[stil]} ${WIDTH_CLASS[latime]}`}
      />
    </div>
  );
}
