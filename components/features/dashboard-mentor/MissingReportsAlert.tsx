import Link from "next/link";
import { AlertCircle } from "lucide-react";
import type { MentorMeetingRef } from "@/lib/api/dashboard";
import { formatShortDate } from "@/lib/utils/date";

/**
 * Warns about held meetings still missing their report. Rendered only when
 * there is something to warn about — unlike the other sections, an empty
 * version of this block would be noise.
 */
export function MissingReportsAlert({
  meetings,
  total,
}: {
  meetings: MentorMeetingRef[];
  /** Full count; `meetings` is capped at five by the backend. */
  total: number;
}) {
  if (meetings.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border p-5 mb-6 bg-warning-surface border-warning-border">
      <div className="flex gap-3">
        <AlertCircle size={18} className="shrink-0 mt-0.5 text-warning-icon" />
        <div className="min-w-0 flex-1">
          <h2 className="font-heading font-bold text-sm text-warning-strong">
            {total === 1
              ? "Ai o întâlnire fără raport completat"
              : `Ai ${total} întâlniri fără raport completat`}
          </h2>
          <ul className="mt-1.5">
            {meetings.map((meeting) => (
              <li
                key={meeting.documentId}
                className="flex items-baseline justify-between gap-4 py-0.5 text-sm text-warning-muted"
              >
                <span className="truncate">
                  {meeting.ongName} · {meeting.subiect} ·{" "}
                  {formatShortDate(meeting.dataOra)}
                </span>
                <Link
                  href="/dashboard/mentor/intalniri"
                  className="shrink-0 font-semibold hover:underline text-warning-strong"
                >
                  Completează →
                </Link>
              </li>
            ))}
          </ul>
          {total > meetings.length && (
            <p className="mt-1.5 text-xs text-warning-muted">
              și încă {total - meetings.length}{" "}
              {total - meetings.length === 1 ? "întâlnire" : "întâlniri"}.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
