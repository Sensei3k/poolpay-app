import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  signPostAuthNonce,
  verifyPostAuthNonce,
} from "@/lib/auth/post-auth-nonce";

const payload = {
  userId: "u1",
  accessToken: "a.b.c",
  refreshToken: "r1",
  accessTokenExpiresAt: "1700000900",
};

const originalSecret = process.env.NEXTAUTH_SECRET;

beforeEach(() => {
  process.env.NEXTAUTH_SECRET = "test-secret-0123456789abcdef0123456789abcdef";
});

afterEach(() => {
  process.env.NEXTAUTH_SECRET = originalSecret;
});

describe("post-auth nonce", () => {
  it("signs and verifies a matching payload", () => {
    const now = () => 1_700_000_000_000;
    const { nonce, issuedAt } = signPostAuthNonce(payload, now);
    expect(verifyPostAuthNonce({ ...payload, nonce, issuedAt }, now)).toBe(
      true,
    );
  });

  it("rejects a tampered userId", () => {
    const now = () => 1_700_000_000_000;
    const { nonce, issuedAt } = signPostAuthNonce(payload, now);
    expect(
      verifyPostAuthNonce(
        { ...payload, userId: "someone-else", nonce, issuedAt },
        now,
      ),
    ).toBe(false);
  });

  it("rejects a tampered accessToken", () => {
    const now = () => 1_700_000_000_000;
    const { nonce, issuedAt } = signPostAuthNonce(payload, now);
    expect(
      verifyPostAuthNonce(
        { ...payload, accessToken: "x.y.z", nonce, issuedAt },
        now,
      ),
    ).toBe(false);
  });

  it("rejects an expired nonce", () => {
    const signedAt = () => 1_700_000_000_000;
    const { nonce, issuedAt } = signPostAuthNonce(payload, signedAt);
    const later = () => 1_700_000_000_000 + 120_000;
    expect(
      verifyPostAuthNonce({ ...payload, nonce, issuedAt }, later),
    ).toBe(false);
  });

  it("rejects a malformed nonce", () => {
    const now = () => 1_700_000_000_000;
    const { issuedAt } = signPostAuthNonce(payload, now);
    expect(
      verifyPostAuthNonce(
        { ...payload, nonce: "not-hex", issuedAt },
        now,
      ),
    ).toBe(false);
  });

  it("throws when NEXTAUTH_SECRET is missing", () => {
    delete process.env.NEXTAUTH_SECRET;
    expect(() => signPostAuthNonce(payload)).toThrow(/NEXTAUTH_SECRET/);
  });
});
