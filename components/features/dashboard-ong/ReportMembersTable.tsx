"use client";

import { useState } from "react";
import { Plus, CheckCircle2, Clock, AlertCircle, XCircle, Mail } from "lucide-react";
import { AddReportMembersModal } from "./AddReportMembersModal";
import type { OngMember, ReportMember } from "@/lib/api/reports";

function formatDate(iso: string) {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
}

const MEMBER_STATUS_LABELS: Record<string, string> = {
  neinceput: "Neînceput",
  in_lucru: "În progres",
  completat: "Completat",
  nefinalizat: "Nefinalizat",
};

const MEMBER_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  neinceput: { bg: "#f8fafc", color: "#94a3b8" },
  in_lucru: { bg: "#fefce8", color: "#ca8a04" },
  completat: { bg: "#f0fdf4", color: "#16a34a" },
  nefinalizat: { bg: "#fff5f5", color: "#dc2626" },
};

const MEMBER_STATUS_ICONS: Record<string, typeof CheckCircle2> = {
  neinceput: AlertCircle,
  in_lucru: Clock,
  completat: CheckCircle2,
  nefinalizat: XCircle,
};

export function ReportMembersTable({
  reportId,
  invited,
  candidates,
  canAddMembers,
}: {
  reportId: string;
  invited: ReportMember[];
  candidates: OngMember[];
  canAddMembers: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const completedCount = invited.filter((entry) => entry.status === "completat").length;

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-base" style={{ color: "#162040" }}>
            Utilizatori invitați
          </h2>
          {invited.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#f0faf6", color: "#2dbe8f" }}>
              {completedCount} / {invited.length} completat
            </span>
          )}
        </div>
        {canAddMembers && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#162040" }}
          >
            <Plus size={13} /> Adaugă utilizatori
          </button>
        )}
      </div>

      {invited.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-muted-foreground">Niciun membru invitat încă.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["Utilizator", "Status", "Completat la", "Acțiuni"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#94a3b8" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invited.map((entry) => {
              const statusColor = MEMBER_STATUS_COLORS[entry.status] ?? MEMBER_STATUS_COLORS.neinceput;
              const StatusIcon = MEMBER_STATUS_ICONS[entry.status] ?? AlertCircle;
              return (
                <tr key={entry.documentId} className="border-b border-border last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold" style={{ color: "#162040" }}>{entry.user?.nume ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{entry.user?.email ?? "—"}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: statusColor.bg, color: statusColor.color }}
                    >
                      <StatusIcon size={11} /> {MEMBER_STATUS_LABELS[entry.status] ?? entry.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "#64748b" }}>
                    {entry.completedAt ? formatDate(entry.completedAt.slice(0, 10)) : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    {entry.status !== "completat" && (
                      <button
                        type="button"
                        disabled
                        title="Retrimiterea invitației nu este disponibilă încă"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border opacity-40 cursor-not-allowed"
                        style={{ color: "#475569" }}
                      >
                        <Mail size={11} /> Trimite reminder
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {adding && (
        <AddReportMembersModal reportId={reportId} candidates={candidates} onClose={() => setAdding(false)} />
      )}
    </div>
  );
}
