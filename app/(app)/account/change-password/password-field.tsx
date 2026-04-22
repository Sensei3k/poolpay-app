"use client";

import * as React from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

type Props = Omit<React.ComponentProps<"input">, "type"> & {
  label: string;
  error?: string;
  extra?: React.ReactNode;
};

/**
 * Password input with a right-edge visibility toggle, label, and inline
 * error slot. Designed to pair with react-hook-form `register()` — spread
 * its output as props and pass `error={errors[name]?.message}`.
 */
export const PasswordField = React.forwardRef<HTMLInputElement, Props>(
  function PasswordField(
    { label, error, extra, id, name, className, disabled, ...inputProps },
    ref,
  ) {
    const [visible, setVisible] = React.useState(false);
    // Derive id from `name` (always supplied by react-hook-form's `register`)
    // instead of `useId()` — useId's counter can drift between SSR and CSR
    // when upstream client components (e.g. next-themes, base-ui dropdowns)
    // register hooks in different orders, surfacing as hydration warnings.
    const inputId = id ?? (name ? `pwf-${name}` : undefined);
    const errorId = inputId ? `${inputId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={inputId} className="text-sm">
          {label}
        </Label>
        <div className="relative">
          <input
            {...inputProps}
            name={name}
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 pr-11 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
              className,
            )}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            onClick={() => setVisible((v) => !v)}
            disabled={disabled}
            className="absolute right-1 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {extra}
        {error && (
          <p
            id={errorId}
            role="alert"
            className="flex items-center gap-1.5 text-xs text-destructive"
          >
            <AlertCircle className="size-3.5" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  },
);
