import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { authEnabled, getCurrentUser } from "@/lib/auth";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (authEnabled && !user) {
    redirect("/signin");
  }

  return <AppShell user={user}>{children}</AppShell>;
}
