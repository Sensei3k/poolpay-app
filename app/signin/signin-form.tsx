"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn as nextAuthSignIn } from "next-auth/react";
import { AlertCircle, Clock, Link2, Loader2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { signInAction, type SignInCode } from "@/app/signin/actions";
import { SignInCard } from "@/app/signin/signin-card";
import { GithubGlyph, GoogleGlyph } from "@/app/signin/provider-glyphs";
import { useRateLimitCountdown } from "@/app/signin/use-rate-limit-countdown";

type SocialProvider = "google" | "github";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "social-inflight"; provider: SocialProvider }
  | { kind: "field-error"; field: "email"; message: string }
  | { kind: "auth-error"; message: string }
  | { kind: "rate-limited"; retryAfterSecs: number }
  | { kind: "linking-conflict"; message: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVALID_EMAIL_MESSAGE = "Enter a valid email address (e.g. name@company.com).";
const LINKING_CONFLICT_MESSAGE =
  "Sign in with your password below, then link Google from Settings → Connected accounts.";
const FOCUS_RING_OVERRIDE =
  "focus-visible:border-ajo-paid focus-visible:ring-ajo-paid/25";
const INPUT_HEIGHT = "h-10";

function messageForCode(
  code: SignInCode | undefined,
  retryAfterSecs: number | undefined,
): { status: Status } {
  switch (code) {
    case "rate_limited":
      return {
        status: {
          kind: "rate-limited",
          retryAfterSecs: retryAfterSecs ?? 0,
        },
      };
    case "field_validation":
      return {
        status: {
          kind: "auth-error",
          message: "Email or password is too long.",
        },
      };
    case "backend_unavailable":
    case "post_auth_failed":
      return {
        status: {
          kind: "auth-error",
          message:
            "Sign-in is temporarily unavailable. Please try again in a few minutes.",
        },
      };
    default:
      return {
        status: {
          kind: "auth-error",
          message: "Invalid email or password.",
        },
      };
  }
}

function statusFromNextAuthError(rawError: string | null): Status {
  if (!rawError) return { kind: "idle" };
  if (rawError === "AccountLinkingRequired") {
    return { kind: "linking-conflict", message: LINKING_CONFLICT_MESSAGE };
  }
  return {
    kind: "auth-error",
    message:
      "Sign-in is temporarily unavailable. Please try again in a few minutes.",
  };
}

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const initialError = searchParams.get("error");
  const initialStatus = useMemo(
    () => statusFromNextAuthError(initialError),
    [initialError],
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>(initialStatus);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const submitting = status.kind === "submitting";
  const socialInflight = status.kind === "social-inflight";
  const formDisabled = submitting || socialInflight;
  const fieldError = status.kind === "field-error" ? status : null;

  const countdown = useRateLimitCountdown(
    status.kind === "rate-limited" ? status.retryAfterSecs : null,
  );

  function resetTransientAlerts() {
    if (
      status.kind === "auth-error" ||
      status.kind === "rate-limited" ||
      status.kind === "field-error" ||
      status.kind === "linking-conflict"
    ) {
      setStatus({ kind: "idle" });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!EMAIL_REGEX.test(email)) {
      setStatus({
        kind: "field-error",
        field: "email",
        message: INVALID_EMAIL_MESSAGE,
      });
      return;
    }

    setStatus({ kind: "submitting" });

    try {
      const result = await signInAction({ email, password, callbackUrl });
      if (!result.ok) {
        setStatus(messageForCode(result.code, result.retryAfterSecs).status);
        return;
      }
      router.push(result.redirectTo);
      router.refresh();
    } catch {
      setStatus(messageForCode("backend_unavailable", undefined).status);
    }
  }

  async function handleSocial(provider: SocialProvider) {
    setStatus({ kind: "social-inflight", provider });
    try {
      await nextAuthSignIn(provider, {
        callbackUrl: callbackUrl ?? "/",
      });
    } catch {
      setStatus({
        kind: "auth-error",
        message:
          "Sign-in is temporarily unavailable. Please try again in a few minutes.",
      });
    }
  }

  return (
    <SignInCard>
      <StatusAlert status={status} countdown={countdown} />

      <div className="flex flex-col gap-2.5">
        <Button
          type="button"
          variant="outline"
          className={cn("w-full justify-center gap-2.5", INPUT_HEIGHT)}
          disabled={formDisabled}
          onClick={() => handleSocial("google")}
          aria-label="Continue with Google"
        >
          {status.kind === "social-inflight" && status.provider === "google" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Signing in with Google…</span>
            </>
          ) : (
            <>
              <GoogleGlyph className="size-4" />
              <span>Continue with Google</span>
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className={cn("w-full justify-center gap-2.5", INPUT_HEIGHT)}
          disabled={formDisabled}
          onClick={() => handleSocial("github")}
          aria-label="Continue with GitHub"
        >
          {status.kind === "social-inflight" && status.provider === "github" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Signing in with GitHub…</span>
            </>
          ) : (
            <>
              <GithubGlyph className="size-4" />
              <span>Continue with GitHub</span>
            </>
          )}
        </Button>
      </div>

      <Divider label="or" />

      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="signin-email">Email</Label>
          <Input
            id="signin-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              resetTransientAlerts();
            }}
            placeholder="you@company.com"
            disabled={formDisabled}
            aria-invalid={fieldError?.field === "email" ? true : undefined}
            aria-describedby={
              fieldError?.field === "email" ? "signin-email-error" : undefined
            }
            className={cn(INPUT_HEIGHT, FOCUS_RING_OVERRIDE)}
          />
          {fieldError?.field === "email" && (
            <p
              id="signin-email-error"
              className="text-destructive text-xs leading-snug"
            >
              {fieldError.message}
            </p>
          )}
        </div>

        <div className="mt-3.5 flex flex-col gap-1.5">
          <Label htmlFor="signin-password">Password</Label>
          <Input
            id="signin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              resetTransientAlerts();
            }}
            placeholder="Your password"
            disabled={formDisabled}
            className={cn(INPUT_HEIGHT, FOCUS_RING_OVERRIDE)}
          />
        </div>

        <div className="mt-4.5 flex flex-col gap-3">
          <Button
            type="submit"
            className={cn(
              "bg-ajo-paid hover:bg-ajo-paid/90 w-full font-medium text-white",
              INPUT_HEIGHT,
            )}
            disabled={formDisabled}
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Signing in…</span>
              </>
            ) : (
              <span>Sign in</span>
            )}
          </Button>
          <div className="text-[0.78rem] leading-none flex justify-end">
            <a
              href="#"
              className="text-foreground decoration-foreground/25 underline underline-offset-2"
            >
              Forgot password?
            </a>
          </div>
        </div>
      </form>
    </SignInCard>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div
      className="text-muted-foreground my-4 flex items-center gap-3 text-[0.7rem] font-medium tracking-wide lowercase"
      aria-hidden="true"
    >
      <span className="bg-border h-px flex-1" />
      <span>{label}</span>
      <span className="bg-border h-px flex-1" />
    </div>
  );
}

interface StatusAlertProps {
  status: Status;
  countdown: number | null;
}

function StatusAlert({ status, countdown }: StatusAlertProps) {
  if (status.kind === "auth-error") {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle />
        <AlertTitle>{status.message}</AlertTitle>
        <AlertDescription>
          Double-check your credentials and try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (status.kind === "rate-limited") {
    const secs = countdown ?? status.retryAfterSecs;
    return (
      <Alert variant="warning" className="mb-4">
        <Clock />
        <AlertTitle>
          {secs > 0
            ? `Too many attempts. Try again in ${secs} second${secs === 1 ? "" : "s"}.`
            : "You can try signing in again now."}
        </AlertTitle>
        <AlertDescription>
          For your security, sign-in is paused briefly after repeated failures.
        </AlertDescription>
      </Alert>
    );
  }

  if (status.kind === "linking-conflict") {
    return (
      <Alert variant="destructive" className="mb-4">
        <Link2 />
        <AlertTitle>An account with this email already exists.</AlertTitle>
        <AlertDescription>{status.message}</AlertDescription>
      </Alert>
    );
  }

  return null;
}
