import { GlobalRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name?: string | null;
    globalRole: GlobalRole;
    onboardingComplete: boolean;
  }

  interface Session {
    user: {
      image: string | null;
      id: string;
      email: string;
      name?: string | null;
      globalRole: GlobalRole;
      isAdminGlobal: boolean;
      impersonatedWorkspaceId?: string | null;
    };
  }
}
