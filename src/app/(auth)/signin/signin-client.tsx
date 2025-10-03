"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function SignInClient() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/20 px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">Entrar com Google</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Acesse o funil de vendas usando sua conta Google corporativa.
        </p>
        <Button className="mt-6 w-full" onClick={handleSignIn} disabled={loading}>
          {loading ? "Redirecionando..." : "Continuar com Google"}
        </Button>
      </div>
    </div>
  );
}
