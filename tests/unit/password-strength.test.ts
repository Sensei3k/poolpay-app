import { describe, expect, it } from "vitest";
import { scoreStrength } from "@/app/(app)/account/change-password/password-strength";

describe("scoreStrength", () => {
  it("returns null for an empty string", () => {
    expect(scoreStrength("")).toBeNull();
  });

  it("rates very short passwords as weak", () => {
    expect(scoreStrength("abc")).toBe("weak");
    expect(scoreStrength("a1")).toBe("weak");
  });

  it("rates 8-char single-class passwords as weak (one point only)", () => {
    expect(scoreStrength("abcdefgh")).toBe("weak");
    expect(scoreStrength("ABCDEFGH")).toBe("weak");
  });

  it("rates 12-char single-class passwords as ok", () => {
    expect(scoreStrength("abcdefghijkl")).toBe("ok");
  });

  it("rates long diverse passwords as strong", () => {
    expect(scoreStrength("CorrectHorse54")).toBe("strong");
    expect(scoreStrength("MyP@ssw0rd123!")).toBe("strong");
  });

  it("counts mixed case only when both cases are present", () => {
    expect(scoreStrength("Abcdefgh")).toBe("ok");
    expect(scoreStrength("abcdefgh")).toBe("weak");
    expect(scoreStrength("ABCDEFGH")).toBe("weak");
  });
});
