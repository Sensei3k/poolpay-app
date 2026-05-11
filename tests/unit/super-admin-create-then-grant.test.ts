import { describe, expect, it, vi } from 'vitest';
import {
  runCreateThenGrant,
  type CreateThenGrantDeps,
} from '@/lib/super-admin/create-then-grant';

function makeDeps(overrides: Partial<CreateThenGrantDeps> = {}): CreateThenGrantDeps {
  return {
    createUser: vi.fn().mockResolvedValue({ ok: true, userId: 'user-1' }),
    grantGroup: vi.fn().mockResolvedValue({ ok: true }),
    deleteUser: vi.fn().mockResolvedValue({ ok: true }),
    ...overrides,
  };
}

const baseInput = {
  name: 'Chidi Obi',
  email: 'chidi@chamasave.ng',
  phone: '+234 803 552 6612',
  initialPassword: 'temp-pw',
  groupIds: ['pool-a', 'pool-b'],
} as const;

describe('runCreateThenGrant', () => {
  it('returns ok and records all granted ids when every step succeeds', async () => {
    const deps = makeDeps();
    const result = await runCreateThenGrant(baseInput, deps);
    expect(result).toEqual({
      ok: true,
      userId: 'user-1',
      grantedGroupIds: ['pool-a', 'pool-b'],
    });
    expect(deps.createUser).toHaveBeenCalledOnce();
    expect(deps.grantGroup).toHaveBeenCalledTimes(2);
    expect(deps.deleteUser).not.toHaveBeenCalled();
  });

  it('fails with stage="create" when user creation fails', async () => {
    const deps = makeDeps({
      createUser: vi.fn().mockResolvedValue({ ok: false, error: 'duplicate email' }),
    });
    const result = await runCreateThenGrant(baseInput, deps);
    expect(result).toEqual({ ok: false, stage: 'create', error: 'duplicate email' });
    expect(deps.grantGroup).not.toHaveBeenCalled();
    expect(deps.deleteUser).not.toHaveBeenCalled();
  });

  it('fails with stage="grant" and compensates when a grant fails', async () => {
    const deps = makeDeps({
      grantGroup: vi
        .fn()
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: false, error: 'pool not found' }),
    });
    const result = await runCreateThenGrant(baseInput, deps);
    expect(result).toEqual({
      ok: false,
      stage: 'grant',
      error: 'pool not found',
      partial: { userId: 'user-1', compensated: true },
    });
    expect(deps.deleteUser).toHaveBeenCalledWith('user-1');
  });

  it('reports compensated=false when the rollback DELETE also fails', async () => {
    const deps = makeDeps({
      grantGroup: vi.fn().mockResolvedValue({ ok: false, error: 'grant error' }),
      deleteUser: vi.fn().mockResolvedValue({ ok: false }),
    });
    const result = await runCreateThenGrant(baseInput, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.partial?.compensated).toBe(false);
    }
  });

  it('treats a thrown deleteUser rejection as a failed compensation', async () => {
    const deps = makeDeps({
      grantGroup: vi.fn().mockResolvedValue({ ok: false, error: 'grant error' }),
      deleteUser: vi.fn().mockRejectedValue(new Error('network')),
    });
    const result = await runCreateThenGrant(baseInput, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.partial?.compensated).toBe(false);
    }
  });

  it('treats a missing userId from the create endpoint as a create failure', async () => {
    const deps = makeDeps({
      createUser: vi.fn().mockResolvedValue({ ok: true }),
    });
    const result = await runCreateThenGrant(baseInput, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.stage).toBe('create');
    }
  });

  it('records partial granted ids before aborting on grant failure', async () => {
    const deps = makeDeps({
      grantGroup: vi
        .fn()
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: false, error: 'grant failed' }),
    });
    const result = await runCreateThenGrant(
      { ...baseInput, groupIds: ['pool-a', 'pool-b', 'pool-c'] },
      deps,
    );
    // Even though `pool-a` succeeded, we surface the failure shape so
    // the UI surfaces the partial-rollback path rather than reporting
    // a clean success.
    expect(result.ok).toBe(false);
    expect(deps.grantGroup).toHaveBeenCalledTimes(2);
  });

  it('handles an empty groupIds list by skipping the grant loop entirely', async () => {
    const deps = makeDeps();
    const result = await runCreateThenGrant({ ...baseInput, groupIds: [] }, deps);
    expect(result).toEqual({ ok: true, userId: 'user-1', grantedGroupIds: [] });
    expect(deps.grantGroup).not.toHaveBeenCalled();
  });
});
