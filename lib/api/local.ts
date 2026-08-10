import { ApiError } from "./client";

interface LocalErrorResponse {
  message?: string;
  details?: unknown;
}

export async function localApiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(path, {
    ...init,
    headers,
  }).catch(() => {
    throw new ApiError("Nu am putut contacta serverul. Verifică conexiunea și încearcă din nou.", 0);
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorBody = data as LocalErrorResponse | null;
    const message = errorBody?.message ?? "A apărut o eroare. Încearcă din nou.";
    throw new ApiError(message, res.status, errorBody?.details);
  }

  return data as T;
}
