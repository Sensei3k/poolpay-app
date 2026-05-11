import { cn } from '@/lib/utils';

export interface SuperChipProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Violet "system-wide" badge surfaced on every super-admin toolbar so
 * operators never confuse a cross-tenant view with a scoped admin
 * view. Mirrors the design source `<SuperChip>` in `super-desktop.jsx`.
 *
 * Colours come from the `--accent-violet*` tokens added in slice 1 (see
 * `globals.css`).
 */
export function SuperChip({ children = 'system-wide', className }: SuperChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-[5px] rounded-[4px] px-[7px] py-[2px] font-mono text-[10px] font-semibold uppercase tracking-[0.06em]',
        className,
      )}
      style={{
        background: 'var(--accent-violet-subtle)',
        color: 'var(--accent-violet)',
      }}
    >
      <span
        aria-hidden="true"
        className="inline-block h-[5px] w-[5px] rounded-full"
        style={{ background: 'var(--accent-violet)' }}
      />
      {children}
    </span>
  );
}
