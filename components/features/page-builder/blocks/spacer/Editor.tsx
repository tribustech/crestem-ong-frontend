"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { SpacerData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";

export function SpacerEditor({
  value,
  onChange,
}: {
  value: SpacerData;
  onChange: (next: SpacerData) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <span className={labelClass}>Dimensiune</span>
        <SegmentedControl
          ariaLabel="Dimensiune"
          value={value.dimensiune}
          onChange={(dimensiune) => onChange({ ...value, dimensiune })}
          options={[
            { value: "mic", label: "Mic" },
            { value: "mediu", label: "Mediu" },
            { value: "mare", label: "Mare" },
            { value: "foarte-mare", label: "Foarte mare" },
          ]}
        />
      </div>
    </div>
  );
}
