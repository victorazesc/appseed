import { NextResponse } from "next/server";
import { WorkspaceRole } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { requireWorkspace } from "@/lib/guards";
import { roleMeetsRequirement } from "@/lib/workspace";
import { generateToken, addHours } from "@/lib/tokens";
import { mailer, isMailerConfigured } from "@/app/configs/nodemailer.config";
import { workspaceInviteTemplate } from "@/emails/templates/workspace-invite";

const schema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  role: z.nativeEnum(WorkspaceRole).optional().default(WorkspaceRole.MEMBER),
});

const deleteSchema = z.object({
  inviteId: z.string().min(10, "Convite inválido"),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const payload = await request.json();
    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Dados inválidos", 422);
    }

    const context = await requireWorkspace(slug);

    if (!roleMeetsRequirement(context.role, [WorkspaceRole.ADMIN, WorkspaceRole.OWNER])) {
      return jsonError("Acesso negado", 403);
    }

    const email = parsed.data.email.trim().toLowerCase();
    const role = parsed.data.role ?? WorkspaceRole.MEMBER;

    const existingMembership = await prisma.membership.findFirst({
      where: {
        workspaceId: context.workspace.id,
        user: { email },
      },
    });

    if (existingMembership) {
      return jsonError("Este usuário já participa do workspace", 409);
    }

    const existingInvite = await prisma.invite.findFirst({
      where: {
        workspaceId: context.workspace.id,
        email,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      return jsonError("Já existe um convite pendente para este e-mail", 409);
    }

    const token = generateToken(24);
    const expiresAt = addHours(new Date(), 48);

    const invite = await prisma.invite.create({
      data: {
        email,
        token,
        workspaceId: context.workspace.id,
        role,
        createdById: context.user.id,
        expiresAt,
      },
      include: {
        workspace: {
          select: { name: true, slug: true },
        },
      },
    });

    if (isMailerConfigured()) {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ??
        process.env.APP_URL ??
        process.env.NEXTAUTH_URL ??
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

      const normalizedBase = baseUrl.replace(/\/$/, "");
      const acceptUrl = `${normalizedBase}/invite/accept?token=${invite.token}`;

      try {
        await mailer.sendMail({
          from: process.env.SMTP_EMAIL,
          to: email,
          subject: `Seedora • Você foi convidado para ${invite.workspace.name}`,
          html: workspaceInviteTemplate({
            inviteeName: null,
            inviterName: context.user.name,
            workspaceName: invite.workspace.name,
            acceptUrl,
            expiresInHours: 48,
            supportEmail: process.env.CONTACT_INBOX_EMAIL ?? process.env.SMTP_EMAIL ?? undefined,
            role,
          }),
        });
      } catch (emailError) {
        console.error("failed to send invite email", emailError);
      }
    }

    return NextResponse.json({ invite: { token: invite.token, email: invite.email, role: invite.role, expiresAt: invite.expiresAt.toISOString() } });
  } catch (error) {
    console.error(`POST /api/workspaces/${slug}/invite`, error);
    if (error instanceof Error && error.message === "WORKSPACE_NOT_FOUND") {
      return jsonError("Workspace não encontrado", 404);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return jsonError("Acesso negado", 403);
    }
    return jsonError("Erro interno", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const rawBody = await request.json().catch(() => null);
    const parsed = deleteSchema.safeParse(rawBody);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Dados inválidos", 422);
    }

    const context = await requireWorkspace(slug);

    if (!roleMeetsRequirement(context.role, [WorkspaceRole.ADMIN, WorkspaceRole.OWNER])) {
      return jsonError("Acesso negado", 403);
    }

    const invite = await prisma.invite.findFirst({
      where: {
        id: parsed.data.inviteId,
        workspaceId: context.workspace.id,
      },
      select: {
        id: true,
        acceptedAt: true,
      },
    });

    if (!invite) {
      return jsonError("Convite não encontrado", 404);
    }

    if (invite.acceptedAt) {
      return jsonError("Convite já foi aceito", 409);
    }

    await prisma.invite.delete({ where: { id: invite.id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`DELETE /api/workspaces/${slug}/invite`, error);
    if (error instanceof Error && error.message === "WORKSPACE_NOT_FOUND") {
      return jsonError("Workspace não encontrado", 404);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return jsonError("Acesso negado", 403);
    }
    return jsonError("Erro interno", 500);
  }
}
