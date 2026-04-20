import { getBackendHmacSecret, getBackendUrl } from "@/lib/config";
import { MUTATION_TIMEOUT_MS } from "@/lib/http";
import { signBackendRequest } from "@/lib/auth/hmac";
import { isTransportError } from "@/lib/auth/transport-error";
import { ROLES, type Role } from "@/lib/auth/verify-credentials";

export const ENSURE_USER_PROVIDERS = ["google", "github", "apple"] as const;
export type EnsureUserProvider = (typeof ENSURE_USER_PROVIDERS)[number];

const PROVIDER_SUBJECT_MAX = 255;
const EMAIL_MAX = 320;

export type EnsureUserInput = {
  provider: EnsureUserProvider;
  providerSubject: string;
  email: string;
};

export type EnsuredUser = {
  userId: string;
  email: string;
  role: Role;
  created: boolean;
};

export class EnsureUserValidationError extends Error {
  constructor(public readonly backendMessage: string) {
    super(backendMessage);
    this.name = "EnsureUserValidationError";
  }
}

export class EnsureUserUnauthorizedError extends Error {
  constructor() {
    super("ensure-user unauthorized");
    this.name = "EnsureUserUnauthorizedError";
  }
}

export class EnsureUserForbiddenError extends Error {
  constructor(public readonly backendMessage: string) {
    super(backendMessage);
    this.name = "EnsureUserForbiddenError";
  }
}

export class EnsureUserBackendError extends Error {
  constructor(public readonly status: number) {
    super(`ensure-user failed: ${status}`);
    this.name = "EnsureUserBackendError";
  }
}

function isEnsuredUser(value: unknown): value is EnsuredUser {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.userId === "string" &&
    v.userId.length > 0 &&
    typeof v.email === "string" &&
    v.email.length > 0 &&
    typeof v.role === "string" &&
    (ROLES as readonly string[]).includes(v.role) &&
    typeof v.created === "boolean"
  );
}

export async function ensureUser(
  input: EnsureUserInput,
  fetchImpl: typeof fetch = fetch,
): Promise<EnsuredUser> {
  if (
    !(ENSURE_USER_PROVIDERS as readonly string[]).includes(input.provider)
  ) {
    throw new EnsureUserValidationError(`unsupported provider: ${input.provider}`);
  }
  if (input.providerSubject.length === 0) {
    throw new EnsureUserValidationError("providerSubject required");
  }
  if (input.providerSubject.length > PROVIDER_SUBJECT_MAX) {
    throw new EnsureUserValidationError("providerSubject too long");
  }
  if (input.email.length === 0) {
    throw new EnsureUserValidationError("email required");
  }
  if (input.email.length > EMAIL_MAX) {
    throw new EnsureUserValidationError("email too long");
  }

  const body = JSON.stringify({
    provider: input.provider,
    providerSubject: input.providerSubject,
    email: input.email,
  });
  const { signature, timestamp } = signBackendRequest(
    body,
    getBackendHmacSecret(),
  );

  let res: Response;
  try {
    res = await fetchImpl(`${getBackendUrl()}/api/auth/ensure-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Timestamp": timestamp,
        "X-Signature": signature,
      },
      body,
      signal: AbortSignal.timeout(MUTATION_TIMEOUT_MS),
    });
  } catch (err) {
    if (isTransportError(err)) {
      throw new EnsureUserBackendError(0);
    }
    throw err;
  }

  if (res.status === 200) {
    let payload: unknown;
    try {
      payload = await res.json();
    } catch {
      throw new EnsureUserBackendError(200);
    }
    if (!isEnsuredUser(payload)) {
      throw new EnsureUserBackendError(200);
    }
    return payload;
  }

  if (res.status === 400) {
    const payload = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new EnsureUserValidationError(payload?.error ?? "invalid request");
  }

  if (res.status === 401) {
    throw new EnsureUserUnauthorizedError();
  }

  if (res.status === 403) {
    const payload = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new EnsureUserForbiddenError(payload?.error ?? "forbidden");
  }

  throw new EnsureUserBackendError(res.status);
}
