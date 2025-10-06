import { NextRequest, NextResponse } from "next/server";

import { assertAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
};

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await assertAuthenticated(request);
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: { accounts: true },
    });

    if (!user) {
      return jsonError("Usuário não encontrado", 404);
    }

    const providers = user.accounts.map((account) => ({
      id: account.id,
      provider: account.provider,
      type: account.type,
      label: PROVIDER_LABELS[account.provider] ?? account.provider,
    }));

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        loginMethod: providers.length ? "social" : "credentials",
        providers,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error("GET /api/me/profile", error);
    return jsonError("Erro interno", 500);
  }
}
