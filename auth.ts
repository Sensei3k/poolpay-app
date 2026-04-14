import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {
  InvalidCredentialsError,
  verifyCredentials,
} from "@/lib/auth/verify-credentials";

type AppRole = "super_admin" | "admin" | "member";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;
      mustResetPassword: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: AppRole;
    mustResetPassword?: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    userId?: string;
    role?: AppRole;
    mustResetPassword?: boolean;
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const email = typeof raw?.email === "string" ? raw.email : "";
        const password = typeof raw?.password === "string" ? raw.password : "";
        if (!email || !password) return null;

        try {
          const user = await verifyCredentials(email, password);
          return {
            id: user.userId,
            email: user.email,
            role: user.role,
            mustResetPassword: user.mustResetPassword,
          };
        } catch (err) {
          if (err instanceof InvalidCredentialsError) return null;
          throw err;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        token.mustResetPassword = user.mustResetPassword;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) session.user.id = token.userId;
      if (token.role) session.user.role = token.role;
      session.user.mustResetPassword = token.mustResetPassword ?? false;
      return session;
    },
  },
});
