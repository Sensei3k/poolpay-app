import { describe, expect, it } from "vitest";
import { signBackendRequest } from "@/lib/auth/hmac";

const SECRET = "x".repeat(32);
const BODY = '{"email":"a@b.c","password":"pw"}';
const FIXED_MS = 1_700_000_000_000;

describe("signBackendRequest", () => {
  it("produces the documented known vector", () => {
    const { signature, timestamp } = signBackendRequest(
      BODY,
      SECRET,
      () => FIXED_MS,
    );

    expect(timestamp).toBe("1700000000");
    expect(signature).toBe(
      "sha256=b586f572f2e1f8972f0f81d4e4ec979516b22dea04255ef208b121d90b7927fa",
    );
  });

  it("is deterministic for identical inputs", () => {
    const a = signBackendRequest(BODY, SECRET, () => FIXED_MS);
    const b = signBackendRequest(BODY, SECRET, () => FIXED_MS);
    expect(a).toEqual(b);
  });

  it("changes signature when body differs by one byte", () => {
    const a = signBackendRequest(BODY, SECRET, () => FIXED_MS);
    const b = signBackendRequest(`${BODY} `, SECRET, () => FIXED_MS);
    expect(a.signature).not.toBe(b.signature);
  });

  it("rejects secrets shorter than 32 bytes", () => {
    expect(() => signBackendRequest(BODY, "x".repeat(31))).toThrow(
      /at least 32 bytes/,
    );
  });

  it("floors fractional milliseconds to whole seconds", () => {
    const { timestamp } = signBackendRequest(
      BODY,
      SECRET,
      () => 1_700_000_000_999,
    );
    expect(timestamp).toBe("1700000000");
  });
});
