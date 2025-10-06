"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MIN_PASSWORD = 8;

type ResetPasswordFormProps = {
  token: string;
  email?: string | null;
  className?: string;
};

export function ResetPasswordForm({ token, email, className }: ResetPasswordFormProps) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "submitting">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setErrors({});

      const formData = new FormData(event.currentTarget);
      const password = String(formData.get("password") ?? "");
      const confirmPassword = String(formData.get("confirmPassword") ?? "");

      const nextErrors: Record<string, string> = {};
      if (!password || password.length < MIN_PASSWORD) {
        nextErrors.password = "A senha deve ter pelo menos 8 caracteres";
      }
      if (password !== confirmPassword) {
        nextErrors.confirmPassword = "As senhas não conferem";
      }

      if (Object.keys(nextErrors).length) {
        setErrors(nextErrors);
        return;
      }

      try {
        setState("submitting");
        const response = await fetch("/api/auth/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          const message = body?.error ?? "Não foi possível redefinir a senha";
          setErrors({ general: message });
          return;
        }

        const body = await response.json().catch(() => ({ ok: true }));
        toast.success("Senha atualizada com sucesso. Faça login novamente.");

        const nextEmail = body?.email ?? email;
        const url = nextEmail
          ? `/auth/sign-in?email=${encodeURIComponent(String(nextEmail))}&reset=success`
          : "/auth/sign-in?reset=success";

        router.replace(url);
      } catch (err) {
        console.error("reset password", err);
        setErrors({ general: "Erro inesperado ao redefinir a senha" });
      } finally {
        setState("idle");
      }
    },
    [email, router, token],
  );

  const isLoading = state === "submitting";

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Definir nova senha</CardTitle>
          <CardDescription>
            Escolha uma nova senha para a conta{email ? ` ${email}` : ""}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="reset-password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Nova senha
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="reset-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "reset-password-error" : undefined}
                  />
                  <FieldError
                    id="reset-password-error"
                    errors={errors.password ? [{ message: errors.password }] : undefined}
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="reset-password-confirm">Confirmar senha</FieldLabel>
                <FieldContent>
                  <Input
                    id="reset-password-confirm"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repita a senha"
                    disabled={isLoading}
                    aria-invalid={Boolean(errors.confirmPassword)}
                    aria-describedby={errors.confirmPassword ? "reset-password-confirm-error" : undefined}
                  />
                  <FieldError
                    id="reset-password-confirm-error"
                    errors={
                      errors.confirmPassword ? [{ message: errors.confirmPassword }] : undefined
                    }
                  />
                </FieldContent>
              </Field>
              {errors.general ? (
                <p className="text-sm text-destructive">{errors.general}</p>
              ) : null}
              <Field>
                <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Atualizando...
                    </span>
                  ) : (
                    "Atualizar senha"
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <FieldDescription>
            Lembrou a senha? {" "}
            <Link className="underline underline-offset-4" href="/auth/sign-in">
              Entrar
            </Link>
          </FieldDescription>
        </CardFooter>
      </Card>
    </div>
  );
}
