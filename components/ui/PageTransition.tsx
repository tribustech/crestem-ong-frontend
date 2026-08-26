"use client";

import { usePathname } from "next/navigation";

/**
 * Route prefixes whose sub-routes are tabs sharing one persistent layout
 * (header + tab bar rendered once by a parent `layout.tsx`, e.g.
 * `OrgDetailChrome`). Keying the transition on the full pathname would
 * remount that shared chrome — and flash it — on every tab click, so
 * navigations within one of these prefixes reuse the same key instead.
 */
const STABLE_TAB_PREFIXES = [/^\/dashboard\/fdsc\/organizatii\/[^/]+/];

function transitionKeyFor(pathname: string) {
  for (const prefix of STABLE_TAB_PREFIXES) {
    const match = pathname.match(prefix);
    if (match) return match[0];
  }
  return pathname;
}

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
    <div key={transitionKeyFor(pathname)} className={`animate-page-enter ${className}`}>
      {children}
    </div>
  );
}
