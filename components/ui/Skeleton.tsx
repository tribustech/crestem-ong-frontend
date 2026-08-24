/**
 * Placeholder block used by route-level `loading.tsx` files.
 * Purely decorative — screen readers get the "Se încarcă…" text on the
 * surrounding skeleton instead.
 */
export function Skeleton({
  className = "",
  width,
  height,
}: {
  className?: string;
  width?: number | string;
  height?: number | string;
}) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded bg-muted ${className}`}
      style={{ width, height }}
    />
  );
}
