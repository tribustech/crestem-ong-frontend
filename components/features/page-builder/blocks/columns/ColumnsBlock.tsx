import type { ColumnsData } from "./schema";

/**
 * "Structure – Columns" — a two- or three-column text layout that collapses to a
 * single column below `md`. Each column shows an optional bold heading and a
 * body paragraph. The page-builder has no nested-block model yet, so a column
 * holds text, not other blocks. Pure (no hooks, no `"use client"`).
 */
export function ColumnsBlock({ data }: { data: ColumnsData }) {
  const { numarColoane, coloane } = data;

  if (coloane.length === 0) return null;

  return (
    <section>
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div
          className={
            numarColoane === "3"
              ? "grid gap-8 md:grid-cols-3"
              : "grid gap-8 md:grid-cols-2"
          }
        >
          {coloane.map((column, index) => (
            <div key={index}>
              {column.titlu ? (
                <p className="font-semibold text-[#162040] wrap-break-word">
                  {column.titlu}
                </p>
              ) : null}
              <p
                className={`text-sm text-[#475569] wrap-break-word ${
                  column.titlu ? "mt-1.5" : ""
                }`}
              >
                {column.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
