"use client";

import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Settings2 } from "lucide-react";

import { LeadSummary, Stage } from "@/types";

import { LeadCard } from "./lead-card";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/i18n-context";
import { formatCurrency } from "@/lib/format";

export type StageColumnProps = {
  stage: Stage;
  leads: LeadSummary[];
  onOpenLead: (leadId: string) => void;
  onAddActivity: (lead: LeadSummary) => void;
};

export function StageColumn({ stage, leads, onOpenLead, onAddActivity }: StageColumnProps) {
  const { messages, locale } = useTranslation();
  const { crm } = messages;

  const positiveStyle = {
    container: "bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-950/70 border-emerald-200/70",
    badge: "bg-emerald-100 text-emerald-700",
  } as const;

  const negativeStyle = {
    container: "bg-rose-50 dark:bg-rose-950/30 dark:border-rose-950/70 border-rose-200/70",
    badge: "bg-rose-100 text-rose-700",
  } as const;

  const styleMap: Record<string, { container: string; badge: string }> = {
    Ganho: positiveStyle,
    Won: positiveStyle,
    Ganado: positiveStyle,
    Perda: negativeStyle,
    Lost: negativeStyle,
    Perdido: negativeStyle,
  };

  const stageStyle = styleMap[stage.name] ?? {
    container: "bg-muted/30 border-transparent",
    badge: "",
  };

  const leadBadgeLabel = crm.stageColumn.leadCount.replace("{{count}}", String(leads.length));
  const totalValueCents = leads.reduce((total, lead) => total + (lead.valueCents ?? 0), 0);
  const formattedTotal = formatCurrency(totalValueCents, { locale });
  const totalLabel = crm.stageColumn.totalValue.replace("{{total}}", formattedTotal);
  const isLossStage = ["Perda", "Lost", "Perdido"].includes(stage.name);
  const transitionMode = stage.transitionMode ?? "NONE";
  const hasTransitionRule = transitionMode !== "NONE";

  const ruleLabel = transitionMode === "MANUAL" ? crm.stageColumn.ruleManual : crm.stageColumn.ruleAuto;

  return (
    <div
      className={cn(
        "flex w-72 flex-shrink-0 flex-col gap-3 rounded-xl border p-4",
        stageStyle.container,
      )}
    >
      <div className="flex flex-col space-y-2" >

        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {stage.name}
        </h3>

        <div className="mt-1 flex items-center gap-2 w-full">
          <Badge className={cn(stageStyle.badge)} variant={isLossStage ? "destructive" : "secondary"}>
            {leadBadgeLabel}
          </Badge>
          <p className="mt-1 text-xs font-medium text-muted-foreground">{totalLabel}</p>
        </div>
        {hasTransitionRule ? (
          <Badge
            variant="outline"
            className="mt-2 flex w-max items-center gap-1 text-[10px] font-semibold uppercase tracking-wide"
          >
            <Settings2 className="h-3 w-3" aria-hidden />
            {ruleLabel}
          </Badge>
        ) : null}

      </div>

      <Droppable droppableId={stage.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex flex-1 flex-col gap-3"
          >
            {leads.map((lead, index) => (
              <Draggable key={lead.id} draggableId={lead.id} index={index}>
                {(draggableProvided, snapshotDrag) => (
                  <div
                    ref={draggableProvided.innerRef}
                    {...draggableProvided.draggableProps}
                    {...draggableProvided.dragHandleProps}
                  >
                    <LeadCard
                      lead={lead}
                      dragging={snapshotDrag.isDragging}
                      onOpenDetails={onOpenLead}
                      onAddActivity={onAddActivity}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {snapshot.isDraggingOver && leads.length === 0 ? (
              <div className="rounded-lg border border-dashed border-primary/50 bg-primary/5 p-4 text-center text-sm text-primary">
                {crm.stageColumn.dropHere}
              </div>
            ) : null}
          </div>
        )}
      </Droppable>
    </div>
  );
}
