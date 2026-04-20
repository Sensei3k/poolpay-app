import { describe, expect, it } from "vitest";

import type { SignInCode } from "@/app/signin/actions";
import {
  LINKING_CONFLICT_MESSAGE,
  messageForCode,
  statusFromNextAuthError,
  type Status,
} from "@/app/signin/status-machine";

// The `satisfies Record<SignInCode, Status>` clause gives us compile-time
// exhaustiveness: adding a new SignInCode without extending this table is a
// type error, so messageForCode can never drift out of sync with its inputs.
const SIGN_IN_CODE_EXPECTATIONS = {
  invalid_credentials: {
    kind: "auth-error",
    cause: "invalid-credentials",
    message: "Invalid email or password.",
  },
  rate_limited: { kind: "rate-limited", retryAfterSecs: null },
  field_validation: {
    kind: "auth-error",
    cause: "validation",
    message: "Email or password is too long.",
  },
  backend_unavailable: {
    kind: "auth-error",
    cause: "service",
    message:
      "Sign-in is temporarily unavailable. Please try again in a few minutes.",
  },
  post_auth_failed: {
    kind: "auth-error",
    cause: "service",
    message:
      "Sign-in is temporarily unavailable. Please try again in a few minutes.",
  },
} as const satisfies Record<SignInCode, Status>;

describe("messageForCode", () => {
  for (const [code, expected] of Object.entries(SIGN_IN_CODE_EXPECTATIONS)) {
    it(`maps ${code} to the expected Status`, () => {
      expect(messageForCode(code as SignInCode, undefined).status).toEqual(
        expected,
      );
    });
  }

  it("maps undefined code to invalid-credentials (defensive default)", () => {
    expect(messageForCode(undefined, undefined).status).toEqual(
      SIGN_IN_CODE_EXPECTATIONS.invalid_credentials,
    );
  });

  it("carries retryAfterSecs when rate-limited and number given", () => {
    expect(messageForCode("rate_limited", 42).status).toEqual({
      kind: "rate-limited",
      retryAfterSecs: 42,
    });
  });

  it("forces retryAfterSecs to null when missing on rate_limited", () => {
    expect(messageForCode("rate_limited", undefined).status).toEqual({
      kind: "rate-limited",
      retryAfterSecs: null,
    });
  });

  it("ignores retryAfterSecs on non-rate-limited codes", () => {
    expect(messageForCode("backend_unavailable", 99).status).toEqual(
      SIGN_IN_CODE_EXPECTATIONS.backend_unavailable,
    );
  });
});

describe("statusFromNextAuthError", () => {
  it("returns idle for null", () => {
    expect(statusFromNextAuthError(null)).toEqual({ kind: "idle" });
  });

  it("returns idle for empty string", () => {
    expect(statusFromNextAuthError("")).toEqual({ kind: "idle" });
  });

  it("returns linking-conflict for OAuthAccountNotLinked", () => {
    expect(statusFromNextAuthError("OAuthAccountNotLinked")).toEqual({
      kind: "linking-conflict",
      message: LINKING_CONFLICT_MESSAGE,
    });
  });

  it("returns linking-conflict for AccountLinkingRequired", () => {
    expect(statusFromNextAuthError("AccountLinkingRequired")).toEqual({
      kind: "linking-conflict",
      message: LINKING_CONFLICT_MESSAGE,
    });
  });

  it("returns a generic service auth-error for unknown codes", () => {
    expect(statusFromNextAuthError("SomeUnseenCode")).toEqual({
      kind: "auth-error",
      cause: "service",
      message:
        "Sign-in is temporarily unavailable. Please try again in a few minutes.",
    });
  });

  it("treats arbitrary error strings as generic service errors", () => {
    expect(statusFromNextAuthError("CredentialsSignin")).toMatchObject({
      kind: "auth-error",
      cause: "service",
    });
  });
});
