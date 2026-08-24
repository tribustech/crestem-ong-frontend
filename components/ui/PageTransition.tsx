"use client";

import { usePathname } from "next/navigation";

/**
 * Fades/slides in the content of each route. Keyed on the pathname so React
 * remounts the subtree on navigation and the enter animation replays; without
 * the key the new page would just pop into place.
 */
export function PageTransition({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div key={pathname} className={`animate-page-enter ${className}`}>
      {children}
    </div>
  );
}
