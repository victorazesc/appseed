export type Stage = {
  id: string;
  name: string;
  position: number;
  pipelineId?: string;
};

export type LeadSummary = {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  valueCents?: number | null;
  ownerId?: string | null;
  stageId?: string | null;
  stage?: Stage | null;
  hasOverdueTasks?: boolean;
  overdueTasksCount?: number;
  nextDueAt?: string | Date | null;
  _count?: {
    activities: number;
  };
  createdAt?: string;
};

export type Activity = {
  id: string;
  type: "note" | "call" | "email" | "whatsapp" | "task";
  content: string;
  dueAt?: string | null;
  createdAt: string;
  createdBy?: string | null;
};

export type LeadDetail = LeadSummary & {
  pipeline: {
    id: string;
    name: string;
  };
  hasOverdueTasks?: boolean;
  overdueTasksCount?: number;
  nextDueAt?: string | Date | null;
  activities: Activity[];
};

export type MetricsOverview = {
  leads_per_stage: Record<string, number>;
  conversion_rate_pct: number;
  avg_time_days: number;
};
