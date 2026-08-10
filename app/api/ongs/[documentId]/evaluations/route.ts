import { NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  try {
    const data = await serverApiFetch(
      `/api/ongs/${encodeURIComponent(documentId)}/evaluations${query ? `?${query}` : ""}`,
    );
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "A apărut o eroare.";
    const status = err instanceof ApiError ? err.status : 500;
    return NextResponse.json({ message }, { status: status || 500 });
  }
}
