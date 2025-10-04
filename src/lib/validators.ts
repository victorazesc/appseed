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

export const activityCreateSchema = z.object({
  type: z.enum(["note", "call", "email", "whatsapp", "task"]),
  content: z.string().min(1, "Conteúdo obrigatório"),
  dueAt: dueDateSchema,
  createdBy: z.string().optional(),
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

export const leadTransitionSchema = z.object({
  pipelineId: z.string(),
  stageId: z.string().optional(),
  copyActivities: z.boolean().optional(),
  archiveOriginal: z.boolean().optional(),
});
