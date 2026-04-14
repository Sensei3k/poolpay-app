import NextAuth, { CredentialsSignin, type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {
  CredentialFieldError,
  InvalidCredentialsError,
  RateLimitedError,
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

class InvalidCredentialsSignin extends CredentialsSignin {
  code = "invalid_credentials";
}

class RateLimitedSignin extends CredentialsSignin {
  code = "rate_limited";
}

class FieldValidationSignin extends CredentialsSignin {
  code = "field_validation";
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
        if (!email || !password) {
          throw new InvalidCredentialsSignin();
        }

        try {
          const user = await verifyCredentials(email, password);
          return {
            id: user.userId,
            email: user.email,
            role: user.role,
            mustResetPassword: user.mustResetPassword,
          };
        } catch (err) {
          if (err instanceof InvalidCredentialsError) {
            throw new InvalidCredentialsSignin();
          }
          if (err instanceof RateLimitedError) {
            throw new RateLimitedSignin();
          }
          if (err instanceof CredentialFieldError) {
            throw new FieldValidationSignin();
          }
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
      session.user.id = token.userId ?? "";
      session.user.role = token.role ?? "member";
      session.user.mustResetPassword = token.mustResetPassword ?? false;
      return session;
    },
  },
});
