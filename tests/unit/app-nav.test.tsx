import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

// Stub client-component children so the test stays in a node env and doesn't
// drag NextAuth / next-themes / dropdown primitives into the import graph —
// this file only asserts the nav's role-gating shape.
vi.mock("@/components/dashboard/theme-toggle", () => ({
  ThemeToggle: () => null,
}));
vi.mock("@/components/dashboard/signout-button", () => ({
  SignOutButton: () => null,
}));

import { AppNav } from "@/components/layout/app-nav";

describe("AppNav", () => {
  it("renders the PoolPay wordmark linking home", () => {
    const html = renderToStaticMarkup(<AppNav role="member" />);
    expect(html).toContain("PoolPay");
    expect(html).toContain('href="/"');
  });

  it("does not render the Admin link for role=member", () => {
    const html = renderToStaticMarkup(<AppNav role="member" />);
    expect(html).not.toContain('href="/admin"');
  });

  it("renders the Admin link for role=admin", () => {
    const html = renderToStaticMarkup(<AppNav role="admin" />);
    expect(html).toContain('href="/admin"');
  });

  it("renders the Admin link for role=super_admin", () => {
    const html = renderToStaticMarkup(<AppNav role="super_admin" />);
    expect(html).toContain('href="/admin"');
  });
});
