import { beforeEach, describe, expect, it } from 'vitest';
import { useInboxFilterStore } from '@/lib/stores/inbox-filter';

describe('useInboxFilterStore', () => {
  beforeEach(() => {
    useInboxFilterStore.getState().reset();
  });

  it("starts at 'all'", () => {
    expect(useInboxFilterStore.getState().filter).toBe('all');
  });

  it('updates the active filter chip', () => {
    useInboxFilterStore.getState().setFilter('unread');
    expect(useInboxFilterStore.getState().filter).toBe('unread');

    useInboxFilterStore.getState().setFilter('mentions');
    expect(useInboxFilterStore.getState().filter).toBe('mentions');
  });

  it("reset() restores 'all'", () => {
    useInboxFilterStore.getState().setFilter('mentions');
    useInboxFilterStore.getState().reset();
    expect(useInboxFilterStore.getState().filter).toBe('all');
  });
});
