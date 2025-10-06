import { NextResponse } from "next/server";
import { WorkspaceRole } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { getSessionUser } from "@/lib/auth";

const schema = z.object({ token: z.string().min(10, "Token inválido") });

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Dados inválidos", 422);
    }

    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return jsonError("É necessário estar autenticado para aceitar convites", 401);
    }

    const invite = await prisma.invite.findUnique({
      where: { token: parsed.data.token },
      include: {
        workspace: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!invite) {
      return jsonError("Convite inválido", 400);
    }

    if (invite.acceptedAt) {
      return jsonError("Convite já utilizado", 409);
    }

    if (invite.expiresAt.getTime() < Date.now()) {
      return jsonError("Convite expirado", 410);
    }

    if (invite.email.trim().toLowerCase() !== sessionUser.email?.trim().toLowerCase()) {
      return jsonError("Convite não corresponde ao seu e-mail", 403);
    }

    const membership = await prisma.membership.findFirst({
      where: { workspaceId: invite.workspaceId, userId: sessionUser.id },
    });

    if (membership) {
      await prisma.invite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });

      return NextResponse.json({
        workspace: invite.workspace,
        membership: {
          id: membership.id,
          role: membership.role,
        },
      });
    }

    const createdMembership = await prisma.$transaction(async (tx) => {
      const newMembership = await tx.membership.create({
        data: {
          userId: sessionUser.id,
          workspaceId: invite.workspaceId,
          role: invite.role as WorkspaceRole,
          invitedById: invite.createdById,
        },
        select: {
          id: true,
          role: true,
        },
      });

      await tx.invite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });

      return newMembership;
    });

    return NextResponse.json({
      workspace: invite.workspace,
      membership: createdMembership,
    });
  } catch (error) {
    console.error("POST /api/invites/accept", error);
    return jsonError("Erro interno", 500);
  }
}
