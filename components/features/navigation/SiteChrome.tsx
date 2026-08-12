"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import type { NavUser } from "./nav-data";

export function SiteChrome({
  children,
  user,
}: {
  children: React.ReactNode;
  user: NavUser | null;
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard") ?? false;

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar user={user} />
      <main className="flex-1 pt-16">{children}</main>
    </>
  );
}
