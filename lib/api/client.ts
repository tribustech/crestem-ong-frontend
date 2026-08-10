const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface StrapiErrorResponse {
  error?: { message?: string; details?: unknown };
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export interface ZodFlattenError {
  formErrors?: string[];
  fieldErrors?: Record<string, string[]>;
}

export function isZodFlattenError(details: unknown): details is ZodFlattenError {
  return (
    typeof details === "object" &&
    details !== null &&
    ("fieldErrors" in details || "formErrors" in details)
  );
}

/**
 * Strapi validation errors carry the real reason (e.g. "Cel puțin o fază
 * trebuie să aibă evaluare") in `details.fieldErrors`/`formErrors`, while
 * `message` is often just a generic "Date invalide: ". Prefer the details.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) return fallback;

  if (err.status === 403) {
    return "Nu ai permisiunea necesară pentru această acțiune.";
  }

  if (isZodFlattenError(err.details)) {
    const messages = [
      ...(err.details.formErrors ?? []),
      ...Object.values(err.details.fieldErrors ?? {}).flat(),
    ].filter(Boolean);
    if (messages.length > 0) return messages.join(" ");
  }

  return err.message || fallback;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  }).catch(() => {
    throw new ApiError("Nu am putut contacta serverul. Verifică conexiunea și încearcă din nou.", 0);
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorBody = (data as StrapiErrorResponse | null)?.error;
    const message = errorBody?.message ?? "A apărut o eroare. Încearcă din nou.";
    throw new ApiError(message, res.status, errorBody?.details);
  }

  return data as T;
}
