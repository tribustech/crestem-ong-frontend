"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { DESPRE_SUBMENU, NAV_LINKS } from "./nav-data";

export function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [despreOpen, setDespreOpen] = useState(false);

  const close = () => {
    setOpen(false);
    setDespreOpen(false);
  };

  return (
    <>
      <button
        className="md:hidden p-2 rounded-lg hover:bg-muted"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Închide meniul" : "Deschide meniul"}
        aria-expanded={open}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-border px-6 py-4 flex flex-col gap-1">
          <button
            onClick={() => setDespreOpen((o) => !o)}
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
                  onClick={close}
                  className="py-2.5 px-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {item.label}
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
                onClick={close}
                className={`py-3 px-3 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-muted font-semibold" : "text-foreground"}`}
              >
                {l.label}
              </Link>
            );
          })}
          <div className="mt-2 border-t border-border pt-3 flex flex-col gap-2">
            <Link
              href="/autentificare"
              onClick={close}
              className="py-3 text-center rounded-lg text-sm font-medium transition-colors hover:bg-muted"
              style={{ color: "#162040", border: "1.5px solid #e2e8f0" }}
            >
              Intră în cont
            </Link>
            <Link
              href="/inregistrare"
              onClick={close}
              className="py-3 text-center rounded-lg text-sm font-semibold text-white"
              style={{ background: "#2dbe8f" }}
            >
              Înregistrează-te
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
