import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const payload = await request.json().catch(() => ({}));

    if (payload?.action !== "complete") {
      return jsonError("Ação inválida", 400);
    }

    const activity = await prisma.activity.findUnique({ where: { id } });

    if (!activity) {
      return jsonError("Atividade não encontrada", 404);
    }

    if (activity.type !== "task") {
      return jsonError("Apenas tarefas podem ser concluídas", 400);
    }

    const updated = await prisma.activity.update({
      where: { id },
      data: {
        type: "note",
        content: `Tarefa concluída: ${activity.content}`,
        dueAt: null,
      },
    });

    return NextResponse.json({ activity: updated });
  } catch (error) {
    console.error(`PATCH /api/activities/[id]`, error);
    return jsonError("Erro interno", 500);
  }
}
