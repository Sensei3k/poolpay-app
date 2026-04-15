"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInAction, type SignInCode } from "@/app/signin/actions";

function messageForCode(
  code: SignInCode | undefined,
  retryAfterSecs: number | undefined,
): string {
  switch (code) {
    case "rate_limited":
      return typeof retryAfterSecs === "number"
        ? `Too many attempts. Try again in ${retryAfterSecs} seconds.`
        : "Too many attempts. Please wait before trying again.";
    case "field_validation":
      return "Email or password is too long.";
    case "backend_unavailable":
    case "post_auth_failed":
      return "Sign-in is temporarily unavailable. Please try again in a few minutes.";
    default:
      return "Invalid email or password.";
  }
}

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await signInAction({ email, password, callbackUrl });

      if (!result.ok) {
        setError(messageForCode(result.code, result.retryAfterSecs));
        return;
      }

      router.push(result.redirectTo);
      router.refresh();
    } catch {
      setError(messageForCode("backend_unavailable", undefined));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ maxWidth: 360, margin: "4rem auto", fontFamily: "sans-serif" }}>
      <h1>Sign in</h1>
      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginBottom: 12 }}>
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </label>
        <label style={{ display: "block", marginBottom: 12 }}>
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </label>
        {error ? (
          <p role="alert" style={{ color: "crimson" }}>
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={submitting} style={{ padding: "8px 16px" }}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
