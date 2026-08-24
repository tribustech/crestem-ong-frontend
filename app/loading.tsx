import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Fallback boundary for the public pages (home, autentificare, înregistrare…).
 * The root layout reads the session cookie, so these routes are dynamic too and
 * would otherwise sit on the previous page until the server responds.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="mx-auto w-full max-w-3xl px-6 py-16"
    >
      <Skeleton className="h-10 w-2/3 rounded-lg" />
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />

      <div className="mt-10 space-y-4">
        {[0, 1, 2].map((index) => (
          <div key={index} className="rounded-xl border border-border bg-white p-6">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-4/5" />
          </div>
        ))}
      </div>

      <span className="sr-only">Se încarcă…</span>
    </div>
  );
}
