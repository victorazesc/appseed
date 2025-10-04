import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { generateWebhookToken } from "@/lib/pipeline";

function buildTokenPreview(token: string) {
  if (!token) return "••••";
  return token.length <= 4 ? "••••" : `••••${token.slice(-4)}`;
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const pipeline = await prisma.pipeline.findUnique({ where: { id } });

  if (!pipeline) {
    return jsonError("Funil não encontrado", 404);
  }

  const token = generateWebhookToken();

  await prisma.pipeline.update({
    where: { id },
    data: { webhookToken: token },
  });

  return NextResponse.json({
    token,
    tokenPreview: buildTokenPreview(token),
  });
}
