import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { activityCreateSchema } from "@/lib/validators";
import { getCurrentUser } from "@/lib/auth";
import { sendEmail } from "@/lib/resend";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const payload = await request.json();
    const parsed = activityCreateSchema.safeParse(payload);

    if (!parsed.success) {
      return jsonError("Dados inválidos", 422);
    }

    const lead = await prisma.lead.findUnique({ where: { id } });

    if (!lead) {
      return jsonError("Lead não encontrado", 404);
    }

    const user = await getCurrentUser();
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

    const activity = await prisma.activity.create({
      data: {
        leadId: id,
        type: parsed.data.type,
        content: parsed.data.content,
        dueAt,
        createdBy: parsed.data.createdBy ?? user?.id ?? null,
      },
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

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error("POST /api/leads/[id]/activities", error);
    return jsonError("Erro interno", 500);
  }
}
