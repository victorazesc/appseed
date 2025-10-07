import { z } from "zod";

const moneyValueSchema = z
  .union([z.number(), z.string()])
  .optional()
  .transform((value, ctx) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }

    const cleaned = typeof value === "string" ? value.replace(/[^0-9.-]/g, "") : value;
    const parsed = Number(cleaned);

    if (Number.isNaN(parsed)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valor inválido" });
      return z.NEVER;
    }

    return Math.round(parsed);
  });

const dueDateSchema = z
  .union([z.date(), z.string()])
  .optional()
  .transform((value, ctx) => {
    if (!value) return undefined;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Data inválida" });
      return z.NEVER;
    }
    return date;
  });

const hexColorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

const nullableDueDateSchema = z
  .union([z.date(), z.string(), z.null()])
  .optional()
  .transform((value, ctx) => {
    if (value === null) return null;
    if (!value) return undefined;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Data inválida" });
      return z.NEVER;
    }
    return date;
  });

export const leadCreateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  valueCents: moneyValueSchema,
  ownerId: z.string().optional(),
  pipelineId: z.string().optional(),
  stageId: z.string().optional(),
});

export const leadUpdateSchema = leadCreateSchema.partial();

export const leadQuerySchema = z.object({
  stageId: z.string().optional(),
  pipelineId: z.string().optional(),
  q: z.string().optional(),
  ownerId: z.string().optional(),
  limit: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value, ctx) => {
      if (value === undefined || value === null || value === "") return undefined;
      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Limite inválido" });
        return z.NEVER;
      }
      return Math.min(parsed, 100);
    }),
});

const activityStatusSchema = z
  .enum(["OPEN", "COMPLETED"] as const)
  .optional();

const activityPrioritySchema = z
  .enum(["LOW", "MEDIUM", "HIGH"] as const)
  .optional();

export const activityCreateSchema = z.object({
  type: z.enum(["note", "call", "email", "whatsapp", "task"]),
  title: z
    .string()
    .trim()
    .min(1, "Informe um título")
    .max(140, "Título muito longo")
    .optional(),
  content: z.string().min(1, "Conteúdo obrigatório"),
  dueAt: dueDateSchema,
  assigneeId: z.string().min(1).optional(),
  priority: activityPrioritySchema,
  status: activityStatusSchema,
  followers: z.array(z.string().min(1)).optional(),
});

export const activityCreateWithLeadSchema = activityCreateSchema.extend({
  leadId: z.string().min(1, "Lead é obrigatório"),
});

export const activityUpdateSchema = z
  .object({
    type: z.enum(["note", "call", "email", "whatsapp", "task"]).optional(),
    title: z
      .string()
      .trim()
      .min(1, "Informe um título")
      .max(140, "Título muito longo")
      .optional(),
    content: z.string().min(1, "Conteúdo obrigatório").optional(),
    dueAt: nullableDueDateSchema,
    status: activityStatusSchema,
    priority: activityPrioritySchema,
    assigneeId: z.string().min(1).nullable().optional(),
    followers: z.array(z.string().min(1)).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Nenhuma alteração informada",
  });

export const activityQuerySchema = z.object({
  assigneeId: z.string().optional(),
  leadId: z.string().optional(),
  pipelineId: z.string().optional(),
  status: z.string().optional(),
  type: z.enum(["note", "call", "email", "whatsapp", "task"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueFrom: z.string().optional(),
  dueTo: z.string().optional(),
  sort: z.enum(["dueAt", "priority", "createdAt"]).optional(),
  direction: z.enum(["asc", "desc"]).optional(),
  limit: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value, ctx) => {
      if (value === undefined || value === null || value === "") return undefined;
      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Limite inválido" });
        return z.NEVER;
      }
      return Math.min(parsed, 200);
    }),
});

export const activityCommentSchema = z.object({
  content: z.string().min(1, "Escreva um comentário"),
  mentions: z.array(z.string().min(1)).optional(),
});

export const metricsQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  pipelineId: z.string().optional(),
});

export const landingLeadSchema = leadCreateSchema.extend({
  email: z.string().email("Informe um email válido"),
  phone: z.string().min(8, "Informe um telefone válido").optional(),
});

const pipelineStageInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Informe o nome da etapa"),
  transitionMode: z.enum(["NONE", "MANUAL", "AUTO"]).optional(),
  transitionTargetPipelineId: z.string().nullable().optional(),
  transitionTargetStageId: z.string().nullable().optional(),
  transitionCopyActivities: z.boolean().optional(),
  transitionArchiveSource: z.boolean().optional(),
});

export const pipelineCreateSchema = z.object({
  name: z.string().min(1, "Informe o nome do funil"),
  color: z.string().regex(hexColorRegex, "Cor inválida"),
  stages: z
    .array(pipelineStageInputSchema)
    .min(1, "Adicione pelo menos uma etapa"),
});

export const pipelineUpdateSchema = pipelineCreateSchema
  .partial()
  .extend({
    stages: z.array(pipelineStageInputSchema).optional(),
  });

export const pipelineWebhookUpdateSchema = z.object({
  defaultStageId: z.string().nullable().optional(),
});

export const leadTransitionSchema = z.object({
  targetPipelineId: z.string(),
  targetStageId: z.string().optional(),
  copyActivities: z.boolean().optional(),
  archiveSource: z.boolean().optional(),
  sourceStageId: z.string().optional(),
});

export const pipelineWebhookPayloadSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  value: moneyValueSchema,
  stage: z.string().optional(),
  origin: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});
