"use client";

import Link from "next/link";
import { Loader2, Trash2, Pencil, CheckSquare } from "lucide-react";

import { useTranslation } from "@/contexts/i18n-context";
import { Activity } from "@/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AssigneeSelect } from "@/components/activity/assignee-select";
import { ActivityPriorityBadge } from "@/components/activity/activity-priority-badge";
import { ActivityStatusBadge } from "@/components/activity/activity-status-badge";

type ActivitiesTableProps = {
  activities: Activity[];
  isLoading?: boolean;
  workspaceSlug?: string;
  onComplete: (activity: Activity) => void;
  onReassign: (activity: Activity, assigneeId: string | null) => void;
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
  completingId?: string | null;
  reassigningId?: string | null;
  deletingId?: string | null;
};

export function ActivitiesTable({
  activities,
  isLoading = false,
  workspaceSlug,
  onComplete,
  onReassign,
  onEdit,
  onDelete,
  completingId,
  reassigningId,
  deletingId,
}: ActivitiesTableProps) {
  const { messages } = useTranslation();
  const { crm } = messages;
  const copy = crm.activities;
  const tableCopy = copy.table;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <div className="h-3 w-full rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
        {copy.empty}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{tableCopy.activity}</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{tableCopy.lead}</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{tableCopy.pipeline}</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{tableCopy.assignee}</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{tableCopy.dueDate}</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{tableCopy.status}</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{tableCopy.actions}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {activities.map((activity) => {
            const lead = activity.lead;
            const dueAt = activity.dueAt ? new Date(activity.dueAt) : null;
            const isTask = activity.type === "task";
            const now = Date.now();
            const isOverdue = Boolean(
              isTask && activity.status !== "COMPLETED" && dueAt && dueAt.getTime() < now,
            );
            const dueLabel = dueAt ? formatDate(dueAt.toISOString()) : copy.table.noDueDate;
            const leadHref = workspaceSlug && lead ? `/${workspaceSlug}/leads/${lead.id}` : null;
            const typeLabel = copy.types[activity.type];
            const titleLabel = activity.title?.trim() ? activity.title : typeLabel;
            const priorityValue = (activity.priority ?? "MEDIUM") as "LOW" | "MEDIUM" | "HIGH";
            const priorityLabel = copy.priorities[priorityValue.toLowerCase() as "low" | "medium" | "high"];
            const statusValue = activity.status ?? "OPEN";
            const statusLabel = copy.statuses[statusValue === "COMPLETED" ? "completed" : "open"];
            const followers = activity.followers ?? [];

            return (
              <tr key={activity.id} className="bg-card align-center hover:bg-accent/10">
                <td className="px-4 py-3 align-top">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-foreground">{titleLabel}</span>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{typeLabel}</span>
                      <ActivityPriorityBadge priority={priorityValue} label={priorityLabel} />
                      {followers.length ? (
                        <span>{copy.table.followersCount.replace("{{count}}", String(followers.length))}</span>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  {lead && leadHref ? (
                    <Link href={leadHref} className="text-foreground hover:underline">
                      {lead.name}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">{copy.table.noLead}</span>
                  )}
                </td>
                <td className="px-4 py-3 align-top text-muted-foreground">
                  {lead?.pipeline ? (
                    <div className="flex flex-col">
                      <span className="text-foreground">{lead.pipeline.name}</span>
                      <span className="text-xs">{lead.stage?.name ?? copy.table.noStage}</span>
                    </div>
                  ) : (
                    <span>{copy.table.noPipeline}</span>
                  )}
                </td>
                <td className="px-4 py-3 align-middle">
                  <AssigneeSelect
                    value={activity.assignee?.id ?? ""}
                    onChange={(val) => onReassign(activity, val)}
                    disabled={reassigningId === activity.id}
                    labelUnassigned={copy.table.noAssignee}
                  />
                </td>
                <td className="px-4 py-3 align-middle">
                  <span
                    className={cn(
                      "text-sm",
                      isOverdue && statusValue !== "COMPLETED" ? "text-destructive font-medium" : "text-foreground",
                    )}
                  >
                    {dueLabel}
                  </span>
                </td>
                <td className="px-4 py-3 align-middle">
                  <ActivityStatusBadge status={statusValue as "OPEN" | "COMPLETED"} label={statusLabel} />
                </td>
                <td className="px-4 py-3 align-middle text-left">
                  <div className="flex items-center justify-start gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onComplete(activity)}
                      disabled={statusValue === "COMPLETED" || completingId === activity.id}
                    >
                      <CheckSquare className="mr-1 h-4 w-4" /> {copy.table.complete}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(activity)}
                    >
                      <Pencil className="mr-1 h-4 w-4" /> {copy.table.edit}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => onDelete(activity)}
                      disabled={deletingId === activity.id}
                    >
                      <Trash2 className="mr-1 h-4 w-4" /> {copy.table.delete}
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
