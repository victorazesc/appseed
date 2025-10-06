"use client";

import { useMemo, useRef, useState } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { ActivityDialog } from "@/components/dialogs/activity-dialog";
import { NewLeadDialog } from "@/components/dialogs/new-lead-dialog";
import { StageColumn } from "@/components/stage-column";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import type { LeadSummary, Stage } from "@/types";
import { useTranslation } from "@/contexts/i18n-context";
import { useActivePipeline, usePipelines } from "@/contexts/pipeline-context";
import { useWorkspace } from "@/contexts/workspace-context";
import { LeadTransitionDialog } from "@/components/lead/lead-transition-dialog";

const leadsKey = (
  workspaceSlug: string | undefined,
  params: { q?: string; ownerId?: string; pipelineId?: string },
) => ["leads", workspaceSlug ?? "unknown", params] as const;

type CreateLeadInput = {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  valueCents?: number;
  ownerId?: string;
  stageId?: string;
  notes?: string;
};

type ActivityInput = {
  leadId: string;
  type: "note" | "call" | "email" | "whatsapp" | "task";
  content: string;
  dueAt?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { messages } = useTranslation();
  const { crm } = messages;
  const transitionCopy = crm.leadTransition;
  const { pipelines, isLoading: isPipelinesLoading } = usePipelines();
  const { activePipeline, activePipelineId } = useActivePipeline();
  const { workspace, isLoading: isWorkspaceLoading } = useWorkspace();
  const workspaceSlug = workspace?.slug;
  const appendWorkspace = (url: string) => {
    if (!workspaceSlug) return url;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}workspaceSlug=${encodeURIComponent(workspaceSlug)}`;
  };
  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [activityLead, setActivityLead] = useState<LeadSummary | null>(null);
  const [transitionLead, setTransitionLead] = useState<LeadSummary | null>(null);
  const [transitionOpen, setTransitionOpen] = useState(false);
  const [transitionRule, setTransitionRule] = useState<{
    pipelineId?: string | null;
    stageId?: string | null;
    copyActivities?: boolean;
    archiveSource?: boolean;
    sourceStageId?: string | null;
  } | null>(null);
  const autoTransitioningRef = useRef(new Set<string>());

  const pipelineStages = useMemo(() => {
    const stages = activePipeline?.stages ?? [];
    return [...stages].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }, [activePipeline?.stages]);

  const leadsQuery = useQuery({
    queryKey: leadsKey(workspaceSlug, {
      q: search || undefined,
      ownerId: ownerFilter || undefined,
      pipelineId: activePipelineId ?? undefined,
    }),
    queryFn: async () => {
      if (!activePipelineId || !workspaceSlug) return [] as LeadSummary[];
      const params = new URLSearchParams();
      params.set("pipelineId", activePipelineId);
      params.set("workspaceSlug", workspaceSlug);
      if (search) params.set("q", search);
      if (ownerFilter) params.set("ownerId", ownerFilter);
      const data = await apiFetch<{ leads: LeadSummary[] }>(`/api/leads?${params.toString()}`);
      return data.leads;
    },
    enabled: Boolean(activePipelineId && workspaceSlug),
    onError: (error: Error) => toast.error(error.message),
  });

  const createLeadMutation = useMutation({
    mutationFn: async ({ notes, ...payload }: CreateLeadInput) => {
      if (!workspaceSlug) {
        throw new Error("Workspace não selecionado");
      }
      const response = await apiFetch<{ lead: LeadSummary }>(appendWorkspace("/api/leads"), {
        method: "POST",
        body: JSON.stringify({ ...payload, pipelineId: activePipelineId }),
      });
      return { ...response, notes };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads", workspaceSlug ?? "unknown"] });
      toast.success(crm.toasts.leadCreated);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const addActivityMutation = useMutation({
    mutationFn: ({ leadId, ...payload }: ActivityInput) => {
      if (!workspaceSlug) {
        throw new Error("Workspace não selecionado");
      }
      return apiFetch<{ activity: unknown }>(appendWorkspace(`/api/leads/${leadId}/activities`), {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads", workspaceSlug ?? "unknown"] });
      toast.success(crm.toasts.activityLogged);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const moveLeadMutation = useMutation({
    mutationFn: ({ leadId, stageId }: { leadId: string; stageId: string }) => {
      if (!workspaceSlug) {
        throw new Error("Workspace não selecionado");
      }
      return apiFetch<{ lead: LeadSummary }>(appendWorkspace(`/api/leads/${leadId}`), {
        method: "PATCH",
        body: JSON.stringify({ stageId, pipelineId: activePipelineId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads", workspaceSlug ?? "unknown"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const owners = useMemo(() => {
    const set = new Set<string>();
    (leadsQuery.data ?? []).forEach((lead) => {
      if (lead.ownerId) set.add(lead.ownerId);
    });
    return Array.from(set).sort();
  }, [leadsQuery.data]);

  const leadsByStage = useMemo(() => {
    const map = new Map<string, LeadSummary[]>();
    pipelineStages.forEach((stage) => map.set(stage.id, []));

    (leadsQuery.data ?? []).forEach((lead) => {
      const stageId = lead.stage?.id ?? lead.stageId;
      if (!stageId) return;
      const list = map.get(stageId) ?? [];
      list.push(lead);
      map.set(stageId, list);
    });

    pipelineStages.forEach((stage) => {
      const list = map.get(stage.id);
      if (list) {
        list.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
      }
    });

    return map;
  }, [leadsQuery.data, pipelineStages]);

  const triggerAutoTransition = async (lead: LeadSummary, stage: Stage, sourceStageId?: string) => {
    if (!stage.transitionTargetPipelineId) {
      toast.error(transitionCopy.error);
      return;
    }

    if (autoTransitioningRef.current.has(lead.id)) {
      return;
    }

    autoTransitioningRef.current.add(lead.id);

    try {
      if (!workspaceSlug) {
        toast.error("Workspace não selecionado");
        return;
      }

      const payload = {
        targetPipelineId: stage.transitionTargetPipelineId,
        targetStageId: stage.transitionTargetStageId ?? undefined,
        copyActivities: stage.transitionCopyActivities ?? true,
        archiveSource: stage.transitionArchiveSource ?? false,
        sourceStageId: sourceStageId ?? lead.stageId ?? lead.stage?.id,
      };

      const response = await fetch(appendWorkspace(`/api/leads/${lead.id}/transition`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await response.json();

      if (!response.ok) {
        if (body?.error === "already_transferred" && body?.pipelineName) {
          toast.error(transitionCopy.duplicate.replace("{{pipeline}}", body.pipelineName));
        } else {
          toast.error(transitionCopy.error);
        }
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["leads"] }),
        queryClient.invalidateQueries({ queryKey: ["pipelines"] }),
        queryClient.invalidateQueries({ queryKey: ["leads", workspaceSlug ?? "unknown"] }),
        queryClient.invalidateQueries({ queryKey: ["pipelines", workspaceSlug ?? "unknown"] }),
        queryClient.invalidateQueries({ queryKey: ["metrics"] }),
        queryClient.invalidateQueries({ queryKey: ["metrics", workspaceSlug ?? "unknown"] }),
      ]);

      toast.success(transitionCopy.success.replace("{{pipeline}}", body.targetPipelineName), {
        action: {
          label: transitionCopy.open,
          onClick: () => {
            const params = new URLSearchParams(window.location.search);
            params.set("pipelineId", body.targetPipelineId);
            if (workspaceSlug) {
              router.push(`/${workspaceSlug}/dashboard?${params.toString()}#lead-${body.newLeadId}`);
            }
          },
        },
      });
    } catch (error) {
      console.error("auto transition lead", error);
      toast.error(transitionCopy.error);
    } finally {
      autoTransitioningRef.current.delete(lead.id);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const stage = pipelineStages.find((item) => item.id === destination.droppableId);

    queryClient.setQueryData<LeadSummary[]>(
      leadsKey(workspaceSlug, {
        q: search || undefined,
        ownerId: ownerFilter || undefined,
        pipelineId: activePipelineId ?? undefined,
      }),
      (previous) => {
        if (!previous) return previous;

        const updated = previous.map((lead) => {
          if (lead.id !== draggableId) return lead;

          return {
            ...lead,
            stageId: destination.droppableId,
            stage: stage ? { ...stage } : lead.stage,
          };
        });

        return updated;
      },
    );

    moveLeadMutation.mutate({ leadId: draggableId, stageId: destination.droppableId });
    const currentLeads = queryClient.getQueryData<LeadSummary[]>(
      leadsKey(workspaceSlug, {
        q: search || undefined,
        ownerId: ownerFilter || undefined,
        pipelineId: activePipelineId ?? undefined,
      }),
    );

    const movedLead = currentLeads?.find((lead) => lead.id === draggableId);

    if (stage?.transitionMode === "MANUAL") {
      if (movedLead) {
        setTransitionLead(movedLead);
        setTransitionRule({
          pipelineId: stage.transitionTargetPipelineId ?? undefined,
          stageId: stage.transitionTargetStageId ?? undefined,
          copyActivities: stage.transitionCopyActivities ?? true,
          archiveSource: stage.transitionArchiveSource ?? false,
          sourceStageId: source.droppableId ?? null,
        });
        setTransitionOpen(true);
      }
      return;
    }

    if (stage?.transitionMode === "AUTO" && movedLead) {
      triggerAutoTransition(movedLead, stage, source.droppableId);
    }
  };

  const isLoadingLeads = leadsQuery.isLoading;
  const hasPipelines = pipelines.length > 0;
  const hasStages = pipelineStages.length > 0;

  const leadsBadgeLabel = crm.dashboard.stats.leads.replace(
    "{{count}}",
    String(leadsQuery.data?.length ?? 0),
  );
  const stagesBadgeLabel = crm.dashboard.stats.stages.replace(
    "{{count}}",
    String(pipelineStages.length ?? 0),
  );

  if (!workspaceSlug) {
    if (isWorkspaceLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
        Selecione um workspace válido para visualizar o funil.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{crm.dashboard.title}</h1>
            <p className="text-sm text-muted-foreground">{crm.dashboard.subtitle}</p>
          </div>
          <Button onClick={() => setLeadDialogOpen(true)} disabled={!hasPipelines || !hasStages}>
            {crm.buttons.newLead}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={crm.placeholders.searchLeads}
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              disabled={!hasPipelines}
            />
          </div>
          <div className="md:col-span-2">
            <select
              value={ownerFilter}
              onChange={(event) => setOwnerFilter(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={!hasPipelines}
            >
              <option value="">{crm.dashboard.ownerFilterAll}</option>
              {owners.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{leadsBadgeLabel}</Badge>
          <Badge variant="secondary">{stagesBadgeLabel}</Badge>
        </div>
      </div>

      {isPipelinesLoading ? (
        <div className="flex gap-4 overflow-x-auto">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-72 flex-shrink-0 space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      ) : !hasPipelines ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <h2 className="text-lg font-semibold text-foreground">{crm.dashboard.emptyPipelines.title}</h2>
          <p className="max-w-md text-sm text-muted-foreground">{crm.dashboard.emptyPipelines.description}</p>
          <Button
            onClick={() => {
              if (workspaceSlug) {
                router.push(`/${workspaceSlug}/settings`);
              } else {
                toast.error("Workspace não selecionado");
              }
            }}
          >
            {crm.dashboard.emptyPipelines.cta}
          </Button>
        </div>
      ) : !hasStages ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <h2 className="text-lg font-semibold text-foreground">{crm.dashboard.emptyStages.title}</h2>
          <p className="max-w-md text-sm text-muted-foreground">{crm.dashboard.emptyStages.description}</p>
        </div>
      ) : isLoadingLeads ? (
        <div className="flex gap-4 overflow-x-auto">
          {Array.from({ length: pipelineStages.length || 4 }).map((_, index) => (
            <div key={index} className="w-72 flex-shrink-0 space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      ) : (leadsQuery.data?.length ?? 0) === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <h2 className="text-lg font-semibold text-foreground">{crm.dashboard.emptyLeads}</h2>
          <Button onClick={() => setLeadDialogOpen(true)}>{crm.buttons.newLead}</Button>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-6">
            {pipelineStages.map((stage) => (
              <StageColumn
                key={stage.id}
                stage={stage}
                leads={leadsByStage.get(stage.id) ?? []}
                onOpenLead={(leadId) => {
                  if (!workspaceSlug) return;
                  router.push(`/${workspaceSlug}/leads/${leadId}`);
                }}
                onAddActivity={(lead) => setActivityLead(lead)}
              />
            ))}
          </div>
        </DragDropContext>
      )}

      <NewLeadDialog
        open={leadDialogOpen}
        onOpenChange={setLeadDialogOpen}
        stages={pipelineStages as Stage[]}
        onCreate={async (payload) => {
          const result = await createLeadMutation.mutateAsync(payload);
          if (result.notes && result.lead?.id) {
            await addActivityMutation.mutateAsync({
              leadId: result.lead.id,
              type: "note",
              content: result.notes,
            });
          }
        }}
      />

      <ActivityDialog
        lead={activityLead}
        open={Boolean(activityLead)}
        onOpenChange={(open) => {
          if (!open) setActivityLead(null);
        }}
        onCreate={async ({ leadId, ...payload }) => {
          await addActivityMutation.mutateAsync({ leadId, ...payload });
          setActivityLead(null);
        }}
      />

      <LeadTransitionDialog
        lead={transitionLead}
        open={transitionOpen}
        onOpenChange={(open) => {
          setTransitionOpen(open);
          if (!open) {
            setTransitionLead(null);
            setTransitionRule(null);
          }
        }}
        initialRule={transitionRule ?? undefined}
      />
    </div>
  );
}
