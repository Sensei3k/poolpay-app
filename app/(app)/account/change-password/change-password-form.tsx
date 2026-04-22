"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Clock, Loader2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { useRateLimitCountdown } from "@/app/signin/use-rate-limit-countdown";

import { changePasswordAction } from "./actions";
import { PasswordField } from "./password-field";
import { PasswordStrengthMeter } from "./password-strength-meter";
import { changePasswordSchema, type ChangePasswordFormValues } from "./schema";
import {
  AUTH_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  statusFromActionError,
  type Status,
} from "./status-machine";
import { SuccessSurface } from "./success-surface";

const DEFAULT_VALUES: ChangePasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function ChangePasswordForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onBlur",
    defaultValues: DEFAULT_VALUES,
  });

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = form;

  // `useWatch` is the compiler-safe subscription API (vs `watch()` which
  // returns a non-memoizable function and causes the React Compiler to skip
  // optimizing this component).
  const newPasswordValue = useWatch({ control, name: "newPassword" });
  const countdown = useRateLimitCountdown(
    status.kind === "rate-limited" ? status.retryAfterSecs : null,
  );

  const rateLimitActive =
    status.kind === "rate-limited" &&
    (status.retryAfterSecs === null ||
      (countdown ?? status.retryAfterSecs) > 0);
  // `retryAfterSecs` may be null when the BE omits Retry-After; in that case
  // the button stays disabled but renders a seconds-free "Locked" label
  // instead of a bogus `Locked · 0s`.
  const rateLimitSecs =
    status.kind === "rate-limited"
      ? (countdown ?? status.retryAfterSecs)
      : null;
  const submitting = status.kind === "submitting";
  const disabled = submitting || rateLimitActive;

  if (status.kind === "success") {
    return <SuccessSurface />;
  }

  async function onSubmit(values: ChangePasswordFormValues) {
    setStatus({ kind: "submitting" });

    let result: Awaited<ReturnType<typeof changePasswordAction>>;
    try {
      result = await changePasswordAction({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
    } catch {
      // `changePasswordAction` already collapses transport failures to
      // `{ ok: false, code: "backend_unavailable" }`. Reaching this branch
      // means `BackendUnauthorizedError` bubbled out (no_session or
      // refresh_failed) — the user's session is truly invalid.
      setStatus({ kind: "network-error", message: NETWORK_ERROR_MESSAGE });
      router.replace("/signin?reauth=1");
      return;
    }

    if (result.ok) {
      setStatus({ kind: "success" });
      router.replace("/signin?passwordChanged=1");
      router.refresh();
      return;
    }

    if (result.code === "bad_current") {
      setError("currentPassword", {
        type: "manual",
        message: AUTH_ERROR_MESSAGE,
      });
    }

    setStatus(statusFromActionError(result.code, result.retryAfterSecs ?? null));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <StatusAlert status={status} countdown={countdown} />

      <PasswordField
        label="Current password"
        autoComplete="current-password"
        disabled={disabled}
        error={errors.currentPassword?.message}
        {...register("currentPassword")}
      />

      <PasswordField
        label="New password"
        autoComplete="new-password"
        disabled={disabled}
        error={errors.newPassword?.message}
        extra={<PasswordStrengthMeter value={newPasswordValue ?? ""} />}
        {...register("newPassword")}
      />

      <PasswordField
        label="Confirm new password"
        autoComplete="new-password"
        disabled={disabled}
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Separator className="my-2" />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link
          href="/account"
          aria-disabled={submitting}
          tabIndex={submitting ? -1 : 0}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "sm:w-auto",
            submitting && "pointer-events-none opacity-50",
          )}
        >
          Cancel
        </Link>
        <Button
          type="submit"
          size="lg"
          disabled={disabled}
          className="bg-ajo-paid text-white hover:bg-ajo-paid/90 sm:w-auto"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Updating…</span>
            </>
          ) : rateLimitActive ? (
            <span>
              {rateLimitSecs === null ? "Locked" : `Locked · ${rateLimitSecs}s`}
            </span>
          ) : (
            <span>Update password</span>
          )}
        </Button>
      </div>

      <p className="text-right text-xs text-muted-foreground sm:text-right">
        You&apos;ll be signed out of this and all other sessions after updating.
      </p>
    </form>
  );
}

function StatusAlert({
  status,
  countdown,
}: {
  status: Status;
  countdown: number | null;
}) {
  if (status.kind === "auth-error") {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>{AUTH_ERROR_MESSAGE}</AlertTitle>
        <AlertDescription>
          Double-check the current password and try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (status.kind === "rate-limited") {
    const secs =
      status.retryAfterSecs === null
        ? null
        : (countdown ?? status.retryAfterSecs);
    let title: string;
    if (secs === null) {
      title = "Too many attempts. Please wait before trying again.";
    } else if (secs > 0) {
      title = `Too many attempts. Try again in ${secs} second${secs === 1 ? "" : "s"}.`;
    } else {
      title = "You can try again now.";
    }
    return (
      <Alert variant="warning">
        <Clock />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          For your security, we pause password changes briefly after repeated
          failures.
        </AlertDescription>
      </Alert>
    );
  }

  if (status.kind === "network-error") {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Something went wrong.</AlertTitle>
        <AlertDescription>{status.message}</AlertDescription>
      </Alert>
    );
  }

  return null;
}
