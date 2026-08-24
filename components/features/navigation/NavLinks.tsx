"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LinkPendingIndicator } from "@/components/ui/LinkPendingIndicator";
import { NAV_LINKS } from "./nav-data";

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {NAV_LINKS.map((l) => {
        const isActive = pathname === l.href;
        return (
          <Link
            key={l.label}
            href={l.href}
            onClick={onNavigate}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive
                ? "text-foreground bg-muted font-semibold"
                : "text-muted-foreground font-medium hover:text-foreground hover:bg-muted"
            }`}
          >
            {l.label}
            <LinkPendingIndicator />
          </Link>
        );
      })}
    </>
  );
}
