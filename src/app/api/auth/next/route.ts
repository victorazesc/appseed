import { NextRequest, NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return jsonError("Não autenticado", 401);
    }

    const membership = await prisma.membership.findFirst({
      where: { userId: sessionUser.id },
      include: { workspace: true },
      orderBy: { createdAt: "asc" },
    });

    if (!membership?.workspace) {
      return NextResponse.json({ redirect: "/onboarding/create-workspace" });
    }

    return NextResponse.json({ redirect: `/${membership.workspace.slug}/dashboard` });
  } catch (error) {
    console.error("GET /api/auth/next", error);
    return jsonError("Erro interno", 500);
  }
}
