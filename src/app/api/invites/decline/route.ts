import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";

const schema = z.object({ token: z.string().min(10, "Token inválido") });

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Dados inválidos", 422);
    }

    const sessionUser = await getSessionUser();
    if (!sessionUser?.email) {
      return jsonError("É necessário estar autenticado para recusar convites", 401);
    }

    const normalizedEmail = sessionUser.email.trim().toLowerCase();

    const invite = await prisma.invite.findUnique({
      where: { token: parsed.data.token },
      select: {
        id: true,
        email: true,
        acceptedAt: true,
      },
    });

    if (!invite) {
      return jsonError("Convite inválido ou expirado", 400);
    }

    if (invite.email.trim().toLowerCase() !== normalizedEmail) {
      return jsonError("Convite não corresponde ao seu e-mail", 403);
    }

    if (invite.acceptedAt) {
      return jsonError("Convite já utilizado", 409);
    }

    await prisma.invite.delete({ where: { id: invite.id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/invites/decline", error);
    return jsonError("Erro interno", 500);
  }
}
