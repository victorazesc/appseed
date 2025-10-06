import { NextRequest, NextResponse } from "next/server";

import { assertAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    const user = await assertAuthenticated(request);

    const memberships = await prisma.membership.findMany({
      where: { userId: user.id },
      include: {
        workspace: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const workspaces = memberships.map((membership) => ({
      id: membership.workspace.id,
      name: membership.workspace.name,
      slug: membership.workspace.slug,
      color: membership.workspace.color,
      role: membership.role,
    }));

    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error("GET /api/me/workspaces", error);
    return jsonError("Erro interno", 500);
  }
}
