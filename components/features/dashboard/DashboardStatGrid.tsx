import type { ReactNode } from "react";

export function DashboardStatGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">{children}</div>
  );
}
