import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { env, authDisabled } from "./env";

type UserLike = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

const shouldEnableAuth = !authDisabled && !!env.AUTH_GOOGLE_ID && !!env.AUTH_GOOGLE_SECRET;

const allowedEmails = [
  "victorazesc@gmail.com",
  "anacaroline.sardavargas@gmail.com",
];

const providers = shouldEnableAuth
  ? [
      Google({
        clientId: env.AUTH_GOOGLE_ID!,
        clientSecret: env.AUTH_GOOGLE_SECRET!,
      }),
    ]
  : [];

export const authEnabled = shouldEnableAuth;

export const {
  auth,
  handlers,
  signIn,
  signOut,
} = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  providers,
  secret: env.AUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      if (!shouldEnableAuth) {
        return true;
      }

      const email = user.email?.toLowerCase();
      if (!email || !allowedEmails.includes(email)) {
        return false;
      }

      return true;
    },
  },
});

export async function getCurrentUser(): Promise<UserLike | null> {
  if (!shouldEnableAuth) {
    return {
      id: "demo-user",
      name: "Demo User",
      email: "demo@appseed.dev",
    };
  }

  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }

  const email = session.user.email.toLowerCase();
  if (!allowedEmails.includes(email)) {
    return null;
  }

  return {
    id: session.user.email,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };
}
