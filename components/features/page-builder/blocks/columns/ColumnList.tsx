"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { EMPTY_COLUMN, type Column } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";
const optionalHint = "font-normal normal-case text-[#94a3b8]";

/**
 * The "Coloane" repeater: add / reorder / delete columns, each with an optional
 * Titlu and a required Text. Co-located with the block.
 */
export function ColumnList({
  value,
  onChange,
  error,
}: {
  value: Column[];
  onChange: (next: Column[]) => void;
  error?: string;
}) {
  const update = (index: number, patch: Partial<Column>) =>
    onChange(value.map((c, i) => (i === index ? { ...c, ...patch } : c)));

  const remove = (index: number) =>
    onChange(value.filter((_, i) => i !== index));

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#475569]">
          Coloane
        </span>
        <span className="text-xs text-[#94a3b8]">{value.length} adăugate</span>
      </div>

      {value.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-[#94a3b8]">
          Nicio coloană adăugată încă.
        </p>
      ) : (
        <ul className="space-y-3">
          {value.map((column, index) => (
            <li
              key={index}
              className="rounded-xl border border-border bg-slate-50/60 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-[#162040]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#162040] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="truncate">
                    {column.titlu || "fără titlu"}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Mută mai sus"
                    className="rounded-lg p-1.5 text-[#475569] transition-colors hover:bg-slate-200 disabled:opacity-40"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === value.length - 1}
                    aria-label="Mută mai jos"
                    className="rounded-lg p-1.5 text-[#475569] transition-colors hover:bg-slate-200 disabled:opacity-40"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label="Elimină coloana"
                    className="rounded-lg p-1.5 text-[#ef4444] transition-colors hover:bg-[#fef2f2]"
                  >
                    <Trash2 size={16} />
                  </button>
                </span>
              </div>

              <div>
                <label htmlFor={`column-${index}-titlu`} className={labelClass}>
                  Titlu <span className={optionalHint}>(opțional)</span>
                </label>
                <input
                  id={`column-${index}-titlu`}
                  className={inputClass}
                  value={column.titlu}
                  onChange={(e) => update(index, { titlu: e.target.value })}
                  placeholder="Misiunea noastră"
                />
              </div>
              <div className="mt-3">
                <label htmlFor={`column-${index}-text`} className={labelClass}>
                  Text
                </label>
                <textarea
                  id={`column-${index}-text`}
                  rows={3}
                  className={inputClass}
                  value={column.text}
                  onChange={(e) => update(index, { text: e.target.value })}
                  placeholder="Sprijinim organizațiile locale să crească sustenabil și să-și mărească impactul."
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-1 text-xs text-[#ef4444]">{error}</p>}

      <button
        type="button"
        onClick={() => onChange([...value, { ...EMPTY_COLUMN }])}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm font-semibold text-[#475569] transition-colors hover:border-[#2dbe8f] hover:text-[#162040]"
      >
        <Plus size={16} /> Adaugă coloană
      </button>
    </div>
  );
}
