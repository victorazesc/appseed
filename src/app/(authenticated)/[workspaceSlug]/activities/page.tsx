"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, startOfToday, endOfToday } from "date-fns";
import { toast } from "sonner";

import { useWorkspace } from "@/contexts/workspace-context";
import { useTranslation } from "@/contexts/i18n-context";
import { usePipelines } from "@/contexts/pipeline-context";
import { useWorkspaceUsers } from "@/hooks/use-workspace-users";
import { ActivitiesTable } from "@/components/activity/activities-table";
import { ActivityDialog, ActivityFormSubmit } from "@/components/dialogs/activity-dialog";
import { Activity } from "@/types";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type DuePreset = "ALL" | "TODAY" | "WEEK" | "CUSTOM";

type Filters = {
  status: "OPEN" | "COMPLETED" | "OVERDUE" | "ALL";
  type: Activity["type"] | "ALL";
  priority: "LOW" | "MEDIUM" | "HIGH" | "ALL";
  pipelineId: string;
  assigneeId: string;
  duePreset: DuePreset;
  dueFrom?: string;
  dueTo?: string;
};

function buildDueRange(filters: Filters) {
  if (filters.duePreset === "TODAY") {
    const start = startOfToday();
    const end = endOfToday();
    return {
      dueFrom: start.toISOString(),
      dueTo: end.toISOString(),
    };
  }

  if (filters.duePreset === "WEEK") {
    const start = new Date();
    const end = addDays(start, 7);
    return {
      dueFrom: start.toISOString(),
      dueTo: end.toISOString(),
    };
  }

  if (filters.duePreset === "CUSTOM") {
    return {
      dueFrom: filters.dueFrom ? new Date(filters.dueFrom).toISOString() : undefined,
      dueTo: filters.dueTo ? new Date(filters.dueTo).toISOString() : undefined,
    };
  }

  return { dueFrom: undefined, dueTo: undefined };
}

