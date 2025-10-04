import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { pipelineCreateSchema } from "@/lib/validators";
import { generateUniqueWebhookSlug, generateWebhookToken } from "@/lib/pipeline";

export async function GET() {
  const pipelines = await prisma.pipeline.findMany({
    where: { archived: false },
    include: {
      stages: {
        orderBy: { position: "asc" },
      },
      _count: {
        select: { stages: true, leads: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ pipelines });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = pipelineCreateSchema.safeParse(payload);

    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Dados inválidos", 422);
    }

    const { name, color, stages } = parsed.data;

    const pipeline = await prisma.$transaction(async (tx) => {
      const webhookToken = generateWebhookToken();
      const webhookSlug = await generateUniqueWebhookSlug(prisma, name);

      const created = await tx.pipeline.create({
        data: {
          name,
          color,
          webhookToken,
          webhookSlug,
          stages: {
            create: stages.map((stage, index) => ({
              name: stage.name,
              position: index,
              transitionMode: stage.transitionMode ?? "NONE",
              transitionTargetPipelineId:
                stage.transitionMode && stage.transitionMode !== "NONE"
                  ? stage.transitionTargetPipelineId ?? null
                  : null,
              transitionTargetStageId:
                stage.transitionMode && stage.transitionMode !== "NONE"
                  ? stage.transitionTargetStageId ?? null
                  : null,
              transitionCopyActivities: stage.transitionCopyActivities ?? true,
              transitionArchiveSource: stage.transitionArchiveSource ?? false,
            })),
          },
        },
        include: {
          stages: {
            orderBy: { position: "asc" },
          },
          _count: {
            select: { stages: true, leads: true },
          },
        },
      });

      const defaultStage = created.stages[0];
      if (defaultStage) {
        await tx.pipeline.update({
          where: { id: created.id },
          data: { webhookDefaultStageId: defaultStage.id },
        });
      }

      return created;
    });

    return NextResponse.json({ pipeline }, { status: 201 });
  } catch (error) {
    console.error("POST /api/pipelines", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return jsonError("Já existe um funil com esse nome", 409);
    }
    return jsonError("Erro interno", 500);
  }
}
