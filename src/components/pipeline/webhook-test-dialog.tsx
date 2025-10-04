"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { PipelineWebhookConfig } from "@/types";
import { useTranslation } from "@/contexts/i18n-context";

const samplePayload = JSON.stringify(
  {
    name: "Ana Silva",
    email: "ana@empresa.com",
    phone: "+55 11 91234-5678",
    company: "Empresa Exemplo",
    value: 15000,
    stage: "Lead Novo",
    origin: "website_contact",
    metadata: {
      utm_source: "google",
    },
  },
  null,
  2,
);

type TestResult = {
  status: number;
  body: string;
};

type WebhookTestDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: PipelineWebhookConfig;
};

export function WebhookTestDialog({ open, onOpenChange, config }: WebhookTestDialogProps) {
  const { messages } = useTranslation();
  const copy = messages.crm.pipelineModal.webhook.test;

  const [payload, setPayload] = useState(samplePayload);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setPayload(samplePayload);
      setResult(null);
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    let parsedPayload: unknown;
    try {
      parsedPayload = JSON.parse(payload);
    } catch {
      setError(copy.invalidJson);
      return;
    }

    if (!config.token) {
      setError(copy.missingToken);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(config.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`,
        },
        body: JSON.stringify(parsedPayload),
      });

      const text = await response.text();
      let body = text;
      try {
        const json = JSON.parse(text);
        body = JSON.stringify(json, null, 2);
      } catch {
        // keep text
      }

      setResult({ status: response.status, body });
    } catch (error) {
      setError(copy.error);
      console.error("webhook test", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="webhook-test-payload" className="text-sm font-medium text-foreground">
              {copy.payloadLabel}
            </label>
            <Textarea
              id="webhook-test-payload"
              className="h-48 font-mono text-xs"
              value={payload}
              onChange={(event) => setPayload(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">{copy.payloadHelper}</p>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          {result ? (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm font-medium text-foreground">
                {copy.statusLabel}: <span className="font-mono">{result.status}</span>
              </p>
              <pre className="mt-2 max-h-48 overflow-auto rounded bg-background p-3 text-xs text-muted-foreground">
                {result.body}
              </pre>
            </div>
          ) : null}

          <DialogFooter className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {copy.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? copy.submitting : copy.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
