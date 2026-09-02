import Link from "next/link";

export const EVALUARI_TABS = [
  { key: "utilizatori", label: "Evaluări per utilizator" },
  { key: "organizatii", label: "Evaluări per organizație" },
] as const;

export type EvaluariTab = (typeof EVALUARI_TABS)[number]["key"];

export function isEvaluariTab(value?: string): value is EvaluariTab {
  return EVALUARI_TABS.some((tab) => tab.key === value);
}

/**
 * Switching tabs drops the filters of the tab being left: the two tabs search
 * different things (a respondent's address against an organization's fiscal
 * code), so carrying a term across would return nothing and look broken.
 */
export function EvaluariTabs({ active }: { active: EvaluariTab }) {
  return (
    <div className="flex gap-1 mb-6 border-b border-border" role="tablist">
      {EVALUARI_TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={`/dashboard/evaluari?tab=${tab.key}`}
            role="tab"
            aria-selected={isActive}
            className="px-4 py-2.5 text-sm font-semibold -mb-px border-b-2 transition-colors"
            style={
              isActive
                ? { borderColor: "#2dbe8f", color: "#162040" }
                : { borderColor: "transparent", color: "#94a3b8" }
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
