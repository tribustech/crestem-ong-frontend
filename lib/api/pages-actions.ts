"use server";

import { revalidatePath } from "next/cache";
import { getApiErrorMessage } from "./client";
import { revalidateDashboardPath } from "./revalidate";
import { serverApiFetch } from "./server";
import { getCurrentUser } from "./session-server";
import { isFdscStaff } from "@/lib/roles";
import type { PageBlock, VisibilityAudience } from "./pages-types";

export interface PageInput {
  titlu: string;
  slug: string;
  vizibilitate: VisibilityAudience[];
  blocuri: PageBlock[];
}

const FORBIDDEN = "Nu ai permisiunea necesară pentru această acțiune.";

/**
 * A Server Action is an addressable endpoint, so the staff check lives here as
 * well as in the layout that renders the screens. The backend refuses the same
 * calls through `global::is-fdsc-staff`.
 */
async function refuseNonStaff(): Promise<{ error: string } | null> {
  const user = await getCurrentUser();
  return isFdscStaff(user?.role?.type) ? null : { error: FORBIDDEN };
}

function revalidatePage(slug: string, previousSlug?: string) {
  revalidateDashboardPath("/dashboard/fdsc/pagini");
  revalidatePath(`/${slug}`);
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/${previousSlug}`);
  }
}

export async function createPageAction(
  input: PageInput,
): Promise<{ error?: string; documentId?: string }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;

  try {
    const { data } = await serverApiFetch<{ data: { documentId: string } }>("/api/pages", {
      method: "POST",
      body: JSON.stringify(input),
    });
    revalidatePage(input.slug);
    return { documentId: data.documentId };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut crea pagina.") };
  }
}

export async function updatePageAction(
  documentId: string,
  input: PageInput,
  previousSlug?: string,
): Promise<{ error?: string }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;

  try {
    await serverApiFetch(`/api/pages/${documentId}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut salva pagina.") };
  }

  revalidatePage(input.slug, previousSlug);
  return {};
}

export async function deletePageAction(
  documentId: string,
  slug: string,
): Promise<{ error?: string }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;

  try {
    await serverApiFetch(`/api/pages/${documentId}`, { method: "DELETE" });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut șterge pagina.") };
  }

  revalidatePage(slug);
  return {};
}

export async function setPagePublishedAction(
  documentId: string,
  slug: string,
  published: boolean,
): Promise<{ error?: string }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;

  try {
    await serverApiFetch(
      `/api/pages/${documentId}/${published ? "publish" : "unpublish"}`,
      { method: "POST" },
    );
  } catch (err) {
    return {
      error: getApiErrorMessage(
        err,
        published ? "Nu am putut publica pagina." : "Nu am putut retrage pagina.",
      ),
    };
  }

  revalidatePage(slug);
  return {};
}
