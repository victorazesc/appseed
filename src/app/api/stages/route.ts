import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const stages = await prisma.stage.findMany({
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
