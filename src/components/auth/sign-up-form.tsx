"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Lock, Mail, User } from "lucide-react";

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

type SignUpFormProps = {
  className?: string;
};

export function SignUpForm({ className }: SignUpFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("inviteToken") ?? undefined;

  const [state, setState] = useState<"idle" | "submitting">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setErrors({});

      const formData = new FormData(event.currentTarget);
      const payload = {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        confirmPassword: String(formData.get("confirmPassword") ?? ""),
      };

      const fieldErrors: Record<string, string> = {};
      if (!payload.name.trim()) {
        fieldErrors.name = "Informe seu nome";
      }
      if (!payload.email.trim()) {
        fieldErrors.email = "Informe um e-mail";
      }
      if (!payload.password || payload.password.length < MIN_PASSWORD) {
        fieldErrors.password = "A senha deve ter pelo menos 8 caracteres";
      }
      if (payload.password !== payload.confirmPassword) {
        fieldErrors.confirmPassword = "As senhas não conferem";
      }

      if (Object.keys(fieldErrors).length) {
        setErrors(fieldErrors);
        return;
      }

      try {
        setState("submitting");
        const response = await fetch("/api/auth/sign-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: payload.name.trim(),
            email: payload.email.trim(),
            password: payload.password,
            inviteToken,
          }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          const message = body?.error ?? "Não foi possível criar a conta";
          toast.error(message);
          return;
        }

        toast.success("Conta criada com sucesso. Faça login para continuar.");
        router.replace(`/auth/sign-in?email=${encodeURIComponent(payload.email.trim())}`);
      } catch (error) {
        console.error("sign-up", error);
        toast.error("Erro inesperado ao criar conta");
      } finally {
        setState("idle");
      }
    },
    [inviteToken, router],
  );

  const isLoading = state === "submitting";

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Criar conta</CardTitle>
          <CardDescription>Preencha os dados para começar a usar a Seedora.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="signup-name" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Nome
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="signup-name"
                    name="name"
                    placeholder="Seu nome"
                    disabled={isLoading}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "signup-name-error" : undefined}
                  />
                  <FieldError id="signup-name-error" errors={errors.name ? [{ message: errors.name }] : undefined} />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="signup-email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="voce@empresa.com"
                    disabled={isLoading}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "signup-email-error" : undefined}
                  />
                  <FieldError id="signup-email-error" errors={errors.email ? [{ message: errors.email }] : undefined} />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="signup-password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Senha
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "signup-password-error" : undefined}
                  />
                  <FieldError
                    id="signup-password-error"
                    errors={errors.password ? [{ message: errors.password }] : undefined}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="signup-password-confirm">Confirmar senha</FieldLabel>
                <FieldContent>
                  <Input
                    id="signup-password-confirm"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repita a senha"
                    disabled={isLoading}
                    aria-invalid={Boolean(errors.confirmPassword)}
                    aria-describedby={errors.confirmPassword ? "signup-password-confirm-error" : undefined}
                  />
                  <FieldError
                    id="signup-password-confirm-error"
                    errors={errors.confirmPassword ? [{ message: errors.confirmPassword }] : undefined}
                  />
                </FieldContent>
              </Field>

              <Field>
                <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Criando conta...
                    </span>
                  ) : (
                    "Criar conta"
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <FieldDescription>
            Já tem uma conta? {" "}
            <Link href="/auth/sign-in" className="underline underline-offset-4">
              Entrar
            </Link>
          </FieldDescription>
        </CardFooter>
      </Card>
    </div>
  );
}
