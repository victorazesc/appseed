"use client";

import { useMemo, useState } from "react";
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

const leadsKey = (params: { q?: string; ownerId?: string }) => ["leads", params] as const;

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { messages } = useTranslation();
  const { crm } = messages;
  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [activityLead, setActivityLead] = useState<LeadSummary | null>(null);

  const stagesQuery = useQuery({
    queryKey: ["stages"],
    queryFn: async () => {
      const data = await apiFetch<{ stages: Stage[] }>("/api/stages");
      return data.stages.sort((a, b) => a.position - b.position);
    },
  });

  const leadsQuery = useQuery({
    queryKey: leadsKey({ q: search || undefined, ownerId: ownerFilter || undefined }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (ownerFilter) params.set("ownerId", ownerFilter);
      const qs = params.toString();
      const data = await apiFetch<{ leads: LeadSummary[] }>(
        qs ? `/api/leads?${qs}` : "/api/leads",
      );
      return data.leads;
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: async ({ notes, ...payload }: CreateLeadInput) => {
      const response = await apiFetch<{ lead: LeadSummary }>("/api/leads", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return { ...response, notes };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success(crm.toasts.leadCreated);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const addActivityMutation = useMutation({
    mutationFn: ({ leadId, ...payload }: ActivityInput) =>
      apiFetch<{ activity: unknown }>(`/api/leads/${leadId}/activities`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success(crm.toasts.activityLogged);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const moveLeadMutation = useMutation({
    mutationFn: ({ leadId, stageId }: { leadId: string; stageId: string }) =>
      apiFetch<{ lead: LeadSummary }>(`/api/leads/${leadId}`, {
        method: "PATCH",
        body: JSON.stringify({ stageId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
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
    stagesQuery.data?.forEach((stage) => map.set(stage.id, []));

    (leadsQuery.data ?? []).forEach((lead) => {
      const stageId = lead.stage?.id ?? lead.stageId;
      if (!stageId) return;
      const list = map.get(stageId) ?? [];
      list.push(lead);
      map.set(stageId, list);
    });

    stagesQuery.data?.forEach((stage) => {
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
  }, [leadsQuery.data, stagesQuery.data]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const stage = stagesQuery.data?.find((item) => item.id === destination.droppableId);

    queryClient.setQueryData<LeadSummary[]>(
      leadsKey({ q: search || undefined, ownerId: ownerFilter || undefined }),
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
  };

  const isLoading = stagesQuery.isLoading || leadsQuery.isLoading;
  const leadsBadgeLabel = crm.dashboard.stats.leads.replace(
    "{{count}}",
    String(leadsQuery.data?.length ?? 0),
  );
  const stagesBadgeLabel = crm.dashboard.stats.stages.replace(
    "{{count}}",
    String(stagesQuery.data?.length ?? 0),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{crm.dashboard.title}</h1>
            <p className="text-sm text-muted-foreground">{crm.dashboard.subtitle}</p>
          </div>
          <Button onClick={() => setLeadDialogOpen(true)}>{crm.buttons.newLead}</Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={crm.placeholders.searchLeads}
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <select
              value={ownerFilter}
              onChange={(event) => setOwnerFilter(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-72 flex-shrink-0 space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-6">
            {stagesQuery.data?.map((stage) => (
              <StageColumn
                key={stage.id}
                stage={stage}
                leads={leadsByStage.get(stage.id) ?? []}
                onOpenLead={(leadId) => router.push(`/leads/${leadId}`)}
                onAddActivity={(lead) => setActivityLead(lead)}
              />
            ))}
          </div>
        </DragDropContext>
      )}

      <NewLeadDialog
        open={leadDialogOpen}
        onOpenChange={setLeadDialogOpen}
        stages={stagesQuery.data ?? []}
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
    </div>
  );
}
