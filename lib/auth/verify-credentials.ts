import { getBackendHmacSecret, getBackendUrl } from "@/lib/config";
import { FETCH_TIMEOUT_MS } from "@/lib/http";
import { signBackendRequest } from "@/lib/auth/hmac";

const EMAIL_MAX = 320;
const PASSWORD_MAX = 1024;
const ROLES = ["super_admin", "admin", "member"] as const;

export type VerifiedUser = {
  userId: string;
  email: string;
  role: (typeof ROLES)[number];
  mustResetPassword: boolean;
};

export class InvalidCredentialsError extends Error {
  constructor() {
    super("invalid credentials");
    this.name = "InvalidCredentialsError";
  }
}

export class RateLimitedError extends Error {
  constructor(public readonly retryAfterSecs: number | null) {
    super("rate limited");
    this.name = "RateLimitedError";
  }
}

export class CredentialFieldError extends Error {
  constructor(public readonly backendMessage: string) {
    super(backendMessage);
    this.name = "CredentialFieldError";
  }
}

export class BackendError extends Error {
  constructor(public readonly status: number) {
    super(`verify-credentials failed: ${status}`);
    this.name = "BackendError";
  }
}

function isVerifiedUser(value: unknown): value is VerifiedUser {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.userId === "string" &&
    v.userId.length > 0 &&
    typeof v.email === "string" &&
    typeof v.role === "string" &&
    (ROLES as readonly string[]).includes(v.role) &&
    typeof v.mustResetPassword === "boolean"
  );
}

export async function verifyCredentials(
  email: string,
  password: string,
  fetchImpl: typeof fetch = fetch,
): Promise<VerifiedUser> {
  if (email.length > EMAIL_MAX) {
    throw new CredentialFieldError("email too long");
  }
  if (password.length > PASSWORD_MAX) {
    throw new CredentialFieldError("password too long");
  }

  const body = JSON.stringify({ email, password });
  const { signature, timestamp } = signBackendRequest(
    body,
    getBackendHmacSecret(),
  );

  const res = await fetchImpl(`${getBackendUrl()}/api/auth/verify-credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Timestamp": timestamp,
      "X-Signature": signature,
    },
    body,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (res.status === 200) {
    const payload = (await res.json()) as unknown;
    if (!isVerifiedUser(payload)) {
      throw new BackendError(200);
    }
    return payload;
  }

  if (res.status === 400) {
    const payload = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new CredentialFieldError(payload?.error ?? "invalid request");
  }

  if (res.status === 401) {
    throw new InvalidCredentialsError();
  }

  if (res.status === 429) {
    const retryAfter = res.headers.get("retry-after");
    const parsed = retryAfter ? Number.parseInt(retryAfter, 10) : Number.NaN;
    throw new RateLimitedError(Number.isFinite(parsed) ? parsed : null);
  }

  throw new BackendError(res.status);
}
