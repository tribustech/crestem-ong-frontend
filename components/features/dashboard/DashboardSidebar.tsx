"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Layers, ClipboardList } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { logoutSession } from "@/lib/api/session";

export interface DashboardNavSection {
  label: string;
  items: { href: string; label: string; icon: LucideIcon }[];
}

const FDSC_NAV_SECTIONS: DashboardNavSection[] = [
  {
    label: "Programe",
    items: [
      { href: "/dashboard/fdsc/programe", label: "Management programe", icon: Layers },
    ],
  },
];

const ONG_NAV_SECTIONS: DashboardNavSection[] = [
  {
    label: "Cont",
    items: [
      { href: "/dashboard/ong/evaluari", label: "Evaluările mele", icon: ClipboardList },
      { href: "/dashboard/ong/programe", label: "Programele mele", icon: Layers },
    ],
  },
];

const MEMBER_NAV_SECTIONS: DashboardNavSection[] = [
  {
    label: "Cont",
    items: [{ href: "/dashboard/user-ong", label: "Evaluările mele", icon: ClipboardList }],
  },
];

const NAV_SECTIONS_BY_VARIANT: Record<"fdsc" | "ong" | "member", DashboardNavSection[]> = {
  fdsc: FDSC_NAV_SECTIONS,
  ong: ONG_NAV_SECTIONS,
  member: MEMBER_NAV_SECTIONS,
};

export function DashboardSidebar({
  userName,
  userEmail,
  variant = "fdsc",
}: {
  userName: string;
  userEmail: string;
  variant?: "fdsc" | "ong" | "member";
}) {
  const sections = NAV_SECTIONS_BY_VARIANT[variant];
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleLogout = async () => {
    setLoggingOut(true);
    setLogoutError(null);
    try {
      await logoutSession();
      router.replace("/");
      router.refresh();
    } catch {
      setLoggingOut(false);
      setLogoutError("Nu am putut finaliza deconectarea. Încearcă din nou.");
    }
  };

  const initial = userName.trim().charAt(0).toUpperCase() || "?";

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r border-border">
      <div className="px-6 py-5 border-b border-border">
        <Logo variant="dark" height={24} />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={
                      active
                        ? { background: "#162040", color: "white" }
                        : { color: "#334155" }
                    }
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border space-y-3">
        <div className="flex items-center gap-2.5 px-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
            style={{ background: "#2dbe8f" }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "#162040" }}>
              {userName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
        </div>
        <Link
          href="/"
          className="block px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted"
          style={{ color: "#334155" }}
        >
          Înapoi la site
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted disabled:opacity-60"
          style={{ color: "#ef4444" }}
        >
          <LogOut size={16} />
          Deconectare
        </button>
        {logoutError && (
          <p className="px-3 text-xs" style={{ color: "#ef4444" }}>
            {logoutError}
          </p>
        )}
      </div>
    </aside>
  );
}
