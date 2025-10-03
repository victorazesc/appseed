"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { LeadSummary } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/contexts/i18n-context";

type FormValues = {
  type: "note" | "call" | "email" | "whatsapp" | "task";
  content: string;
  dueAt?: string;
};

type ActivityDialogProps = {
  lead: LeadSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (payload: { leadId: string; type: FormValues["type"]; content: string; dueAt?: string }) => Promise<void>;
  initialType?: FormValues["type"];
  initialContent?: string;
};

export function ActivityDialog({
  lead,
  open,
  onOpenChange,
  onCreate,
  initialType = "note",
  initialContent = "",
}: ActivityDialogProps) {
  const { messages } = useTranslation();
  const { crm } = messages;
  const copy = crm.dialogs.activity;

  const formSchema = useMemo(
    () =>
      z.object({
        type: z.enum(["note", "call", "email", "whatsapp", "task"]),
        content: z.string().min(1, copy.validation.contentRequired),
        dueAt: z.string().optional(),
      }),
    [copy.validation.contentRequired],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: initialType,
      content: initialContent,
      dueAt: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const type = watch("type");

  const dialogTitle = lead
    ? copy.titleWithLead.replace("{{lead}}", lead.name)
    : copy.title;

  useEffect(() => {
    if (open) {
      reset({ type: initialType, content: initialContent, dueAt: "" });
    }
  }, [open, reset, initialType, initialContent]);

  const onSubmit = handleSubmit(async (values) => {
    if (!lead) return;

    await onCreate({
      leadId: lead.id,
      type: values.type,
      content: values.content,
      dueAt: values.dueAt ? new Date(values.dueAt).toISOString() : undefined,
    });

    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="activity-type">{copy.fields.type}</Label>
            <select
              id="activity-type"
              {...register("type")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="note">{copy.types.note}</option>
              <option value="call">{copy.types.call}</option>
              <option value="email">{copy.types.email}</option>
              <option value="whatsapp">{copy.types.whatsapp}</option>
              <option value="task">{copy.types.task}</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity-content">{copy.fields.content}</Label>
            <Textarea
              id="activity-content"
              rows={4}
              placeholder={copy.placeholders.content}
              {...register("content")}
            />
            {errors.content ? (
              <p className="text-xs text-destructive">{errors.content.message}</p>
            ) : null}
          </div>
          {type === "task" ? (
            <div className="space-y-2">
              <Label htmlFor="activity-due">{copy.fields.dueAt}</Label>
              <Input
                id="activity-due"
                type="datetime-local"
                {...register("dueAt")}
                aria-invalid={Boolean(errors.dueAt)}
              />
              {errors.dueAt ? (
                <p className="text-xs text-destructive">{errors.dueAt.message}</p>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {copy.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting || !lead}>
              {isSubmitting ? copy.submitting : copy.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
