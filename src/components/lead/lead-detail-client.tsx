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
  MessageCircleMore,
} from "lucide-react";

import { ActivityDialog } from "@/components/dialogs/activity-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Activity, ActivityComment, LeadDetail, Stage } from "@/types";
import { LeadTransitionDialog } from "@/components/lead/lead-transition-dialog";
import { useTranslation } from "@/contexts/i18n-context";
import { usePipelines } from "@/contexts/pipeline-context";
import { useWorkspace } from "@/contexts/workspace-context";
import { useWorkspaceUsers } from "@/hooks/use-workspace-users";
import { MentionTextarea } from "@/components/activity/mention-textarea";

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

type ActivityDialogInitialValues = {
  type?: Activity["type"];
  title?: string;
  content?: string;
  dueAt?: string;
  status?: "OPEN" | "COMPLETED";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  assigneeId?: string;
  followers?: string[];
};

type MentionHighlightProps = {
  label: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
};

function getUserLabel(user: { name: string | null; email: string | null }) {
  return user.name?.trim() || user.email || "Usuário";
}

function getUserInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email || "Usuário";
  const parts = source.split(" ").filter(Boolean).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "US";
}

function MentionHighlight({ label, user }: MentionHighlightProps) {
  const initials = getUserInitials(user.name, user.email);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
          @{label}
        </span>
      </TooltipTrigger>
      <TooltipContent className="w-56">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            {user.image ? <AvatarImage src={user.image} alt={label} /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">{user.name ?? label}</p>
            <p className="text-xs text-muted-foreground">{user.email ?? "—"}</p>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function renderCommentContent(comment: ActivityComment) {
  const text = comment.content ?? "";
  if (!comment.mentions?.length) {
    return [text];
  }

  const entries = comment.mentions.map((mention) => {
    const userLabel = getUserLabel({ name: mention.name ?? null, email: mention.email ?? null });
    return {
      key: `@${userLabel}`,
      label: userLabel,
      user: {
        id: mention.id,
        name: mention.name ?? null,
        email: mention.email ?? null,
        image: mention.image ?? null,
      },
    };
  });

  const nodes: React.ReactNode[] = [];
  let index = 0;

  while (index < text.length) {
    let matchEntry: (typeof entries)[number] | null = null;
    let matchIndex = -1;

    for (const entry of entries) {
      const pos = text.indexOf(entry.key, index);
      if (pos !== -1 && (matchIndex === -1 || pos < matchIndex)) {
        matchIndex = pos;
        matchEntry = entry;
      }
    }

    if (!matchEntry || matchIndex < index) {
      nodes.push(text.slice(index));
      break;
    }

    if (matchIndex > index) {
      nodes.push(text.slice(index, matchIndex));
    }

    nodes.push(
      <MentionHighlight
        key={`${matchEntry.user.id}-${matchIndex}`}
        label={matchEntry.label}
        user={matchEntry.user}
      />,
    );

    index = matchIndex + matchEntry.key.length;
  }

  return nodes;
}

type ActivityMutationInput = {
  type: Activity["type"];
  title?: string;
  content: string;
  dueAt?: string;
  status?: "OPEN" | "COMPLETED";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  assigneeId?: string | null;
  followers?: string[];
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
  const [activityInitialValues, setActivityInitialValues] = useState<ActivityDialogInitialValues>({
    type: "note",
    status: "OPEN",
    priority: "MEDIUM",
  });
  const [activeCommentActivity, setActiveCommentActivity] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, { content: string; mentions: string[] }>>({});
  const [transitionOpen, setTransitionOpen] = useState(false);
  const { messages, locale } = useTranslation();
  const { crm } = messages;
  const leadCopy = crm.leadDetail;
  const activityCopy = crm.dialogs.activity;
  const timelineCopy = leadCopy.timeline;
  const commentsCopy = leadCopy.comments;

  const { pipelines } = usePipelines();
  const { workspace, isLoading: isWorkspaceLoading } = useWorkspace();
  const workspaceUsersQuery = useWorkspaceUsers();
  const mentionUsers = workspaceUsersQuery.data ?? [];
  const workspaceSlug = workspace?.slug;
  const appendWorkspace = (url: string) => {
    if (!workspaceSlug) return url;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}workspaceSlug=${encodeURIComponent(workspaceSlug)}`;
  };
  const leadQuery = useQuery({
    queryKey: ["lead", workspaceSlug ?? "unknown", leadId],
    queryFn: async () => {
      if (!workspaceSlug) throw new Error("Workspace não selecionado");
      const data = await apiFetch<{ lead: LeadDetail }>(appendWorkspace(`/api/leads/${leadId}`));
      return data.lead;
    },
    enabled: Boolean(workspaceSlug),
  });
  useEffect(() => {
    if (leadQuery.isError) {
      const err = leadQuery.error as Error | null;
      if (err?.message) toast.error(err.message);
      else toast.error("Erro ao carregar lead.");
    }
  }, [leadQuery.isError, leadQuery.error]);
  const lead = leadQuery.data;
  const hasAlternativePipelines = useMemo(
    () => pipelines.some((pipeline) => pipeline.id !== (lead?.pipeline?.id ?? lead?.pipelineId ?? "")),
    [pipelines, lead?.pipeline?.id, lead?.pipelineId],
  );

  const stagesQuery = useQuery({
    queryKey: ["stages", workspaceSlug ?? "unknown", leadQuery.data?.pipeline?.id ?? "unknown"],
    queryFn: async () => {
      const pipelineId = leadQuery.data?.pipeline?.id;
      if (!pipelineId || !workspaceSlug) return [] as Stage[];
      const data = await apiFetch<{ stages: Stage[] }>(
        appendWorkspace(`/api/stages?pipelineId=${pipelineId}`),
      );
      return data.stages.sort((a, b) => a.position - b.position);
    },
    enabled: Boolean(leadQuery.data?.pipeline?.id && workspaceSlug),
  });
  useEffect(() => {
    if (stagesQuery.isError) {
      const err = stagesQuery.error as Error | null;
      if (err?.message) toast.error(err.message);
      else toast.error("Erro ao carregar etapas do funil.");
    }
  }, [stagesQuery.isError, stagesQuery.error]);

  const updateLeadMutation = useMutation({
    mutationFn: (payload: LeadUpdatePayload) => {
      if (!workspaceSlug) {
        throw new Error("Workspace não selecionado");
      }
      return apiFetch<{ lead: LeadDetail }>(appendWorkspace(`/api/leads/${leadId}`), {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", workspaceSlug ?? "unknown", leadId] });
      queryClient.invalidateQueries({ queryKey: ["lead"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads", workspaceSlug ?? "unknown"] });
      toast.success(crm.toasts.leadUpdated);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const addActivityMutation = useMutation({
    mutationFn: (payload: ActivityMutationInput) => {
      if (!workspaceSlug) {
        throw new Error("Workspace não selecionado");
      }
      return apiFetch<{ activity: Activity }>(appendWorkspace(`/api/leads/${leadId}/activities`), {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", workspaceSlug ?? "unknown", leadId] });
      queryClient.invalidateQueries({ queryKey: ["lead"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads", workspaceSlug ?? "unknown"] });
      toast.success(crm.toasts.activityLogged);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const completeTaskMutation = useMutation({
    mutationFn: (activityId: string) => {
      if (!workspaceSlug) {
        throw new Error("Workspace não selecionado");
      }
      return apiFetch<{ activity: Activity }>(appendWorkspace(`/api/activities/${activityId}`), {
        method: "PATCH",
        body: JSON.stringify({ status: "COMPLETED" }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", workspaceSlug ?? "unknown", leadId] });
      queryClient.invalidateQueries({ queryKey: ["lead"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads", workspaceSlug ?? "unknown"] });
      toast.success(crm.toasts.taskCompleted);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const commentMutation = useMutation({
    mutationFn: async ({ activityId, content, mentions }: { activityId: string; content: string; mentions: string[] }) => {
      if (!workspaceSlug) {
        throw new Error("Workspace não selecionado");
      }
      return apiFetch<{ comment: ActivityComment }>(appendWorkspace(`/api/activities/${activityId}/comments`), {
        method: "POST",
        body: JSON.stringify({ content, mentions }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", workspaceSlug ?? "unknown", leadId] });
      queryClient.invalidateQueries({ queryKey: ["lead"] });
      toast.success(leadCopy.comments.toastCreated);
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

  const handleStageChange = async (stageId: string) => {
    if (!stageId) return;
    try {
      const result = await updateLeadMutation.mutateAsync({ stageId });
      const updatedStageName = result?.lead?.stage?.name ?? lead?.stage?.name;
      if (updatedStageName && updatedStageName.toLowerCase() === "ganho" && hasAlternativePipelines) {
        setTransitionOpen(true);
      }
    } catch (error) {
      console.error("change stage", error);
    }
  };

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

  if (!workspaceSlug) {
    if (isWorkspaceLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
        Não foi possível identificar o workspace ativo. Retorne à lista de funis e selecione um workspace válido.
      </div>
    );
  }

  const handleTaskDone = async (activity: Activity) => {
    await completeTaskMutation.mutateAsync(activity.id);
  };

  const ensureCommentDraft = (activityId: string) => {
    setCommentDrafts((prev) => {
      if (prev[activityId]) return prev;
      return {
        ...prev,
        [activityId]: {
          content: "",
          mentions: [],
        },
      };
    });
  };

  const handleToggleComments = (activityId: string) => {
    setActiveCommentActivity((current) => {
      const next = current === activityId ? null : activityId;
      if (next) ensureCommentDraft(activityId);
      return next;
    });
  };

  const handleCommentChange = (activityId: string, content: string) => {
    setCommentDrafts((prev) => ({
      ...prev,
      [activityId]: {
        content,
        mentions: prev[activityId]?.mentions ?? [],
      },
    }));
  };

  const handleMentionsChange = (activityId: string, mentionIds: string[]) => {
    setCommentDrafts((prev) => ({
      ...prev,
      [activityId]: {
        content: prev[activityId]?.content ?? "",
        mentions: mentionIds,
      },
    }));
  };

  const handleCommentSubmit = async (activityId: string) => {
    const draft = commentDrafts[activityId];
    if (!draft || !draft.content.trim()) {
      toast.error(commentsCopy.validationRequired);
      return;
    }

    await commentMutation.mutateAsync({
      activityId,
      content: draft.content.trim(),
      mentions: draft.mentions,
    });

    setCommentDrafts((prev) => ({
      ...prev,
      [activityId]: {
        content: "",
        mentions: [],
      },
    }));
    setActiveCommentActivity(null);
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
    <TooltipProvider>
      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <NotebookPen className="h-5 w-5 text-primary" />
              {lead.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setTransitionOpen(true)}
                disabled={!hasAlternativePipelines}
              >
                {messages.crm.leadTransition.trigger}
              </Button>
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
            </div>
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
            <CardTitle>{timelineCopy.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setActivityInitialValues({
                    type: "email",
                    content: "",
                    status: "OPEN",
                    priority: "MEDIUM",
                  });
                  setActivityDialogOpen(true);
                }}
                disabled={!lead.email}
              >
                <Mail className="mr-2 h-4 w-4" /> {leadCopy.buttons.sendEmail}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setActivityInitialValues({
                    type: "note",
                    content: "",
                    status: "OPEN",
                    priority: "MEDIUM",
                  });
                  setActivityDialogOpen(true);
                }}
              >
                {leadCopy.buttons.addActivity}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground">{timelineCopy.empty}</p>
            ) : (
              <ul className="space-y-4">
                {sortedActivities.map((activity) => {
                  const isTask = activity.type === "task";
                  const isCompleted = isTask && activity.status === "COMPLETED";
                  const dueAt = activity.dueAt ? new Date(activity.dueAt) : null;
                  const isOverdue = Boolean(
                    isTask && !isCompleted && dueAt && dueAt.getTime() < now,
                  );
                  const isDueSoon = Boolean(
                    isTask &&
                      !isCompleted &&
                      !isOverdue &&
                      dueAt &&
                      dueAt.getTime() > now &&
                      dueAt.getTime() - now <= 60 * 60 * 1000,
                  );
                  const formattedCreatedAt = formatDate(activity.createdAt, { locale });
                  const formattedDueAt = activity.dueAt
                    ? formatDate(activity.dueAt, { locale })
                    : null;
                  const typeLabel = activityCopy.types[activity.type];
                  const titleText = activity.title?.trim() ? activity.title : typeLabel;
                  const priorityValue = (activity.priority ?? "MEDIUM") as "LOW" | "MEDIUM" | "HIGH";
                  const priorityKey = priorityValue.toLowerCase() as "low" | "medium" | "high";
                  const priorityLabel = activityCopy.priorities[priorityKey];
                  const statusValue = (activity.status ?? "OPEN") as "OPEN" | "COMPLETED";
                  const statusLabel =
                    activityCopy.statuses[statusValue === "OPEN" ? "open" : "completed"];
                  const assigneeLabel = activity.assignee
                    ? activity.assignee.name?.trim() ||
                      activity.assignee.email ||
                      crm.statuses.none
                    : crm.statuses.none;
                  const followerNames =
                    activity.followers?.map(
                      (user) => user.name?.trim() || user.email || crm.statuses.none,
                    ) ?? [];
                  const showFollowers = followerNames.length > 0;
                  const priorityBadgeVariant =
                    priorityValue === "HIGH" ? "destructive" : priorityValue === "LOW" ? "outline" : "secondary";

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
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                              <span>{titleText}</span>
                              <Badge variant="outline">{typeLabel}</Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">{formattedCreatedAt}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant={priorityBadgeVariant} className="font-medium">
                              {priorityLabel}
                            </Badge>
                            <span>
                              {activityCopy.labels.assignee}: {assigneeLabel}
                            </span>
                            <Badge variant={statusValue === "COMPLETED" ? "secondary" : "outline"}>
                              {statusLabel}
                            </Badge>
                          </div>
                        </div>
                        {isTask && activity.dueAt ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant={
                                isCompleted
                                  ? "secondary"
                                  : isOverdue
                                    ? "destructive"
                                    : isDueSoon
                                      ? "warning"
                                      : "secondary"
                              }
                            >
                              {isCompleted ? statusLabel : dueBadgeText}
                            </Badge>
                            {!isCompleted ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleTaskDone(activity)}
                                disabled={completeTaskMutation.isPending}
                              >
                                <CheckCircle2 className="mr-1 h-4 w-4" /> {crm.buttons.markDone}
                              </Button>
                            ) : null}
                          </div>
                        ) : null}
                        <p
                          className={cn(
                            "text-sm whitespace-pre-line",
                            isOverdue
                              ? "text-destructive"
                              : isCompleted
                                ? "text-muted-foreground line-through"
                                : "text-muted-foreground",
                          )}
                        >
                          {activity.content}
                        </p>
                        {showFollowers ? (
                          <p className="text-xs text-muted-foreground">
                            {activityCopy.labels.followers}: {followerNames.join(", ")}
                          </p>
                        ) : null}

                        <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-3">
                          <button
                            type="button"
                            className="flex items-center gap-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
                            onClick={() => handleToggleComments(activity.id)}
                          >
                            <MessageCircleMore className="h-4 w-4" />
                            {commentsCopy.count.replace(
                              "{{count}}",
                              String(activity.comments?.length ?? 0),
                            )}
                          </button>

                          {activeCommentActivity === activity.id ? (
                            <div className="mt-3 space-y-3">
                              {activity.comments?.length ? (
                                <div className="space-y-2">
                                  {activity.comments.map((comment) => {
                                    const authorName =
                                      comment.author?.name?.trim() ||
                                      comment.author?.email ||
                                      commentsCopy.unknownAuthor;
                                    const postedAt = formatDate(comment.createdAt, {
                                      locale,
                                      format: {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    });
                                    return (
                                      <div key={comment.id} className="rounded-lg border border-border/70 bg-background p-3">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                          <span className="font-semibold text-foreground">{authorName}</span>
                                          <span>{commentsCopy.postedAt.replace("{{date}}", postedAt)}</span>
                                        </div>
                                        <div className="mt-2 whitespace-pre-line text-sm text-foreground">
                                          {renderCommentContent(comment)}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">{commentsCopy.empty}</p>
                              )}

                              <MentionTextarea
                                users={mentionUsers}
                                value={commentDrafts[activity.id]?.content ?? ""}
                                mentions={commentDrafts[activity.id]?.mentions ?? []}
                                onChange={(text) => handleCommentChange(activity.id, text)}
                                onMentionsChange={(ids) => handleMentionsChange(activity.id, ids)}
                                placeholder={commentsCopy.placeholder}
                                disabled={commentMutation.isPending}
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setActiveCommentActivity(null);
                                  }}
                                >
                                  {commentsCopy.cancel}
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => handleCommentSubmit(activity.id)}
                                  disabled={commentMutation.isPending}
                                >
                                  {commentMutation.isPending
                                    ? commentsCopy.submitting
                                    : commentsCopy.submit}
                                </Button>
                              </div>
                              {workspaceUsersQuery.isError ? (
                                <p className="text-xs text-destructive">{commentsCopy.usersError}</p>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
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
        mode="create"
        lead={lead}
        initialValues={activityInitialValues}
        open={activityDialogOpen}
        onOpenChange={(open) => {
          setActivityDialogOpen(open);
          if (!open) {
            setActivityInitialValues({
              type: "note",
              status: "OPEN",
              priority: "MEDIUM",
              content: "",
              assigneeId: "",
              followers: [],
            });
          }
        }}
        onSubmit={async (formData) => {
          const { leadId, activityId, assigneeId, ...body } = formData;
          void activityId;
          void leadId;
          await addActivityMutation.mutateAsync({
            ...body,
            assigneeId: assigneeId ?? null,
          });
        }}
      />

      <LeadTransitionDialog lead={lead} open={transitionOpen} onOpenChange={setTransitionOpen} />
      </div>
    </TooltipProvider>
  );
}
