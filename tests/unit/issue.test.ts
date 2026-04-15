import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  IssueBackendError,
  IssueFailedError,
  IssueValidationError,
  issueTokens,
} from "@/lib/auth/issue";

const SECRET = "x".repeat(32);

beforeEach(() => {
  process.env.NEXTAUTH_BACKEND_SECRET = SECRET;
  process.env.BACKEND_URL = "http://backend.test";
});

afterEach(() => {
  delete process.env.NEXTAUTH_BACKEND_SECRET;
  delete process.env.BACKEND_URL;
});

function mockFetch(response: Partial<Response>): typeof fetch {
  return vi.fn(async () => response as Response) as unknown as typeof fetch;
}

describe("issueTokens", () => {
  it("returns the token pair on 200", async () => {
    const pair = {
      accessToken: "eyJ.a.b",
      refreshToken: "opaque-refresh",
      expiresAt: "2026-04-15T12:34:56Z",
    };
    const fetchImpl = mockFetch({
      status: 200,
      json: async () => pair,
    });

    const result = await issueTokens("abcd", fetchImpl);
    expect(result).toEqual(pair);
  });

  it("throws IssueBackendError when 200 body is missing fields", async () => {
    const fetchImpl = mockFetch({
      status: 200,
      json: async () => ({ accessToken: "a" }),
    });
    await expect(issueTokens("abcd", fetchImpl)).rejects.toBeInstanceOf(
      IssueBackendError,
    );
  });

  it("throws IssueBackendError when 200 body is not JSON", async () => {
    const fetchImpl = mockFetch({
      status: 200,
      json: async () => {
        throw new Error("not json");
      },
    });
    await expect(issueTokens("abcd", fetchImpl)).rejects.toBeInstanceOf(
      IssueBackendError,
    );
  });

  it("signs the request with HMAC headers and posts JSON body", async () => {
    const fetchImpl = vi.fn(
      async () =>
        ({
          status: 200,
          json: async () => ({
            accessToken: "a",
            refreshToken: "r",
            expiresAt: "2026-04-15T00:00:00Z",
          }),
        }) as Response,
    ) as unknown as typeof fetch;

    await issueTokens("abcd", fetchImpl);

    const [url, init] = (
      fetchImpl as unknown as { mock: { calls: unknown[][] } }
    ).mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://backend.test/api/auth/issue");
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["X-Signature"]).toMatch(/^sha256=[0-9a-f]{64}$/);
    expect(headers["X-Timestamp"]).toMatch(/^\d+$/);
    expect(init.body).toBe(JSON.stringify({ userId: "abcd" }));
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("throws IssueValidationError with backend message on 400", async () => {
    const fetchImpl = mockFetch({
      status: 400,
      json: async () => ({ error: "userId too long" }),
    });
    try {
      await issueTokens("abcd", fetchImpl);
      expect.fail("expected throw");
    } catch (err) {
      expect(err).toBeInstanceOf(IssueValidationError);
      expect((err as IssueValidationError).backendMessage).toBe(
        "userId too long",
      );
    }
  });

  it("pre-checks empty userId without calling the backend", async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    await expect(issueTokens("", fetchImpl)).rejects.toBeInstanceOf(
      IssueValidationError,
    );
    expect(
      (fetchImpl as unknown as { mock: { calls: unknown[][] } }).mock.calls,
    ).toHaveLength(0);
  });

  it("pre-checks over-cap userId without calling the backend", async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    await expect(
      issueTokens("a".repeat(129), fetchImpl),
    ).rejects.toBeInstanceOf(IssueValidationError);
    expect(
      (fetchImpl as unknown as { mock: { calls: unknown[][] } }).mock.calls,
    ).toHaveLength(0);
  });

  it("throws IssueFailedError on 401", async () => {
    const fetchImpl = mockFetch({
      status: 401,
      json: async () => ({ error: "unauthorized" }),
    });
    await expect(issueTokens("abcd", fetchImpl)).rejects.toBeInstanceOf(
      IssueFailedError,
    );
  });

  it("throws IssueBackendError on 500", async () => {
    const fetchImpl = mockFetch({ status: 500 });
    await expect(issueTokens("abcd", fetchImpl)).rejects.toBeInstanceOf(
      IssueBackendError,
    );
  });
});
