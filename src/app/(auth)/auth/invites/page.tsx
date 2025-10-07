import { redirect } from "next/navigation";

import { assertAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PendingInvitesList } from "@/components/workspace/pending-invites-list";

export default async function AuthInvitesPage() {
  const user = await assertAuthenticated();
  const normalizedEmail = user.email?.trim().toLowerCase();

  if (!normalizedEmail) {
    redirect("/onboarding/create-workspace");
  }

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

  if (!invites.length) {
    redirect("/onboarding/create-workspace");
  }

  return (
    <PendingInvitesList
      invites={invites.map((invite) => ({
        id: invite.id,
        token: invite.token,
        role: invite.role,
        workspace: invite.workspace,
        createdBy: invite.createdBy,
        expiresAt: invite.expiresAt.toISOString(),
        createdAt: invite.createdAt.toISOString(),
      }))}
      user={{
        name: user.name ?? "",
        email: user.email ?? "",
      }}
    />
  );
}
