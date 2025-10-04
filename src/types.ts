export type StageTransitionMode = "NONE" | "MANUAL" | "AUTO";

export type Stage = {
  id: string;
  name: string;
  position: number;
  pipelineId?: string;
  transitionMode?: StageTransitionMode;
  transitionTargetPipelineId?: string | null;
  transitionTargetStageId?: string | null;
  transitionCopyActivities?: boolean;
  transitionArchiveSource?: boolean;
};

export type Pipeline = {
  id: string;
  name: string;
  color: string;
  archived?: boolean;
  createdAt?: string;
  stages?: Stage[];
  _count?: {
    stages: number;
    leads: number;
  };
  webhookToken?: string | null;
  webhookSlug?: string | null;
  webhookDefaultStageId?: string | null;
};

export type PipelineWebhookConfig = {
  url: string;
  slugUrl?: string | null;
  slug?: string | null;
  hasToken: boolean;
  token?: string | null;
  tokenPreview?: string | null;
  defaultStageId?: string | null;
  stages: Array<{ id: string; name: string }>;
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
  pipelineId?: string;
  hasOverdueTasks?: boolean;
  overdueTasksCount?: number;
  nextDueAt?: string | Date | null;
  archived?: boolean;
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
    color?: string;
  };
  hasOverdueTasks?: boolean;
  overdueTasksCount?: number;
  nextDueAt?: string | Date | null;
  activities: Activity[];
};

export type MetricsOverview = {
  pipeline: {
    id: string;
    name: string;
    color: string;
  };
  leads_per_stage: Array<{
    stageId: string;
    stageName: string;
    count: number;
    valueCents: number;
  }>;
  conversion_rate_pct: number;
  avg_time_days: number;
};
