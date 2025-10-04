import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pipelineId = searchParams.get("pipelineId") ?? undefined;

  const stages = await prisma.stage.findMany({
    where: {
      ...(pipelineId ? { pipelineId } : {}),
      pipeline: { archived: false },
    },
    orderBy: [{ pipelineId: "asc" }, { position: "asc" }],
    select: {
      id: true,
      name: true,
      position: true,
      pipelineId: true,
    },
  });

  return NextResponse.json({ stages });
}
