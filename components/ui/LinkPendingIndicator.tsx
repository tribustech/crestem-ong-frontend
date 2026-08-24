"use client";

import { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";

/**
 * Drop inside a <Link> to show a spinner while that navigation is in flight.
 * `useLinkStatus` only reports for the Link it is rendered under, so the
 * indicator can't leak onto other links. Parent needs a flex/inline-flex
 * layout for the spinner to sit next to the label.
 */
export function LinkPendingIndicator({
  size = 14,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const { pending } = useLinkStatus();

  if (!pending) return null;

  return (
    <>
      <Loader2 size={size} className={`shrink-0 animate-spin ${className}`} aria-hidden />
      <span className="sr-only">Se încarcă…</span>
    </>
  );
}
