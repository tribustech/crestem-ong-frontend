import { NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/client";
import { requireSuperAdminRoute } from "@/lib/api/route-auth";

export async function GET() {
  try {
    const data = await serverApiFetch("/api/programs");
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "A apărut o eroare.";
    const status = err instanceof ApiError ? err.status : 500;
    const details = err instanceof ApiError ? err.details : undefined;
    return NextResponse.json({ message, details }, { status: status || 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireSuperAdminRoute();
  if (authError) return authError;

  const body = await request.text();
  try {
    const data = await serverApiFetch("/api/programs", { method: "POST", body });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "A apărut o eroare.";
    const status = err instanceof ApiError ? err.status : 500;
    const details = err instanceof ApiError ? err.details : undefined;
    return NextResponse.json({ message, details }, { status: status || 500 });
  }
}
