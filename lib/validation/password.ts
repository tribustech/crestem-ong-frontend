import { z } from "zod";

/**
 * Single source of truth for the password rules the backend enforces on
 * register + activate. Keep in sync with the API's own validation — a mismatch
 * shows up as a server-side error on an input the client marked valid.
 */
export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_RULES_HINT =
  "Minim 8 caractere, cel puțin o literă mare, o cifră și un caracter special.";

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, "Parola trebuie să aibă minim 8 caractere")
  .regex(/[A-Z]/, "Parola trebuie să conțină cel puțin o literă mare")
  .regex(/[0-9]/, "Parola trebuie să conțină cel puțin o cifră")
  .regex(/[^A-Za-z0-9]/, "Parola trebuie să conțină cel puțin un caracter special");

export const confirmedPasswordSchema = z.string().min(1, "Câmp obligatoriu");


/**
 * Use as `.refine(passwordsMatch, PASSWORDS_MATCH_ERROR)` on any object schema
 * holding both `password` and `confirmedPassword`.
 */
export function passwordsMatch(data: { password: string; confirmedPassword: string }): boolean {
  return data.password === data.confirmedPassword;
}

export const PASSWORDS_MATCH_ERROR = {
  message: "Parolele nu coincid",
  path: ["confirmedPassword"],
};
