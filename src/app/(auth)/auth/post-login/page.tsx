import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PostLoginPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/auth/sign-in");
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: sessionUser.id },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  });

  if (!membership?.workspace) {
    redirect("/onboarding/create-workspace");
  }

  redirect(`/${membership.workspace.slug}/dashboard`);
}
