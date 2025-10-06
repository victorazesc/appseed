import { assertAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CreateWorkspaceForm } from "@/components/workspace/create-workspace-form";

export default async function OnboardingCreateWorkspacePage() {
  const user = await assertAuthenticated();

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-16">
      <div className="w-full max-w-3xl space-y-6">
        {membership?.workspace ? (
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Você já participa de um workspace</h2>
              <p className="text-sm text-muted-foreground">
                O workspace {membership.workspace.name} continuará disponível. Crie um novo workspace para outro time
                ou operação e alterne entre eles pelo seletor no topo da aplicação.
              </p>
            </div>
            <div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/${membership.workspace.slug}/dashboard`}>Voltar para {membership.workspace.name}</Link>
              </Button>
            </div>
          </div>
        ) : null}

        <CreateWorkspaceForm
          defaultName={user.name ?? ""}
          email={user.email}
          hasExistingWorkspace={Boolean(membership?.workspace)}
        />
      </div>
    </div>
  );
}
