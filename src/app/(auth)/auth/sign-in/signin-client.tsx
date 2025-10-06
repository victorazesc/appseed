"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Logo } from "@/components/logo";
import { LoginForm } from "@/components/login-form";

export function SignInClient() {
  const searchParams = useSearchParams();
  const defaultEmail = searchParams.get("email") ?? undefined;
  const resetSuccess = searchParams.get("reset") === "success";

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <span className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Logo className="size-4" />
          </span>
          Seedora
        </Link>
        <LoginForm defaultEmail={defaultEmail} resetSuccess={resetSuccess} />
      </div>
    </div>
  );
}
