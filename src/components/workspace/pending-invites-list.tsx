"use client";

import { useCallback, useMemo, useState } from "react";
import { WorkspaceRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

const ROLE_LABEL: Record<WorkspaceRole, string> = {
  [WorkspaceRole.OWNER]: "Owner",
  [WorkspaceRole.ADMIN]: "Admin",
  [WorkspaceRole.MEMBER]: "Member",
  [WorkspaceRole.VIEWER]: "Viewer",
};

type PendingInvite = {
  id: string;
  token: string;
  role: WorkspaceRole;
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  expiresAt: string;
  createdAt: string;
};

type PendingInvitesListProps = {
  invites: PendingInvite[];
  user: {
    name?: string | null;
    email: string;
  };
};

type PendingAction = {
  token: string;
  type: "accept" | "decline";
} | null;

export function PendingInvitesList({ invites: initialInvites, user }: PendingInvitesListProps) {
  const router = useRouter();
  const [invites, setInvites] = useState(initialInvites);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const headerCopy = useMemo(() => {
    const name = user.name?.trim();
    return {
      title: "Convites pendentes",
      description: name
        ? `${name}, encontramos convites para você participar de workspaces no AppSeed utilizando ${user.email}.`
        : `Encontramos convites para o e-mail ${user.email}. Aceite para entrar no workspace ou recuse se não for participar.`,
    };
  }, [user.name, user.email]);

  const isActionPending = useCallback(
    (token: string, type: "accept" | "decline") =>
      pendingAction?.token === token && pendingAction.type === type,
    [pendingAction],
  );

  const handleAccept = useCallback(
    async (token: string) => {
      setPendingAction({ token, type: "accept" });
      try {
        const response = await fetch("/api/invites/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Sua sessão expirou. Faça login novamente para aceitar.");
            router.replace(`/auth/sign-in?callbackUrl=${encodeURIComponent("/auth/invites")}`);
            return;
          }
          if (response.status === 403) {
            toast.error("Este convite pertence a outro e-mail. Faça login com a conta correta.");
            return;
          }
          const body = await response.json().catch(() => null);
          const message = body?.error ?? "Não foi possível aceitar o convite.";
          toast.error(message);
          return;
        }

        const body = await response.json().catch(() => null);
        toast.success("Convite aceito com sucesso");

        const workspaceSlug: string | undefined = body?.workspace?.slug;
        if (workspaceSlug) {
          router.replace(`/${workspaceSlug}/dashboard`);
        } else {
          router.replace("/auth/post-login");
        }
      } catch (error) {
        console.error("accept invite (pending list)", error);
        toast.error("Erro inesperado ao aceitar o convite.");
      } finally {
        setPendingAction(null);
      }
    },
    [router],
  );

  const handleDecline = useCallback(
    async (token: string) => {
      setPendingAction({ token, type: "decline" });
      try {
        const response = await fetch("/api/invites/decline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Sua sessão expirou. Faça login novamente para recusar.");
            router.replace(`/auth/sign-in?callbackUrl=${encodeURIComponent("/auth/invites")}`);
            return;
          }
          const body = await response.json().catch(() => null);
          const message = body?.error ?? "Não foi possível recusar o convite.";
          toast.error(message);
          return;
        }

        toast.success("Convite recusado");
        const updatedInvites = invites.filter((invite) => invite.token !== token);
        setInvites(updatedInvites);
        if (!updatedInvites.length) {
          router.replace("/onboarding/create-workspace");
        }
      } catch (error) {
        console.error("decline invite (pending list)", error);
        toast.error("Erro inesperado ao recusar o convite.");
      } finally {
        setPendingAction(null);
      }
    },
    [invites, router],
  );

  return (
    <div className="flex min-h-svh flex-col items-center bg-muted/30 px-6 py-20">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>{headerCopy.title}</CardTitle>
          <CardDescription>{headerCopy.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {invites.map((invite) => {
            const acceptPending = isActionPending(invite.token, "accept");
            const declinePending = isActionPending(invite.token, "decline");
            const invitedBy = invite.createdBy?.name ?? invite.createdBy?.email ?? "—";

            return (
              <div
                key={invite.id}
                className="flex flex-col gap-4 rounded-lg border border-border/60 bg-muted/10 p-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-base font-medium text-foreground">{invite.workspace.name}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="outline">{ROLE_LABEL[invite.role]}</Badge>
                    <span>Convidado por {invitedBy}</span>
                  </div>
                  <p className="text-xs">
                    Convite enviado em{" "}
                    {formatDate(invite.createdAt, {
                      format: { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" },
                    })}
                  </p>
                  <p className="text-xs">
                    Expira em{" "}
                    {formatDate(invite.expiresAt, {
                      format: { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" },
                    })}
                  </p>
                </div>
                <div className="flex flex-col gap-2 md:flex-row">
                  <Button
                    type="button"
                    className="md:min-w-32"
                    onClick={() => handleAccept(invite.token)}
                    disabled={acceptPending || declinePending}
                  >
                    {acceptPending ? "Aceitando..." : "Aceitar convite"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="md:min-w-32"
                    onClick={() => handleDecline(invite.token)}
                    disabled={acceptPending || declinePending}
                  >
                    {declinePending ? "Recusando..." : "Recusar"}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Button
        type="button"
        variant="ghost"
        className="mt-6"
        onClick={() => router.push("/onboarding/create-workspace")}
      >
        Criar novo workspace
      </Button>
    </div>
  );
}
