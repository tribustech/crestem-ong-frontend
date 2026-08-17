"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { changePasswordAction } from "@/lib/api/auth-actions";
import { PasswordInput } from "@/components/features/auth/PasswordInput";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Introdu parola curentă"),
    password: z
      .string()
      .min(8, "Parola trebuie să aibă minim 8 caractere")
      .regex(/[A-Z]/, "Parola trebuie să conțină cel puțin o literă mare")
      .regex(/[0-9]/, "Parola trebuie să conțină cel puțin o cifră")
      .regex(/[^A-Za-z0-9]/, "Parola trebuie să conțină cel puțin un caracter special"),
    confirmedPassword: z.string().min(1, "Câmp obligatoriu"),
  })
  .refine((data) => data.password === data.confirmedPassword, {
    message: "Parolele nu coincid",
    path: ["confirmedPassword"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

const passwordInputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";

export function ChangePasswordForm() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", password: "", confirmedPassword: "" },
  });

  const onSubmit = (data: ChangePasswordValues) => {
    startTransition(async () => {
      const result = await changePasswordAction(data);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Parola a fost schimbată cu succes.");
      reset();
      setShowPasswordForm(false);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowPasswordForm((v) => !v)}
        className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold border border-border hover:bg-muted transition-colors"
        style={{ color: "#475569" }}
      >
        {showPasswordForm ? "Anulează" : "Schimbă parola"}
      </button>

      {showPasswordForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-5 pt-5 border-t border-border space-y-3 max-w-sm w-full basis-full"
        >
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#475569" }}>
              Parola curentă
            </label>
            <PasswordInput className={passwordInputClass} {...register("currentPassword")} />
            {errors.currentPassword && (
              <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                {errors.currentPassword.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#475569" }}>
              Parola nouă
            </label>
            <PasswordInput className={passwordInputClass} {...register("password")} />
            {errors.password && (
              <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#475569" }}>
              Confirmă parola nouă
            </label>
            <PasswordInput className={passwordInputClass} {...register("confirmedPassword")} />
            {errors.confirmedPassword && (
              <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                {errors.confirmedPassword.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
            style={{ background: "#2dbe8f" }}
          >
            {isPending ? "Se salvează..." : "Salvează parola"}
          </button>
        </form>
      )}
    </>
  );
}
