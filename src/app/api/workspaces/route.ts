import { NextRequest, NextResponse } from "next/server";
import { WorkspaceRole } from "@prisma/client";
import { z } from "zod";

import { assertAuthenticated } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { generateUniqueWorkspaceSlug } from "@/lib/slug";
import { generateUniqueWebhookSlug, generateWebhookToken } from "@/lib/pipeline";

const workspaceSchema = z.object({
  name: z.string().min(1, "Informe o nome do workspace"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/i, "Cor inválida").default("#16A34A"),
});

const DEFAULT_PIPELINE_STAGE_NAMES = [
  "Lead Novo",
  "Contato Inicial",
  "Proposta Enviada",
  "Fechamento",
  "Ganho",
  "Perda",
] as const;

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
    const normalizedEmail = user.email?.trim().toLowerCase() ?? null;
    const now = new Date();

    const [membershipCount, pendingInvites] = await Promise.all([
      prisma.membership.count({ where: { userId: user.id } }),
      normalizedEmail
        ? prisma.invite.count({
            where: {
              email: normalizedEmail,
              acceptedAt: null,
              expiresAt: { gt: now },
            },
          })
        : Promise.resolve(0),
    ]);

    const shouldCreateDefaultPipeline = membershipCount === 0 && pendingInvites === 0;

    const workspace = await prisma.$transaction(async (tx) => {
      const createdWorkspace = await tx.workspace.create({
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

      if (shouldCreateDefaultPipeline) {
        const webhookSlug = await generateUniqueWebhookSlug(tx, "Funil de Vendas");
        const webhookToken = generateWebhookToken();

        const pipeline = await tx.pipeline.create({
          data: {
            name: "Funil de Vendas",
            color,
            workspaceId: createdWorkspace.id,
            webhookSlug,
            webhookToken,
            stages: {
              create: DEFAULT_PIPELINE_STAGE_NAMES.map((stageName, index) => ({
                name: stageName,
                position: index,
              })),
            },
          },
          include: {
            stages: true,
          },
        });

        const firstStageId = pipeline.stages[0]?.id ?? null;
        if (firstStageId) {
          await tx.pipeline.update({
            where: { id: pipeline.id },
            data: { webhookDefaultStageId: firstStageId },
          });
        }
      }

      return createdWorkspace;
    });

    return NextResponse.json({ workspace });
  } catch (error) {
    console.error("POST /api/workspaces", error);
    return jsonError("Erro interno", 500);
  }
}
