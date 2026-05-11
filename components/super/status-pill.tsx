import { cn } from '@/lib/utils';

export type StatusPillTone =
  | 'paid'
  | 'pending'
  | 'out'
  | 'muted'
  | 'inactive'
  | 'system'
  | 'drift';

interface ToneStyle {
  background: string;
  color: string;
}

const TONE_STYLES: Record<StatusPillTone, ToneStyle> = {
  paid: {
    background: 'var(--ajo-paid-subtle)',
    color: 'var(--ajo-paid)',
  },
  pending: {
    background: 'var(--ajo-outstanding-subtle)',
    color: 'var(--ajo-outstanding-fg)',
  },
  out: {
    background: 'color-mix(in oklch, var(--destructive) 12%, transparent)',
    color: 'var(--destructive)',
  },
  muted: {
    background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
    color: 'color-mix(in oklch, var(--d2-ink) 70%, transparent)',
  },
  inactive: {
    background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
    color: 'color-mix(in oklch, var(--d2-ink) 60%, transparent)',
  },
  system: {
    background: 'var(--accent-violet-subtle)',
    color: 'var(--accent-violet)',
  },
  drift: {
    background: 'var(--ajo-outstanding-subtle)',
    color: 'var(--ajo-outstanding-fg)',
  },
};

export interface StatusPillProps {
  tone: StatusPillTone;
  children: React.ReactNode;
  /** Render in mono font (used for status codes like "linked"/"drift"). */
  mono?: boolean;
  className?: string;
}

/**
 * Compact status pill used across all super-admin tables.
 *
 * Lives in `components/super/` because we deliberately do not add a
 * shadcn variant for it, the design-handoff `<Pill>` is a one-off
 * surface that maps poorly to the badge primitive. Cross-domain
 * consumers should keep their own pill renderer; this one is scoped
 * to the `/sys/*` views.
 */
export function StatusPill({
  tone,
  children,
  mono = true,
  className,
}: StatusPillProps) {
  const style = TONE_STYLES[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium',
        mono && 'font-mono uppercase tracking-[0.05em]',
        className,
      )}
      style={style}
    >
      {children}
    </span>
  );
}
