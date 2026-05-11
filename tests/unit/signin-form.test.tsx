// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/server", () => ({
  NextRequest: class {},
  NextResponse: class {},
}));

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(async () => undefined),
}));

let searchParamsValue = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => searchParamsValue,
}));

import { signIn as nextAuthSignIn } from "next-auth/react";
import { SignInForm } from "@/app/signin/signin-form";

const signInMock = nextAuthSignIn as unknown as ReturnType<typeof vi.fn>;

function setCallbackUrl(raw: string | null) {
  searchParamsValue =
    raw === null ? new URLSearchParams() : new URLSearchParams({ callbackUrl: raw });
}

beforeEach(() => {
  signInMock.mockReset();
  signInMock.mockResolvedValue(undefined);
  setCallbackUrl(null);
});

afterEach(() => {
  cleanup();
});

describe("SignInForm — social callbackUrl sanitisation", () => {
  it.each([
    ["null", null, "/"],
    ["safe same-origin path", "/admin/groups", "/admin/groups"],
    ["safe path with query", "/admin/groups?page=2", "/admin/groups?page=2"],
    ["absolute http URL", "http://evil.com", "/"],
    ["absolute https URL", "https://evil.com/steal", "/"],
    ["protocol-relative URL", "//evil.com", "/"],
    ["javascript URI", "javascript:alert(1)", "/"],
    ["relative path without slash", "admin", "/"],
  ])(
    "Google: %s → forwards %j",
    async (_label, raw, expected) => {
      setCallbackUrl(raw);
      const user = userEvent.setup();
      render(<SignInForm />);

      await user.click(screen.getByRole("button", { name: /continue with google/i }));

      expect(signInMock).toHaveBeenCalledTimes(1);
      expect(signInMock).toHaveBeenCalledWith("google", { callbackUrl: expected });
    },
  );

  it("GitHub: absolute off-origin URL collapses to /", async () => {
    setCallbackUrl("https://evil.com");
    const user = userEvent.setup();
    render(<SignInForm />);

    await user.click(screen.getByRole("button", { name: /continue with github/i }));

    expect(signInMock).toHaveBeenCalledWith("github", { callbackUrl: "/" });
  });

  it("GitHub: safe path passes through", async () => {
    setCallbackUrl("/dashboard");
    const user = userEvent.setup();
    render(<SignInForm />);

    await user.click(screen.getByRole("button", { name: /continue with github/i }));

    expect(signInMock).toHaveBeenCalledWith("github", { callbackUrl: "/dashboard" });
  });
});
