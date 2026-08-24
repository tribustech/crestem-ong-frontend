export type ProgramStatus = "Upcoming" | "Active" | "Finished";

export const PROGRAM_STATUS_LABELS: Record<ProgramStatus, string> = {
  Upcoming: "Viitor",
  Active: "Activ",
  Finished: "Finalizat",
};

/** Badge background + text, as theme utilities rather than raw hex. */
export const PROGRAM_STATUS_CLASSES: Record<ProgramStatus, string> = {
  Upcoming: "bg-status-upcoming text-status-upcoming-foreground",
  Active: "bg-status-active text-status-active-foreground",
  Finished: "bg-status-finished text-status-finished-foreground",
};

/**
 * `programStatus` arrives as a plain string on the dashboard payloads. Falls
 * back to `Upcoming` so an unexpected value still renders a badge.
 */
export function programStatusOf(value: string): ProgramStatus {
  return value in PROGRAM_STATUS_LABELS ? (value as ProgramStatus) : "Upcoming";
}

/** Today in Bucharest as `YYYY-MM-DD`, matching the backend's day boundary. */
export function todayInBucharest(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Bucharest" });
}

/**
 * A finished program is read-only. Derived from `endDate` rather than the
 * stored `programStatus`, which only refreshes when the dates are edited — the
 * same rule the backend enforces in `programFinishedError`.
 */
export function isProgramFinished(
  program: { endDate: string },
  today: string = todayInBucharest(),
): boolean {
  return program.endDate.slice(0, 10) < today;
}
