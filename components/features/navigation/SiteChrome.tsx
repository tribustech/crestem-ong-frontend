"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard") ?? false;

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
    </>
  );
}
