import type { ReactNode } from "react";

/**
 * The "Panou principal" counter card: value first, then the label, then an
 * optional caption. Deliberately separate from `OverviewStatCard`, which stacks
 * label-above-value and is used by the organization overview pages.
 */

export type StatTone = "neutral" | "violet" | "amber" | "teal";

/**
 * The headline number's color. Distinct hues rather than semantic states — they
 * separate adjacent counters at a glance.
 */
export type StatValueTone =
  | "primary"
  | "teal"
  | "blue"
  | "violet"
  | "red"
  | "orange"
  | "green";

const TONE_CLASSES: Record<StatTone, string> = {
  neutral: "bg-background border-border",
  violet: "bg-tint-violet border-tint-violet-border",
  amber: "bg-tint-amber border-tint-amber-border",
  teal: "bg-tint-teal border-tint-teal-border",
};

const VALUE_TONE_CLASSES: Record<StatValueTone, string> = {
  primary: "text-primary",
  teal: "text-value-teal",
  blue: "text-value-blue",
  violet: "text-value-violet",
  red: "text-value-red",
  orange: "text-value-orange",
  green: "text-value-green",
};

interface DashboardStatCardProps {
  value: ReactNode;
  label: string;
  /** Small muted line under the label, e.g. `2 active`. */
  caption?: string;
  valueTone?: StatValueTone;
  tone?: StatTone;
}

export function DashboardStatCard({
  value,
  label,
  caption,
  valueTone = "primary",
  tone = "neutral",
}: DashboardStatCardProps) {
  return (
    <div className={`rounded-xl border p-5 ${TONE_CLASSES[tone]}`}>
      <p
        className={`text-3xl font-heading font-extrabold leading-none ${VALUE_TONE_CLASSES[valueTone]}`}
      >
        {value}
      </p>
      <p className="mt-3 text-sm font-medium text-primary">{label}</p>
      {caption && <p className="mt-0.5 text-xs text-muted-foreground">{caption}</p>}
    </div>
  );
}
