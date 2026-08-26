// lib/utils/fdsc-report.ts
const FILE_TYPE_STYLES: Record<string, { label: string; background: string; color: string }> = {
  ".pdf": { label: "PDF", background: "#fef2f2", color: "#dc2626" },
  ".doc": { label: "DOC", background: "#eff6ff", color: "#2563eb" },
  ".docx": { label: "DOC", background: "#eff6ff", color: "#2563eb" },
  ".xls": { label: "XLS", background: "#f0fdf4", color: "#16a34a" },
  ".xlsx": { label: "XLS", background: "#f0fdf4", color: "#16a34a" },
};

export function fileTypeBadge(ext: string | undefined) {
  const key = ext?.toLowerCase() ?? "";
  const fallbackLabel = key.replace(/^\./, "").slice(0, 4).toUpperCase() || "?";
  return FILE_TYPE_STYLES[key] ?? { label: fallbackLabel, background: "#f1f5f9", color: "#64748b" };
}
