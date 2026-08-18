"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * The link is rendered as selectable text *and* offered behind a copy button:
 * `navigator.clipboard` is undefined on plain-HTTP origins (non-secure context),
 * which is exactly where staging runs, so the button can never be the only way
 * to get the URL out. `document.execCommand("copy")` is the HTTP fallback.
 */
function execCommandCopy(): boolean {
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  }
}

async function copyToClipboard(input: HTMLInputElement): Promise<boolean> {
  input.focus();
  input.select();
  input.setSelectionRange(0, input.value.length);

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(input.value);
      return true;
    } catch {
      return execCommandCopy();
    }
  }
  return execCommandCopy();
}

export function MemberActivationLink({ href, nume }: { href: string; nume: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (status !== "copied") return;
    const timer = window.setTimeout(() => setStatus("idle"), 2000);
    return () => window.clearTimeout(timer);
  }, [status]);

  const handleCopy = async () => {
    const input = inputRef.current;
    if (!input) return;
    setStatus((await copyToClipboard(input)) ? "copied" : "failed");
  };

  return (
    <div className="max-w-[16rem]">
      <div className="flex items-center gap-1.5">
        <input
          ref={inputRef}
          type="text"
          readOnly
          value={href}
          aria-label={`Link de activare pentru ${nume}`}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full min-w-0 px-2 py-1.5 rounded-lg border border-border bg-[#f8fafc] text-xs font-mono text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f]"
        />
        <button
          type="button"
          onClick={handleCopy}
          title="Copiază linkul de activare"
          aria-label={`Copiază linkul de activare pentru ${nume}`}
          className="shrink-0 p-1.5 rounded-lg border border-border hover:bg-slate-50 transition-colors text-[#475569]"
        >
          {status === "copied" ? <Check size={14} style={{ color: "#16a34a" }} /> : <Copy size={14} />}
        </button>
      </div>
      <p aria-live="polite" className="mt-1 text-[11px] text-muted-foreground">
        {status === "copied" && "Link copiat."}
        {status === "failed" && "Nu am putut copia automat — selectează textul și copiază manual."}
      </p>
    </div>
  );
}
