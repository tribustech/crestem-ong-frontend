// lib/utils/date.ts
export function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const [year, month, day] = iso.slice(0, 10).split("-");
  if (!year || !month || !day) return "—";
  return `${day}.${month}.${year}`;
}

const RO_MONTHS = [
  "ianuarie",
  "februarie",
  "martie",
  "aprilie",
  "mai",
  "iunie",
  "iulie",
  "august",
  "septembrie",
  "octombrie",
  "noiembrie",
  "decembrie",
];

/**
 * `2025-03-17` → `17 martie 2025`. Built from the ISO parts rather than
 * `toLocaleDateString`, so a date-only string never shifts a day across
 * timezones the way `new Date("2025-03-17")` (parsed as UTC) can.
 */
export function formatLongDate(iso?: string | null) {
  if (!iso) return "—";
  const [year, month, day] = iso.slice(0, 10).split("-");
  const monthName = RO_MONTHS[Number(month) - 1];
  if (!year || !day || !monthName) return "—";
  return `${Number(day)} ${monthName} ${year}`;
}
