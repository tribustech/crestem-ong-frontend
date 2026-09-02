"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ColumnList } from "./ColumnList";
import type { BlockFieldErrors } from "../../types";
import type { ColumnsData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";

export function ColumnsEditor({
  value,
  onChange,
  errors,
}: {
  value: ColumnsData;
  onChange: (next: ColumnsData) => void;
  errors: BlockFieldErrors;
}) {
  const set = (patch: Partial<ColumnsData>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <span className={labelClass}>Număr de coloane</span>
        <SegmentedControl
          ariaLabel="Număr de coloane"
          value={value.numarColoane}
          onChange={(numarColoane) => set({ numarColoane })}
          options={[
            { value: "2", label: "2 coloane" },
            { value: "3", label: "3 coloane" },
          ]}
        />
        <p className="mt-1 text-xs text-[#94a3b8]">
          Coloanele se așază una sub alta pe ecrane mici.
        </p>
      </div>

      <ColumnList
        value={value.coloane}
        onChange={(coloane) => set({ coloane })}
        error={errors.coloane}
      />
    </div>
  );
}
