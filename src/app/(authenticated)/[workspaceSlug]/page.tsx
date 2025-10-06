import { redirect } from "next/navigation";

export default async function WorkspaceIndexPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;

  if (!workspaceSlug) {
    redirect("/auth/post-login");
  }

  redirect(`/${workspaceSlug}/dashboard`);
}
