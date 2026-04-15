import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Post-auth nonce prevents abuse of the `credentials-post-auth` NextAuth
 * callback (which is publicly POSTable) by requiring a server-only HMAC over
 * the identifying fields the server action just minted. Without the nonce a
 * client could forge a session for an arbitrary userId/role by POSTing to
 * `/api/auth/callback/credentials-post-auth` directly.
 */

const NONCE_TTL_SECS = 60;

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("NEXTAUTH_SECRET must be set to sign post-auth nonces");
  }
  return secret;
}

function canonical(input: {
  userId: string;
  email: string;
  role: string;
  mustResetPassword: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  issuedAt: string;
}): string {
  return [
    input.userId,
    input.email,
    input.role,
    input.mustResetPassword,
    input.accessToken,
    input.refreshToken,
    input.accessTokenExpiresAt,
    input.issuedAt,
  ].join("\n");
}

export type PostAuthNonce = { nonce: string; issuedAt: string };

export function signPostAuthNonce(
  input: {
    userId: string;
    email: string;
    role: string;
    mustResetPassword: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: string;
  },
  now: () => number = Date.now,
): PostAuthNonce {
  const issuedAt = Math.floor(now() / 1000).toString();
  const digest = createHmac("sha256", getSecret())
    .update(canonical({ ...input, issuedAt }), "utf8")
    .digest("hex");
  return { nonce: digest, issuedAt };
}

export function verifyPostAuthNonce(
  input: {
    userId: string;
    email: string;
    role: string;
    mustResetPassword: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: string;
    issuedAt: string;
    nonce: string;
  },
  now: () => number = Date.now,
): boolean {
  const issuedAtSecs = Number.parseInt(input.issuedAt, 10);
  if (!Number.isFinite(issuedAtSecs)) return false;

  const nowSecs = Math.floor(now() / 1000);
  if (nowSecs - issuedAtSecs > NONCE_TTL_SECS) return false;
  if (issuedAtSecs - nowSecs > NONCE_TTL_SECS) return false;

  const expected = createHmac("sha256", getSecret())
    .update(canonical(input), "utf8")
    .digest("hex");

  const provided = Buffer.from(input.nonce, "hex");
  const expectedBuf = Buffer.from(expected, "hex");
  if (provided.length !== expectedBuf.length) return false;
  return timingSafeEqual(provided, expectedBuf);
}
