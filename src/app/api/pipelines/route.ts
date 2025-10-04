import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { pipelineCreateSchema } from "@/lib/validators";

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

    const pipeline = await prisma.pipeline.create({
      data: {
        name,
        color,
        stages: {
          create: stages.map((stage, index) => ({
            name: stage.name,
            position: index,
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

    return NextResponse.json({ pipeline }, { status: 201 });
  } catch (error) {
    console.error("POST /api/pipelines", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return jsonError("Já existe um funil com esse nome", 409);
    }
    return jsonError("Erro interno", 500);
  }
}
