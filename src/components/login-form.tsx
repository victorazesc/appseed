"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const credentialsSchema = z.object({
  email: z.string().email({ message: "Informe um email válido" }),
  password: z.string().min(1, { message: "Informe a senha" }),
});

type LoginFormProps = React.ComponentProps<"div"> & {
  defaultEmail?: string;
  resetSuccess?: boolean;
};

type State = "idle" | "credentials" | "google";

export function LoginForm({ className, defaultEmail, resetSuccess, ...props }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/auth/post-login";

  const [state, setState] = useState<State>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleGoogle = useCallback(async () => {
    try {
      setState("google");
      await signIn("google", { callbackUrl });
    } catch (error) {
      console.error("signin google", error);
      toast.error("Erro inesperado ao autenticar com Google.");
    } finally {
      setState("idle");
    }
  }, [callbackUrl]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setErrors({});

      const formData = new FormData(event.currentTarget);
      const raw = {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      };

      const parsed = credentialsSchema.safeParse(raw);
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        parsed.error.issues.forEach((issue) => {
          const path = issue.path[0];
          if (typeof path === "string") {
            fieldErrors[path] = issue.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      try {
        setState("credentials");
        const result = await signIn("credentials", {
          email: parsed.data.email,
          password: parsed.data.password,
          redirect: false,
        });

        if (!result) {
          toast.error("Falha ao iniciar sessão.");
          setState("idle");
          return;
        }

        if (result.error) {
          toast.error(result.error === "CredentialsSignin" ? "Credenciais inválidas. Verifique os dados." : result.error);
          setState("idle");
          return;
        }

        // Login OK: navega manualmente para o destino e força reidratação da sessão
        toast.success("Autenticado com sucesso");
        router.replace(callbackUrl);
        router.refresh();
        return;
      } catch (error) {
        console.error("signin credentials", error);
        toast.error("Erro inesperado ao autenticar.");
      } finally {
        setState("idle");
      }
    },
    [callbackUrl, router],
  );

  const isLoading = state !== "idle";

  useEffect(() => {
    if (resetSuccess) {
      toast.success("Senha redefinida com sucesso. Faça login com a nova senha.");
    }
  }, [resetSuccess]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Bem-vindo de volta</CardTitle>
          <CardDescription>Entre na plataforma para continuar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="você@empresa.com"
                    defaultValue={defaultEmail}
                    autoComplete="email"
                    disabled={isLoading}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "signin-email-error" : undefined}
                  />
                  <FieldError id="signin-email-error" errors={errors.email ? [{ message: errors.email }] : undefined} />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Senha
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isLoading}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "signin-password-error" : undefined}
                  />
                  <FieldError
                    id="signin-password-error"
                    errors={errors.password ? [{ message: errors.password }] : undefined}
                  />
                </FieldContent>
              </Field>

              <Field>
                <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                  {state === "credentials" ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Entrando...
                    </span>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </Field>

              <FieldSeparator>ou continue com</FieldSeparator>

              <Field>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogle}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {state === "google" ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Redirecionando...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> Continuar com Google
                    </span>
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Ainda não tem conta? {" "}
        <Link className="underline underline-offset-4" href="/auth/sign-up">
          Criar conta
        </Link>
        . {" "}
        <Link className="underline underline-offset-4" href="/auth/forgot">
          Esqueci minha senha
        </Link>
        .
      </FieldDescription>
    </div>
  );
}
