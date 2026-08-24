"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  Layers,
  ClipboardList,
  LayoutGrid,
  FileText,
  BookOpen,
  Menu,
  Workflow,
  Image as ImageIcon,
  ListChecks,
  Plus,
  Building2,
  UserCog,
  Users,
  Settings,
  User,
  GraduationCap,
  Calendar,
  MessageCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { logoutSession } from "@/lib/api/session";

export interface DashboardNavSection {
  label?: string;
  items: { href: string; label: string; icon: LucideIcon }[];
}

const FDSC_NAV_SECTIONS: DashboardNavSection[] = [
  {
    items: [{ href: "/dashboard/fdsc", label: "Panou principal", icon: LayoutGrid }],
  },
  {
    label: "CMS",
    items: [
      { href: "/dashboard/fdsc/pagini", label: "Pagini", icon: FileText },
      { href: "/dashboard/fdsc/biblioteca", label: "Bibliotecă", icon: BookOpen },
      { href: "/dashboard/fdsc/meniuri", label: "Meniuri", icon: Menu },
      { href: "/dashboard/fdsc/arbori-decizionali", label: "Arbori decizionali", icon: Workflow },
      { href: "/dashboard/fdsc/media-library", label: "Media library", icon: ImageIcon },
    ],
  },
  {
    label: "E-Learning",
    items: [
      { href: "/dashboard/fdsc/cursuri", label: "Lista cursuri", icon: ListChecks },
      { href: "/dashboard/fdsc/cursuri/adauga", label: "Adaugă curs", icon: Plus },
    ],
  },
  {
    label: "Programe",
    items: [
      { href: "/dashboard/fdsc/programe", label: "Management programe", icon: Layers },
      { href: "/dashboard/fdsc/organizatii", label: "Organizații", icon: Building2 },
      { href: "/dashboard/fdsc/persoane-resursa", label: "Persoane resursă", icon: UserCog },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/dashboard/fdsc/utilizatori", label: "Utilizatori", icon: Users },
      { href: "/dashboard/fdsc/setari", label: "Setări", icon: Settings },
    ],
  },
];

const ONG_NAV_SECTIONS: DashboardNavSection[] = [
  {
    items: [
      { href: "/dashboard/ong", label: "Panou principal", icon: LayoutGrid },
      { href: "/dashboard/ong/profil", label: "Profilul meu", icon: User },
      { href: "/dashboard/ong/evaluari", label: "Evaluările mele", icon: ClipboardList },
      { href: "/dashboard/ong/programe", label: "Programele mele", icon: Layers },
      { href: "/dashboard/ong/utilizatori", label: "Utilizatori", icon: Users },
      { href: "/dashboard/ong/e-learning", label: "E-Learning", icon: GraduationCap },
      { href: "/dashboard/ong/mesaje", label: "Mesaje", icon: MessageCircle },
    ],
  },
];

const MEMBER_NAV_SECTIONS: DashboardNavSection[] = [
  {
    items: [
      { href: "/dashboard/user-ong/profil", label: "Profilul meu", icon: User },
      { href: "/dashboard/user-ong", label: "Evaluările mele", icon: ClipboardList },
      { href: "/dashboard/user-ong/e-learning", label: "E-Learning", icon: GraduationCap },
    ],
  },
];

const INDIVIDUAL_NAV_SECTIONS: DashboardNavSection[] = [
  {
    items: [
      { href: "/dashboard/individual", label: "Profilul meu", icon: User },
      { href: "/dashboard/individual/e-learning", label: "E-Learning", icon: GraduationCap },
    ],
  },
];

const MENTOR_NAV_SECTIONS: DashboardNavSection[] = [
  {
    items: [
      { href: "/dashboard/mentor", label: "Panou principal", icon: LayoutGrid },
      { href: "/dashboard/mentor/profil", label: "Profilul meu", icon: User },
      { href: "/dashboard/mentor/programe", label: "Programele mele", icon: Layers },
      { href: "/dashboard/mentor/intalniri", label: "Întâlniri", icon: Calendar },
      { href: "/dashboard/mentor/mesaje", label: "Mesaje", icon: MessageCircle },
    ],
  },
];

const NAV_SECTIONS_BY_VARIANT: Record<"fdsc" | "ong" | "member" | "individual" | "mentor", DashboardNavSection[]> = {
  fdsc: FDSC_NAV_SECTIONS,
  ong: ONG_NAV_SECTIONS,
  member: MEMBER_NAV_SECTIONS,
  individual: INDIVIDUAL_NAV_SECTIONS,
  mentor: MENTOR_NAV_SECTIONS,
};

export function DashboardSidebar({
  userName,
  userEmail,
  variant = "fdsc",
  accountLabel,
}: {
  userName: string;
  userEmail: string;
  variant?: "fdsc" | "ong" | "member" | "individual" | "mentor";
  accountLabel?: string;
}) {
  const sections = NAV_SECTIONS_BY_VARIANT[variant];
  const pathname = usePathname();
  const router = useRouter();

  // Longest-prefix match: a root item like "Panou principal" (href "/dashboard/fdsc")
  // would otherwise stay highlighted on every nested page, since its href prefixes them all.
  const activeHref = sections
    .flatMap((section) => section.items)
    .map((item) => item.href)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];

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
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r border-border print:hidden">
      <div className="px-6 py-5 border-b border-border">
        <Logo variant="dark" height={24} />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section, index) => (
          <div key={section.label ?? `section-${index}`}>
            {section.label && (
              <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = item.href === activeHref;
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
            style={{ background: variant === "individual" ? "#2563eb" : "#2dbe8f" }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "#162040" }}>
              {userName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{accountLabel ?? userEmail}</p>
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
