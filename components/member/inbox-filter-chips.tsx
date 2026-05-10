'use client';

import {
  useInboxFilterStore,
  type InboxFilter,
} from '@/lib/stores/inbox-filter';
import { cn } from '@/lib/utils';

interface ChipDef {
  value: InboxFilter;
  label: string;
}

const CHIPS: ReadonlyArray<ChipDef> = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'mentions', label: 'Mentions' },
];

/**
 * Filter chips on the member inbox header. Reads from / writes to the
 * Zustand store so the chip selection survives a route round-trip
 * (member can pop into a pool detail and back without losing their
 * filter — the cross-route durability is the reason this is a store
 * rather than `useState`).
 */
export function InboxFilterChips() {
  const filter = useInboxFilterStore((s) => s.filter);
  const setFilter = useInboxFilterStore((s) => s.setFilter);

  return (
    <div
      role="tablist"
      aria-label="Filter inbox"
      className="flex gap-1 rounded-[10px] p-1"
      style={{
        background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
      }}
    >
      {CHIPS.map((chip) => {
        const active = chip.value === filter;
        return (
          <button
            key={chip.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setFilter(chip.value)}
            className={cn(
              'rounded-[8px] px-3 py-1 text-[12px] font-medium transition-colors',
              active
                ? 'bg-d2-cream text-d2-ink shadow-sm'
                : 'text-d2-ink/60 hover:text-d2-ink',
            )}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
