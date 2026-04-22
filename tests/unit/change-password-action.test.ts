import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { secureActionMock } = vi.hoisted(() => ({
  secureActionMock: vi.fn(),
}));

vi.mock("@/lib/auth/backend-fetch", async (orig) => {
  const actual = await orig<typeof import("@/lib/auth/backend-fetch")>();
  return {
    ...actual,
    secureAction: secureActionMock,
  };
});

import { BackendUnauthorizedError } from "@/lib/auth/backend-fetch";
import { changePasswordAction } from "@/app/(app)/account/change-password/actions";

beforeEach(() => {
  secureActionMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("changePasswordAction", () => {
  it("returns ok: true on 204 success", async () => {
    secureActionMock.mockResolvedValueOnce({ success: true });

    const result = await changePasswordAction({
      currentPassword: "old",
      newPassword: "new-password-123",
    });

    expect(result).toEqual({ ok: true });
  });

  it("maps 400 + code=bad_current to a first-class bad_current domain code", async () => {
    secureActionMock.mockResolvedValueOnce({
      success: false,
      error: "Current password is incorrect.",
      status: 400,
      code: "bad_current",
    });

    const result = await changePasswordAction({
      currentPassword: "wrong",
      newPassword: "new-password-123",
    });

    expect(result).toEqual({ ok: false, code: "bad_current" });
  });

  it("maps 400 without a coded body to validation drift", async () => {
    secureActionMock.mockResolvedValueOnce({
      success: false,
      error: "newPassword required",
      status: 400,
    });

    const result = await changePasswordAction({
      currentPassword: "old",
      newPassword: "",
    });

    expect(result).toEqual({ ok: false, code: "validation" });
  });

  it("maps 429 to rate_limited and reads Retry-After from headers", async () => {
    const headers = new Headers({ "Retry-After": "17" });
    secureActionMock.mockResolvedValueOnce({
      success: false,
      error: "too many requests",
      status: 429,
      headers,
    });

    const result = await changePasswordAction({
      currentPassword: "old",
      newPassword: "new-password-123",
    });

    expect(result).toEqual({
      ok: false,
      code: "rate_limited",
      retryAfterSecs: 17,
    });
  });

  it("maps 5xx to a generic service error", async () => {
    secureActionMock.mockResolvedValueOnce({
      success: false,
      error: "internal",
      status: 500,
    });

    const result = await changePasswordAction({
      currentPassword: "old",
      newPassword: "new-password-123",
    });

    expect(result).toEqual({ ok: false, code: "service" });
  });

  it("maps a transport-level failure (status undefined) to backend_unavailable", async () => {
    secureActionMock.mockResolvedValueOnce({
      success: false,
      error: "network_error",
    });

    const result = await changePasswordAction({
      currentPassword: "old",
      newPassword: "new-password-123",
    });

    expect(result).toEqual({ ok: false, code: "backend_unavailable" });
  });

  it("rethrows BackendUnauthorizedError so the caller can redirect to /signin?reauth=1", async () => {
    // Post-poolpay-api#39, a 401 bubbles out of secureAction only when the
    // session is genuinely dead (refresh failed or retry exhausted). The
    // action must surface that as a thrown error — it's no longer conflated
    // with wrong-current-password.
    secureActionMock.mockRejectedValueOnce(
      new BackendUnauthorizedError("retry_exhausted"),
    );

    await expect(
      changePasswordAction({
        currentPassword: "old",
        newPassword: "new-password-123",
      }),
    ).rejects.toBeInstanceOf(BackendUnauthorizedError);
  });

  it("collapses unexpected errors to backend_unavailable", async () => {
    secureActionMock.mockRejectedValueOnce(new Error("boom"));

    const result = await changePasswordAction({
      currentPassword: "old",
      newPassword: "new-password-123",
    });

    expect(result).toEqual({ ok: false, code: "backend_unavailable" });
  });
});
