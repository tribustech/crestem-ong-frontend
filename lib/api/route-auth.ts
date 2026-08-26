import { NextResponse } from "next/server";
import { getCurrentUser } from "./session-server";
import { isFdscStaff } from "@/lib/roles";

/**
 * Guards the route handlers that proxy FDSC-side endpoints. Both staff roles
 * pass; user administration is not reached through here (see the `admin-user`
 * controller on the backend, which narrows `editor-fdsc` to mentor targets).
 */
export async function requireFdscStaffRoute(): Promise<NextResponse | null> {
  const user = await getCurrentUser();
  if (!isFdscStaff(user?.role?.type)) {
    return NextResponse.json(
      { message: "Nu ai permisiunea necesară pentru această acțiune." },
      { status: 403 },
    );
  }
  return null;
}
