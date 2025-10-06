"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

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

const schema = z.object({
  name: z.string().min(1, "Informe o nome"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/i, "Cor inválida"),
});

type CreateWorkspaceFormProps = {
  defaultName?: string;
  email?: string | null;
  className?: string;
  hasExistingWorkspace?: boolean;
};

export function CreateWorkspaceForm({
  defaultName,
  email,
  className,
  hasExistingWorkspace = false,
}: CreateWorkspaceFormProps) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "submitting">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setErrors({});

      const formData = new FormData(event.currentTarget);
      const payload = {
        name: String(formData.get("name") ?? ""),
        color: String(formData.get("color") ?? "#16A34A"),
      };

      const parsed = schema.safeParse(payload);
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        parsed.error.issues.forEach((issue) => {
          const field = issue.path[0];
          if (typeof field === "string") {
            fieldErrors[field] = issue.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      try {
        setState("submitting");
        const response = await fetch("/api/workspaces", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parsed.data),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          const message = body?.error ?? "Não foi possível criar o workspace";
          toast.error(message);
          return;
        }

        const body = await response.json().catch(() => null);
        const workspaceSlug = body?.workspace?.slug as string | undefined;
        const redirect = workspaceSlug ? `/${workspaceSlug}/dashboard` : "/auth/post-login";

        toast.success(hasExistingWorkspace ? "Novo workspace criado" : "Workspace criado com sucesso");
        router.replace(redirect);
        router.refresh();
      } catch (error) {
        console.error("create workspace", error);
        toast.error("Erro inesperado ao criar workspace");
      } finally {
        setState("idle");
      }
    },
    [hasExistingWorkspace, router],
  );

  const isLoading = state === "submitting";

  return (
    <div className={cn("w-full max-w-lg", className)}>
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>{hasExistingWorkspace ? "Crie um novo workspace" : "Crie seu primeiro workspace"}</CardTitle>
          <CardDescription>
            {hasExistingWorkspace
              ? "Defina o nome e a cor do novo workspace. Você poderá alternar entre eles pelo seletor no topo da aplicação."
              : `Bem-vindo${defaultName ? `, ${defaultName.split(" ")[0]}` : ""}! Vamos começar criando o ambiente para o seu time.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="workspace-name">Nome do workspace</FieldLabel>
                <FieldContent>
                  <Input
                    id="workspace-name"
                    name="name"
                    placeholder="Ex.: Vendas Brasil"
                    disabled={isLoading}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "workspace-name-error" : undefined}
                  />
                  <FieldError id="workspace-name-error" errors={errors.name ? [{ message: errors.name }] : undefined} />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="workspace-color">Cor</FieldLabel>
                <FieldContent>
                  <div className="flex items-center gap-3">
                    <Input
                      id="workspace-color"
                      name="color"
                      type="color"
                      defaultValue="#16A34A"
                      disabled={isLoading}
                      className="h-12 w-20 cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground">
                      Essa cor será usada nos destaques e indicadores do workspace.
                    </span>
                  </div>
                </FieldContent>
              </Field>

              <Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Criando..." : "Criar workspace"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="mt-4 text-center text-sm">
        Conta: {email ?? "sem e-mail"}
      </FieldDescription>
    </div>
  );
}
