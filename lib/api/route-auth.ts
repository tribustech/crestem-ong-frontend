import { NextResponse } from "next/server";
import { getCurrentUser } from "./session-server";

export async function requireSuperAdminRoute(): Promise<NextResponse | null> {
  const user = await getCurrentUser();
  if (!user || user.role?.type !== "super-admin") {
    return NextResponse.json(
      { message: "Nu ai permisiunea necesară pentru această acțiune." },
      { status: 403 },
    );
  }
  return null;
}
