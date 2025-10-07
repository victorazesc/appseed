"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { LeadSummary, Activity } from "@/types";
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
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "@/contexts/i18n-context";
import { AssigneeSelect } from "@/components/activity/assignee-select";
import { useWorkspaceUsers } from "@/hooks/use-workspace-users";

type ActivityDialogMode = "create" | "edit";

const schema = z.object({
  type: z.enum(["note", "call", "email", "whatsapp", "task"]),
  title: z
    .string()
    .trim()
    .max(140, "Título muito longo")
    .optional(),
  content: z.string().min(1, "Informe o conteúdo"),
  dueAt: z.string().optional(),
  status: z.enum(["OPEN", "COMPLETED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  assigneeId: z.string().optional(),
  followers: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof schema>;

export type ActivityFormSubmit = {
  leadId: string;
  activityId?: string;
  type: FormValues["type"];
  title?: string;
  content: string;
  dueAt?: string;
  status?: "OPEN" | "COMPLETED";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  assigneeId?: string | null;
  followers?: string[];
};

type ActivityDialogProps = {
  mode?: ActivityDialogMode;
  lead?: LeadSummary | null;
  activity?: Activity | null;
  initialValues?: Partial<FormValues>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: ActivityFormSubmit) => Promise<void>;
};

const PRIORITY_OPTIONS = [
  { value: "LOW", labelKey: "low" },
  { value: "MEDIUM", labelKey: "medium" },
  { value: "HIGH", labelKey: "high" },
] as const;

const STATUS_OPTIONS = [
  { value: "OPEN", labelKey: "open" },
  { value: "COMPLETED", labelKey: "completed" },
] as const;

export function ActivityDialog({
  mode = "create",
  lead,
  activity,
  initialValues,
  open,
  onOpenChange,
  onSubmit,
}: ActivityDialogProps) {
  const { messages } = useTranslation();
  const { crm } = messages;
  const copy = crm.dialogs.activity;
  const usersQuery = useWorkspaceUsers();

  const targetLead = activity?.lead ?? lead ?? null;

  const defaultValues = useMemo<FormValues>(() => {
    if (mode === "edit" && activity) {
      return {
        type: activity.type,
        title: activity.title ?? "",
        content: activity.content,
        dueAt: activity.dueAt ? activity.dueAt.slice(0, 16) : "",
        status: activity.status ?? "OPEN",
        priority: activity.priority ?? "MEDIUM",
        assigneeId: activity.assignee?.id ?? "",
        followers: activity.followers?.map((user) => user.id) ?? [],
      };
    }

    return {
      type: "note",
      title: initialValues?.title ?? "",
      content: initialValues?.content ?? "",
      dueAt: initialValues?.dueAt ?? "",
      status: initialValues?.status ?? "OPEN",
      priority: initialValues?.priority ?? "MEDIUM",
      assigneeId: initialValues?.assigneeId ?? "",
      followers: initialValues?.followers ?? [],
    };
  }, [activity, initialValues, mode]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const type = watch("type");

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, reset, defaultValues]);

  const dialogTitle =
    mode === "edit"
      ? crm.dialogs.activity.editTitle
      : targetLead
        ? copy.titleWithLead.replace("{{lead}}", targetLead.name)
        : copy.title;

  const onSubmitForm = handleSubmit(async (values) => {
    const currentLead = targetLead;
    if (!currentLead) {
      console.error("Lead não encontrado para criação de atividade");
      return;
    }

    const normalizedDueAt =
      values.dueAt && values.dueAt.trim() ? new Date(values.dueAt).toISOString() : undefined;

    if (values.type === "task" && !normalizedDueAt) {
      form.setError("dueAt", { type: "manual", message: copy.validation.dueAtRequired ?? "Informe o vencimento" });
      return;
    }

    const payload: ActivityFormSubmit = {
      leadId: currentLead.id,
      activityId: activity?.id,
      type: values.type,
      title: values.title?.trim() ? values.title.trim() : undefined,
      content: values.content,
      dueAt: normalizedDueAt,
      status: values.status,
      priority: values.priority,
      assigneeId: values.assigneeId ? values.assigneeId : null,
      followers: values.followers ?? [],
    };

    await onSubmit(payload);
    onOpenChange(false);
  });

  const followers = usersQuery.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmitForm}>
          <div className="space-y-2">
            <Label htmlFor="activity-type">{copy.fields.type}</Label>
            <Select
              id="activity-type"
              {...register("type")}
              className="h-10"
              disabled={isSubmitting || mode === "edit"}
            >
              <option value="note">{copy.types.note}</option>
              <option value="call">{copy.types.call}</option>
              <option value="email">{copy.types.email}</option>
              <option value="whatsapp">{copy.types.whatsapp}</option>
              <option value="task">{copy.types.task}</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity-title">{copy.fields.title}</Label>
            <Input
              id="activity-title"
              placeholder={copy.placeholders.title}
              {...register("title")}
              disabled={isSubmitting}
            />
            {errors.title ? (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity-content">{copy.fields.content}</Label>
            <Textarea
              id="activity-content"
              rows={4}
              placeholder={copy.placeholders.content}
              {...register("content")}
              disabled={isSubmitting}
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
        disabled={isSubmitting}
      />
      {errors.dueAt ? (
        <p className="text-xs text-destructive">{errors.dueAt.message}</p>
      ) : null}
    </div>
  ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{copy.fields.priority}</Label>
              <Select
                value={watch("priority") ?? "MEDIUM"}
                onChange={(event) => form.setValue("priority", event.target.value as FormValues["priority"])}
                disabled={isSubmitting}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {copy.priorities[option.labelKey]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{copy.fields.status}</Label>
              <Select
                value={watch("status") ?? "OPEN"}
                onChange={(event) => form.setValue("status", event.target.value as FormValues["status"])}
                disabled={isSubmitting}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {copy.statuses[option.labelKey]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{copy.fields.assignee}</Label>
            <Controller
              control={control}
              name="assigneeId"
              render={({ field }) => (
                <AssigneeSelect
                  value={field.value ?? ""}
                  onChange={(val) => field.onChange(val ?? "")}
                  disabled={isSubmitting || usersQuery.isLoading}
                  placeholder={copy.placeholders.assignee}
                />
              )}
            />
            {usersQuery.isError ? (
              <p className="text-xs text-destructive">{copy.feedback.usersError}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>{copy.fields.followers}</Label>
            {usersQuery.isLoading ? (
              <p className="text-xs text-muted-foreground">{copy.feedback.usersLoading}</p>
            ) : followers.length ? (
              <div className="grid gap-2">
                {followers.map((user) => (
                  <Controller
                    key={user.id}
                    control={control}
                    name="followers"
                    render={({ field }) => {
                      const checked = field.value?.includes(user.id) ?? false;
                      return (
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(isChecked) => {
                              const current = new Set(field.value ?? []);
                              if (isChecked) {
                                current.add(user.id);
                              } else {
                                current.delete(user.id);
                              }
                              field.onChange(Array.from(current));
                            }}
                            disabled={isSubmitting}
                          />
                          <span>{user.name?.trim() || user.email || copy.labels.unknownUser}</span>
                        </label>
                      );
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">{copy.feedback.usersEmpty}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {copy.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting || (mode === "create" && !targetLead)}>
              {isSubmitting ? copy.submitting : copy.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
