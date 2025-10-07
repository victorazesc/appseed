import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { PipelineProvider } from "@/contexts/pipeline-context";
import { WorkspaceProvider } from "@/contexts/workspace-context";
import { authEnabled, getSessionUser } from "@/lib/auth";
import { getWorkspacePipelines } from "@/lib/server/pipelines";
import { getWorkspaceContext } from "@/lib/server/workspace";
import type { WorkspaceServerContext } from "@/lib/server/workspace";
import type { WorkspaceContextData } from "@/types/workspace";
import type { Metadata } from "next";

const WORKSPACE_DESCRIPTION =
  "AppSeed é especialista em desenvolvimento de MVPs, aplicações web e crescimento pós-lançamento, com tecnologia moderna e metodologia ágil.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}): Promise<Metadata> {
  const { workspaceSlug } = await params;

  if (!workspaceSlug) {
    return {
      title: "Seedora | MVPs e Crescimento de Produtos Digitais",
      description: WORKSPACE_DESCRIPTION,
    };
  }

  try {
    const context = await getWorkspaceContext(workspaceSlug);
    const workspaceName = context.workspace.name || workspaceSlug;

    return {
      title: `${workspaceName} | MVPs e Crescimento de Produtos Digitais`,
      description: WORKSPACE_DESCRIPTION,
    };
  } catch (error) {
    console.error(`Failed to resolve workspace metadata for ${workspaceSlug}`, error);

    return {
      title: "Seedora | MVPs e Crescimento de Produtos Digitais",
      description: WORKSPACE_DESCRIPTION,
    };
  }
}

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const user = await getSessionUser();

  if (authEnabled && !user) {
    redirect("/auth/sign-in");
  }

  if (!workspaceSlug) {
    redirect("/auth/post-login");
  }

  let context: WorkspaceServerContext;
  let initialPipelines: Awaited<ReturnType<typeof getWorkspacePipelines>> = [];
  try {
    context = await getWorkspaceContext(workspaceSlug);
  } catch (error) {
    console.error(`Failed to resolve workspace ${workspaceSlug}`, error);
    redirect("/auth/post-login?error=workspace");
  }

  try {
    initialPipelines = await getWorkspacePipelines(workspaceSlug);
  } catch (error) {
    console.error(`Failed to preload pipelines for workspace ${workspaceSlug}`, error);
    initialPipelines = [];
  }

  const initialContext: WorkspaceContextData = {
    workspace: {
      id: context.workspace.id,
      name: context.workspace.name,
      slug: context.workspace.slug,
      color: context.workspace.color,
      role: context.role,
    },
    role: context.role,
    membership: context.membership
      ? {
        id: context.membership.id,
        userId: context.membership.userId,
        workspaceId: context.membership.workspaceId,
        role: context.membership.role,
        createdAt: context.membership.createdAt.toISOString(),
        updatedAt: context.membership.updatedAt.toISOString(),
      }
      : null,
    impersonated: context.impersonated,
  };

  return (
    <WorkspaceProvider initialContext={initialContext}>
      <PipelineProvider
        initialPipelines={initialPipelines}
        initialPipelineId={initialPipelines[0]?.id ?? null}
      >
        <AppShell user={user}>{children}</AppShell>
      </PipelineProvider>
    </WorkspaceProvider>
  );
}
