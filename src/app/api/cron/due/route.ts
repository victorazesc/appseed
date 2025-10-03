import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { sendEmail } from "@/lib/resend";

function isEmail(value: string | null | undefined) {
  if (!value) return false;
  return /.+@.+\..+/.test(value);
}

export async function POST() {
  try {
    const now = new Date();

    const tasks = await prisma.activity.findMany({
      where: {
        type: "task",
        dueAt: { lte: now },
      },
      select: {
        id: true,
        content: true,
        dueAt: true,
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            ownerId: true,
            stage: {
              select: { name: true },
            },
          },
        },
      },
    });

    let notified = 0;

    for (const task of tasks) {
      const recipient =
        (isEmail(task.lead.ownerId) && task.lead.ownerId) || task.lead.email;

      if (!recipient) {
        console.info("[cron:downdue] Sem destinatário para tarefa", task.id);
        continue;
      }

      await sendEmail({
        to: recipient,
        subject: `Tarefa pendente para ${task.lead.name}`,
        html: `<!doctype html><html><body><h1>Tarefa pendente</h1><p>${task.content}</p><p><strong>Lead:</strong> ${task.lead.name}</p><p><strong>Etapa:</strong> ${task.lead.stage?.name ?? "Sem etapa"}</p><p><strong>Vencimento:</strong> ${task.dueAt?.toISOString()}</p></body></html>`,
      });

      notified += 1;
    }

    return NextResponse.json({ tasks: tasks.length, notified });
  } catch (error) {
    console.error("POST /api/cron/due", error);
    return jsonError("Erro interno", 500);
  }
}
