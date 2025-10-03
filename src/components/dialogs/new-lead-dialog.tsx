"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Stage } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/contexts/i18n-context";

type FormValues = {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  value?: string;
  ownerId?: string;
  notes?: string;
  stageId?: string;
};

type NewLeadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: Stage[];
  onCreate: (payload: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    valueCents?: number;
    ownerId?: string;
    stageId?: string;
    notes?: string;
  }) => Promise<void>;
};

export function NewLeadDialog({ open, onOpenChange, stages, onCreate }: NewLeadDialogProps) {
  const { messages } = useTranslation();
  const { crm } = messages;
  const copy = crm.dialogs.newLead;

  const formSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, copy.validation.nameRequired),
        email: z.string().email(copy.validation.emailInvalid).optional().or(z.literal("")),
        phone: z.string().optional(),
        company: z.string().optional(),
        value: z.string().optional(),
        ownerId: z.string().optional(),
        notes: z.string().optional(),
        stageId: z.string().optional(),
      }),
    [copy.validation.emailInvalid, copy.validation.nameRequired],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      value: "",
      notes: "",
      stageId: stages[0]?.id,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (open) {
      reset({
        name: "",
        email: "",
        phone: "",
        company: "",
        value: "",
        notes: "",
        stageId: stages[0]?.id,
      });
    }
  }, [open, reset, stages]);

  const onSubmit = handleSubmit(async (values) => {
    const sanitized = values.value?.replace(/\s/g, "");
    const numericValue = sanitized ? Number(sanitized.replace(/\./g, "").replace(",", ".")) : undefined;
    const cents = numericValue && !Number.isNaN(numericValue) ? Math.round(numericValue * 100) : undefined;

    await onCreate({
      name: values.name,
      email: values.email || undefined,
      phone: values.phone,
      company: values.company,
      valueCents: cents,
      ownerId: values.ownerId,
      stageId: values.stageId,
      notes: values.notes,
    });

    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="lead-name">{copy.fields.name}</Label>
            <Input
              id="lead-name"
              placeholder={copy.placeholders.name}
              {...register("name")}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name ? (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            ) : null}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lead-email">{copy.fields.email}</Label>
              <Input
                id="lead-email"
                type="email"
                placeholder={copy.placeholders.email}
                {...register("email")}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email ? (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-phone">{copy.fields.phone}</Label>
              <Input id="lead-phone" placeholder={copy.placeholders.phone} {...register("phone")} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lead-company">{copy.fields.company}</Label>
              <Input id="lead-company" placeholder={copy.placeholders.company} {...register("company")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-value">{copy.fields.value}</Label>
              <Input id="lead-value" placeholder={copy.placeholders.value} {...register("value")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-owner">{copy.fields.owner}</Label>
            <Input id="lead-owner" placeholder={copy.placeholders.owner} {...register("ownerId")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-notes">{copy.fields.notes}</Label>
            <Textarea
              id="lead-notes"
              rows={3}
              placeholder={copy.placeholders.notes}
              {...register("notes")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-stage">{copy.fields.stage}</Label>
            <select
              id="lead-stage"
              {...register("stageId")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
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
