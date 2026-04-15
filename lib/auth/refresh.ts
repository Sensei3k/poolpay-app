import { getBackendUrl } from "@/lib/config";
import { MUTATION_TIMEOUT_MS } from "@/lib/http";
import type { TokenPair } from "@/lib/auth/issue";

export class RefreshFailedError extends Error {
  constructor() {
    super("refresh failed");
    this.name = "RefreshFailedError";
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

export async function refreshTokens(
  refreshToken: string,
  fetchImpl: typeof fetch = fetch,
): Promise<TokenPair> {
  if (!refreshToken) {
    throw new RefreshFailedError();
  }

  let res: Response;
  try {
    res = await fetchImpl(`${getBackendUrl()}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      signal: AbortSignal.timeout(MUTATION_TIMEOUT_MS),
    });
  } catch {
    throw new RefreshFailedError();
  }

  if (res.status !== 200) {
    throw new RefreshFailedError();
  }

  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    throw new RefreshFailedError();
  }

  if (!isTokenPair(payload)) {
    throw new RefreshFailedError();
  }

  return payload;
}
