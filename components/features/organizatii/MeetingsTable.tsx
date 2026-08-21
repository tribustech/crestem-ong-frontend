"use client";

import { useState } from "react";
import { Download, Info } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import { formatMeetingDateTime } from "@/lib/utils/date";
import type { OngMeeting } from "@/lib/api/meetings";
import type { Dimension } from "@/lib/api/dimensions";
import { MeetingDetailsModal } from "./MeetingDetailsModal";

const STATUS_BADGES: Record<OngMeeting["status"], { label: string; bg: string; color: string }> = {
  programata: { label: "Programată", bg: "#eff6ff", color: "#2563eb" },
  efectuata: { label: "Efectuată", bg: "#f0fdf4", color: "#16a34a" },
  anulata: { label: "Anulată", bg: "#fef2f2", color: "#dc2626" },
};

const FORMAT_LABELS: Record<OngMeeting["format"], string> = {
  online: "Online",
  fata_in_fata: "Față în față",
};

export function MeetingsTable({
  meetings,
  ongName,
  dimensions,
}: {
  meetings: OngMeeting[];
  ongName: string;
  dimensions: Dimension[];
}) {
  const [openMeetingId, setOpenMeetingId] = useState<string | null>(null);
  const openMeeting = meetings.find((meeting) => meeting.documentId === openMeetingId) ?? null;

  if (meetings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Nicio întâlnire nu corespunde filtrelor selectate.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            {["Persoană resursă", "Data și ora", "Format", "Status", "Program", "Raport", "Acțiuni"].map((h) => (
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
          {meetings.map((meeting) => {
            const statusBadge = STATUS_BADGES[meeting.status];
            const fileUrl = meeting.report ? getMediaUrl(meeting.report.url) : null;
            return (
              <tr key={meeting.documentId} className="border-b border-border last:border-0">
                <td className="px-5 py-3.5 font-semibold whitespace-nowrap" style={{ color: "#162040" }}>
                  {meeting.mentor?.nume ?? "—"}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap" style={{ color: "#64748b" }}>
                  {formatMeetingDateTime(meeting.dataOra)}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: "#f1f5f9", color: "#475569" }}
                  >
                    {FORMAT_LABELS[meeting.format]}
                  </span>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: statusBadge.bg, color: statusBadge.color }}
                  >
                    {statusBadge.label}
                  </span>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap" style={{ color: "#64748b" }}>
                  {meeting.program?.name ?? "—"}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  {fileUrl ? (
                    <a
                      href={fileUrl}
                      download={meeting.report?.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-slate-50 transition-colors"
                      style={{ color: "#334155" }}
                    >
                      <Download size={13} /> Descarcă raport
                    </a>
                  ) : (
                    <span style={{ color: "#94a3b8" }}>—</span>
                  )}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => setOpenMeetingId(meeting.documentId)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-slate-50 transition-colors"
                    style={{ color: "#334155" }}
                  >
                    <Info size={13} /> Detalii
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {openMeeting && (
        <MeetingDetailsModal
          meeting={openMeeting}
          ongName={ongName}
          dimensions={dimensions}
          onClose={() => setOpenMeetingId(null)}
        />
      )}
    </div>
  );
}
