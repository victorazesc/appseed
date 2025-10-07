import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.email) {
      return jsonError("Não autenticado", 401);
    }

    const normalizedEmail = sessionUser.email.trim().toLowerCase();
    const invites = await prisma.invite.findMany({
      where: {
        email: normalizedEmail,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      invites: invites.map((invite) => ({
        id: invite.id,
        token: invite.token,
        role: invite.role,
        email: invite.email,
        workspace: invite.workspace,
        createdBy: invite.createdBy,
        expiresAt: invite.expiresAt.toISOString(),
        createdAt: invite.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("GET /api/invites/pending", error);
    return jsonError("Erro interno", 500);
  }
}
