import Link from "next/link";
import { redirect } from "next/navigation";

import { authEnabled } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Logo } from "@/components/logo";

async function getTokenInfo(token: string) {
  const record = await prisma.userToken.findUnique({ where: { token } });
  if (!record) return null;
  if (record.purpose !== "PASSWORD_RESET") return null;
  if (record.consumedAt) return null;
  if (record.expiresAt.getTime() < Date.now()) return null;
  return record;
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  if (!authEnabled) {
    redirect("/");
  }

  const { token } = await params;
  if (!token) {
    redirect("/auth/sign-in");
  }

  const tokenInfo = await getTokenInfo(token);

  if (!tokenInfo) {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6 text-center">
          <Link href="/" className="flex items-center gap-2 self-center font-medium">
            <span className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Logo className="size-4" />
            </span>
            Seedora
          </Link>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 shadow-sm">
            <h1 className="mb-2 text-xl font-semibold text-destructive">Link inválido ou expirado</h1>
            <p className="text-sm text-muted-foreground">
              O link de redefinição de senha não é mais válido. Solicite um novo link abaixo.
            </p>
            <Link
              href="/auth/forgot"
              className="mt-4 inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10"
            >
              Enviar novo link de redefinição
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <span className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Logo className="size-4" />
          </span>
          Seedora
        </Link>
        <ResetPasswordForm token={token} email={tokenInfo.email} />
      </div>
    </div>
  );
}
