import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { AcceptInviteForm } from "@/components/workspace/accept-invite-form";

const paramsSchema = z.object({ token: z.string().min(10) });

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AcceptInvitePage({ searchParams }: { searchParams: PageSearchParams }) {
  const params = await searchParams;
  const parsed = paramsSchema.safeParse({ token: params.token });

  if (!parsed.success) {
    return <InvalidInvite />;
  }

  const token = parsed.data.token;
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { workspace: true },
  });

  if (!invite || invite.acceptedAt || (invite.expiresAt && invite.expiresAt.getTime() < Date.now())) {
    return <InvalidInvite />;
  }

  const existingUser = await prisma.user.findUnique({ where: { email: invite.email.trim().toLowerCase() } });

  return (
    <AcceptInviteForm
      token={token}
      email={invite.email}
      workspaceName={invite.workspace?.name ?? "Workspace"}
      requiresPassword={!existingUser}
      suggestedName={existingUser?.name ?? ""}
    />
  );
}

function InvalidInvite() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/30 px-6 py-20 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">Convite inválido</h1>
        <p className="text-sm text-muted-foreground">
          Este convite não é mais válido. Peça para quem convidou gerar um novo link.
        </p>
      </div>
    </div>
  );
}
