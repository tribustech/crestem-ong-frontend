/**
 * Every route under `evaluari` is dynamic (all of them read the session cookie),
 * so Next skips prefetching them unless a `loading` boundary exists. With this
 * file the tab row and page chrome are prefetched and swapped in on click, so
 * switching tabs navigates immediately instead of freezing on the old page.
 */
export default function Loading() {
  return (
    <div className="animate-pulse">
      <nav className="mb-6 flex items-center gap-6 border-b border-border" aria-hidden>
        {[64, 56, 104, 76].map((width, index) => (
          <div key={index} className="pb-3">
            <div className="h-4 rounded bg-muted" style={{ width }} />
          </div>
        ))}
      </nav>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="h-9 w-52 rounded-lg bg-muted" />
        <div className="h-9 w-40 rounded-lg bg-muted" />
      </div>

      <div className="rounded-xl border border-border bg-white p-6">
        <div className="h-5 w-1/3 rounded bg-muted" />
        <div className="mt-4 space-y-3">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="h-4 w-full rounded bg-muted" />
          ))}
        </div>
      </div>

      <span className="sr-only">Se încarcă…</span>
    </div>
  );
}
