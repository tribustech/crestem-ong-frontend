"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BookOpen, GraduationCap } from "lucide-react";
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

function formatJoinDate(iso: string) {
  return new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

export function IndividualProfileSection({
  nume,
  email,
  createdAt,
}: {
  nume: string;
  email: string;
  createdAt: string;
}) {
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

  const initials = nume
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div>
      <h1 className="text-2xl font-heading font-extrabold" style={{ color: "#162040" }}>
        Profilul meu
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Informațiile contului și activitatea ta pe platformă.
      </p>

      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
              style={{ background: "#2dbe8f" }}
            >
              {initials}
            </div>
            <div>
              <p className="font-heading font-bold text-lg" style={{ color: "#162040" }}>
                {nume}
              </p>
              <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
                {email}
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                Membru din{" "}
                <span className="font-semibold" style={{ color: "#162040" }}>
                  {formatJoinDate(createdAt)}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswordForm((v) => !v)}
            className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold border border-border hover:bg-muted transition-colors"
            style={{ color: "#475569" }}
          >
            {showPasswordForm ? "Anulează" : "Schimbă parola"}
          </button>
        </div>

        {showPasswordForm && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-5 pt-5 border-t border-border space-y-3 max-w-sm"
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
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <BookOpen size={16} style={{ color: "#162040" }} />
          <h3 className="font-heading font-bold" style={{ color: "#162040" }}>
            Articole citite din Bibliotecă
          </h3>
          <span
            className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-bold"
            style={{ background: "#eff6ff", color: "#2563eb" }}
          >
            0
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["Titlu resursă", "Tip", "Accesat la"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} className="px-5 py-8 text-center text-sm text-muted-foreground">
                Nu ai citit niciun articol din bibliotecă încă.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <GraduationCap size={16} style={{ color: "#162040" }} />
          <h3 className="font-heading font-bold" style={{ color: "#162040" }}>
            Cursuri parcurse
          </h3>
          <span
            className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-bold"
            style={{ background: "#f0faf6", color: "#2dbe8f" }}
          >
            0
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["Titlu curs", "Durată", "Status", "Finalizat la"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-foreground">
                Nu ai parcurs niciun curs încă.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
