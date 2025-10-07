"use client";

import { Badge } from "@/components/ui/badge";

type ActivityPriorityBadgeProps = {
  priority?: "LOW" | "MEDIUM" | "HIGH";
  label: string;
};

const PRIORITY_VARIANT: Record<"LOW" | "MEDIUM" | "HIGH", "outline" | "secondary" | "destructive"> = {
  LOW: "outline",
  MEDIUM: "secondary",
  HIGH: "destructive",
};

export function ActivityPriorityBadge({ priority = "MEDIUM", label }: ActivityPriorityBadgeProps) {
  return <Badge variant={PRIORITY_VARIANT[priority]}>{label}</Badge>;
}
