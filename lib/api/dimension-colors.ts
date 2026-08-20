export function dimensionColor(score: number | null) {
  if (score == null) return "#94a3b8";
  if (score >= 60) return "#2dbe8f";
  if (score >= 35) return "#f59e0b";
  return "#ef4444";
}

export function dimensionPillStyle(score: number | null) {
  if (score == null) return { background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" };
  if (score >= 60) return { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" };
  if (score >= 35) return { background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" };
  return { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" };
}

export function dimensionLabel(score: number | null) {
  if (score == null) return "—";
  if (score >= 60) return "Ridicat";
  if (score >= 35) return "Mediu";
  return "Scăzut";
}
