"use client";

import { useState } from "react";
import { X } from "lucide-react";

export interface MenuItemValues {
  label: string;
  url?: string;
}

const VARIANT = {
  root: { strip: "bg-slate-50", submit: "bg-[#2563eb]" },
  child: { strip: "bg-[#f0faf6]", submit: "bg-[#2dbe8f]" },
} as const;

/**
 * The inline strip used both for adding an item and for editing one in place.
 * `withUrl` is false for a footer column heading, which names a group and never
 * redirects — there is no address to type.
 */
/**
 * `hidden` is a footer column heading, which never redirects. `optional` is a
 * header entry that already has sub-elements: it opens a dropdown, so an address
 * is a choice rather than a requirement.
 */
export type UrlMode = "required" | "optional" | "hidden";

export function MenuItemForm({
  variant,
  title,
  urlMode,
  initialLabel = "",
  initialUrl = "",
  submitLabel,
  pending = false,
  onSubmit,
  onCancel,
}: {
  variant: "root" | "child";
  title: string;
  urlMode: UrlMode;
  initialLabel?: string;
  initialUrl?: string;
  submitLabel: string;
  pending?: boolean;
  onSubmit: (values: MenuItemValues) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(initialLabel);
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);

  const styles = VARIANT[variant];
  const showUrl = urlMode !== "hidden";

  const submit = () => {
    const trimmedLabel = label.trim();
    const trimmedUrl = url.trim();

    if (!trimmedLabel) {
      setError("Eticheta este obligatorie.");
      return;
    }
    if (urlMode === "required" && !trimmedUrl) {
      setError("Adresa este obligatorie.");
      return;
    }
    if (showUrl && trimmedUrl && !/^(\/|https?:\/\/)/.test(trimmedUrl)) {
      setError("Adresa trebuie să înceapă cu „/” sau cu http:// ori https://");
      return;
    }

    setError(null);
    onSubmit(
      showUrl && trimmedUrl
        ? { label: trimmedLabel, url: trimmedUrl }
        : { label: trimmedLabel },
    );
  };

  return (
    <div className={`border-b border-border px-5 py-4 ${styles.strip}`}>
      <p className="mb-3 text-xs font-semibold text-[#475569]">{title}</p>
      <div className="flex flex-wrap items-start gap-2">
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && submit()}
          placeholder="Etichetă"
          aria-label="Etichetă"
          autoFocus
          className="min-w-0 flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-[#2dbe8f] focus:outline-none"
        />
        {showUrl && (
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && submit()}
            placeholder={urlMode === "optional" ? "/url (opțional)" : "/url"}
            aria-label="Adresă"
            className="w-40 rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-[#2dbe8f] focus:outline-none"
          />
        )}
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 ${styles.submit}`}
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          aria-label="Renunță"
          className="rounded-lg border border-border bg-white px-3 py-2 text-[#475569] transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          <X size={14} />
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-[#ef4444]">
          {error}
        </p>
      )}
    </div>
  );
}
