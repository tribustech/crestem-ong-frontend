import type { UserRoleType } from "@/lib/roles";

/**
 * Each role's dashboard lives in its own folder under `app/dashboard/`, but the
 * role name must never surface in the URL the user sees. The proxy rewrites the
 * role-less path the browser shows onto the folder that actually renders it, so
 * these segments exist only server-side.
 */
export const DASHBOARD_SEGMENT_BY_ROLE: Record<UserRoleType, string> = {
  "super-admin": "fdsc",
  "editor-fdsc": "fdsc",
  "ngo-admin": "ong",
  "ngo-member": "user-ong",
  mentor: "mentor",
  individual: "individual",
};

/** Longest first, so `user-ong` is never mistaken for `ong`. */
export const DASHBOARD_SEGMENTS = ["user-ong", "individual", "mentor", "fdsc", "ong"] as const;

export const DASHBOARD_ROOT = "/dashboard";

export function dashboardSegmentForRole(roleType?: string | null): string | null {
  if (!roleType) return null;
  return DASHBOARD_SEGMENT_BY_ROLE[roleType as UserRoleType] ?? null;
}

export function isDashboardSegment(segment?: string): boolean {
  return (DASHBOARD_SEGMENTS as readonly string[]).includes(segment ?? "");
}

/**
 * `/dashboard/fdsc/programe` -> `/dashboard/programe`. Returns the path
 * unchanged when it carries no role segment.
 */
export function stripDashboardSegment(path: string): string {
  const [, dashboard, segment, ...rest] = path.split("/");
  if (dashboard !== "dashboard" || !isDashboardSegment(segment)) return path;
  return rest.length ? `/dashboard/${rest.join("/")}` : DASHBOARD_ROOT;
}

/**
 * `/dashboard/programe` -> `/dashboard/fdsc/programe`, the route that exists on
 * disk. Only the proxy needs this.
 */
export function addDashboardSegment(path: string, segment: string): string {
  const rest = path.slice(DASHBOARD_ROOT.length);
  return `/dashboard/${segment}${rest}`;
}

/** Where a dashboard layout sends a visitor whose routing cookie went stale. */
export const ROLE_SYNC_PATH = "/api/auth/sync-role";
