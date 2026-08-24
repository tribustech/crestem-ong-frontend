import { LayoutGrid } from "lucide-react";

/**
 * The "va fi disponibilă în curând" block. Sits in the page flow rather than
 * inside a card, matching the FDSC design.
 */
export function DashboardEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center py-20">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-surface-placeholder">
        <LayoutGrid size={20} className="text-muted-foreground" />
      </div>
      <p className="font-heading font-bold text-primary">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
