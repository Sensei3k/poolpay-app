import NextAuth, { CredentialsSignin, type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {
  ROLES,
  type Role,
} from "@/lib/auth/verify-credentials";
import { readJwtExpSecs } from "@/lib/auth/jwt-exp";
import { verifyPostAuthNonce } from "@/lib/auth/post-auth-nonce";
import { refreshTokens } from "@/lib/auth/refresh";

type AppRole = Role;

const REFRESH_SKEW_SECS = 360;

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;
      mustResetPassword: boolean;
    } & DefaultSession["user"];
    error?: "RefreshFailedError";
  }

  interface User {
    id?: string;
    role?: AppRole;
    mustResetPassword?: boolean;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    userId?: string;
    role?: AppRole;
    mustResetPassword?: boolean;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    error?: "RefreshFailedError";
  }
}

class PostAuthFailedSignin extends CredentialsSignin {
  code = "post_auth_failed";
}

function parseRole(raw: unknown): AppRole | null {
  return typeof raw === "string" && (ROLES as readonly string[]).includes(raw)
    ? (raw as AppRole)
    : null;
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  providers: [
    Credentials({
      id: "credentials-post-auth",
      credentials: {
        userId: {},
        email: {},
        role: {},
        mustResetPassword: {},
        accessToken: {},
        refreshToken: {},
        accessTokenExpiresAt: {},
        postAuthNonce: {},
        postAuthIssuedAt: {},
      },
      async authorize(raw) {
        const userId = typeof raw?.userId === "string" ? raw.userId : "";
        const email = typeof raw?.email === "string" ? raw.email : "";
        const role = parseRole(raw?.role);
        const accessToken =
          typeof raw?.accessToken === "string" ? raw.accessToken : "";
        const refreshToken =
          typeof raw?.refreshToken === "string" ? raw.refreshToken : "";
        const accessTokenExpiresAt =
          typeof raw?.accessTokenExpiresAt === "string"
            ? raw.accessTokenExpiresAt
            : "";
        const postAuthNonce =
          typeof raw?.postAuthNonce === "string" ? raw.postAuthNonce : "";
        const postAuthIssuedAt =
          typeof raw?.postAuthIssuedAt === "string" ? raw.postAuthIssuedAt : "";
        const expiresAtRaw = accessTokenExpiresAt
          ? Number.parseInt(accessTokenExpiresAt, 10)
          : Number.NaN;
        const mustResetPassword = raw?.mustResetPassword === "true";

        if (
          !userId ||
          !email ||
          !role ||
          !accessToken ||
          !refreshToken ||
          !Number.isFinite(expiresAtRaw) ||
          !postAuthNonce ||
          !postAuthIssuedAt
        ) {
          throw new PostAuthFailedSignin();
        }

        const nonceOk = verifyPostAuthNonce({
          userId,
          accessToken,
          refreshToken,
          accessTokenExpiresAt,
          issuedAt: postAuthIssuedAt,
          nonce: postAuthNonce,
        });
        if (!nonceOk) {
          throw new PostAuthFailedSignin();
        }

        return {
          id: userId,
          email,
          role,
          mustResetPassword,
          accessToken,
          refreshToken,
          accessTokenExpiresAt: expiresAtRaw,
        };
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
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpiresAt = user.accessTokenExpiresAt;
        delete token.error;
        return token;
      }

      if (token.error) return token;

      if (!token.refreshToken) {
        return token;
      }

      const now = Math.floor(Date.now() / 1000);
      const expiresAt = token.accessTokenExpiresAt;
      if (
        typeof expiresAt !== "number" ||
        !Number.isFinite(expiresAt) ||
        expiresAt <= 0
      ) {
        token.accessToken = undefined;
        token.refreshToken = undefined;
        token.accessTokenExpiresAt = undefined;
        token.error = "RefreshFailedError";
        return token;
      }

      if (expiresAt - now > REFRESH_SKEW_SECS) {
        return token;
      }

      try {
        const pair = await refreshTokens(token.refreshToken);
        const refreshedAccessTokenExpiresAt = readJwtExpSecs(pair.accessToken);

        if (!refreshedAccessTokenExpiresAt) {
          token.accessToken = undefined;
          token.refreshToken = undefined;
          token.accessTokenExpiresAt = undefined;
          token.error = "RefreshFailedError";
          return token;
        }

        token.accessToken = pair.accessToken;
        token.refreshToken = pair.refreshToken;
        token.accessTokenExpiresAt = refreshedAccessTokenExpiresAt;
        return token;
      } catch {
        token.accessToken = undefined;
        token.refreshToken = undefined;
        token.accessTokenExpiresAt = undefined;
        token.error = "RefreshFailedError";
        return token;
      }
    },
    async session({ session, token }) {
      if (!session.user) {
        session.user = {} as typeof session.user;
      }
      session.user.id = token.userId ?? "";
      session.user.role = token.role ?? "member";
      session.user.mustResetPassword = token.mustResetPassword ?? false;
      if (token.email) session.user.email = token.email;
      if (token.name) session.user.name = token.name;
      if (token.picture) session.user.image = token.picture;
      if (token.error) session.error = token.error;
      return session;
    },
  },
});
