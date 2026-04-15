import { getBackendHmacSecret, getBackendUrl } from "@/lib/config";
import { MUTATION_TIMEOUT_MS } from "@/lib/http";
import { signBackendRequest } from "@/lib/auth/hmac";

const USER_ID_MAX = 128;

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
};

export class IssueFailedError extends Error {
  constructor() {
    super("issue failed");
    this.name = "IssueFailedError";
  }
}

export class IssueValidationError extends Error {
  constructor(public readonly backendMessage: string) {
    super(backendMessage);
    this.name = "IssueValidationError";
  }
}

export class IssueBackendError extends Error {
  constructor(public readonly status: number) {
    super(`issue failed: ${status}`);
    this.name = "IssueBackendError";
  }
}

function isTokenPair(value: unknown): value is TokenPair {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.accessToken === "string" &&
    v.accessToken.length > 0 &&
    typeof v.refreshToken === "string" &&
    v.refreshToken.length > 0 &&
    typeof v.expiresAt === "string" &&
    v.expiresAt.length > 0
  );
}

export async function issueTokens(
  userId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<TokenPair> {
  if (userId.length === 0) {
    throw new IssueValidationError("userId required");
  }
  if (userId.length > USER_ID_MAX) {
    throw new IssueValidationError("userId too long");
  }

  const body = JSON.stringify({ userId });
  const { signature, timestamp } = signBackendRequest(
    body,
    getBackendHmacSecret(),
  );

  let res: Response;
  try {
    res = await fetchImpl(`${getBackendUrl()}/api/auth/issue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Timestamp": timestamp,
        "X-Signature": signature,
      },
      body,
      signal: AbortSignal.timeout(MUTATION_TIMEOUT_MS),
    });
  } catch {
    throw new IssueBackendError(0);
  }

  if (res.status === 200) {
    let payload: unknown;
    try {
      payload = await res.json();
    } catch {
      throw new IssueBackendError(200);
    }
    if (!isTokenPair(payload)) {
      throw new IssueBackendError(200);
    }
    return payload;
  }

  if (res.status === 400) {
    const payload = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new IssueValidationError(payload?.error ?? "invalid request");
  }

  if (res.status === 401) {
    throw new IssueFailedError();
  }

  throw new IssueBackendError(res.status);
}
