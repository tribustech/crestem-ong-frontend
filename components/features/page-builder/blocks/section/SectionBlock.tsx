import type { SectionData } from "./schema";

/** Full literal classes so the Tailwind scanner picks them up. */
const BG_CLASS: Record<SectionData["fundal"], string> = {
  alb: "bg-white",
  gri: "bg-[#f8fafc]",
  navy: "bg-[#162040]",
  teal: "bg-[#2dbe8f]/10",
};

const PAD_CLASS: Record<SectionData["spatiere"], string> = {
  mic: "py-10",
  mediu: "py-16",
  mare: "py-24",
};

const WIDTH_CLASS: Record<SectionData["latime"], string> = {
  ingust: "max-w-3xl",
  standard: "max-w-5xl",
  larg: "max-w-6xl",
};

/**
 * "Structure – Section" — a full-width band with a background colour, vertical
 * padding and an optional heading + intro paragraph. The page-builder has no
 * nested-block model yet, so this is a standalone band rather than a container
 * that wraps other blocks. Pure (no hooks, no `"use client"`).
 */
export function SectionBlock({ data }: { data: SectionData }) {
  const { fundal, spatiere, latime, titlu, text } = data;
  const isDark = fundal === "navy";

  return (
    <section className={BG_CLASS[fundal]}>
      <div
        className={`mx-auto px-6 ${PAD_CLASS[spatiere]} ${WIDTH_CLASS[latime]}`}
      >
        {titlu ? (
          <h2
            className="font-heading wrap-break-word"
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              fontWeight: 800,
              lineHeight: 1.2,
              color: isDark ? "#ffffff" : "#162040",
            }}
          >
            {titlu}
          </h2>
        ) : null}
        {text ? (
          <p
            className={`text-lg wrap-break-word ${titlu ? "mt-4" : ""} ${
              isDark ? "text-white/80" : "text-[#475569]"
            }`}
          >
            {text}
          </p>
        ) : null}
      </div>
    </section>
  );
}
