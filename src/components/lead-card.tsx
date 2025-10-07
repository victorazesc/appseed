"use client";

import { AlertTriangle, Clock, NotebookPen, Plus } from "lucide-react";

import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { LeadSummary } from "@/types";
import { useTranslation } from "@/contexts/i18n-context";

import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

type LeadCardProps = {
  lead: LeadSummary;
  onOpenDetails?: (leadId: string) => void;
  onAddActivity?: (lead: LeadSummary) => void;
  dragging?: boolean;
};

export function LeadCard({ lead, onOpenDetails, onAddActivity, dragging }: LeadCardProps) {
  const { messages, locale } = useTranslation();
  const { crm } = messages;
  const createdDate = lead.createdAt ? new Date(lead.createdAt) : new Date();
  const hasOverdue = Boolean(lead.hasOverdueTasks && (lead.overdueTasksCount ?? 0) > 0);
  const nextDueAt = lead.nextDueAt ? new Date(lead.nextDueAt) : null;
  const now = Date.now();
  const dueSoon = Boolean(
    !hasOverdue &&
      nextDueAt &&
      nextDueAt.getTime() > now &&
      nextDueAt.getTime() - now <= 60 * 60 * 1000,
  );

  const formattedCreatedDate = formatDate(createdDate, {
    locale,
    format: {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  });

  const createdAtLabel = crm.leadCard.createdAt.replace("{{date}}", formattedCreatedDate);
  const activitiesLabel = crm.leadCard.activities.replace(
    "{{count}}",
    String(lead._count?.activities ?? 0),
  );
  const nextActivityLabel = nextDueAt
    ? crm.leadCard.nextActivity.replace(
        "{{date}}",
        formatDate(nextDueAt.toISOString(), {
          locale,
          format: {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          },
        }),
      )
    : crm.leadCard.noNextActivity;

  return (
    <Card
      className={cn(
        "group flex cursor-grab flex-col gap-3 rounded-xl border border-border bg-background p-4 shadow-sm transition hover:border-primary/60",
        dragging && "opacity-80 shadow-md",
        hasOverdue && "border-destructive/60 ring-2 ring-destructive/40",
        !hasOverdue && dueSoon && "border-amber-300/70 ring-2 ring-amber-200/60",
      )}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpenDetails?.(lead.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpenDetails?.(lead.id);
          }
        }}
        className="flex flex-1 flex-col items-start gap-2 text-left focus:outline-none"
      >
        <div className="flex w-full items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{lead.name}</p>
          <div className="flex items-center gap-2">
            {hasOverdue ? (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                {lead.overdueTasksCount ?? 0}
              </Badge>
            ) : null}
            {!hasOverdue && dueSoon ? (
              <Badge variant="warning" className="gap-1">
                <Clock className="h-3.5 w-3.5" />
                {crm.leadCard.attention}
              </Badge>
            ) : null}
            <Badge variant="success">
              <Clock className="mr-1 h-3 w-3" />
              {createdAtLabel}
            </Badge>
          </div>
        </div>
        {lead.company ? (
          <p className="text-sm text-muted-foreground">{lead.company}</p>
        ) : null}
        <p className="text-base font-semibold text-foreground">
          {formatCurrency(lead.valueCents, { locale })}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <NotebookPen className="h-4 w-4" />
          {activitiesLabel}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddActivity?.(lead)}
          className="h-8 px-2 text-xs"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          {crm.leadCard.addActivity}
        </Button>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span>{nextActivityLabel}</span>
      </div>
    </Card>
  );
}
