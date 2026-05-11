import { describe, expect, it } from 'vitest';
import { fetchInbox } from '@/lib/data';

describe('fetchInbox', () => {
  it('returns a non-empty mock list with stable shape', async () => {
    const result = await fetchInbox();
    expect(result.ok).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);

    for (const item of result.data) {
      expect(typeof item.id).toBe('string');
      expect(typeof item.userId).toBe('string');
      expect(typeof item.title).toBe('string');
      expect(typeof item.body).toBe('string');
      expect(typeof item.createdAt).toBe('string');
    }
  });

  it('returns a fresh array each call so callers cannot mutate the source', async () => {
    const a = await fetchInbox();
    const b = await fetchInbox();
    expect(a.data).not.toBe(b.data);
    a.data.push({
      id: 'mutated',
      userId: 'mock',
      kind: 'admin_message',
      title: 'mutated',
      body: 'mutated',
      createdAt: '2026-01-01T00:00:00Z',
    });
    expect(b.data.find((i) => i.id === 'mutated')).toBeUndefined();
  });

  it('contains at least one unread row (readAt undefined)', async () => {
    const result = await fetchInbox();
    expect(result.data.some((item) => item.readAt === undefined)).toBe(true);
  });
});
