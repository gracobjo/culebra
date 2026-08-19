import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getActiveUserById, notifyLogin, validateCredentials } from "@culebra/auth";

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contrasena", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await validateCredentials({
          email: String(credentials.email),
          password: String(credentials.password),
        });

        if (!user) {
          notifyLogin({ email: String(credentials.email), role: "?", success: false });
          return null;
        }

        notifyLogin({
          email: user.email,
          role: user.roles[0] ?? "CONSUMER",
          success: true,
        });

        return {
          id: user.id,
          email: user.email,
          name:
            [user.firstName, user.lastName].filter(Boolean).join(" ") ||
            user.email,
          roles: user.roles,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = (user as { roles?: string[] }).roles ?? [];
        token.status = (user as { status?: string }).status ?? "ACTIVE";
      }

      if (token.id) {
        const activeUser = await getActiveUserById(token.id as string);
        if (!activeUser) {
          return {};
        }
        token.roles = activeUser.roles;
        token.status = activeUser.status;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.roles = (token.roles as string[]) ?? [];
        session.user.status = (token.status as string) ?? "ACTIVE";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
