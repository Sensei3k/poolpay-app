import { describe, it, expect, vi, afterEach } from 'vitest';
import { FETCH_TIMEOUT_MS, MUTATION_TIMEOUT_MS } from '@/lib/http';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : String(status),
    json: async () => body,
  };
}

function stubFetch(...responses: ReturnType<typeof mockResponse>[]) {
  const spy = vi.fn();
  for (const r of responses) spy.mockResolvedValueOnce(r);
  vi.stubGlobal('fetch', spy);
  return spy;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('lib/http', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  // ── Constants ──────────────────────────────────────────────────────────────

  describe('constants', () => {
    it('FETCH_TIMEOUT_MS defaults to 5000', () => {
      expect(FETCH_TIMEOUT_MS).toBe(5000);
    });

    it('MUTATION_TIMEOUT_MS defaults to 10000', () => {
      expect(MUTATION_TIMEOUT_MS).toBe(10000);
    });
  });

  // ── apiFetch ───────────────────────────────────────────────────────────────

  describe('apiFetch', () => {
    it('returns { ok: true, data } on 200', async () => {
      stubFetch(mockResponse(200, { id: '1' }));
      const { apiFetch } = await import('@/lib/http');

      const result = await apiFetch('/api/groups', [], { retries: 0 });

      expect(result.ok).toBe(true);
      expect(result.data).toEqual({ id: '1' });
    });

    it('returns { ok: false, data: fallback } on non-ok status', async () => {
      stubFetch(mockResponse(500, {}));
      const { apiFetch } = await import('@/lib/http');

      const result = await apiFetch('/api/groups', ['fallback'], { retries: 0 });

      expect(result.ok).toBe(false);
      expect(result.data).toEqual(['fallback']);
    });

    it('passes cache: no-store to every fetch call', async () => {
      const spy = stubFetch(mockResponse(200, []));
      const { apiFetch } = await import('@/lib/http');

      await apiFetch('/api/groups', [], { retries: 0 });

      const [, opts] = spy.mock.calls[0] as [string, RequestInit];
      expect(opts.cache).toBe('no-store');
    });

    it('attaches Authorization header when token is provided', async () => {
      const spy = stubFetch(mockResponse(200, []));
      const { apiFetch } = await import('@/lib/http');

      await apiFetch('/api/groups', [], { token: 'my-token', retries: 0 });

      const [, opts] = spy.mock.calls[0] as [string, RequestInit];
      expect((opts.headers as Record<string, string>)['Authorization']).toBe('Bearer my-token');
    });

    it('does NOT attach Authorization header when token is undefined', async () => {
      const spy = stubFetch(mockResponse(200, []));
      const { apiFetch } = await import('@/lib/http');

      await apiFetch('/api/groups', [], { retries: 0 });

      const [, opts] = spy.mock.calls[0] as [string, RequestInit];
      expect((opts.headers as Record<string, string>)['Authorization']).toBeUndefined();
    });

    it('retries on 503 and succeeds on 3rd attempt', async () => {
      const spy = stubFetch(
        mockResponse(503, {}),
        mockResponse(503, {}),
        mockResponse(200, [{ id: '1' }]),
      );
      const { apiFetch } = await import('@/lib/http');

      const result = await apiFetch('/api/groups', [], { retries: 2, backoffMs: 0 });

      expect(spy).toHaveBeenCalledTimes(3);
      expect(result.ok).toBe(true);
    });

    it('does NOT retry on 404 — calls fetch exactly once', async () => {
      const spy = stubFetch(mockResponse(404, {}));
      const { apiFetch } = await import('@/lib/http');

      const result = await apiFetch('/api/groups', [], { retries: 2, backoffMs: 0 });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(result.ok).toBe(false);
    });

    it('retries on TypeError (network failure) and returns fallback after all retries', async () => {
      const spy = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
      vi.stubGlobal('fetch', spy);
      const { apiFetch } = await import('@/lib/http');

      const result = await apiFetch('/api/groups', ['fallback'], { retries: 2, backoffMs: 0 });

      expect(spy).toHaveBeenCalledTimes(3);
      expect(result.ok).toBe(false);
      expect(result.data).toEqual(['fallback']);
    });

    it('does NOT retry on non-TypeError errors (e.g. AbortError)', async () => {
      const abortErr = new DOMException('Aborted', 'AbortError');
      const spy = vi.fn().mockRejectedValue(abortErr);
      vi.stubGlobal('fetch', spy);
      const { apiFetch } = await import('@/lib/http');

      const result = await apiFetch('/api/groups', [], { retries: 2, backoffMs: 0 });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(result.ok).toBe(false);
    });

    it('returns fallback after all retries on 503 exhausted', async () => {
      stubFetch(mockResponse(503, {}), mockResponse(503, {}), mockResponse(503, {}));
      const { apiFetch } = await import('@/lib/http');

      const result = await apiFetch('/api/groups', ['fallback'], { retries: 2, backoffMs: 0 });

      expect(result.ok).toBe(false);
      expect(result.data).toEqual(['fallback']);
    });
  });

  // ── apiAction ──────────────────────────────────────────────────────────────

  describe('apiAction', () => {
    it('returns { success: true } on 200', async () => {
      stubFetch(mockResponse(200, {}));
      const { apiAction } = await import('@/lib/http');

      const result = await apiAction('/api/payments');

      expect(result.success).toBe(true);
    });

    it('returns { success: false, error } from JSON error body on non-ok', async () => {
      stubFetch(mockResponse(400, { error: 'name is required' }));
      const { apiAction } = await import('@/lib/http');

      const result = await apiAction('/api/admin/groups', { method: 'POST', body: {} });

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toBe('name is required');
    });

    it('falls back to status text when error body has no error field', async () => {
      stubFetch(mockResponse(422, { message: 'unprocessable' }));
      const { apiAction } = await import('@/lib/http');

      const result = await apiAction('/api/admin/groups', { method: 'POST', body: {} });

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toContain('422');
    });

    it('attaches Authorization header when token is provided', async () => {
      const spy = stubFetch(mockResponse(200, {}));
      const { apiAction } = await import('@/lib/http');

      await apiAction('/api/admin/groups', { method: 'POST', body: {}, token: 'admin-token' });

      const [, opts] = spy.mock.calls[0] as [string, RequestInit];
      expect((opts.headers as Record<string, string>)['Authorization']).toBe('Bearer admin-token');
    });

    it('does NOT attach Authorization header when token is undefined', async () => {
      const spy = stubFetch(mockResponse(200, {}));
      const { apiAction } = await import('@/lib/http');

      await apiAction('/api/payments', { method: 'POST', body: {} });

      const [, opts] = spy.mock.calls[0] as [string, RequestInit];
      expect((opts.headers as Record<string, string>)['Authorization']).toBeUndefined();
    });

    it('always attaches Content-Type: application/json', async () => {
      const spy = stubFetch(mockResponse(200, {}));
      const { apiAction } = await import('@/lib/http');

      await apiAction('/api/payments', { method: 'POST', body: {} });

      const [, opts] = spy.mock.calls[0] as [string, RequestInit];
      expect((opts.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    });

    it('omits body from fetch call when body is undefined (DELETE)', async () => {
      const spy = stubFetch(mockResponse(200, {}));
      const { apiAction } = await import('@/lib/http');

      await apiAction('/api/payments/1/2', { method: 'DELETE' });

      const [, opts] = spy.mock.calls[0] as [string, RequestInit];
      expect(opts.body).toBeUndefined();
    });

    it('serialises body as JSON when provided', async () => {
      const spy = stubFetch(mockResponse(200, {}));
      const { apiAction } = await import('@/lib/http');

      await apiAction('/api/payments', { method: 'POST', body: { amount: 5000 } });

      const [, opts] = spy.mock.calls[0] as [string, RequestInit];
      expect(opts.body).toBe(JSON.stringify({ amount: 5000 }));
    });

    it('defaults to method POST', async () => {
      const spy = stubFetch(mockResponse(200, {}));
      const { apiAction } = await import('@/lib/http');

      await apiAction('/api/payments', { body: {} });

      const [, opts] = spy.mock.calls[0] as [string, RequestInit];
      expect((opts.method as string).toUpperCase()).toBe('POST');
    });

    it('defaults to retries: 0 — fetch called exactly once on failure', async () => {
      const spy = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
      vi.stubGlobal('fetch', spy);
      const { apiAction } = await import('@/lib/http');

      const result = await apiAction('/api/payments', { method: 'POST', body: {} });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(false);
    });

    it('returns { success: false, error: err.message } on caught Error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
      const { apiAction } = await import('@/lib/http');

      const result = await apiAction('/api/payments', { method: 'POST', body: {} });

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toBe('network down');
    });
  });
});
