import { ApiError } from "./client";
import { serverApiFetch } from "./server";
import type { PageDetail, PageListResult } from "./pages-types";

export * from "./pages-types";

export async function listPages(params: { search?: string; page?: number } = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.page && params.page > 1) query.set("page", String(params.page));
  const suffix = query.toString() ? `?${query}` : "";

  return serverApiFetch<PageListResult>(`/api/pages${suffix}`);
}

export async function getPage(documentId: string): Promise<PageDetail> {
  const { data } = await serverApiFetch<{ data: PageDetail }>(`/api/pages/${documentId}`);
  return data;
}

/** The public read. Returns null when the page is missing or not visible. */
export async function getPublicPage(slug: string): Promise<PageDetail | null> {
  try {
    const { data } = await serverApiFetch<{ data: PageDetail }>(
      `/api/public/pages/${encodeURIComponent(slug)}`,
    );
    return data;
  } catch (err) {
    // A 403 means the caller isn't entitled to this page, which is a 404 to
    // them — the backend never reveals that a restricted page exists.
    if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
      return null;
    }
    throw err;
  }
}
