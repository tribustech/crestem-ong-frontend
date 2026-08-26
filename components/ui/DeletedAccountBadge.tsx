/**
 * Marks a person resource who deleted their account. They stay listed wherever
 * they were already assigned — conversations, meetings, reports — so the
 * organization keeps its history, but nothing about them is actionable any
 * more. Same shape as the "Retras" badge organizations get after `Șterge ONG`.
 */
export function DeletedAccountBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 ${className}`}
    >
      Cont șters
    </span>
  );
}
