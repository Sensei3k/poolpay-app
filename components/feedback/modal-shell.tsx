'use client';

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

export interface ModalShellProps {
  /** Whether the modal is rendered. Caller owns the open/closed state. */
  open: boolean;
  /** Dismiss handler. Fired on backdrop click, close button, or Escape. */
  onClose: () => void;
  /** Modal width — handoff variants use 420 / 460 / 500 / 540 / 620. */
  width?: 420 | 460 | 500 | 540 | 620;
  /** Optional mono kicker above the title. */
  kicker?: ReactNode;
  /** Title — renders as the dialog heading. Required. */
  title: ReactNode;
  /** Sub-headline directly below the title. Optional. */
  sub?: ReactNode;
  /** Body slot — children render between header and footer. */
  children: ReactNode;
  /** Optional footer left content (kicker hint, helper copy, etc). */
  footerLeft?: ReactNode;
  /** Optional footer right content (button group). */
  footerRight?: ReactNode;
  /** Aria-labelledby override; otherwise an internal id is generated. */
  ariaLabelledBy?: string;
}

/**
 * Modal chrome primitive matching the handoff `<ModalShell>` artboard.
 * Wraps the header (kicker / title / sub / close), the body slot, and
 * an optional 2-slot footer in a centered dialog with blurred backdrop.
 *
 * Caller composes button variants in `footerRight` — this primitive
 * does not impose a button system. Confirm modals throughout the app
 * should consume this rather than re-implementing the backdrop +
 * close-button chrome.
 *
 * Escape dismiss and backdrop click are wired here, so callers only
 * provide the open flag and the close handler.
 */
export function ModalShell({
  open,
  onClose,
  width = 460,
  kicker,
  title,
  sub,
  children,
  footerLeft,
  footerRight,
  ariaLabelledBy,
}: ModalShellProps) {
  // Document-level Escape handler. Attached only while the modal is
  // open, detached via cleanup when it closes. Avoids a permanent
  // listener on the document for routes that never open a modal.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const titleId = ariaLabelledBy ?? 'modal-shell-title';

  const hasFooter = footerLeft != null || footerRight != null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop is decorative; the dialog dismisses via the close button (click/Enter) and the document-level Escape handler attached above */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 backdrop-blur-[3px]"
        style={{
          background:
            'color-mix(in oklch, var(--d2-ink) 35%, transparent)',
        }}
      />
      <div
        className="relative z-10 flex w-full flex-col overflow-hidden rounded-[18px] bg-d2-cream"
        style={{
          maxWidth: width,
          boxShadow:
            '0 30px 80px -20px color-mix(in oklch, var(--d2-ink) 35%, transparent), 0 4px 12px color-mix(in oklch, var(--d2-ink) 8%, transparent)',
        }}
      >
        <header
          className="flex items-start gap-3 px-5 py-4"
          style={{
            borderBottom:
              '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
          }}
        >
          <div className="min-w-0 flex-1">
            {kicker && (
              <div className="kicker-mono text-[10px]">{kicker}</div>
            )}
            <h3
              id={titleId}
              className="mt-1 text-[17px] font-semibold tracking-tight"
            >
              {title}
            </h3>
            {sub && (
              <p className="mt-1 text-[12.5px] leading-snug text-d2-ink/60">
                {sub}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-d2-ink/60 transition-colors hover:bg-d2-ink/5"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>
        <div className="flex flex-col gap-3.5 px-5 py-4">{children}</div>
        {hasFooter && (
          <footer
            className="flex flex-col-reverse items-stretch gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            style={{
              borderTop:
                '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
              background:
                'color-mix(in oklch, var(--d2-ink) 2%, transparent)',
            }}
          >
            <div className="text-d2-ink/55">{footerLeft}</div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
              {footerRight}
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
