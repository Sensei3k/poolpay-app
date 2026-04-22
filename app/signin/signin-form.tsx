"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn as nextAuthSignIn } from "next-auth/react";
import { AlertCircle, CheckCircle2, Clock, Link2, Loader2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { signInAction } from "@/app/signin/actions";
import { SignInCard } from "@/app/signin/signin-card";
import { GithubGlyph, GoogleGlyph } from "@/app/signin/provider-glyphs";
import { useRateLimitCountdown } from "@/app/signin/use-rate-limit-countdown";
import {
  AUTH_ERROR_DESCRIPTION,
  initialSignInStatus,
  messageForCode,
  type SocialProvider,
  type Status,
} from "@/app/signin/status-machine";
import { safeCallbackUrl } from "@/lib/auth/safe-callback-url";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVALID_EMAIL_MESSAGE = "Enter a valid email address (e.g. name@company.com).";
const FOCUS_RING_OVERRIDE =
  "focus-visible:border-ajo-paid focus-visible:ring-ajo-paid/25";
const INPUT_HEIGHT = "h-10";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const initialError = searchParams.get("error");
  const passwordChanged = searchParams.get("passwordChanged");
  const initialStatus = useMemo(
    () => initialSignInStatus({ error: initialError, passwordChanged }),
    [initialError, passwordChanged],
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // `useState`'s initializer captures the banner/error status on mount.
  // We deliberately do NOT re-sync from `initialStatus` afterwards:
  // `useSearchParams` is reactive to `history.replaceState` in Next.js 16,
  // and the URL-strip effect below would otherwise reset a pinned notice to
  // idle. Legitimate URL-driven status changes (OAuth redirects) come with
  // a full page reload, so capture-on-mount is sufficient.
  const [status, setStatus] = useState<Status>(initialStatus);

  // Strip `passwordChanged` from the URL once the notice is mounted so
  // bookmarks, back-nav, and reloads don't resurrect the banner out of
  // context.
  const hasStrippedPasswordChangedRef = useRef(false);
  useEffect(() => {
    if (passwordChanged !== "1" || hasStrippedPasswordChangedRef.current) {
      return;
    }
    hasStrippedPasswordChangedRef.current = true;
    const url = new URL(window.location.href);
    url.searchParams.delete("passwordChanged");
    const next = url.pathname + (url.search ? url.search : "") + url.hash;
    window.history.replaceState(window.history.state, "", next);
  }, [passwordChanged]);

  const submitting = status.kind === "submitting";
  const socialInflight = status.kind === "social-inflight";
  const fieldError = status.kind === "field-error" ? status : null;

  const countdown = useRateLimitCountdown(
    status.kind === "rate-limited" ? status.retryAfterSecs : null,
  );

  const rateLimitActive =
    status.kind === "rate-limited" &&
    (status.retryAfterSecs === null || (countdown ?? status.retryAfterSecs) > 0);
  const formDisabled = submitting || socialInflight || rateLimitActive;

  function resetTransientAlerts() {
    // Intentionally do NOT clear `notice` on input: browser autofill fires
    // a change event as soon as the form mounts, which would wipe the
    // "password updated" confirmation before the user has even read it.
    // Notice naturally disappears once the next submit lands anyway.
    if (
      status.kind === "auth-error" ||
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
        callbackUrl: safeCallbackUrl(callbackUrl),
      });
    } catch {
      setStatus({
        kind: "auth-error",
        cause: "service",
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
          variant="secondary"
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
          variant="secondary"
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
            <button
              type="button"
              disabled
              className="text-muted-foreground decoration-foreground/25 cursor-not-allowed underline underline-offset-2 bg-transparent p-0"
            >
              Forgot password?
            </button>
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
          {AUTH_ERROR_DESCRIPTION[status.cause]}
        </AlertDescription>
      </Alert>
    );
  }

  if (status.kind === "rate-limited") {
    const secs =
      status.retryAfterSecs === null ? null : (countdown ?? status.retryAfterSecs);
    let title: string;
    if (secs === null) {
      title = "Too many attempts. Please wait before trying again.";
    } else if (secs > 0) {
      title = `Too many attempts. Try again in ${secs} second${secs === 1 ? "" : "s"}.`;
    } else {
      title = "You can try signing in again now.";
    }
    return (
      <Alert variant="warning" className="mb-4">
        <Clock />
        <AlertTitle>{title}</AlertTitle>
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

  if (status.kind === "notice") {
    return (
      <Alert className="mb-4 border-ajo-paid/25 bg-ajo-paid-subtle text-ajo-paid [&>svg]:text-ajo-paid dark:border-ajo-paid/40 dark:bg-ajo-paid/15">
        <CheckCircle2 />
        <AlertTitle>{status.message}</AlertTitle>
      </Alert>
    );
  }

  return null;
}
