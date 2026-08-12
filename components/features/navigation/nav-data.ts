export interface NavUser {
  nume: string;
  dashboardHref: string;
}

export const DESPRE_SUBMENU = [
  { label: "Despre noi", href: "/despre" },
  { label: "Echipă", href: "/echipa" },
  { label: "Susținători", href: "/sustinatori" },
];

export const NAV_LINKS = [
  { label: "Biblioteca", href: "/biblioteca" },
  { label: "Programe", href: "/programe" },
  { label: "LexiXplore", href: "/lexixplore" },
  { label: "Evaluare ONG", href: "/evaluare-ong" },
  { label: "Persoane resursă", href: "/mentori" },
  { label: "Contact", href: "/contact" },
];
