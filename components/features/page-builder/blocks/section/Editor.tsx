"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { SectionData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";
const optionalHint = "font-normal normal-case text-[#94a3b8]";

export function SectionEditor({
  value,
  onChange,
}: {
  value: SectionData;
  onChange: (next: SectionData) => void;
}) {
  const set = (patch: Partial<SectionData>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <span className={labelClass}>Fundal</span>
        <SegmentedControl
          ariaLabel="Fundal"
          value={value.fundal}
          onChange={(fundal) => set({ fundal })}
          options={[
            { value: "alb", label: "Alb" },
            { value: "gri", label: "Gri" },
            { value: "navy", label: "Navy" },
            { value: "teal", label: "Teal" },
          ]}
        />
      </div>

      <div>
        <span className={labelClass}>Spațiere</span>
        <SegmentedControl
          ariaLabel="Spațiere"
          value={value.spatiere}
          onChange={(spatiere) => set({ spatiere })}
          options={[
            { value: "mic", label: "Mică" },
            { value: "mediu", label: "Medie" },
            { value: "mare", label: "Mare" },
          ]}
        />
      </div>

      <div>
        <span className={labelClass}>Lățime conținut</span>
        <SegmentedControl
          ariaLabel="Lățime conținut"
          value={value.latime}
          onChange={(latime) => set({ latime })}
          options={[
            { value: "ingust", label: "Îngust" },
            { value: "standard", label: "Standard" },
            { value: "larg", label: "Larg" },
          ]}
        />
      </div>

      <div>
        <label htmlFor="section-titlu" className={labelClass}>
          Titlu <span className={optionalHint}>(opțional)</span>
        </label>
        <input
          id="section-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="Despre programul nostru"
        />
      </div>

      <div>
        <label htmlFor="section-text" className={labelClass}>
          Text <span className={optionalHint}>(opțional)</span>
        </label>
        <textarea
          id="section-text"
          rows={3}
          className={inputClass}
          value={value.text}
          onChange={(e) => set({ text: e.target.value })}
          placeholder="Un paragraf introductiv pentru secțiunea de mai jos."
        />
      </div>
    </div>
  );
}
