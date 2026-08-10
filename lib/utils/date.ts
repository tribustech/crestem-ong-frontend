// lib/utils/date.ts
export function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const [year, month, day] = iso.slice(0, 10).split("-");
  if (!year || !month || !day) return "—";
  return `${day}.${month}.${year}`;
}
