// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, renderHook } from '@testing-library/react';

const { routerRefreshMock } = vi.hoisted(() => ({
  routerRefreshMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: routerRefreshMock, push: vi.fn() }),
}));

import { useReceiptsQueuePoll } from '@/app/(app)/admin/receipts/_hooks/use-receipts-queue-poll';

beforeEach(() => {
  routerRefreshMock.mockReset();
  vi.useFakeTimers();
  // Default to "visible" — jsdom does not toggle this on its own.
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => 'visible',
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  });
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('useReceiptsQueuePoll', () => {
  it('calls router.refresh once per interval while the tab is visible', () => {
    renderHook(() => useReceiptsQueuePoll({ intervalMs: 1_000 }));

    expect(routerRefreshMock).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1_000);
    expect(routerRefreshMock).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1_000);
    expect(routerRefreshMock).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(1_000);
    expect(routerRefreshMock).toHaveBeenCalledTimes(3);
  });

  it('stops polling when the tab becomes hidden', () => {
    renderHook(() => useReceiptsQueuePoll({ intervalMs: 1_000 }));

    vi.advanceTimersByTime(1_000);
    expect(routerRefreshMock).toHaveBeenCalledTimes(1);

    setVisibility('hidden');
    vi.advanceTimersByTime(5_000);
    expect(routerRefreshMock).toHaveBeenCalledTimes(1);
  });

  it('resumes polling and triggers an immediate refresh on visibility regain', () => {
    renderHook(() => useReceiptsQueuePoll({ intervalMs: 1_000 }));

    setVisibility('hidden');
    vi.advanceTimersByTime(3_000);
    expect(routerRefreshMock).not.toHaveBeenCalled();

    setVisibility('visible');
    // Immediate catch-up refresh.
    expect(routerRefreshMock).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1_000);
    expect(routerRefreshMock).toHaveBeenCalledTimes(2);
  });

  it('no-ops when enabled=false', () => {
    renderHook(() => useReceiptsQueuePoll({ enabled: false, intervalMs: 1_000 }));

    vi.advanceTimersByTime(10_000);
    expect(routerRefreshMock).not.toHaveBeenCalled();
  });

  it('clears the interval on unmount', () => {
    const { unmount } = renderHook(() =>
      useReceiptsQueuePoll({ intervalMs: 1_000 }),
    );

    vi.advanceTimersByTime(1_000);
    expect(routerRefreshMock).toHaveBeenCalledTimes(1);

    unmount();
    vi.advanceTimersByTime(5_000);
    expect(routerRefreshMock).toHaveBeenCalledTimes(1);
  });

  it('does not start polling when the tab is hidden at mount', () => {
    setVisibility('hidden');
    renderHook(() => useReceiptsQueuePoll({ intervalMs: 1_000 }));

    vi.advanceTimersByTime(5_000);
    expect(routerRefreshMock).not.toHaveBeenCalled();
  });
});
