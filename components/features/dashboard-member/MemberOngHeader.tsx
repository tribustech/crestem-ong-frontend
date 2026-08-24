import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Breadcrumb above every view scoped to one of the member's organizations. */
export function MemberOngHeader({ ongName }: { ongName: string }) {
  const initial = ongName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="mb-6 flex items-center gap-2 text-sm">
      <Link href="/dashboard/user-ong" className="font-medium" style={{ color: "#94a3b8" }}>
        <span className="inline-flex items-center gap-1.5">
          <ArrowLeft size={14} /> Toate ONG-urile
        </span>
      </Link>
      <span style={{ color: "#cbd5e1" }}>|</span>
      <span className="inline-flex items-center gap-2 font-semibold" style={{ color: "#162040" }}>
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white"
          style={{ background: "#2dbe8f" }}
        >
          {initial}
        </span>
        {ongName}
      </span>
    </div>
  );
}
