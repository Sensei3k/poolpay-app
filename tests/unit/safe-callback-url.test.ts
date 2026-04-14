import { describe, expect, it } from "vitest";
import { safeCallbackUrl } from "@/app/signin/signin-form";

describe("safeCallbackUrl", () => {
  it("returns root when input is null", () => {
    expect(safeCallbackUrl(null)).toBe("/");
  });

  it("allows internal absolute paths", () => {
    expect(safeCallbackUrl("/admin")).toBe("/admin");
    expect(safeCallbackUrl("/admin/groups?page=2")).toBe("/admin/groups?page=2");
  });

  it("rejects protocol-relative URLs", () => {
    expect(safeCallbackUrl("//evil.com")).toBe("/");
    expect(safeCallbackUrl("//evil.com/steal")).toBe("/");
  });

  it("rejects absolute URLs", () => {
    expect(safeCallbackUrl("https://evil.com")).toBe("/");
    expect(safeCallbackUrl("http://evil.com")).toBe("/");
  });

  it("rejects javascript: URIs", () => {
    expect(safeCallbackUrl("javascript:alert(1)")).toBe("/");
  });

  it("rejects relative paths without leading slash", () => {
    expect(safeCallbackUrl("admin")).toBe("/");
  });
});
