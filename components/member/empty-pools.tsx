import { MessageSquare, UsersRound } from 'lucide-react';
import { EmptyState } from '@/components/feedback/empty-state';

/**
 * Member-home empty state for "no pools yet" (handoff `EmptyPools`
 * artboard). Surfaced by `app/(app)/home/page.tsx` when the joined pool
 * count is zero. The two CTAs are visually present but disabled until
 * slice 7 wires invite-code redemption and "ask to be invited" flows;
 * the copy nudges members toward the WhatsApp-link path which works today.
 */
export function EmptyPools() {
  return (
    <EmptyState
      ariaLabel="No pools yet"
      tone="gradient"
      headingLevel="h2"
      icon={<UsersRound size={32} />}
      title="You haven't joined a pool yet."
      description={
        <>
          Pools (also called <em className="not-italic font-medium">ajo</em>,{' '}
          <em className="not-italic font-medium">esusu</em>, or{' '}
          <em className="not-italic font-medium">chama</em>) let a group save
          together. Everyone contributes on the same schedule, and one person
          collects each cycle.
        </>
      }
      primaryAction={
        <button
          type="button"
          disabled
          title="Invite-code redemption lands in a later slice"
          className="rounded-[10px] bg-ink px-4 py-2.5 text-[13.5px] font-semibold text-surface-page disabled:cursor-not-allowed disabled:opacity-60"
        >
          Join with invite code
        </button>
      }
      secondaryAction={
        <button
          type="button"
          disabled
          title="Invite request lands in a later slice"
          className="rounded-[10px] border border-ink/12 px-4 py-2.5 text-[13.5px] font-medium text-ink disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            borderColor: 'color-mix(in oklch, var(--ink) 12%, transparent)',
          }}
        >
          Ask to be invited
        </button>
      }
      footer={
        <div
          className="flex gap-2.5 rounded-[12px] px-4 py-3.5 text-left text-[12px] leading-[1.5] text-ink/65"
          style={{
            background: 'color-mix(in oklch, var(--ink) 4%, transparent)',
          }}
        >
          <MessageSquare
            size={16}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-accent-primary"
          />
          <span>
            Already part of an ajo on WhatsApp? Ask the admin to link your
            phone number. Your existing payments will appear here.
          </span>
        </div>
      }
    />
  );
}
