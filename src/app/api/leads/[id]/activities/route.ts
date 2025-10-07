import { NextRequest, NextResponse } from "next/server";
import { ActivityStatus, WorkspaceRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { activityCreateSchema } from "@/lib/validators";
import { getSessionUser } from "@/lib/auth";
import { sendEmail } from "@/lib/resend";
import { requireWorkspaceFromRequest } from "@/lib/guards";
import { createActivity, serializeActivity } from "@/lib/server/activity";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { workspace, membership } = await requireWorkspaceFromRequest(request);
    if (!membership || membership.role === WorkspaceRole.VIEWER) {
      return jsonError("Acesso negado", 403);
    }
    const { id } = await context.params;
    const payload = await request.json();
    const parsed = activityCreateSchema.safeParse(payload);

    if (!parsed.success) {
      return jsonError("Dados inválidos", 422);
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        pipeline: {
          select: {
            workspaceId: true,
          },
        },
      },
    });

    if (!lead || lead.pipeline?.workspaceId !== workspace.id) {
      return jsonError("Lead não encontrado", 404);
    }

    const user = await getSessionUser();
    const dueAt = parsed.data.dueAt ?? null;

    if (parsed.data.type === "task" && !dueAt) {
      return jsonError("Tasks precisam de dueAt", 422);
    }

    if (dueAt && Number.isNaN(dueAt.getTime())) {
      return jsonError("dueAt inválido", 422);
    }

    if (parsed.data.type === "email" && !lead.email) {
      return jsonError("Lead sem email para disparo", 422);
    }

    const followers = parsed.data.followers ?? [];
    const status =
      parsed.data.status && Object.values(ActivityStatus).includes(parsed.data.status as ActivityStatus)
        ? (parsed.data.status as ActivityStatus)
        : undefined;

    const activity = await createActivity({
      workspaceId: workspace.id,
      leadId: id,
      type: parsed.data.type,
      title: parsed.data.title,
      content: parsed.data.content,
      dueAt: dueAt ?? undefined,
      status,
      priority: parsed.data.priority,
      assigneeId: parsed.data.assigneeId,
      createdById: user?.id ?? null,
      followers,
    });

    if (parsed.data.type === "email" && lead.email) {
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

    return NextResponse.json({ activity: serializeActivity(activity) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/leads/[id]/activities", error);
    if (error instanceof Error && error.message === "WORKSPACE_REQUIRED") {
      return jsonError("Workspace não informado", 400);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return jsonError("Acesso negado", 403);
    }
    if (error instanceof Error && error.message === "WORKSPACE_NOT_FOUND") {
      return jsonError("Workspace não encontrado", 404);
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
