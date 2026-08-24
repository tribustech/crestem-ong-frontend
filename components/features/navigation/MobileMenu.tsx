"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, User } from "lucide-react";
import { LinkPendingIndicator } from "@/components/ui/LinkPendingIndicator";
import { DESPRE_SUBMENU, NAV_LINKS } from "./nav-data";
import type { NavUser } from "./nav-data";

export function MobileMenu({ user }: { user: NavUser | null }) {
  const pathname = usePathname();

  // Both panels remember the pathname they were opened on rather than a plain
  // boolean, so they close by themselves once navigation completes. That keeps
  // a tapped link visible — with its pending spinner — until the new page is
  // actually rendered. Tapping the current page closes directly, since the
  // pathname never changes in that case.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const [despreOpenedAt, setDespreOpenedAt] = useState<string | null>(null);
  const open = openedAt !== null && openedAt === pathname;
  const despreOpen = open && despreOpenedAt === pathname;

  const close = () => {
    setOpenedAt(null);
    setDespreOpenedAt(null);
  };

  const closeIfSamePage = (href: string) => () => {
    if (href === pathname) close();
  };

  return (
    <>
      <button
        className="md:hidden p-2 rounded-lg hover:bg-muted"
        onClick={() => setOpenedAt(open ? null : pathname)}
        aria-label={open ? "Închide meniul" : "Deschide meniul"}
        aria-expanded={open}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-border px-6 py-4 flex flex-col gap-1">
          <button
            onClick={() => setDespreOpenedAt(despreOpen ? null : pathname)}
            className="py-3 px-3 rounded-lg text-sm font-medium text-left flex items-center justify-between text-foreground hover:bg-muted transition-colors"
          >
            Despre noi
            <ChevronDown size={14} className={`transition-transform duration-200 ${despreOpen ? "rotate-180" : ""}`} />
          </button>
          {despreOpen && (
            <div className="pl-4 flex flex-col gap-0.5">
              {DESPRE_SUBMENU.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeIfSamePage(item.href)}
                  className="flex items-center justify-between gap-2 py-2.5 px-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {item.label}
                  <LinkPendingIndicator />
                </Link>
              ))}
            </div>
          )}
          {NAV_LINKS.map((l) => {
            const isActive = pathname === l.href;
            return (
              <Link
                key={l.label}
                href={l.href}
                onClick={closeIfSamePage(l.href)}
                className={`flex items-center justify-between gap-2 py-3 px-3 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-muted font-semibold" : "text-foreground"}`}
              >
                {l.label}
                <LinkPendingIndicator />
              </Link>
            );
          })}
          <div className="mt-2 border-t border-border pt-3 flex flex-col gap-2">
            {user ? (
              <>
                <p
                  className="flex items-center gap-1.5 px-3 text-sm font-medium truncate"
                  style={{ color: "#162040" }}
                >
                  <User size={16} className="shrink-0" />
                  {user.nume}
                </p>
                <Link
                  href={user.dashboardHref}
                  onClick={closeIfSamePage(user.dashboardHref)}
                  className="flex items-center justify-center gap-2 py-3 text-center rounded-lg text-sm font-semibold text-white"
                  style={{ background: "#2dbe8f" }}
                >
                  Mergi la dashboard
                  <LinkPendingIndicator />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/autentificare"
                  onClick={closeIfSamePage("/autentificare")}
                  className="flex items-center justify-center gap-2 py-3 text-center rounded-lg text-sm font-medium transition-colors hover:bg-muted"
                  style={{ color: "#162040", border: "1.5px solid #e2e8f0" }}
                >
                  Intră în cont
                  <LinkPendingIndicator />
                </Link>
                <Link
                  href="/inregistrare"
                  onClick={closeIfSamePage("/inregistrare")}
                  className="flex items-center justify-center gap-2 py-3 text-center rounded-lg text-sm font-semibold text-white"
                  style={{ background: "#2dbe8f" }}
                >
                  Înregistrează-te
                  <LinkPendingIndicator />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
