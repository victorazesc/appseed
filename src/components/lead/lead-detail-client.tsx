"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Mail,
  MoveRight,
  NotebookPen,
  PhoneCall,
  StickyNote,
  TimerReset,
  CheckCircle2,
  MessageCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";

import { ActivityDialog } from "@/components/dialogs/activity-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Activity, LeadDetail, Stage } from "@/types";
import { useTranslation } from "@/contexts/i18n-context";

const leadFormSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  value: z.string().optional(),
  ownerId: z.string().optional(),
  notes: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

type LeadUpdatePayload = {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  ownerId?: string;
  valueCents?: number;
  stageId?: string;
};

type Props = {
  leadId: string;
};

const activityIcons: Record<Activity["type"], ReactNode> = {
  note: <StickyNote className="h-4 w-4 text-primary" />,
  call: <PhoneCall className="h-4 w-4 text-primary" />,
  email: <Mail className="h-4 w-4 text-primary" />,
  whatsapp: <MessageCircle className="h-4 w-4 text-primary" />,
  task: <TimerReset className="h-4 w-4 text-primary" />,
};

export function LeadDetailClient({ leadId }: Props) {
  const queryClient = useQueryClient();
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [activityType, setActivityType] = useState<Activity["type"]>("note");
  const [activityPrefill, setActivityPrefill] = useState<string>("");
  const { messages, locale } = useTranslation();
  const { crm } = messages;
  const leadCopy = crm.leadDetail;
  const activityCopy = crm.dialogs.activity;

  const leadQuery = useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      const data = await apiFetch<{ lead: LeadDetail }>(`/api/leads/${leadId}`);
      return data.lead;
    },
  });

  const stagesQuery = useQuery({
    queryKey: ["stages"],
    queryFn: async () => {
      const data = await apiFetch<{ stages: Stage[] }>("/api/stages");
      return data.stages.sort((a, b) => a.position - b.position);
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: (payload: LeadUpdatePayload) =>
      apiFetch<{ lead: LeadDetail }>(`/api/leads/${leadId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success(crm.toasts.leadUpdated);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const addActivityMutation = useMutation({
    mutationFn: (payload: { type: Activity["type"]; content: string; dueAt?: string }) =>
      apiFetch<{ activity: Activity }>(`/api/leads/${leadId}/activities`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success(crm.toasts.activityLogged);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const completeTaskMutation = useMutation({
    mutationFn: (activityId: string) =>
      apiFetch<{ activity: Activity }>(`/api/activities/${activityId}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "complete" }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success(crm.toasts.taskCompleted);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
  });

  const { register, handleSubmit, reset, formState } = form;

  useEffect(() => {
    if (leadQuery.data) {
      reset({
        name: leadQuery.data.name,
        email: leadQuery.data.email ?? "",
        phone: leadQuery.data.phone ?? "",
        company: leadQuery.data.company ?? "",
        value: leadQuery.data.valueCents ? String(leadQuery.data.valueCents / 100) : "",
        ownerId: leadQuery.data.ownerId ?? "",
        notes: "",
      });
    }
  }, [leadQuery.data, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const sanitized = values.value?.replace(/\s/g, "");
    const numeric = sanitized ? Number(sanitized.replace(/\./g, "").replace(",", ".")) : undefined;
    const valueCents = numeric && !Number.isNaN(numeric) ? Math.round(numeric * 100) : undefined;

    await updateLeadMutation.mutateAsync({
      name: values.name,
      email: values.email || undefined,
      phone: values.phone,
      company: values.company,
      ownerId: values.ownerId,
      valueCents,
    });

    if (values.notes) {
      await addActivityMutation.mutateAsync({ type: "note", content: values.notes });
    }
  });

  const handleStageChange = (stageId: string) => {
    if (!stageId) return;
    updateLeadMutation.mutate({ stageId });
  };

  const lead = leadQuery.data;
  const now = Date.now();
  const dueSoon = Boolean(
    lead?.nextDueAt &&
      !lead?.hasOverdueTasks &&
      new Date(lead.nextDueAt).getTime() > now &&
      new Date(lead.nextDueAt).getTime() - now <= 60 * 60 * 1000,
  );

  const metrics = useMemo(() => {
    if (!lead) {
      return [];
    }

    return [
      { label: leadCopy.metrics.stage, value: lead.stage?.name ?? crm.statuses.noStage },
      { label: leadCopy.metrics.value, value: formatCurrency(lead.valueCents, { locale }) },
      { label: leadCopy.metrics.createdAt, value: formatDate(lead.createdAt, { locale }) },
      { label: leadCopy.metrics.owner, value: lead.ownerId ?? crm.statuses.none },
      {
        label: leadCopy.metrics.overdueTasks,
        value: lead.overdueTasksCount ? String(lead.overdueTasksCount) : "0",
      },
      {
        label: leadCopy.metrics.nextTask,
        value: lead.nextDueAt ? formatDate(lead.nextDueAt, { locale }) : crm.statuses.none,
      },
    ];
  }, [lead, leadCopy, crm.statuses, locale]);

  const sortedActivities = useMemo(() => {
    if (!lead?.activities) {
      return [];
    }

    return [...lead.activities].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [lead?.activities]);

  const handleTaskDone = async (activity: Activity) => {
    await completeTaskMutation.mutateAsync(activity.id);
  };

  if (leadQuery.isLoading || !lead) {
    return (
      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStageId = lead.stage?.id ?? stagesQuery.data?.[0]?.id ?? "";
  const overdueBadgeLabel = leadCopy.badges.overdue.replace(
    "{{count}}",
    String(lead.overdueTasksCount ?? 0),
  );
  const dueSoonLabel = leadCopy.badges.dueSoon;

  return (
    <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <NotebookPen className="h-5 w-5 text-primary" />
              {lead.name}
            </CardTitle>
            {lead.hasOverdueTasks ? (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                {overdueBadgeLabel}
              </Badge>
            ) : dueSoon ? (
              <Badge variant="warning" className="gap-1">
                <Clock className="h-3.5 w-3.5" /> {dueSoonLabel}
              </Badge>
            ) : null}
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lead-name">{leadCopy.form.name}</Label>
                  <Input id="lead-name" {...register("name")} />
                  {formState.errors.name ? (
                    <p className="text-xs text-destructive">{formState.errors.name.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-email">{leadCopy.form.email}</Label>
                  <Input id="lead-email" type="email" {...register("email")} />
                  {formState.errors.email ? (
                    <p className="text-xs text-destructive">{formState.errors.email.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="lead-phone">{leadCopy.form.phone}</Label>
                  <Input id="lead-phone" {...register("phone")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-company">{leadCopy.form.company}</Label>
                  <Input id="lead-company" {...register("company")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-value">{leadCopy.form.value}</Label>
                  <Input id="lead-value" {...register("value")} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lead-owner">{leadCopy.form.owner}</Label>
                  <Input id="lead-owner" {...register("ownerId")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-stage">{leadCopy.form.moveStage}</Label>
                  <select
                    id="lead-stage"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={currentStageId}
                    onChange={(event) => handleStageChange(event.target.value)}
                  >
                    {stagesQuery.data?.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-notes">{leadCopy.form.quickNote}</Label>
                <Textarea id="lead-notes" rows={3} {...register("notes")} />
              </div>

              <div className="flex items-center gap-2">
                <Button type="submit" disabled={updateLeadMutation.isPending}>
                  {updateLeadMutation.isPending ? leadCopy.buttons.saving : leadCopy.buttons.save}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    reset();
                  }}
                >
                  {leadCopy.buttons.cancel}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{leadCopy.timeline.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setActivityType("email");
                  setActivityPrefill("");
                  setActivityDialogOpen(true);
                }}
                disabled={!lead.email}
              >
                <Mail className="mr-2 h-4 w-4" /> {leadCopy.buttons.sendEmail}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setActivityType("note");
                  setActivityPrefill("");
                  setActivityDialogOpen(true);
                }}
              >
                {leadCopy.buttons.addActivity}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground">{leadCopy.timeline.empty}</p>
            ) : (
              <ul className="space-y-4">
                {sortedActivities.map((activity) => {
                  const isTask = activity.type === "task";
                  const dueAt = activity.dueAt ? new Date(activity.dueAt) : null;
                  const isOverdue = Boolean(isTask && dueAt && dueAt.getTime() < now);
                  const isDueSoon = Boolean(
                    isTask &&
                      !isOverdue &&
                      dueAt &&
                      dueAt.getTime() > now &&
                      dueAt.getTime() - now <= 60 * 60 * 1000,
                  );
                  const formattedCreatedAt = formatDate(activity.createdAt, { locale });
                  const formattedDueAt = activity.dueAt
                    ? formatDate(activity.dueAt, { locale })
                    : null;
                  const dueBadgeText = formattedDueAt
                    ? isOverdue
                      ? `${crm.statuses.overdue} ${formattedDueAt}`
                      : isDueSoon
                        ? `${crm.statuses.attention} ${formattedDueAt}`
                        : crm.statuses.dueOn.replace("{{date}}", formattedDueAt)
                    : "";

                  return (
                    <li
                      key={activity.id}
                      className={cn(
                        "flex gap-3 rounded-lg border bg-muted/30 p-3",
                        isOverdue && "border-destructive/50 bg-destructive/10",
                        !isOverdue && isDueSoon && "border-amber-300/70 bg-amber-50/60",
                      )}
                    >
                      <div className="mt-1">{activityIcons[activity.type]}</div>
                    <div className="flex w-full flex-col gap-2">
                      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <span>{activityCopy.types[activity.type]}</span>
                          <span className="text-xs text-muted-foreground">{formattedCreatedAt}</span>
                        </div>
                        {isTask && activity.dueAt ? (
                          <div className="flex items-center gap-2">
                            <Badge variant={isOverdue ? "destructive" : isDueSoon ? "warning" : "secondary"}>
                              {dueBadgeText}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleTaskDone(activity)}
                              disabled={completeTaskMutation.isPending}
                            >
                              <CheckCircle2 className="mr-1 h-4 w-4" /> {crm.buttons.markDone}
                            </Button>
                          </div>
                        ) : null}
                      </div>
                      <p
                        className={cn(
                          "text-sm whitespace-pre-line",
                          isOverdue ? "text-destructive" : "text-muted-foreground",
                        )}
                      >
                        {activity.content}
                      </p>
                    </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{leadCopy.summaryTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="flex flex-col">
                <span className="text-xs uppercase text-muted-foreground">{metric.label}</span>
                <span className="text-sm font-medium text-foreground">{metric.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{leadCopy.pipelineTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{leadCopy.pipelineDescription}</p>
            <ol className="space-y-2">
            {stagesQuery.data?.map((stage) => {
                const isCurrent = stage.id === lead.stage?.id;
                return (
                  <li
                    key={stage.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <MoveRight className="h-3 w-3 text-muted-foreground" />
                    <span className={isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"}>
                      {stage.name}
                    </span>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      </div>

      <ActivityDialog
        lead={lead}
        open={activityDialogOpen}
        onOpenChange={setActivityDialogOpen}
        initialType={activityType}
        initialContent={activityPrefill}
        onCreate={async ({ type, content, dueAt }) => {
          await addActivityMutation.mutateAsync({ type, content, dueAt });
        }}
      />
    </div>
  );
}
