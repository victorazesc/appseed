"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PASSWORD_MIN_LENGTH = 8;

type AcceptInviteFormProps = {
  token: string;
  email: string;
  workspaceName: string;
  requiresPassword: boolean;
  suggestedName?: string;
  className?: string;
};

export function AcceptInviteForm({ token, email, workspaceName, requiresPassword, suggestedName, className }: AcceptInviteFormProps) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "submitting">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setErrors({});

      const formData = new FormData(event.currentTarget);
      const name = String(formData.get("name") ?? "").trim();
      const password = String(formData.get("password") ?? "");

      const fieldErrors: Record<string, string> = {};
      if (!name) {
        fieldErrors.name = "Informe seu nome";
      }

      if (requiresPassword && password.length < PASSWORD_MIN_LENGTH) {
        fieldErrors.password = "Senha deve ter pelo menos 8 caracteres";
      }

      if (Object.keys(fieldErrors).length) {
        setErrors(fieldErrors);
        return;
      }

      try {
        setState("submitting");
        const response = await fetch("/api/invites/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, name, password: requiresPassword ? password : undefined }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          const message = body?.error ?? "Não foi possível aceitar o convite";
          toast.error(message);
          return;
        }

        toast.success("Convite aceito com sucesso");

        if (requiresPassword) {
          const signInResult = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });

          if (signInResult?.error) {
            toast.error("Convite aceito. Faça login com suas credenciais.");
            router.replace("/auth/sign-in");
            return;
          }
        }

        router.replace("/auth/post-login");
      } catch (error) {
        console.error("accept invite", error);
        toast.error("Erro inesperado ao aceitar o convite");
      } finally {
        setState("idle");
      }
    },
    [email, requiresPassword, router, token],
  );

  const isLoading = state === "submitting";

  return (
    <div className={cn("flex min-h-svh items-center justify-center bg-muted/30 px-6 py-20", className)}>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Entrar em {workspaceName}</CardTitle>
          <CardDescription>
            Você foi convidado para participar deste workspace usando o e-mail {email}. Complete as informações para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="invite-name">Nome</FieldLabel>
                <FieldContent>
                  <Input
                    id="invite-name"
                    name="name"
                    defaultValue={suggestedName}
                    placeholder="Seu nome"
                    disabled={isLoading}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "invite-name-error" : undefined}
                  />
                  <FieldError id="invite-name-error" errors={errors.name ? [{ message: errors.name }] : undefined} />
                </FieldContent>
              </Field>

              {requiresPassword ? (
                <Field>
                  <FieldLabel htmlFor="invite-password">Defina uma senha</FieldLabel>
                  <FieldContent>
                    <Input
                      id="invite-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      disabled={isLoading}
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={errors.password ? "invite-password-error" : undefined}
                    />
                    <FieldError
                      id="invite-password-error"
                      errors={errors.password ? [{ message: errors.password }] : undefined}
                    />
                  </FieldContent>
                </Field>
              ) : (
                <FieldDescription>
                  Já existe uma conta com este e-mail. Faça login após aceitar o convite, se solicitado.
                </FieldDescription>
              )}

              <Field>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Confirmando..." : "Aceitar convite"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
