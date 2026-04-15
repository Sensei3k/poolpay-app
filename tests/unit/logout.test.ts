import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LogoutFailedError, revokeRefreshFamily } from "@/lib/auth/logout";

beforeEach(() => {
  process.env.BACKEND_URL = "http://backend.test";
});

afterEach(() => {
  delete process.env.BACKEND_URL;
});

function mockFetch(response: Partial<Response>): typeof fetch {
  return vi.fn(async () => response as Response) as unknown as typeof fetch;
}

describe("revokeRefreshFamily", () => {
  it("resolves to void on 204", async () => {
    const fetchImpl = mockFetch({ status: 204 });
    await expect(
      revokeRefreshFamily("r-token", fetchImpl),
    ).resolves.toBeUndefined();
  });

  it("posts refreshToken in JSON body without HMAC headers", async () => {
    const fetchImpl = vi.fn(
      async () => ({ status: 204 }) as Response,
    ) as unknown as typeof fetch;

    await revokeRefreshFamily("r-token", fetchImpl);

    const [url, init] = (
      fetchImpl as unknown as { mock: { calls: unknown[][] } }
    ).mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://backend.test/api/auth/logout");
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["X-Signature"]).toBeUndefined();
    expect(headers["X-Timestamp"]).toBeUndefined();
    expect(init.body).toBe(JSON.stringify({ refreshToken: "r-token" }));
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("throws LogoutFailedError on 401", async () => {
    const fetchImpl = mockFetch({ status: 401 });
    await expect(
      revokeRefreshFamily("bad", fetchImpl),
    ).rejects.toBeInstanceOf(LogoutFailedError);
  });

  it("throws LogoutFailedError on 500", async () => {
    const fetchImpl = mockFetch({ status: 500 });
    await expect(
      revokeRefreshFamily("bad", fetchImpl),
    ).rejects.toBeInstanceOf(LogoutFailedError);
  });

  it("resolves on transport/network failure (fail-open)", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("network");
    }) as unknown as typeof fetch;
    await expect(
      revokeRefreshFamily("any", fetchImpl),
    ).resolves.toBeUndefined();
  });

  it("rejects empty refresh token without calling the backend", async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    await expect(
      revokeRefreshFamily("", fetchImpl),
    ).rejects.toBeInstanceOf(LogoutFailedError);
    expect(
      (fetchImpl as unknown as { mock: { calls: unknown[][] } }).mock.calls,
    ).toHaveLength(0);
  });
});
