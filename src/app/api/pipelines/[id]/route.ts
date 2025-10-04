import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { pipelineUpdateSchema } from "@/lib/validators";

function includeConfig() {
  return {
    stages: {
      orderBy: { position: "asc" },
    },
    _count: {
      select: { stages: true, leads: true },
    },
  } as const;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const pipeline = await prisma.pipeline.findUnique({
    where: { id },
    include: includeConfig(),
  });

  if (!pipeline) {
    return jsonError("Funil não encontrado", 404);
  }

  return NextResponse.json({ pipeline });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const existing = await prisma.pipeline.findUnique({
    where: { id },
    include: { stages: true },
  });

  if (!existing) {
    return jsonError("Funil não encontrado", 404);
  }

  const payload = await request.json();
  const parsed = pipelineUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError(parsed.error.errors[0]?.message ?? "Dados inválidos", 422);
  }

  const { name, color, stages } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      if (name || color) {
        await tx.pipeline.update({
          where: { id },
          data: {
            ...(name ? { name } : {}),
            ...(color ? { color } : {}),
          },
        });
      }

      if (stages) {
        const stageIdsFromPayload = new Set(
          stages.filter((stage) => stage.id).map((stage) => stage.id as string),
        );
        const stagesToDelete = existing.stages.filter(
          (stage) => !stageIdsFromPayload.has(stage.id),
        );

        if (stagesToDelete.length) {
          await tx.stage.deleteMany({
            where: {
              id: { in: stagesToDelete.map((stage) => stage.id) },
              pipelineId: id,
            },
          });
        }

        for (const [index, stage] of stages.entries()) {
          if (stage.id) {
            await tx.stage.update({
              where: { id: stage.id, pipelineId: id },
              data: { name: stage.name, position: index },
            });
          } else {
            await tx.stage.create({
              data: {
                name: stage.name,
                position: index,
                pipelineId: id,
              },
            });
          }
        }
      }

      return tx.pipeline.findUnique({ where: { id }, include: includeConfig() });
    });

    return NextResponse.json({ pipeline: result });
  } catch (error) {
    console.error(`PATCH /api/pipelines/${id}`, error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return jsonError("Já existe uma etapa com esse nome", 409);
    }
    return jsonError("Erro interno", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await prisma.pipeline.update({
      where: { id },
      data: { archived: true },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`DELETE /api/pipelines/${id}`, error);
    return jsonError("Erro ao remover funil", 500);
  }
}
