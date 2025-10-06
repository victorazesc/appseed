"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";

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

export function ForgotPasswordForm({ className }: { className?: string }) {
  const [state, setState] = useState<"idle" | "submitting">("idle");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    if (!email) {
      setError("Informe seu e-mail");
      return;
    }

    try {
      setState("submitting");
      const response = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = body?.error ?? "Não foi possível enviar o e-mail";
        setError(message);
        return;
      }

      toast.success("Se existir uma conta, enviaremos as instruções por e-mail.");
      setSent(true);
    } catch (err) {
      console.error("forgot password", err);
      toast.error("Erro inesperado ao enviar o e-mail de recuperação");
    } finally {
      setState("idle");
    }
  }, []);

  const isLoading = state === "submitting";

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Esqueci minha senha</CardTitle>
          <CardDescription>Informe seu e-mail e enviaremos um link para redefinir sua senha.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="forgot-email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="forgot-email"
                    name="email"
                    type="email"
                    placeholder="voce@empresa.com"
                    disabled={isLoading || sent}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "forgot-email-error" : undefined}
                  />
                  <FieldError id="forgot-email-error" errors={error ? [{ message: error }] : undefined} />
                </FieldContent>
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading || sent} className="w-full" size="lg">
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
                    </span>
                  ) : (
                    "Enviar instruções"
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-2 text-center">
          <FieldDescription>
            Lembrou a senha? {" "}
            <Link href="/auth/sign-in" className="underline underline-offset-4">
              Entrar
            </Link>
          </FieldDescription>
          {sent ? (
            <p className="text-xs text-muted-foreground">
              Confira sua caixa de entrada (e spam). Você pode fechar esta página com segurança.
            </p>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
}
