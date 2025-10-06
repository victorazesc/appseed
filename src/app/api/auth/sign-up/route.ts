import { NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";

const signUpSchema = z.object({
  name: z.string().min(1, "Informe seu nome"),
  email: z.string().email("Informe um email válido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  inviteToken: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = signUpSchema.safeParse(payload);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Dados inválidos";
      return jsonError(message, 422);
    }

    const { name, email, password, inviteToken } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return jsonError("Já existe um usuário com este e-mail", 409);
    }

    const invite = inviteToken
      ? await prisma.invite.findUnique({
          where: { token: inviteToken },
        })
      : null;

    if (inviteToken && !invite) {
      return jsonError("Convite inválido ou expirado", 400);
    }

    if (invite && invite.email.trim().toLowerCase() !== normalizedEmail) {
      return jsonError("Convite não corresponde ao e-mail informado", 400);
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        onboardingComplete: false,
      },
    });

    if (invite) {
      if (invite.acceptedAt) {
        return jsonError("Convite já utilizado", 409);
      }

      if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
        return jsonError("Convite expirado", 410);
      }

      await prisma.$transaction(async (tx) => {
        await tx.membership.create({
          data: {
            userId: user.id,
            workspaceId: invite.workspaceId,
            role: invite.role,
            invitedById: invite.createdById,
          },
        });

        await tx.invite.update({
          where: { id: invite.id },
          data: { acceptedAt: new Date() },
        });
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/sign-up", error);
    return jsonError("Erro interno", 500);
  }
}
