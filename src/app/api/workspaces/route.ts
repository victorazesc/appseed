import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { assertAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { generateUniqueWorkspaceSlug } from "@/lib/slug";
import { WorkspaceRole } from "@prisma/client";

const workspaceSchema = z.object({
  name: z.string().min(1, "Informe o nome do workspace"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/i, "Cor inválida").default("#16A34A"),
});

export async function POST(request: NextRequest) {
  try {
    const user = await assertAuthenticated(request);
    const payload = await request.json();
    const parsed = workspaceSchema.safeParse(payload);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Dados inválidos", 422);
    }

    const { name, color } = parsed.data;
    const slug = await generateUniqueWorkspaceSlug(name);

    const workspace = await prisma.workspace.create({
      data: {
        name,
        color,
        slug,
        createdById: user.id,
        memberships: {
          create: {
            userId: user.id,
            role: WorkspaceRole.OWNER,
          },
        },
      },
      include: {
        memberships: {
          where: { userId: user.id },
          take: 1,
        },
      },
    });

    return NextResponse.json({ workspace });
  } catch (error) {
    console.error("POST /api/workspaces", error);
    return jsonError("Erro interno", 500);
  }
}
