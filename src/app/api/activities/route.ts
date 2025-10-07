import { NextRequest, NextResponse } from "next/server";
import {
  ActivityPriority,
  ActivityStatus,
  Prisma,
  WorkspaceRole,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import {
  activityCreateWithLeadSchema,
  activityQuerySchema,
} from "@/lib/validators";
import { requireWorkspaceFromRequest } from "@/lib/guards";
import {
  activityInclude,
  createActivity,
  serializeActivity,
} from "@/lib/server/activity";
import { sendEmail } from "@/lib/resend";

function parseDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export async function GET(request: NextRequest) {
  try {
    const { workspace } = await requireWorkspaceFromRequest(request, {
      minimumRole: WorkspaceRole.VIEWER,
    });

    const url = new URL(request.url);
    const queryObject = Object.fromEntries(url.searchParams.entries());
    const parsed = activityQuerySchema.safeParse(queryObject);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Parâmetros inválidos", 422);
    }

    const { assigneeId, leadId, pipelineId, type, priority, dueFrom, dueTo } = parsed.data;
    const statusFilter = parsed.data.status?.toUpperCase();

    const where: Prisma.ActivityWhereInput = {
      workspaceId: workspace.id,
    };

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    if (leadId) {
      where.leadId = leadId;
    }

    if (pipelineId) {
      where.lead = { pipelineId };
    }

    if (type) {
      where.type = type;
    }

    if (priority) {
      where.priority = priority as ActivityPriority;
    }

    const dueRange: Prisma.DateTimeFilter = {};

    const fromDate = parseDate(dueFrom);
    if (fromDate) {
      dueRange.gte = fromDate;
    }
    const toDate = parseDate(dueTo);
    if (toDate) {
      dueRange.lte = toDate;
    }

    if (statusFilter === "OVERDUE") {
      where.status = ActivityStatus.OPEN;
      where.dueAt = {
        lt: new Date(),
      };
    } else if (statusFilter === "OPEN" || statusFilter === "COMPLETED") {
      where.status = statusFilter as ActivityStatus;
      if (Object.keys(dueRange).length) {
        where.dueAt = dueRange;
      }
    } else if (Object.keys(dueRange).length) {
      where.dueAt = dueRange;
    }

    const sortField = parsed.data.sort ?? "dueAt";
    const direction = (parsed.data.direction ?? "asc") as Prisma.SortOrder;

    const orderBy: Prisma.ActivityOrderByWithRelationInput[] = [];

    if (sortField === "priority") {
      orderBy.push({ priority: direction });
      orderBy.push({ dueAt: "asc" });
      orderBy.push({ createdAt: "desc" });
    } else if (sortField === "createdAt") {
      orderBy.push({ createdAt: direction });
    } else {
      orderBy.push({ dueAt: direction });
      orderBy.push({ createdAt: "desc" });
    }

    const limit = parsed.data.limit ?? 100;

    const activities = await prisma.activity.findMany({
      where,
      include: activityInclude,
      orderBy,
      take: limit,
    });

    return NextResponse.json({
      activities: activities.map((activity) => serializeActivity(activity)),
    });
  } catch (error) {
    console.error("GET /api/activities", error);
    if (error instanceof Error && error.message === "WORKSPACE_REQUIRED") {
      return jsonError("Workspace não informado", 400);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return jsonError("Acesso negado", 403);
    }
    if (error instanceof Error && error.message === "WORKSPACE_NOT_FOUND") {
      return jsonError("Workspace não encontrado", 404);
    }
    return jsonError("Erro interno", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { workspace, membership } = await requireWorkspaceFromRequest(request);
    if (!membership || membership.role === WorkspaceRole.VIEWER) {
      return jsonError("Acesso negado", 403);
    }

    const payload = await request.json();
    const parsed = activityCreateWithLeadSchema.safeParse(payload);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Dados inválidos", 422);
    }

    const dueAt = parsed.data.dueAt ?? undefined;
    if (parsed.data.type === "task" && !dueAt) {
      return jsonError("Tasks precisam de dueAt", 422);
    }

    const status =
      parsed.data.status && Object.values(ActivityStatus).includes(parsed.data.status as ActivityStatus)
        ? (parsed.data.status as ActivityStatus)
        : undefined;

    const activity = await createActivity({
      workspaceId: workspace.id,
      leadId: parsed.data.leadId,
      type: parsed.data.type,
      title: parsed.data.title,
      content: parsed.data.content,
      dueAt,
      status,
      priority: parsed.data.priority,
      assigneeId: parsed.data.assigneeId,
      createdById: membership.userId ?? workspace.createdById ?? null,
      followers: parsed.data.followers,
    });

    if (parsed.data.type === "email") {
      const lead = await prisma.lead.findUnique({
        where: { id: parsed.data.leadId },
        select: { email: true, name: true, pipeline: { select: { workspaceId: true } } },
      });
      if (lead?.pipeline.workspaceId === workspace.id && lead.email) {
        try {
          await sendEmail({
            to: lead.email,
            subject: `Mensagem para ${lead.name}`,
            html: `<p>${parsed.data.content}</p>`,
          });
        } catch (error) {
          console.error("Falha ao enviar email", error);
        }
      }
    }

    return NextResponse.json(
      { activity: serializeActivity(activity) },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/activities", error);
    if (error instanceof Error && error.message === "WORKSPACE_REQUIRED") {
      return jsonError("Workspace não informado", 400);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return jsonError("Acesso negado", 403);
    }
    if (error instanceof Error && error.message === "WORKSPACE_NOT_FOUND") {
      return jsonError("Workspace não encontrado", 404);
    }
    if (error instanceof Error && error.message === "LEAD_NOT_FOUND") {
      return jsonError("Lead não encontrado", 404);
    }
    if (error instanceof Error && error.message === "WORKSPACE_USER_NOT_FOUND") {
      return jsonError("Usuário não pertence ao workspace", 404);
    }
    return jsonError("Erro interno", 500);
  }
}
