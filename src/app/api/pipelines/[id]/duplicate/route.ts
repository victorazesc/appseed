import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";

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
    const duplicated = await prisma.pipeline.create({
      data: {
        name: cloneName,
        color: pipeline.color,
        stages: {
          create: pipeline.stages.map((stage) => ({
            name: stage.name,
            position: stage.position,
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

    return NextResponse.json({ pipeline: duplicated }, { status: 201 });
  } catch (error) {
    console.error(`POST /api/pipelines/${id}/duplicate`, error);
    return jsonError("Não foi possível duplicar o funil", 500);
  }
}
