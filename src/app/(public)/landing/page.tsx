"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api-client";
import type { LeadSummary } from "@/types";

const landingFormSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  email: z.string().email("Informe um email válido"),
  phone: z.string().optional(),
  company: z.string().optional(),
  value: z.string().optional(),
  message: z.string().optional(),
});

type LandingFormValues = z.infer<typeof landingFormSchema>;

const defaultValues: LandingFormValues = {
  name: "",
  email: "",
  phone: "",
  company: "",
  value: "",
  message: "",
};

export default function LandingPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LandingFormValues>({
    resolver: zodResolver(landingFormSchema),
    defaultValues,
  });

  const onSubmit = handleSubmit(async (values) => {
    const sanitized = values.value?.replace(/\s/g, "");
    const numeric = sanitized ? Number(sanitized.replace(/\./g, "").replace(",", ".")) : undefined;
    const cents = numeric && !Number.isNaN(numeric) ? Math.round(numeric * 100) : undefined;

    const { lead } = await apiFetch<{ lead: LeadSummary }>("/api/leads", {
      method: "POST",
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        phone: values.phone,
        company: values.company,
        valueCents: cents,
      }),
    });

    if (lead?.id && values.message) {
      await apiFetch(`/api/leads/${lead.id}/activities`, {
        method: "POST",
        body: JSON.stringify({
          type: "note",
          content: values.message,
        }),
      });
    }

    toast.success("Recebemos seus dados! Em breve nossa equipe entra em contato.");
    setSubmitted(true);
    reset(defaultValues);
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/20 px-4 py-16">
      <div className="w-full max-w-3xl space-y-6 text-center">
        <h1 className="text-3xl font-semibold text-foreground">
          Garanta seu próximo lead no funil AppSeed CRM
        </h1>
        <p className="text-muted-foreground">
          {"Preencha o formulário e nossa equipe entrará em contato para entender seu projeto. O lead chega diretamente na etapa \"Lead Novo\" do seu funil."}
        </p>
      </div>

      <Card className="mt-8 w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Captura de leads</CardTitle>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="rounded-lg bg-primary/10 p-6 text-left text-sm text-primary">
              Obrigado! Nosso time fará o follow-up em breve.
            </div>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="landing-name">Nome</Label>
                <Input id="landing-name" {...register("name")} aria-invalid={Boolean(errors.name)} />
                {errors.name ? (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="landing-email">Email</Label>
                <Input id="landing-email" type="email" {...register("email")} aria-invalid={Boolean(errors.email)} />
                {errors.email ? (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                ) : null}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="landing-phone">Telefone</Label>
                <Input id="landing-phone" {...register("phone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="landing-company">Empresa</Label>
                <Input id="landing-company" {...register("company")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="landing-value">Valor estimado (R$)</Label>
              <Input id="landing-value" {...register("value")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="landing-message">Mensagem</Label>
              <Textarea id="landing-message" rows={4} {...register("message")} />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Enviando..." : "Quero falar com a AppSeed"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
