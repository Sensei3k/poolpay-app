import { cookies } from "next/headers";
import { decode } from "@auth/core/jwt";
import type { JWT } from "@auth/core/jwt";

const SECURE_COOKIE_NAME = "__Secure-authjs.session-token";
const INSECURE_COOKIE_NAME = "authjs.session-token";

function useSecureCookies(): boolean {
  const url = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  if (url) return url.startsWith("https://");
  return process.env.NODE_ENV === "production";
}

export function sessionCookieName(): string {
  return useSecureCookies() ? SECURE_COOKIE_NAME : INSECURE_COOKIE_NAME;
}

function getAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET (or AUTH_SECRET) is not set");
  }
  return secret;
}

export async function getServerToken(): Promise<JWT | null> {
  const cookieName = sessionCookieName();
  const store = await cookies();
  const raw = store.get(cookieName)?.value;
  if (!raw) return null;

  const secret = getAuthSecret();

  try {
    const token = await decode<JWT>({
      token: raw,
      secret,
      salt: cookieName,
    });
    if (!token) return null;
    if (token.error === "RefreshFailedError") return null;
    return token;
  } catch {
    return null;
  }
}

export async function getAccessToken(): Promise<string | null> {
  const token = await getServerToken();
  return token?.accessToken ?? null;
}
