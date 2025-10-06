import { redirect } from "next/navigation";

import { authEnabled, getSessionUser } from "@/lib/auth";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (authEnabled && !user) {
    redirect("/auth/sign-in");
  }

  return children;
}
