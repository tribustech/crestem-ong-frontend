"use client";

import { useState } from "react";
import { Layers, X } from "lucide-react";
import type { Dimension } from "@/lib/api/dimensions";

const DIMENSION_LETTERS = "ABCDEFGHIJ";

export function MatrixModelButton({ dimensions }: { dimensions: Dimension[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-border hover:bg-slate-50 transition-colors"
        style={{ color: "#475569" }}
      >
        <Layers size={13} /> Vezi modelul matricei
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="matrix-model-title"
        >
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 id="matrix-model-title" className="font-heading font-extrabold text-lg" style={{ color: "#162040" }}>
                Modelul matricei de evaluare
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Închide"
                className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                style={{ color: "#94a3b8" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dimensions.map((dimension, index) => {
                  const letter = DIMENSION_LETTERS[index] ?? String(index + 1);
                  return (
                    <div key={dimension.key} className="bg-white rounded-2xl border border-border p-4">
                      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#2dbe8f" }}>
                        Dimensiunea {letter}
                      </p>
                      <h3 className="text-sm font-heading font-extrabold mb-3" style={{ color: "#162040" }}>
                        {dimension.name}
                      </h3>
                      <ul className="space-y-1.5">
                        {dimension.quiz.map((question) => (
                          <li key={question.id} className="flex items-start gap-2 text-sm" style={{ color: "#334155" }}>
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                              style={{ background: "#2dbe8f" }}
                            />
                            {question.tag ?? question.question}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
