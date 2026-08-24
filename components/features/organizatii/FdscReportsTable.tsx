import { Download, Eye } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import type { OngFdscReport } from "@/lib/api/ongs";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso),
  );
}

const FILE_TYPE_STYLES: Record<string, { label: string; background: string; color: string }> = {
  ".pdf": { label: "PDF", background: "#fef2f2", color: "#dc2626" },
  ".doc": { label: "DOC", background: "#eff6ff", color: "#2563eb" },
  ".docx": { label: "DOC", background: "#eff6ff", color: "#2563eb" },
  ".xls": { label: "XLS", background: "#f0fdf4", color: "#16a34a" },
  ".xlsx": { label: "XLS", background: "#f0fdf4", color: "#16a34a" },
};

function fileTypeBadge(ext: string | undefined) {
  const key = ext?.toLowerCase() ?? "";
  const fallbackLabel = key.replace(/^\./, "").slice(0, 4).toUpperCase() || "?";
  return FILE_TYPE_STYLES[key] ?? { label: fallbackLabel, background: "#f1f5f9", color: "#64748b" };
}

export function FdscReportsTable({ reports }: { reports: OngFdscReport[] }) {
  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">Nu există niciun raport pentru această organizație.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            {["Denumire raport", "Program", "Data încărcării", "Acțiuni"].map((h) => (
              <th
                key={h}
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                style={{ color: "#94a3b8" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => {
            const fileUrl = report.file ? getMediaUrl(report.file.url) : null;
            const isPdf = report.file?.ext?.toLowerCase() === ".pdf";
            const badge = fileTypeBadge(report.file?.ext);
            return (
              <tr key={report.documentId} className="border-b border-border last:border-0">
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-2.5 font-semibold" style={{ color: "#162040" }}>
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                      style={{ background: badge.background, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                    {report.name}
                  </span>
                </td>
                <td className="px-5 py-3.5" style={{ color: "#64748b" }}>
                  {report.program?.name ?? "—"}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap" style={{ color: "#64748b" }}>
                  {formatDate(report.uploadedAt)}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  {fileUrl ? (
                    <div className="flex items-center gap-2">
                      {isPdf && (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-slate-50 transition-colors"
                          style={{ color: "#334155" }}
                        >
                          <Eye size={13} /> Vezi
                        </a>
                      )}
                      <a
                        href={fileUrl}
                        download={report.file?.name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-slate-50 transition-colors"
                        style={{ color: "#334155" }}
                      >
                        <Download size={13} /> Descarcă
                      </a>
                    </div>
                  ) : (
                    <span style={{ color: "#94a3b8" }}>—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
