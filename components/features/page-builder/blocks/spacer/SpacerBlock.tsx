import type { SpacerData } from "./schema";

/** Full literal classes so the Tailwind scanner picks them up. */
const HEIGHT_CLASS: Record<SpacerData["dimensiune"], string> = {
  mic: "h-8",
  mediu: "h-16",
  mare: "h-24",
  "foarte-mare": "h-32",
};

/**
 * "Structure – Spacer" — a fixed vertical gap between blocks. Pure (no hooks,
 * no `"use client"`) so it renders on the public page unchanged once a backend
 * feeds it the same data shape.
 */
export function SpacerBlock({ data }: { data: SpacerData }) {
  return <div aria-hidden="true" className={HEIGHT_CLASS[data.dimensiune]} />;
}
