import { describe, expect, it } from "vitest";
import { postSignInRedirect } from "@/lib/auth/post-signin-redirect";

describe("postSignInRedirect", () => {
  it("sends a member to /home regardless of any count", () => {
    expect(postSignInRedirect({ role: "member" })).toEqual({
      path: "/home",
      reason: "default-home",
    });
    expect(
      postSignInRedirect({ role: "member", pendingReceiptsCount: 12 }),
    ).toEqual({ path: "/home", reason: "default-home" });
  });

  it("sends an admin to /admin/receipts when pending count > 0", () => {
    expect(
      postSignInRedirect({ role: "admin", pendingReceiptsCount: 1 }),
    ).toEqual({ path: "/admin/receipts", reason: "admin-pending-receipts" });
    expect(
      postSignInRedirect({ role: "admin", pendingReceiptsCount: 47 }),
    ).toEqual({ path: "/admin/receipts", reason: "admin-pending-receipts" });
  });

  it("sends an admin to /home when the queue is empty", () => {
    expect(
      postSignInRedirect({ role: "admin", pendingReceiptsCount: 0 }),
    ).toEqual({ path: "/home", reason: "default-home" });
  });

  it("treats a missing count for an admin as default-home (fail-open)", () => {
    expect(postSignInRedirect({ role: "admin" })).toEqual({
      path: "/home",
      reason: "default-home",
    });
  });

  it("applies the same admin rule to super_admin", () => {
    expect(
      postSignInRedirect({ role: "super_admin", pendingReceiptsCount: 3 }),
    ).toEqual({ path: "/admin/receipts", reason: "admin-pending-receipts" });
    expect(
      postSignInRedirect({ role: "super_admin", pendingReceiptsCount: 0 }),
    ).toEqual({ path: "/home", reason: "default-home" });
  });

  it("guards against NaN / non-finite counts", () => {
    expect(
      postSignInRedirect({ role: "admin", pendingReceiptsCount: Number.NaN }),
    ).toEqual({ path: "/home", reason: "default-home" });
    // Infinity isn't finite, so we fail-open to /home rather than gambling on a
    // suspicious count from a malformed upstream response.
    expect(
      postSignInRedirect({
        role: "admin",
        pendingReceiptsCount: Number.POSITIVE_INFINITY,
      }),
    ).toEqual({ path: "/home", reason: "default-home" });
  });

  it("ignores negative counts (treated as no pending receipts)", () => {
    expect(
      postSignInRedirect({ role: "admin", pendingReceiptsCount: -1 }),
    ).toEqual({ path: "/home", reason: "default-home" });
  });
});
