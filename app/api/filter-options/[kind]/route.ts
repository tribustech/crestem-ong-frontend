import { NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/client";
import { requireFdscStaffRoute } from "@/lib/api/route-auth";

const KINDS = ["ongs", "programs"] as const;
type Kind = (typeof KINDS)[number];

const isKind = (value: string): value is Kind => (KINDS as readonly string[]).includes(value);

/**
 * The options behind the multi-select filters. They load page by page as the
 * dropdown scrolls, which means fetching from the browser — and the session
 * token is httpOnly, so the request goes through here rather than straight to
 * Strapi.
 */
export async function GET(request: Request, { params }: { params: Promise<{ kind: string }> }) {
  const authError = await requireFdscStaffRoute();
  if (authError) return authError;

  const { kind } = await params;
  if (!isKind(kind)) {
    return NextResponse.json({ message: "Filtru necunoscut" }, { status: 404 });
  }

  const incoming = new URL(request.url).searchParams;
  const query = new URLSearchParams();
  for (const key of ["search", "page", "selected"]) {
    const value = incoming.get(key);
    if (value) query.set(key, value);
  }
  const qs = query.toString();

  try {
    const data = await serverApiFetch(
      `/api/admin/filter-options/${kind}${qs ? `?${qs}` : ""}`,
    );
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "A apărut o eroare.";
    const status = err instanceof ApiError ? err.status : 500;
    return NextResponse.json({ message }, { status: status || 500 });
  }
}