export default function ActivitiesPage() {
  const queryClient = useQueryClient();
  const { workspace, membership } = useWorkspace();
  const { messages } = useTranslation();
  const { crm } = messages;
  const copy = crm.activities;
  const filtersCopy = copy.filters;
  const { pipelines } = usePipelines();
  const usersQuery = useWorkspaceUsers();

  const workspaceSlug = workspace?.slug;
  const defaultAssigneeId = membership?.userId ?? "";

  const [filters, setFilters] = useState<Filters>({
    status: "OPEN",
    type: "ALL",
    priority: "ALL",
    pipelineId: "",
    assigneeId: defaultAssigneeId,
    duePreset: "ALL",
    dueFrom: "",
    dueTo: "",
  });

  const [assigneeInitialized, setAssigneeInitialized] = useState(Boolean(defaultAssigneeId));

  useEffect(() => {
    if (!assigneeInitialized && defaultAssigneeId) {
      setFilters((prev) => ({ ...prev, assigneeId: defaultAssigneeId }));
      setAssigneeInitialized(true);
    }
  }, [assigneeInitialized, defaultAssigneeId]);

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const activitiesQuery = useQuery({
    queryKey: ["activities", workspaceSlug, filters],
    queryFn: async () => {
      if (!workspaceSlug) return [] as Activity[];
      const params = new URLSearchParams({ workspaceSlug });

      if (filters.assigneeId) params.set("assigneeId", filters.assigneeId);
      if (filters.pipelineId) params.set("pipelineId", filters.pipelineId);

      if (filters.type !== "ALL") params.set("type", filters.type);
      if (filters.priority !== "ALL") params.set("priority", filters.priority);

      if (filters.status === "OVERDUE") {
        params.set("status", "overdue");
      } else if (filters.status !== "ALL") {
        params.set("status", filters.status.toLowerCase());
      }

      const dueRange = buildDueRange(filters);
      if (dueRange.dueFrom) params.set("dueFrom", dueRange.dueFrom);
      if (dueRange.dueTo) params.set("dueTo", dueRange.dueTo);

      const response = await apiFetch<{ activities: Activity[] }>(`/api/activities?${params.toString()}`);
      return response.activities;
    },
    enabled: Boolean(workspaceSlug),
  });

  const invalidateActivities = () => {
    queryClient.invalidateQueries({ queryKey: ["activities", workspaceSlug] });
  };

  const completeMutation = useMutation({
    mutationFn: async (activity: Activity) => {
      if (!workspaceSlug) throw new Error("Workspace não selecionado");
      const params = new URLSearchParams({ workspaceSlug });
      return apiFetch<{ activity: Activity }>(`/api/activities/${activity.id}?${params.toString()}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "COMPLETED" }),
      });
    },
    onSuccess: () => {
      invalidateActivities();
      toast.success(copy.toasts.completed);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const reassignMutation = useMutation({
    mutationFn: async ({ activity, assigneeId }: { activity: Activity; assigneeId: string | null }) => {
      if (!workspaceSlug) throw new Error("Workspace não selecionado");
      const params = new URLSearchParams({ workspaceSlug });
      return apiFetch<{ activity: Activity }>(`/api/activities/${activity.id}?${params.toString()}`, {
        method: "PATCH",
        body: JSON.stringify({ assigneeId }),
      });
    },
    onSuccess: () => {
      invalidateActivities();
      toast.success(copy.toasts.reassigned);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (activity: Activity) => {
      if (!workspaceSlug) throw new Error("Workspace não selecionado");
      const params = new URLSearchParams({ workspaceSlug });
      return apiFetch<{ ok: boolean }>(`/api/activities/${activity.id}?${params.toString()}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      invalidateActivities();
      toast.success(copy.toasts.deleted);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: ActivityFormSubmit) => {
      if (!workspaceSlug || !payload.activityId) throw new Error("Workspace não selecionado");
      const params = new URLSearchParams({ workspaceSlug });
      return apiFetch<{ activity: Activity }>(`/api/activities/${payload.activityId}?${params.toString()}`, {
        method: "PATCH",
        body: JSON.stringify({
          type: payload.type,
          title: payload.title,
          content: payload.content,
          dueAt: payload.dueAt,
          status: payload.status,
          priority: payload.priority,
          assigneeId: payload.assigneeId ?? null,
          followers: payload.followers,
        }),
      });
    },
    onSuccess: () => {
      invalidateActivities();
      toast.success(copy.toasts.updated);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const resetFilters = () => {
    setFilters({
      status: "OPEN",
      type: "ALL",
      priority: "ALL",
      pipelineId: "",
      assigneeId: membership?.userId ?? "",
      duePreset: "ALL",
      dueFrom: "",
      dueTo: "",
    });
  };

  const users = usersQuery.data ?? [];

  const handleEdit = (activity: Activity) => {
    setSelectedActivity(activity);
    setEditDialogOpen(true);
  };

  const activities = activitiesQuery.data ?? [];

  const isLoading = activitiesQuery.isLoading || usersQuery.isLoading;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="filter-status">
              {filtersCopy.status}
            </label>
            <Select
              id="filter-status"
              value={filters.status}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, status: event.target.value as Filters["status"] }))
              }
            >
              <option value="OPEN">{filtersCopy.statusOpen}</option>
              <option value="OVERDUE">{filtersCopy.statusOverdue}</option>
              <option value="COMPLETED">{filtersCopy.statusCompleted}</option>
              <option value="ALL">{filtersCopy.statusAll}</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="filter-type">
              {filtersCopy.type}
            </label>
            <Select
              id="filter-type"
              value={filters.type}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, type: event.target.value as Activity["type"] | "ALL" }))
              }
            >
              <option value="ALL">{filtersCopy.typeAll}</option>
              <option value="note">{copy.types.note}</option>
              <option value="call">{copy.types.call}</option>
              <option value="email">{copy.types.email}</option>
              <option value="whatsapp">{copy.types.whatsapp}</option>
              <option value="task">{copy.types.task}</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="filter-priority">
              {filtersCopy.priority}
            </label>
            <Select
              id="filter-priority"
              value={filters.priority}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, priority: event.target.value as Filters["priority"] }))
              }
            >
              <option value="ALL">{filtersCopy.priorityAll}</option>
              <option value="LOW">{copy.priorities.low}</option>
              <option value="MEDIUM">{copy.priorities.medium}</option>
              <option value="HIGH">{copy.priorities.high}</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="filter-pipeline">
              {filtersCopy.pipeline}
            </label>
            <Select
              id="filter-pipeline"
              value={filters.pipelineId}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, pipelineId: event.target.value }))
              }
            >
              <option value="">{filtersCopy.pipelineAll}</option>
              {(pipelines ?? []).map((pipeline) => (
                <option key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="filter-assignee">
              {filtersCopy.assignee}
            </label>
            <Select
              id="filter-assignee"
              value={filters.assigneeId}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, assigneeId: event.target.value }))
              }
            >
              <option value="">{filtersCopy.assigneeAll}</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name?.trim() || user.email || copy.table.noAssignee}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="filter-due">
              {filtersCopy.due}
            </label>
            <Select
              id="filter-due"
              value={filters.duePreset}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, duePreset: event.target.value as DuePreset }))
              }
            >
              <option value="ALL">{filtersCopy.dueAll}</option>
              <option value="TODAY">{filtersCopy.dueToday}</option>
              <option value="WEEK">{filtersCopy.dueWeek}</option>
              <option value="CUSTOM">{filtersCopy.dueCustom}</option>
            </Select>
            {filters.duePreset === "CUSTOM" ? (
              <div className="mt-2 flex gap-2">
                <Input
                  type="date"
                  value={filters.dueFrom ?? ""}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, dueFrom: event.target.value }))
                  }
                />
                <Input
                  type="date"
                  value={filters.dueTo ?? ""}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, dueTo: event.target.value }))
                  }
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={resetFilters}>
            {filtersCopy.reset}
          </Button>
        </div>
      </div>

      <ActivitiesTable
        activities={activities}
        workspaceSlug={workspaceSlug}
        isLoading={isLoading}
        onComplete={(activity) => completeMutation.mutate(activity)}
        onReassign={(activity, assigneeId) => reassignMutation.mutate({ activity, assigneeId })}
        onEdit={handleEdit}
        onDelete={(activity) => {
          if (window.confirm(copy.table.deleteConfirm)) {
            deleteMutation.mutate(activity);
          }
        }}
        completingId={
          completeMutation.isPending ? completeMutation.variables?.id ?? null : null
        }
        reassigningId={
          reassignMutation.isPending
            ? reassignMutation.variables?.activity?.id ?? null
            : null
        }
        deletingId={deleteMutation.isPending ? deleteMutation.variables?.id ?? null : null}
      />

      <ActivityDialog
        mode="edit"
        activity={selectedActivity}
        lead={null}
        open={editDialogOpen && Boolean(selectedActivity)}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setSelectedActivity(null);
        }}
        onSubmit={async (payload) => {
          await updateMutation.mutateAsync(payload);
          setEditDialogOpen(false);
          setSelectedActivity(null);
        }}
      />
    </div>
  );
}
