import { Calendar, Clock } from "lucide-react";
import type { MentorDashboard } from "@/lib/api/dashboard";

const FORMAT_LABELS: Record<string, string> = {
  online: "Online",
  fata_in_fata: "Față în față",
};

const dateParts = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return { day: "—", time: "—" };
  }
  return {
    day: new Intl.DateTimeFormat("ro-RO", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Europe/Bucharest",
    })
      .format(date)
      .replace(".", ""),
    time: new Intl.DateTimeFormat("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/Bucharest",
    }).format(date),
  };
};

export function NextMeetingBanner({
  meeting,
}: {
  meeting: MentorDashboard["nextMeeting"];
}) {
  if (!meeting) {
    return (
      <section className="bg-background rounded-xl border border-border p-5 mb-6">
        <p className="text-sm text-muted-foreground">
          Nu ai nicio întâlnire programată.
        </p>
      </section>
    );
  }

  const { day, time } = dateParts(meeting.dataOra);

  return (
    <section className="rounded-2xl p-6 mb-6 flex items-start justify-between gap-4 bg-primary">
      <div className="flex items-center gap-4 min-w-0">
        <span
          aria-hidden="true"
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-accent/15"
        >
          <Calendar size={20} className="text-accent" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Următoarea întâlnire
          </p>
          <p className="mt-1 font-heading font-bold text-white truncate">
            {meeting.ongName}
          </p>
          <p className="text-sm text-white/70 truncate">{meeting.subiect}</p>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="font-heading font-bold text-white whitespace-nowrap">{day}</p>
        <p className="mt-1 flex items-center justify-end gap-1.5 text-sm text-white/70">
          <Clock size={13} aria-hidden="true" /> {time}
        </p>
        <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold text-white/80 bg-white/10">
          {FORMAT_LABELS[meeting.format] ?? meeting.format}
        </span>
      </div>
    </section>
  );
}
