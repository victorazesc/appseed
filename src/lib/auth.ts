import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "@auth/core/adapters";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { verifyPassword } from "@/lib/password";
import { GlobalRole } from "@prisma/client";

const credentialsSchema = z.object({
  email: z.string().email({ message: "Informe um e-mail válido" }),
  password: z.string().min(1, { message: "Informe a senha" }),
});

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

const authDisabled = env.AUTH_DISABLED === "true";
export const authEnabled = !authDisabled;
const authSecret = env.AUTH_SECRET ?? "appseed-dev-secret";

const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Senha", type: "password" },
    },
    authorize: async (rawCredentials) => {
      if (authDisabled) {
        const fallbackUser = await prisma.user.upsert({
          where: { email: "demo@appseed.dev" },
          update: {},
          create: {
            email: "demo@appseed.dev",
            name: "Demo User",
            globalRole: GlobalRole.ADMIN_GLOBAL,
            onboardingComplete: true,
            emailVerified: new Date(),
          },
        });

        return fallbackUser;
      }

      const parsed = credentialsSchema.safeParse(rawCredentials);
      if (!parsed.success) {
        return null;
      }

      const { email, password } = parsed.data;
      const normalizedEmail = normalizeEmail(email);

      const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (!user?.passwordHash) {
        return null;
      }

      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return null;
      }

      return user;
    },
  }),
];

if (env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        const email = profile.email ? normalizeEmail(profile.email) : `${profile.sub}@google.local`;
        return {
          id: profile.sub,
          email,
          name: profile.name,
          image: profile.picture,
          globalRole: GlobalRole.USER,
          onboardingComplete: false,
        };
      },
    }),
  );
}

const adapter: Adapter = PrismaAdapter(prisma) as unknown as Adapter;

export const {
  auth,
  handlers,
  signIn,
  signOut,
} = NextAuth({
  trustHost: true,
  adapter,
  secret: authSecret,
  session: { strategy: "jwt" },
  providers,
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/sign-in",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }

      const normalizedEmail = normalizeEmail(user.email);

      if (!user.id) {
        return true;
      }

      try {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            email: normalizedEmail,
            name: user.name ?? undefined,
            image: user.image ?? undefined,
          },
        });
      } catch (error) {
        console.warn("auth signIn skipped update", { userId: user.id, error });
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.globalRole = (user as { globalRole?: GlobalRole | null }).globalRole ?? GlobalRole.USER;
        token.isAdminGlobal = token.globalRole === GlobalRole.ADMIN_GLOBAL;
        token.impersonatedWorkspaceId = null;
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user) {
        session.user = {} as typeof session.user;
      }

      session.user.id = (token.id as string) ?? "";
      session.user.email = (token.email as string | null | undefined) ?? "";
      session.user.name = (token.name as string | null | undefined) ?? null;
      session.user.image = (token.picture as string | null | undefined) ?? null;
      session.user.globalRole = (token.globalRole as GlobalRole | undefined) ?? GlobalRole.USER;
      session.user.isAdminGlobal = Boolean(token.isAdminGlobal);
      session.user.impersonatedWorkspaceId = (token.impersonatedWorkspaceId as string | null | undefined) ?? null;

      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return `${baseUrl}/auth/post-login`;
    },
  },
  events: {
    async signIn({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    },
  },
});

export async function getSessionUser(_request?: Request) {
  void _request;
  if (!authEnabled) {
    return {
      id: "demo-user",
      email: "demo@appseed.dev",
      name: "Demo User",
      globalRole: GlobalRole.ADMIN_GLOBAL,
      isAdminGlobal: true,
      impersonatedWorkspaceId: null,
    } as const;
  }

  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    globalRole: session.user.globalRole,
    isAdminGlobal: session.user.isAdminGlobal,
    impersonatedWorkspaceId: session.user.impersonatedWorkspaceId ?? null,
  } as const;
}

export async function assertAuthenticated(request?: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user;
}
