import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActionResult } from '@/lib/types';

// `secureAction` is the migration target (graphify post-PR #68). Hoisted so
// the `vi.mock` factory below resolves before `lib/admin-actions` is imported
// at test time.
const { secureActionMock, revalidatePathMock } = vi.hoisted(() => ({
  secureActionMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock('@/lib/auth/backend-fetch', async (orig) => {
  const actual = await orig<typeof import('@/lib/auth/backend-fetch')>();
  return {
    ...actual,
    secureAction: secureActionMock,
  };
});

vi.mock('next/cache', () => ({
  revalidatePath: revalidatePathMock,
}));

import { BackendUnauthorizedError } from '@/lib/auth/backend-fetch';
import {
  createCycle,
  createGroup,
  createMember,
  deleteCycle,
  deleteGroup,
  deleteMember,
  updateCycle,
  updateGroup,
  updateMember,
} from '@/lib/admin-actions';

beforeEach(() => {
  secureActionMock.mockReset();
  revalidatePathMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Groups ───────────────────────────────────────────────────────────────────

describe('createGroup', () => {
  it('POSTs to /api/admin/groups via secureAction with the supplied body', async () => {
    secureActionMock.mockResolvedValueOnce({ success: true });

    const result: ActionResult = await createGroup({ name: 'Test Group' });

    expect(result).toEqual({ success: true });
    expect(secureActionMock).toHaveBeenCalledWith('/api/admin/groups', {
      method: 'POST',
      body: { name: 'Test Group' },
    });
  });

  it('revalidates root and /admin on success so listings refresh', async () => {
    secureActionMock.mockResolvedValueOnce({ success: true });

    await createGroup({ name: 'Test Group' });

    expect(revalidatePathMock).toHaveBeenCalledWith('/');
    expect(revalidatePathMock).toHaveBeenCalledWith('/admin');
  });

  it('returns { success: false, error } on non-OK and skips revalidation', async () => {
    secureActionMock.mockResolvedValueOnce({
      success: false,
      error: 'name is required',
      status: 400,
    });

    const result: ActionResult = await createGroup({ name: '' });

    expect(result).toEqual({ success: false, error: 'name is required' });
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it('rethrows BackendUnauthorizedError so the caller can redirect to /signin', async () => {
    secureActionMock.mockRejectedValueOnce(
      new BackendUnauthorizedError('retry_exhausted'),
    );

    await expect(createGroup({ name: 'x' })).rejects.toBeInstanceOf(
      BackendUnauthorizedError,
    );
  });
});

describe('updateGroup', () => {
  it('PATCHes /api/admin/groups/:id with the supplied patch', async () => {
    secureActionMock.mockResolvedValueOnce({ success: true });

    const result = await updateGroup('group:1', { name: 'Renamed' });

    expect(result).toEqual({ success: true });
    expect(secureActionMock).toHaveBeenCalledWith('/api/admin/groups/group:1', {
      method: 'PATCH',
      body: { name: 'Renamed' },
    });
  });

  it('returns { success: false, error } on 404', async () => {
    secureActionMock.mockResolvedValueOnce({
      success: false,
      error: 'not found',
      status: 404,
    });

    const result = await updateGroup('group:999', { name: 'X' });

    expect(result).toEqual({ success: false, error: 'not found' });
  });
});

describe('deleteGroup', () => {
  it('DELETEs /api/admin/groups/:id with no body', async () => {
    secureActionMock.mockResolvedValueOnce({ success: true });

    const result = await deleteGroup('group:1');

    expect(result).toEqual({ success: true });
    expect(secureActionMock).toHaveBeenCalledWith('/api/admin/groups/group:1', {
      method: 'DELETE',
      body: undefined,
    });
  });

  it('returns { success: false, error } on 409 conflict', async () => {
    secureActionMock.mockResolvedValueOnce({
      success: false,
      error: 'group has active cycles',
      status: 409,
    });

    const result = await deleteGroup('group:1');

    expect(result).toEqual({
      success: false,
      error: 'group has active cycles',
    });
  });
});

// ─── Members ──────────────────────────────────────────────────────────────────

describe('createMember', () => {
  it('POSTs to /api/admin/groups/:groupId/members', async () => {
    secureActionMock.mockResolvedValueOnce({ success: true });

    const result = await createMember('group:1', {
      name: 'Alice',
      phone: '2349000000001',
      position: 1,
    });

    expect(result).toEqual({ success: true });
    expect(secureActionMock).toHaveBeenCalledWith(
      '/api/admin/groups/group:1/members',
      {
        method: 'POST',
        body: { name: 'Alice', phone: '2349000000001', position: 1 },
      },
    );
  });

  it('returns { success: false, error } on validation failure', async () => {
    secureActionMock.mockResolvedValueOnce({
      success: false,
      error: 'phone is invalid',
      status: 400,
    });

    const result = await createMember('group:1', {
      name: 'Alice',
      phone: 'bad',
      position: 1,
    });

    expect(result).toEqual({ success: false, error: 'phone is invalid' });
  });
});

describe('updateMember', () => {
  it('PATCHes /api/admin/members/:id', async () => {
    secureActionMock.mockResolvedValueOnce({ success: true });

    const result = await updateMember('member:1', { name: 'Bob' });

    expect(result).toEqual({ success: true });
    expect(secureActionMock).toHaveBeenCalledWith(
      '/api/admin/members/member:1',
      { method: 'PATCH', body: { name: 'Bob' } },
    );
  });

  it('forwards a status patch to the backend', async () => {
    secureActionMock.mockResolvedValueOnce({ success: true });

    await updateMember('member:1', { status: 'inactive' });

    expect(secureActionMock).toHaveBeenCalledWith(
      '/api/admin/members/member:1',
      { method: 'PATCH', body: { status: 'inactive' } },
    );
  });
});

describe('deleteMember', () => {
  it('DELETEs /api/admin/members/:id with no body', async () => {
    secureActionMock.mockResolvedValueOnce({ success: true });

    const result = await deleteMember('member:1');

    expect(result).toEqual({ success: true });
    expect(secureActionMock).toHaveBeenCalledWith(
      '/api/admin/members/member:1',
      { method: 'DELETE', body: undefined },
    );
  });

  it('returns { success: false, error } on 404', async () => {
    secureActionMock.mockResolvedValueOnce({
      success: false,
      error: 'member not found',
      status: 404,
    });

    const result = await deleteMember('member:missing');

    expect(result).toEqual({ success: false, error: 'member not found' });
  });
});

// ─── Cycles ───────────────────────────────────────────────────────────────────

describe('createCycle', () => {
  it('POSTs to /api/admin/groups/:groupId/cycles with the full payload', async () => {
    secureActionMock.mockResolvedValueOnce({ success: true });

    const result = await createCycle('group:1', {
      cycleNumber: 1,
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      contributionPerMember: 500000,
      recipientMemberId: 'member:1',
    });

    expect(result).toEqual({ success: true });
    expect(secureActionMock).toHaveBeenCalledWith(
      '/api/admin/groups/group:1/cycles',
      {
        method: 'POST',
        body: {
          cycleNumber: 1,
          startDate: '2026-01-01',
          endDate: '2026-01-31',
          contributionPerMember: 500000,
          recipientMemberId: 'member:1',
        },
      },
    );
  });
});

describe('updateCycle', () => {
  it('PATCHes /api/admin/cycles/:id with the supplied patch', async () => {
    secureActionMock.mockResolvedValueOnce({ success: true });

    const result = await updateCycle('cycle:1', { status: 'closed' });

    expect(result).toEqual({ success: true });
    expect(secureActionMock).toHaveBeenCalledWith('/api/admin/cycles/cycle:1', {
      method: 'PATCH',
      body: { status: 'closed' },
    });
  });

  it('returns { success: false, error } when the backend rejects the patch', async () => {
    secureActionMock.mockResolvedValueOnce({
      success: false,
      error: 'cannot reopen a closed cycle',
      status: 409,
    });

    const result = await updateCycle('cycle:1', { status: 'active' });

    expect(result).toEqual({
      success: false,
      error: 'cannot reopen a closed cycle',
    });
  });
});

describe('deleteCycle', () => {
  it('DELETEs /api/admin/cycles/:id with no body', async () => {
    secureActionMock.mockResolvedValueOnce({ success: true });

    const result = await deleteCycle('cycle:1');

    expect(result).toEqual({ success: true });
    expect(secureActionMock).toHaveBeenCalledWith('/api/admin/cycles/cycle:1', {
      method: 'DELETE',
      body: undefined,
    });
  });

  it('returns { success: false, error } on 409 when payments exist', async () => {
    secureActionMock.mockResolvedValueOnce({
      success: false,
      error: 'cycle has confirmed payments',
      status: 409,
    });

    const result = await deleteCycle('cycle:1');

    expect(result).toEqual({
      success: false,
      error: 'cycle has confirmed payments',
    });
  });
});

// ─── Cross-cutting behaviour ──────────────────────────────────────────────────

describe('revalidation', () => {
  it('skips revalidation on a failed mutation so stale pages are not nuked', async () => {
    secureActionMock.mockResolvedValueOnce({
      success: false,
      error: 'boom',
      status: 500,
    });

    await deleteCycle('cycle:1');

    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it('revalidates root and /admin once on every successful mutation', async () => {
    secureActionMock.mockResolvedValueOnce({ success: true });

    await deleteMember('member:1');

    expect(revalidatePathMock).toHaveBeenCalledTimes(2);
    expect(revalidatePathMock).toHaveBeenNthCalledWith(1, '/');
    expect(revalidatePathMock).toHaveBeenNthCalledWith(2, '/admin');
  });
});

describe('auth failure propagation', () => {
  it.each([
    ['updateGroup', () => updateGroup('group:1', { name: 'x' })],
    ['deleteMember', () => deleteMember('member:1')],
    ['createCycle', () =>
      createCycle('group:1', {
        cycleNumber: 1,
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        contributionPerMember: 500000,
        recipientMemberId: 'member:1',
      }),
    ],
  ])('%s rethrows BackendUnauthorizedError', async (_label, run) => {
    secureActionMock.mockRejectedValueOnce(
      new BackendUnauthorizedError('refresh_failed'),
    );

    await expect(run()).rejects.toBeInstanceOf(BackendUnauthorizedError);
  });
});
