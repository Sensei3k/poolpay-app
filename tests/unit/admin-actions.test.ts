import { describe, it, expect, vi, afterEach } from 'vitest';
import type { ActionResult } from '@/lib/types';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: async () => body,
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('admin server actions', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  describe('createGroup', () => {
    it('sends POST to /api/admin/groups with Authorization header', async () => {
      const fetchSpy = mockFetch(200, { id: 'group:1', name: 'Test Group' });
      vi.stubGlobal('fetch', fetchSpy);
      const { createGroup } = await import('@/lib/admin-actions');

      await createGroup({ name: 'Test Group' });

      expect(fetchSpy).toHaveBeenCalledOnce();
      const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/api/admin/groups');
      expect((opts.method as string).toUpperCase()).toBe('POST');
      expect(opts.headers).toMatchObject({ Authorization: expect.stringContaining('Bearer') });
    });

    it('returns { success: true } on 200', async () => {
      vi.stubGlobal('fetch', mockFetch(200, { id: 'group:1', name: 'Test Group' }));
      const { createGroup } = await import('@/lib/admin-actions');
      const result: ActionResult = await createGroup({ name: 'Test Group' });
      expect(result.success).toBe(true);
    });

    it('returns { success: false, error } on non-OK response', async () => {
      vi.stubGlobal('fetch', mockFetch(400, { error: 'name is required' }));
      const { createGroup } = await import('@/lib/admin-actions');
      const result: ActionResult = await createGroup({ name: '' });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toBeTruthy();
    });

    it('returns { success: false, error } when ADMIN_TOKEN is missing', async () => {
      vi.stubGlobal('fetch', mockFetch(401, { error: 'Unauthorized' }));
      const { createGroup } = await import('@/lib/admin-actions');
      const result: ActionResult = await createGroup({ name: 'Test' });
      expect(result.success).toBe(false);
    });
  });

  describe('updateGroup', () => {
    it('sends PATCH to /api/admin/groups/{id}', async () => {
      const fetchSpy = mockFetch(200, {});
      vi.stubGlobal('fetch', fetchSpy);
      const { updateGroup } = await import('@/lib/admin-actions');

      await updateGroup('group:1', { name: 'Renamed' });

      const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/api/admin/groups/');
      expect((opts.method as string).toUpperCase()).toBe('PATCH');
    });

    it('returns { success: true } on 200', async () => {
      vi.stubGlobal('fetch', mockFetch(200, {}));
      const { updateGroup } = await import('@/lib/admin-actions');
      const result = await updateGroup('group:1', { name: 'Renamed' });
      expect(result.success).toBe(true);
    });

    it('returns { success: false, error } on 404', async () => {
      vi.stubGlobal('fetch', mockFetch(404, { error: 'not found' }));
      const { updateGroup } = await import('@/lib/admin-actions');
      const result = await updateGroup('group:999', { name: 'X' });
      expect(result.success).toBe(false);
    });
  });

  describe('deleteGroup', () => {
    it('sends DELETE to /api/admin/groups/{id}', async () => {
      const fetchSpy = mockFetch(200, {});
      vi.stubGlobal('fetch', fetchSpy);
      const { deleteGroup } = await import('@/lib/admin-actions');

      await deleteGroup('group:1');

      const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/api/admin/groups/');
      expect((opts.method as string).toUpperCase()).toBe('DELETE');
    });

    it('returns { success: true } on 200', async () => {
      vi.stubGlobal('fetch', mockFetch(200, {}));
      const { deleteGroup } = await import('@/lib/admin-actions');
      const result = await deleteGroup('group:1');
      expect(result.success).toBe(true);
    });

    it('returns { success: false, error } on 409 conflict', async () => {
      vi.stubGlobal('fetch', mockFetch(409, { error: 'group has active cycles' }));
      const { deleteGroup } = await import('@/lib/admin-actions');
      const result = await deleteGroup('group:1');
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toBeTruthy();
    });
  });

  describe('createMember', () => {
    it('sends POST to /api/admin/groups/{groupId}/members', async () => {
      const fetchSpy = mockFetch(200, { id: 'member:1' });
      vi.stubGlobal('fetch', fetchSpy);
      const { createMember } = await import('@/lib/admin-actions');

      await createMember('group:1', { name: 'Alice', phone: '2349000000001', position: 1 });

      const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/api/admin/groups/');
      expect(url).toContain('/members');
      expect((opts.method as string).toUpperCase()).toBe('POST');
      expect(opts.headers).toMatchObject({ Authorization: expect.stringContaining('Bearer') });
    });

    it('returns { success: true } on 200', async () => {
      vi.stubGlobal('fetch', mockFetch(200, { id: 'member:1' }));
      const { createMember } = await import('@/lib/admin-actions');
      const result = await createMember('group:1', { name: 'Alice', phone: '2349000000001', position: 1 });
      expect(result.success).toBe(true);
    });
  });

  describe('updateMember', () => {
    it('sends PATCH to /api/admin/members/{id}', async () => {
      const fetchSpy = mockFetch(200, {});
      vi.stubGlobal('fetch', fetchSpy);
      const { updateMember } = await import('@/lib/admin-actions');

      await updateMember('member:1', { name: 'Bob' });

      const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/api/admin/members/');
      expect((opts.method as string).toUpperCase()).toBe('PATCH');
    });

    it('returns { success: true } on 200', async () => {
      vi.stubGlobal('fetch', mockFetch(200, {}));
      const { updateMember } = await import('@/lib/admin-actions');
      const result = await updateMember('member:1', { name: 'Bob' });
      expect(result.success).toBe(true);
    });
  });

  describe('deleteMember', () => {
    it('sends DELETE to /api/admin/members/{id}', async () => {
      const fetchSpy = mockFetch(200, {});
      vi.stubGlobal('fetch', fetchSpy);
      const { deleteMember } = await import('@/lib/admin-actions');

      await deleteMember('member:1');

      const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/api/admin/members/');
      expect((opts.method as string).toUpperCase()).toBe('DELETE');
    });

    it('returns { success: true } on 200', async () => {
      vi.stubGlobal('fetch', mockFetch(200, {}));
      const { deleteMember } = await import('@/lib/admin-actions');
      const result = await deleteMember('member:1');
      expect(result.success).toBe(true);
    });
  });

  describe('createCycle', () => {
    it('sends POST to /api/admin/groups/{groupId}/cycles', async () => {
      const fetchSpy = mockFetch(200, { id: 'cycle:1' });
      vi.stubGlobal('fetch', fetchSpy);
      const { createCycle } = await import('@/lib/admin-actions');

      await createCycle('group:1', {
        cycleNumber: 1,
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        contributionPerMember: 500000,
        recipientMemberId: 'member:1',
      });

      const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/api/admin/groups/');
      expect(url).toContain('/cycles');
      expect((opts.method as string).toUpperCase()).toBe('POST');
      expect(opts.headers).toMatchObject({ Authorization: expect.stringContaining('Bearer') });
    });

    it('returns { success: true } on 200', async () => {
      vi.stubGlobal('fetch', mockFetch(200, { id: 'cycle:1' }));
      const { createCycle } = await import('@/lib/admin-actions');
      const result = await createCycle('group:1', {
        cycleNumber: 1,
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        contributionPerMember: 500000,
        recipientMemberId: 'member:1',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('updateCycle', () => {
    it('sends PATCH to /api/admin/cycles/{id}', async () => {
      const fetchSpy = mockFetch(200, {});
      vi.stubGlobal('fetch', fetchSpy);
      const { updateCycle } = await import('@/lib/admin-actions');

      await updateCycle('cycle:1', { status: 'closed' });

      const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/api/admin/cycles/');
      expect((opts.method as string).toUpperCase()).toBe('PATCH');
    });

    it('returns { success: true } on 200', async () => {
      vi.stubGlobal('fetch', mockFetch(200, {}));
      const { updateCycle } = await import('@/lib/admin-actions');
      const result = await updateCycle('cycle:1', { status: 'closed' });
      expect(result.success).toBe(true);
    });
  });

  describe('deleteCycle', () => {
    it('sends DELETE to /api/admin/cycles/{id}', async () => {
      const fetchSpy = mockFetch(200, {});
      vi.stubGlobal('fetch', fetchSpy);
      const { deleteCycle } = await import('@/lib/admin-actions');

      await deleteCycle('cycle:1');

      const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/api/admin/cycles/');
      expect((opts.method as string).toUpperCase()).toBe('DELETE');
    });

    it('returns { success: true } on 200', async () => {
      vi.stubGlobal('fetch', mockFetch(200, {}));
      const { deleteCycle } = await import('@/lib/admin-actions');
      const result = await deleteCycle('cycle:1');
      expect(result.success).toBe(true);
    });
  });
});
