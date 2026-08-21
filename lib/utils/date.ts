// lib/utils/date.ts
export function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const [year, month, day] = iso.slice(0, 10).split("-");
  if (!year || !month || !day) return "—";
  return `${day}.${month}.${year}`;
}

export function formatShortDate(iso?: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Bucharest",
  })
    .format(date)
    .replace(".", "");
}

export function formatMeetingDateTime(iso: string) {
  const date = new Date(iso);
  const datePart = new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Bucharest",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Bucharest",
  }).format(date);
  return `${datePart} · ${timePart}`;
}
