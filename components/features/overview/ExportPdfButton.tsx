"use client";

import { Download } from "lucide-react";

export function ExportPdfButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-slate-50 transition-colors"
      style={{ color: "#334155" }}
    >
      <Download size={14} /> Exportă
    </button>
  );
}
