"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { loginSession } from "@/lib/api/session";
import { getApiErrorMessage } from "@/lib/api/client";
import { PasswordInput } from "./PasswordInput";

const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Câmp obligatoriu")
    .email("Email invalid"),
  password: z.string().min(1, "Câmp obligatoriu"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors bg-white text-sm";

export function LoginForm() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setApiError(null);
    try {
      const user = await loginSession(data);
      const destination =
        user.role?.type === "super-admin"
          ? "/dashboard/fdsc/programe"
          : user.role?.type === "ngo-admin"
            ? "/dashboard/ong/evaluari"
            : user.role?.type === "ngo-member"
              ? "/dashboard/user-ong"
              : user.role?.type === "individual"
                ? "/dashboard/individual"
                : "/";
      router.push(destination);
      router.refresh();
    } catch (err) {
      setApiError(getApiErrorMessage(err, "Nu am putut finaliza autentificarea. Încearcă din nou."));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="bg-white rounded-2xl border border-border shadow-sm p-8 space-y-5"
    >
      {apiError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl p-4 text-sm"
          style={{ background: "#fff5f5", border: "1.5px solid #fca5a5", color: "#ef4444" }}
        >
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          {apiError}
        </div>
      )}

      <div>
        <label htmlFor="identifier" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
          Email
        </label>
        <input
          id="identifier"
          type="email"
          autoComplete="email"
          placeholder="email@exemplu.ro"
          className={inputClass}
          {...register("identifier")}
        />
        {errors.identifier && (
          <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
            {errors.identifier.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
          Parolă
        </label>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className={inputClass}
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
        style={{ background: "#2dbe8f", boxShadow: "0 4px 16px rgba(45,190,143,0.3)" }}
      >
        {isSubmitting && <Loader2 size={18} className="animate-spin" />}
        Autentifică-te
      </button>
    </form>
  );
}
