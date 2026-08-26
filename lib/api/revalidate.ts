import { revalidatePath } from "next/cache";
import { stripDashboardSegment } from "@/lib/dashboard-routes";

/**
 * Dashboard pages live at `/dashboard/<role>/…` on disk but are served at the
 * role-less URL the proxy rewrites from, so the two paths are separate cache
 * keys. Pass the on-disk path and both get invalidated.
 */
export function revalidateDashboardPath(path: string, type?: "layout" | "page") {
  revalidatePath(path, type);
  const publicPath = stripDashboardSegment(path);
  if (publicPath !== path) revalidatePath(publicPath, type);
}
