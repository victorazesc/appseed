"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/i18n-context";

interface ContactFormProps {
  projectTypes: string[];
  budgetRanges: string[];
  timelineOptions: string[];
}

type FormStatus = "idle" | "loading" | "success" | "error";

export function ContactForm({ projectTypes, budgetRanges, timelineOptions }: ContactFormProps) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const { messages } = useTranslation();
  const copy = messages.common.contactForm;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setFeedback(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body?.message || copy.feedback.error);
      }

      setStatus("success");
      setFeedback(body?.message || copy.feedback.success);
      form.reset();
    } catch (error) {
      console.error("Contact form error", error);
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : copy.feedback.error);
    } finally {
      setTimeout(() => setStatus("idle"), 4000);
    }
  }

  const isLoading = status === "loading";

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-3">
        <div
          aria-live="polite"
          className={cn(
            "rounded-xl border px-4 py-3 text-sm transition-opacity",
            status === "success"
              ? "border-emerald-400/70 bg-emerald-50 text-emerald-700"
              : status === "error"
                ? "border-rose-400/70 bg-rose-50 text-rose-700"
                : "pointer-events-none select-none opacity-0",
          )}
        >
          {feedback}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={copy.labels.name} required>
          <Input name="name" placeholder={copy.placeholders.name} required />
        </FormField>
        <FormField label={copy.labels.email} required>
          <Input name="email" type="email" placeholder={copy.placeholders.email} required />
        </FormField>
        <FormField label={copy.labels.company}>
          <Input name="company" placeholder={copy.placeholders.company} />
        </FormField>
        <FormField label={copy.labels.phone}>
          <Input name="phone" placeholder={copy.placeholders.phone} />
        </FormField>
        <FormField label={copy.labels.projectType} required>
          <Select name="projectType" defaultValue="" required>
            <option value="" disabled>
              {copy.selects.projectType}
            </option>
            {projectTypes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label={copy.labels.budget}>
          <Select name="budget" defaultValue="">
            <option value="" disabled>
              {copy.selects.budget}
            </option>
            {budgetRanges.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label={copy.labels.timeline} className="sm:col-span-2">
          <Select name="timeline" defaultValue="">
            <option value="" disabled>
              {copy.selects.timeline}
            </option>
            {timelineOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
      <FormField label={copy.labels.message} required>
        <Textarea
          name="message"
          placeholder={copy.placeholders.message}
          required
        />
      </FormField>
      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? copy.buttons.submitting : copy.buttons.submit}
      </Button>
    </form>
  );
}

function FormField({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-emerald-500"> *</span> : null}
      </label>
      {children}
    </div>
  );
}
