import { randomBytes } from "crypto";
import type { PrismaClient } from "@prisma/client";

export function generateWebhookToken() {
  return randomBytes(32).toString("hex");
}

export function buildWebhookSlugCandidate(name: string) {
  const normalized = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${normalized || "pipeline"}-${randomBytes(4).toString("hex")}`;
}

export async function generateUniqueWebhookSlug(client: Pick<PrismaClient, "pipeline">, name: string) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = buildWebhookSlugCandidate(name);
    const existing = await client.pipeline.findUnique({ where: { webhookSlug: candidate } });
    if (!existing) {
      return candidate;
    }
  }

  return buildWebhookSlugCandidate(`${name}-${Date.now()}`);
}
