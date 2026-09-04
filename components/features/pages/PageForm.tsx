"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageBuilder } from "@/components/features/page-builder/PageBuilder";
import type { BlockInstance } from "@/components/features/page-builder/types";
import {
  createPageAction,
  setPagePublishedAction,
  updatePageAction,
} from "@/lib/api/pages-actions";
import type { PageDetail, VisibilityAudience } from "@/lib/api/pages-types";
import { VisibilityField } from "./VisibilityField";

const inputClass =
  "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:border-[#2dbe8f] focus:outline-none";

/** `Despre noi` -> `despre-noi`. Diacritics folded so the slug stays url-safe. */
function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function PageForm({ page }: { page: PageDetail | null }) {
  const router = useRouter();
  const [titlu, setTitlu] = useState(page?.titlu ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(page));
  const [vizibilitate, setVizibilitate] = useState<VisibilityAudience[]>(
    page?.vizibilitate ?? ["public"],
  );
  const [blocuri, setBlocuri] = useState<BlockInstance[]>(
    (page?.blocuri as BlockInstance[]) ?? [],
  );
  const [publicat, setPublicat] = useState(page?.publicat ?? false);
  const [pending, startTransition] = useTransition();

  const changeTitlu = (value: string) => {
    setTitlu(value);
    // The slug follows the title until the editor writes one by hand; after
    // that it is theirs, and a rename must not silently break existing links.
    if (!slugTouched) setSlug(slugify(value));
  };

  const save = () => {
    if (!titlu.trim()) {
      toast.error("Titlul este obligatoriu.");
      return;
    }
    if (!slug.trim()) {
      toast.error("Slugul este obligatoriu.");
      return;
    }
    if (vizibilitate.length === 0) {
      toast.error("Alege cel puțin o audiență.");
      return;
    }

    const input = { titlu: titlu.trim(), slug: slug.trim(), vizibilitate, blocuri };

    startTransition(async () => {
      if (page) {
        const result = await updatePageAction(page.documentId, input, page.slug);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Pagina a fost salvată.");
        router.refresh();
        return;
      }

      const result = await createPageAction(input);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Pagina a fost creată.");
      router.push(`/dashboard/pagini/${result.documentId}`);
    });
  };

  const togglePublished = () => {
    if (!page) return;
    const next = !publicat;

    startTransition(async () => {
      const result = await setPagePublishedAction(page.documentId, page.slug, next);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setPublicat(next);
      toast.success(next ? "Pagina a fost publicată." : "Pagina a fost retrasă.");
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-heading text-2xl font-extrabold text-[#162040]">
        {page ? "Editează pagina" : "Creează pagină nouă"}
      </h1>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">
        {page ? `/${page.slug}` : "Completează informațiile, apoi adaugă conținutul."}
      </p>

      <div className="mb-6 space-y-5 rounded-xl border border-border bg-white p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="page-titlu" className="mb-1.5 block text-xs font-semibold text-[#475569]">
              Titlu
            </label>
            <input
              id="page-titlu"
              value={titlu}
              onChange={(event) => changeTitlu(event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="page-slug" className="mb-1.5 block text-xs font-semibold text-[#475569]">
              Slug
            </label>
            <input
              id="page-slug"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              className={inputClass}
            />
          </div>
        </div>

        <VisibilityField value={vizibilitate} onChange={setVizibilitate} />
      </div>

      <PageBuilder value={blocuri} onChange={setBlocuri} />

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard/pagini")}
          disabled={pending}
          className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-[#475569] transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          Anulează
        </button>
        {page && (
          <button
            type="button"
            onClick={togglePublished}
            disabled={pending}
            className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-[#475569] transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            {publicat ? "Retrage publicarea" : "Publică pagina"}
          </button>
        )}
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-xl bg-[#2dbe8f] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Se salvează…" : "Salvează"}
        </button>
      </div>
    </div>
  );
}
