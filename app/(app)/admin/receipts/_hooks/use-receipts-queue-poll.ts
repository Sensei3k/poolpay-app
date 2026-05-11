'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 5-second polling cadence. New WhatsApp receipts land server-side
 * within the window the bot posts them; faster than 5s would thrash
 * the BE for no human-visible win.
 */
export const RECEIPTS_POLL_INTERVAL_MS = 5_000;

export interface UseReceiptsQueuePollOptions {
  /**
   * Disable the polling loop entirely. Used by the preview route and
   * tests that mount the page without a live backend.
   */
  enabled?: boolean;
  /**
   * Override the cadence. Tests use this to advance the timer without
   * waiting five real seconds.
   */
  intervalMs?: number;
}

/**
 * Triggers `router.refresh()` on a 5-second interval so any newly-
 * ingested receipts surface in the admin queue without a manual page
 * reload. Pauses while the tab is hidden so the BE isn't billed for
 * polls no human is watching, and resumes on visibility change.
 *
 * Why `router.refresh` rather than a custom endpoint: the page is a
 * server component that already joins the receipts list against
 * groups/cycles/members. Refresh re-runs that RSC and streams the
 * updated tree, one source of truth, no client-side mirror to drift.
 */
export function useReceiptsQueuePoll({
  enabled = true,
  intervalMs = RECEIPTS_POLL_INTERVAL_MS,
}: UseReceiptsQueuePollOptions = {}): void {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (intervalId !== null) return;
      intervalId = setInterval(() => {
        router.refresh();
      }, intervalMs);
    };

    const stop = () => {
      if (intervalId === null) return;
      clearInterval(intervalId);
      intervalId = null;
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Pull a fresh frame immediately when the tab regains focus so
        // an operator who switched away does not wait up to one
        // interval for the queue to catch up.
        router.refresh();
        start();
      } else {
        stop();
      }
    };

    if (document.visibilityState === 'visible') {
      start();
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [router, enabled, intervalMs]);
}
