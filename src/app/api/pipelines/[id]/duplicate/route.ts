import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { generateUniqueWebhookSlug, generateWebhookToken } from "@/lib/pipeline";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const pipeline = await prisma.pipeline.findUnique({
    where: { id },
    include: {
      stages: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!pipeline) {
    return jsonError("Funil não encontrado", 404);
  }

  const cloneName = `${pipeline.name} (cópia)`;

  try {
    const duplicated = await prisma.$transaction(async (tx) => {
      const webhookToken = generateWebhookToken();
      const webhookSlug = await generateUniqueWebhookSlug(prisma, cloneName);

      const created = await tx.pipeline.create({
        data: {
          name: cloneName,
          color: pipeline.color,
          webhookToken,
          webhookSlug,
          stages: {
            create: pipeline.stages.map((stage) => ({
              name: stage.name,
              position: stage.position,
              transitionMode: stage.transitionMode,
              transitionTargetPipelineId: stage.transitionTargetPipelineId,
              transitionTargetStageId: stage.transitionTargetStageId,
              transitionCopyActivities: stage.transitionCopyActivities,
              transitionArchiveSource: stage.transitionArchiveSource,
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

    return NextResponse.json({ pipeline: duplicated }, { status: 201 });
  } catch (error) {
    console.error(`POST /api/pipelines/${id}/duplicate`, error);
    return jsonError("Não foi possível duplicar o funil", 500);
  }
}
