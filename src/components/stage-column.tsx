"use client";

import { Draggable, Droppable } from "@hello-pangea/dnd";

import { LeadSummary, Stage } from "@/types";

import { LeadCard } from "./lead-card";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

export type StageColumnProps = {
  stage: Stage;
  leads: LeadSummary[];
  onOpenLead: (leadId: string) => void;
  onAddActivity: (lead: LeadSummary) => void;
};

export function StageColumn({ stage, leads, onOpenLead, onAddActivity }: StageColumnProps) {
  const styleMap: Record<string, { container: string; badge: string }> = {
    Ganho: {
      container: "bg-emerald-50 border-emerald-200/70",
      badge: "bg-emerald-100 text-emerald-700",
    },
    Perda: {
      container: "bg-rose-50 border-rose-200/70",
      badge: "bg-rose-100 text-rose-700",
    },
  };

  const stageStyle = styleMap[stage.name] ?? {
    container: "bg-muted/30 border-transparent",
    badge: "",
  };

  return (
    <div
      className={cn(
        "flex w-72 flex-shrink-0 flex-col gap-3 rounded-xl border p-4",
        stageStyle.container,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {stage.name}
          </h3>
          <Badge
            className={cn(stageStyle.badge)}
            variant={stage.name === "Perda" ? "destructive" : "secondary"}
          >
            {leads.length} leads
          </Badge>
        </div>
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
                Solte aqui
              </div>
            ) : null}
          </div>
        )}
      </Droppable>
    </div>
  );
}
