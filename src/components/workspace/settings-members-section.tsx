"use client";

import { useEffect, useMemo, useState } from "react";
import { WorkspaceRole } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace } from "@/contexts/workspace-context";
import { apiFetch } from "@/lib/api-client";
import { formatDate } from "@/lib/format";

const ROLE_LABEL: Record<WorkspaceRole, string> = {
  [WorkspaceRole.OWNER]: "Owner",
  [WorkspaceRole.ADMIN]: "Admin",
  [WorkspaceRole.MEMBER]: "Member",
  [WorkspaceRole.VIEWER]: "Viewer",
};

const ROLE_OPTIONS: WorkspaceRole[] = [
  WorkspaceRole.OWNER,
  WorkspaceRole.ADMIN,
  WorkspaceRole.MEMBER,
  WorkspaceRole.VIEWER,
];

type MemberResponse = {
  id: string;
  role: WorkspaceRole;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  invitedBy: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

type InviteResponse = {
  id: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  createdAt: string;
  expiresAt: string;
};

type MembersApiResponse = {
  memberships: MemberResponse[];
  invites: InviteResponse[];
};

export function WorkspaceMembersSection() {
  const queryClient = useQueryClient();
  const { workspace, role, membership: currentMembership } = useWorkspace();
  const workspaceSlug = workspace?.slug;
  const currentUserId = currentMembership?.userId ?? null;

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>(WorkspaceRole.MEMBER);

  const canManage = useMemo(
    () => role === WorkspaceRole.ADMIN || role === WorkspaceRole.OWNER,
    [role],
  );

  const membersQuery = useQuery({
    queryKey: ["workspace-members", workspaceSlug],
    queryFn: async () => {
      if (!workspaceSlug) return { memberships: [], invites: [] } satisfies MembersApiResponse;
      return apiFetch<MembersApiResponse>(`/api/workspaces/${workspaceSlug}/members`);
    },
    enabled: Boolean(workspaceSlug),
  });

  useEffect(() => {
    if (membersQuery.isError) {
      const err = membersQuery.error as Error | null;
      if (err?.message) toast.error(err.message);
      else toast.error("Erro ao carregar membros do workspace.");
    }
  }, [membersQuery.isError, membersQuery.error]);

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, newRole }: { memberId: string; newRole: WorkspaceRole }) =>
      apiFetch<{ membership: MemberResponse }>(`/api/members/${memberId}`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceSlug] });
      toast.success("Papel atualizado");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) =>
      apiFetch<{ ok: boolean }>(`/api/members/${memberId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceSlug] });
      toast.success("Membro removido");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      if (!workspaceSlug) throw new Error("Workspace inválido");
      return apiFetch<{ invite: InviteResponse }>(`/api/workspaces/${workspaceSlug}/invite`, {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
    },
    onSuccess: () => {
      toast.success("Convite enviado");
      setInviteEmail("");
      setInviteRole(WorkspaceRole.MEMBER);
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceSlug] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const isLoading = membersQuery.isLoading;
  const data = membersQuery.data ?? { memberships: [], invites: [] };

  const acceptingLinkBase =
    typeof window !== "undefined"
      ? window.location.origin.replace(/\/$/, "")
      : (process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-foreground">Membros do workspace</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie quem pode acessar o workspace e ajuste os papéis conforme necessário.
          </p>
        </div>
        {canManage ? (
          <form
            className="mt-6 grid gap-4 md:grid-cols-[2fr,1fr,auto]"
            onSubmit={(event) => {
              event.preventDefault();
              inviteMutation.mutateAsync().catch(() => {});
            }}
          >
            <Input
              type="email"
              placeholder="email@empresa.com"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              required
              disabled={inviteMutation.isPending}
            />
            <Select
              value={inviteRole}
              onChange={(event) => setInviteRole(event.target.value as WorkspaceRole)}
              disabled={inviteMutation.isPending}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {ROLE_LABEL[option]}
                </option>
              ))}
            </Select>
            <Button type="submit" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? "Enviando..." : "Enviar convite"}
            </Button>
          </form>
        ) : null}
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Membros ativos</h3>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : data.memberships.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
            Nenhum membro encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Usuário</th>
                  <th className="px-4 py-3 text-left">Papel</th>
                  <th className="px-4 py-3 text-left">Adicionado em</th>
                  <th className="px-4 py-3 text-left">Convidado por</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.memberships.map((member) => {
                  const memberName = member.user.name ?? member.user.email ?? "Usuário";
                  const inviteInfo = member.invitedBy?.name ?? member.invitedBy?.email ?? "—";
                  const isCurrentUser = currentUserId === member.user.id;
                  const disableRoleSelect = !canManage || isCurrentUser || updateRoleMutation.isPending;
                  const allowRemove = isCurrentUser || canManage;
                  const removeLabel = isCurrentUser ? "Sair" : "Remover";

                  return (
                    <tr key={member.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{memberName}</span>
                          <span className="text-xs text-muted-foreground">{member.user.email ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {canManage ? (
                          <Select
                            value={member.role}
                            onChange={(event) =>
                              updateRoleMutation.mutateAsync({
                                memberId: member.id,
                                newRole: event.target.value as WorkspaceRole,
                              })
                            }
                            disabled={disableRoleSelect}
                          >
                            {ROLE_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {ROLE_LABEL[option]}
                              </option>
                            ))}
                          </Select>
                        ) : (
                          <Badge variant="outline">{ROLE_LABEL[member.role]}</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(member.createdAt, {
                          format: { day: "2-digit", month: "2-digit", year: "numeric" },
                        })}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{inviteInfo}</td>
                      <td className="px-4 py-3 text-right">
                        {allowRemove ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className={isCurrentUser ? "text-muted-foreground" : "text-destructive"}
                            onClick={() => removeMemberMutation.mutateAsync(member.id)}
                            disabled={removeMemberMutation.isPending}
                          >
                            {removeLabel}
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data.invites.length ? (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Convites pendentes</h3>
          <div className="space-y-3">
            {data.invites.map((invite) => {
              const link = `${acceptingLinkBase}/invite/accept?token=${invite.token}`;
              return (
                <div
                  key={invite.id}
                  className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-foreground">
                      <span className="font-medium">{invite.email}</span>
                      <Badge variant="outline">{ROLE_LABEL[invite.role]}</Badge>
                    </div>
                    <p>
                      Expira em {formatDate(invite.expiresAt, { format: { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" } })}
                    </p>
                    <p className="text-xs">
                      Criado por {invite.createdBy?.name ?? invite.createdBy?.email ?? "—"}
                    </p>
                    <p className="text-xs">
                      Link: <span className="break-all font-mono text-[11px] text-primary">{link}</span>
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (typeof navigator !== "undefined" && navigator.clipboard) {
                        navigator.clipboard
                          .writeText(link)
                          .then(() => toast.success("Link copiado"))
                          .catch(() => toast.error("Não foi possível copiar o link"));
                      } else {
                        toast.error("Copie o link manualmente");
                      }
                    }}
                  >
                    Copiar link
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
