import { getBackendHmacSecret } from "@/lib/config";
import { signBackendRequest } from "@/lib/auth/hmac";

export type VerifiedUser = {
  userId: string;
  email: string;
  role: "super_admin" | "admin" | "member";
  mustResetPassword: boolean;
};

export class RateLimitedError extends Error {
  constructor(public readonly retryAfterSecs: number | null) {
    super("rate limited");
    this.name = "RateLimitedError";
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("invalid credentials");
    this.name = "InvalidCredentialsError";
  }
}

export async function verifyCredentials(
  email: string,
  password: string,
  fetchImpl: typeof fetch = fetch,
): Promise<VerifiedUser> {
  const body = JSON.stringify({ email, password });
  const { signature, timestamp } = signBackendRequest(
    body,
    getBackendHmacSecret(),
  );

  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";
  const res = await fetchImpl(`${backendUrl}/api/auth/verify-credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Timestamp": timestamp,
      "X-Signature": signature,
    },
    body,
  });

  if (res.status === 200) {
    return (await res.json()) as VerifiedUser;
  }

  if (res.status === 401) {
    throw new InvalidCredentialsError();
  }

  if (res.status === 429) {
    const retryAfter = res.headers.get("retry-after");
    const parsed = retryAfter ? Number.parseInt(retryAfter, 10) : Number.NaN;
    throw new RateLimitedError(Number.isFinite(parsed) ? parsed : null);
  }

  throw new Error(`verify-credentials failed: ${res.status}`);
}
