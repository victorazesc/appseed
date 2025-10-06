import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { jsonError } from "@/lib/http";

const schema = z.object({
  token: z.string().min(10, "Token inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Dados inválidos", 422);
    }

    const { token, password } = parsed.data;

    const tokenRecord = await prisma.userToken.findUnique({ where: { token } });
    if (!tokenRecord || tokenRecord.purpose !== "PASSWORD_RESET") {
      return jsonError("Token inválido", 400);
    }

    if (tokenRecord.consumedAt || tokenRecord.expiresAt.getTime() < Date.now()) {
      return jsonError("Token expirado", 410);
    }

    const userId = tokenRecord.userId;
    if (!userId) {
      return jsonError("Token inválido", 400);
    }

    const passwordHash = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          passwordHash,
        },
        select: {
          id: true,
          email: true,
        },
      });

      await tx.userToken.update({
        where: { id: tokenRecord.id },
        data: { consumedAt: new Date() },
      });

      return updatedUser;
    });

    return NextResponse.json({ ok: true, email: result.email ?? tokenRecord.email ?? null });
  } catch (error) {
    console.error("POST /api/auth/reset", error);
    return jsonError("Erro interno", 500);
  }
}
