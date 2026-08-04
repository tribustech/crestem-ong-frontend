import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { DespreDropdown } from "./DespreDropdown";
import { NavLinks } from "./NavLinks";
import { MobileMenu } from "./MobileMenu";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Logo variant="dark" height={28} />
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <DespreDropdown />
          <NavLinks />
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/autentificare"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted"
            style={{ color: "#162040", border: "1.5px solid #e2e8f0" }}
          >
            Intră în cont
          </Link>
          <Link
            href="/inregistrare"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "#2dbe8f" }}
          >
            Înregistrează-te
          </Link>
        </div>

        <MobileMenu />
      </div>
    </nav>
  );
}
