import { prisma } from "@/lib/prisma";

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60);
}

export async function generateUniqueWorkspaceSlug(name: string) {
  const base = slugify(name) || "workspace";
  let candidate = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.workspace.findFirst({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing) {
      return candidate;
    }
    counter += 1;
    candidate = `${base}-${counter}`;
  }
}
