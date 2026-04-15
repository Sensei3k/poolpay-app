import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RefreshFailedError, refreshTokens } from "@/lib/auth/refresh";

beforeEach(() => {
  process.env.BACKEND_URL = "http://backend.test";
});

afterEach(() => {
  delete process.env.BACKEND_URL;
});

function mockFetch(response: Partial<Response>): typeof fetch {
  return vi.fn(async () => response as Response) as unknown as typeof fetch;
}

describe("refreshTokens", () => {
  it("returns the new token pair on 200", async () => {
    const pair = {
      accessToken: "eyJ.new.access",
      refreshToken: "new-opaque",
      expiresAt: "2026-04-16T00:00:00Z",
    };
    const fetchImpl = mockFetch({ status: 200, json: async () => pair });

    const result = await refreshTokens("old-refresh", fetchImpl);
    expect(result).toEqual(pair);
  });

  it("posts refreshToken in JSON body without HMAC headers", async () => {
    const fetchImpl = vi.fn(
      async () =>
        ({
          status: 200,
          json: async () => ({
            accessToken: "a",
            refreshToken: "r",
            expiresAt: "2026-04-16T00:00:00Z",
          }),
        }) as Response,
    ) as unknown as typeof fetch;

    await refreshTokens("old-refresh", fetchImpl);

    const [url, init] = (
      fetchImpl as unknown as { mock: { calls: unknown[][] } }
    ).mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://backend.test/api/auth/refresh");
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["X-Signature"]).toBeUndefined();
    expect(headers["X-Timestamp"]).toBeUndefined();
    expect(init.body).toBe(JSON.stringify({ refreshToken: "old-refresh" }));
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("throws RefreshFailedError on 401", async () => {
    const fetchImpl = mockFetch({
      status: 401,
      json: async () => ({ error: "unauthorized" }),
    });
    await expect(refreshTokens("bad", fetchImpl)).rejects.toBeInstanceOf(
      RefreshFailedError,
    );
  });

  it("throws RefreshFailedError on any non-200 status", async () => {
    const fetchImpl = mockFetch({ status: 500 });
    await expect(refreshTokens("bad", fetchImpl)).rejects.toBeInstanceOf(
      RefreshFailedError,
    );
  });

  it("throws RefreshFailedError on network failure", async () => {
    const fetchImpl = (vi.fn(async () => {
      throw new TypeError("network");
    }) as unknown) as typeof fetch;
    await expect(refreshTokens("any", fetchImpl)).rejects.toBeInstanceOf(
      RefreshFailedError,
    );
  });

  it("throws RefreshFailedError when 200 body is malformed JSON", async () => {
    const fetchImpl = mockFetch({
      status: 200,
      json: async () => {
        throw new Error("not json");
      },
    });
    await expect(refreshTokens("any", fetchImpl)).rejects.toBeInstanceOf(
      RefreshFailedError,
    );
  });

  it("throws RefreshFailedError when 200 body is missing fields", async () => {
    const fetchImpl = mockFetch({
      status: 200,
      json: async () => ({ accessToken: "a" }),
    });
    await expect(refreshTokens("any", fetchImpl)).rejects.toBeInstanceOf(
      RefreshFailedError,
    );
  });

  it("rejects empty refresh token without calling the backend", async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    await expect(refreshTokens("", fetchImpl)).rejects.toBeInstanceOf(
      RefreshFailedError,
    );
    expect(
      (fetchImpl as unknown as { mock: { calls: unknown[][] } }).mock.calls,
    ).toHaveLength(0);
  });
});
