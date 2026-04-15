import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getServerTokenMock, revokeMock, signOutMock, redirectMock } =
  vi.hoisted(() => ({
    getServerTokenMock: vi.fn(),
    revokeMock: vi.fn(),
    signOutMock: vi.fn(),
    redirectMock: vi.fn((): never => {
      const err = new Error("NEXT_REDIRECT");
      (err as Error & { digest?: string }).digest = "NEXT_REDIRECT";
      throw err;
    }),
  }));

vi.mock("@/lib/auth/server-token", () => ({
  getServerToken: getServerTokenMock,
}));

vi.mock("@/lib/auth/logout", () => ({
  revokeRefreshFamily: revokeMock,
  LogoutFailedError: class LogoutFailedError extends Error {},
}));

vi.mock("@/auth", () => ({
  signOut: signOutMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

import { signOutAction } from "@/app/signout/actions";

beforeEach(() => {
  getServerTokenMock.mockReset();
  revokeMock.mockReset();
  signOutMock.mockReset();
  redirectMock.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("signOutAction", () => {
  it("revokes the refresh family, clears the cookie, and redirects to /signin", async () => {
    getServerTokenMock.mockResolvedValueOnce({
      accessToken: "a",
      refreshToken: "r",
    });
    revokeMock.mockResolvedValueOnce(undefined);
    signOutMock.mockResolvedValueOnce(undefined);

    await expect(signOutAction()).rejects.toThrow("NEXT_REDIRECT");

    expect(revokeMock).toHaveBeenCalledWith("r");
    expect(signOutMock).toHaveBeenCalledWith({ redirect: false });
    expect(redirectMock).toHaveBeenCalledWith("/signin");
  });

  it("skips revoke when no refresh token is present but still signs out", async () => {
    getServerTokenMock.mockResolvedValueOnce(null);
    signOutMock.mockResolvedValueOnce(undefined);

    await expect(signOutAction()).rejects.toThrow("NEXT_REDIRECT");

    expect(revokeMock).not.toHaveBeenCalled();
    expect(signOutMock).toHaveBeenCalledWith({ redirect: false });
    expect(redirectMock).toHaveBeenCalledWith("/signin");
  });

  it("skips revoke when token is present but has no refreshToken field", async () => {
    getServerTokenMock.mockResolvedValueOnce({ accessToken: "a" });
    signOutMock.mockResolvedValueOnce(undefined);

    await expect(signOutAction()).rejects.toThrow("NEXT_REDIRECT");

    expect(revokeMock).not.toHaveBeenCalled();
    expect(signOutMock).toHaveBeenCalledWith({ redirect: false });
  });

  it("still clears the cookie and redirects when revoke throws (fail-open)", async () => {
    getServerTokenMock.mockResolvedValueOnce({
      accessToken: "a",
      refreshToken: "r",
    });
    revokeMock.mockRejectedValueOnce(new Error("boom"));
    signOutMock.mockResolvedValueOnce(undefined);

    await expect(signOutAction()).rejects.toThrow("NEXT_REDIRECT");

    expect(revokeMock).toHaveBeenCalledWith("r");
    expect(signOutMock).toHaveBeenCalledWith({ redirect: false });
    expect(redirectMock).toHaveBeenCalledWith("/signin");
  });

  it("still redirects when signOut throws (fail-open)", async () => {
    getServerTokenMock.mockResolvedValueOnce({
      accessToken: "a",
      refreshToken: "r",
    });
    revokeMock.mockResolvedValueOnce(undefined);
    signOutMock.mockRejectedValueOnce(new Error("cookie mutate boom"));

    await expect(signOutAction()).rejects.toThrow("NEXT_REDIRECT");

    expect(signOutMock).toHaveBeenCalledWith({ redirect: false });
    expect(redirectMock).toHaveBeenCalledWith("/signin");
  });

  it("still redirects when getServerToken throws", async () => {
    getServerTokenMock.mockRejectedValueOnce(new Error("cookie store boom"));
    signOutMock.mockResolvedValueOnce(undefined);

    await expect(signOutAction()).rejects.toThrow("NEXT_REDIRECT");

    expect(revokeMock).not.toHaveBeenCalled();
    expect(signOutMock).toHaveBeenCalledWith({ redirect: false });
    expect(redirectMock).toHaveBeenCalledWith("/signin");
  });
});
