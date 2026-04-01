import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : `${status}`,
    json: async () => body,
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('togglePayment', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  describe('when hasPaid is false (create payment)', () => {
    it('sends POST to /api/payments with correct body', async () => {
      const fetchSpy = mockFetch(200, {});
      vi.stubGlobal('fetch', fetchSpy);
      const { togglePayment } = await import('@/lib/actions');

      await togglePayment('member:2', 'cycle:1', false, 500000);

      const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/api/payments');
      expect((opts.method as string).toUpperCase()).toBe('POST');
      const body = JSON.parse(opts.body as string);
      expect(body.memberId).toBe('member:2');
      expect(body.cycleId).toBe('cycle:1');
      expect(body.amount).toBe(500000);
      expect(body.currency).toBe('NGN');
      expect(body.paymentDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('returns { success: true } on 200', async () => {
      vi.stubGlobal('fetch', mockFetch(200, {}));
      const { togglePayment } = await import('@/lib/actions');

      const result = await togglePayment('member:2', 'cycle:1', false, 500000);

      expect(result.success).toBe(true);
    });

    it('returns { success: false, error } on non-OK response', async () => {
      vi.stubGlobal('fetch', mockFetch(400, { error: 'missing field' }));
      const { togglePayment } = await import('@/lib/actions');

      const result = await togglePayment('member:2', 'cycle:1', false, 500000);

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toBe('missing field');
    });
  });

  describe('when hasPaid is true (delete payment)', () => {
    it('sends DELETE to /api/payments/{memberId}/{cycleId}', async () => {
      const fetchSpy = mockFetch(200, {});
      vi.stubGlobal('fetch', fetchSpy);
      const { togglePayment } = await import('@/lib/actions');

      await togglePayment('member:2', 'cycle:1', true, 500000);

      const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/api/payments/member:2/cycle:1');
      expect((opts.method as string).toUpperCase()).toBe('DELETE');
    });

    it('returns { success: true } on 200', async () => {
      vi.stubGlobal('fetch', mockFetch(200, {}));
      const { togglePayment } = await import('@/lib/actions');

      const result = await togglePayment('member:2', 'cycle:1', true, 500000);

      expect(result.success).toBe(true);
    });

    it('treats 404 on DELETE as success (idempotent — already removed)', async () => {
      vi.stubGlobal('fetch', mockFetch(404, { error: '404 Not Found' }));
      const { togglePayment } = await import('@/lib/actions');

      const result = await togglePayment('member:2', 'cycle:1', true, 500000);

      expect(result.success).toBe(true);
    });

    it('does NOT treat non-404 errors as success', async () => {
      vi.stubGlobal('fetch', mockFetch(500, { error: 'internal error' }));
      const { togglePayment } = await import('@/lib/actions');

      const result = await togglePayment('member:2', 'cycle:1', true, 500000);

      expect(result.success).toBe(false);
    });
  });

  describe('cache revalidation', () => {
    it('calls revalidatePath on success', async () => {
      vi.stubGlobal('fetch', mockFetch(200, {}));
      const { revalidatePath } = await import('next/cache');
      const { togglePayment } = await import('@/lib/actions');

      await togglePayment('member:2', 'cycle:1', false, 500000);

      expect(revalidatePath).toHaveBeenCalledWith('/');
    });

    it('does NOT call revalidatePath on failure', async () => {
      vi.stubGlobal('fetch', mockFetch(500, { error: 'boom' }));
      const { revalidatePath } = await import('next/cache');
      vi.mocked(revalidatePath).mockClear();
      const { togglePayment } = await import('@/lib/actions');

      await togglePayment('member:2', 'cycle:1', false, 500000);

      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });
});
