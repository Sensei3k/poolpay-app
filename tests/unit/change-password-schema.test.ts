import { describe, expect, it } from "vitest";
import { changePasswordSchema } from "@/app/(app)/account/change-password/schema";

describe("changePasswordSchema", () => {
  it("accepts a valid change", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "old-password-1",
      newPassword: "brand-new-password-2",
      confirmPassword: "brand-new-password-2",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty current password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "",
      newPassword: "brand-new-password-2",
      confirmPassword: "brand-new-password-2",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "currentPassword");
      expect(issue?.message).toMatch(/enter your current password/i);
    }
  });

  it("rejects a new password shorter than 8 chars", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "old-password-1",
      newPassword: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "newPassword");
      expect(issue?.message).toMatch(/at least 8 characters/i);
    }
  });

  it("rejects confirm that doesn't match new", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "old-password-1",
      newPassword: "brand-new-password-2",
      confirmPassword: "brand-new-password-3",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "confirmPassword");
      expect(issue?.message).toMatch(/don.t match/i);
    }
  });

  it("rejects a new password identical to current", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "same-password-123",
      newPassword: "same-password-123",
      confirmPassword: "same-password-123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "newPassword");
      expect(issue?.message).toMatch(/differ from your current/i);
    }
  });

  it("rejects a new password above 1024 chars", () => {
    const long = "a".repeat(1025);
    const result = changePasswordSchema.safeParse({
      currentPassword: "old",
      newPassword: long,
      confirmPassword: long,
    });
    expect(result.success).toBe(false);
  });
});
