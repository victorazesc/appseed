"use client";

import { Badge } from "@/components/ui/badge";

type ActivityStatusBadgeProps = {
  status?: "OPEN" | "COMPLETED";
  label: string;
};

export function ActivityStatusBadge({ status = "OPEN", label }: ActivityStatusBadgeProps) {
  return <Badge variant={status === "COMPLETED" ? "secondary" : "outline"}>{label}</Badge>;
}
