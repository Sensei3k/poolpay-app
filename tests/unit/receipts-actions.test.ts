import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  confirmReceiptAction,
  flagReceiptAction,
  rejectReceiptAction,
  RECEIPT_REASON_MAX_LENGTH,
} from '@/lib/actions/receipts';

beforeEach(() => {
  secureActionMock.mockReset();
  revalidatePathMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('confirmReceiptAction', () => {
  it('PATCHes /api/receipts/:id with action=confirm and returns ok: true on success', async () => {
    secureActionMock.mockResolvedValueOnce({ success: true });

    const result = await confirmReceiptAction('R-1');

    expect(result).toEqual({ ok: true });
    expect(secureActionMock).toHaveBeenCalledWith('/api/receipts/R-1', {
      method: 'PATCH',
      body: { action: 'confirm' },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith('/admin/receipts');
  });

  it('maps 409 conflict to a first-class conflict code (double-confirm race)', async () => {
    secureActionMock.mockResolvedValueOnce({
      success: false,
      error: 'Receipt already confirmed by another admin',
      status: 409,
    });

    const result = await confirmReceiptAction('R-1');

    expect(result).toEqual({
      ok: false,
      code: 'conflict',
      message: 'Receipt already confirmed by another admin',
    });
  });

  it('maps 403 to a forbidden code (scoped-admin acting outside their groups)', async () => {
    secureActionMock.mockResolvedValueOnce({
      success: false,
      error: 'forbidden',
      status: 403,
    });

    const result = await confirmReceiptAction('R-1');

    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.code).toBe('forbidden');
    }
  });

  it('maps transport-level failures (status undefined) to backend_unavailable', async () => {
    secureActionMock.mockResolvedValueOnce({
      success: false,
      error: 'network_error',
    });

    const result = await confirmReceiptAction('R-1');

    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.code).toBe('backend_unavailable');
    }
  });

  it('rethrows BackendUnauthorizedError so the caller can redirect to /signin?reauth=1', async () => {
    secureActionMock.mockRejectedValueOnce(
      new BackendUnauthorizedError('retry_exhausted'),
    );

    await expect(confirmReceiptAction('R-1')).rejects.toBeInstanceOf(
      BackendUnauthorizedError,
    );
  });

  it('forwards an explicit reason when one is supplied (whitespace trimmed)', async () => {
    secureActionMock.mockResolvedValueOnce({ success: true });

    await confirmReceiptAction('R-1', '   confirmed in-thread   ');

    expect(secureActionMock).toHaveBeenCalledWith('/api/receipts/R-1', {
      method: 'PATCH',
      body: { action: 'confirm', reason: 'confirmed in-thread' },
    });
  });
});

describe('rejectReceiptAction', () => {
  it('PATCHes with action=reject when a reason is supplied', async () => {
    secureActionMock.mockResolvedValueOnce({ success: true });

    const result = await rejectReceiptAction('R-2', 'duplicate of #R-7');

    expect(result).toEqual({ ok: true });
    expect(secureActionMock).toHaveBeenCalledWith('/api/receipts/R-2', {
      method: 'PATCH',
      body: { action: 'reject', reason: 'duplicate of #R-7' },
    });
  });

  it('short-circuits without a network call when reason is missing', async () => {
    const result = await rejectReceiptAction('R-2', '   ');

    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.code).toBe('validation');
    }
    expect(secureActionMock).not.toHaveBeenCalled();
  });

  it('clamps the reason to the 280-char backend cap', async () => {
    secureActionMock.mockResolvedValueOnce({ success: true });
    const longReason = 'x'.repeat(RECEIPT_REASON_MAX_LENGTH + 50);

    await rejectReceiptAction('R-2', longReason);

    const [, opts] = secureActionMock.mock.calls[0];
    expect(opts.body.reason.length).toBe(RECEIPT_REASON_MAX_LENGTH);
  });

  it('maps 409 conflict to a conflict code on reject too', async () => {
    secureActionMock.mockResolvedValueOnce({
      success: false,
      error: 'already actioned',
      status: 409,
    });

    const result = await rejectReceiptAction('R-2', 'dupe');

    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.code).toBe('conflict');
    }
  });

  it('rethrows BackendUnauthorizedError', async () => {
    secureActionMock.mockRejectedValueOnce(
      new BackendUnauthorizedError('refresh_failed'),
    );

    await expect(rejectReceiptAction('R-2', 'dupe')).rejects.toBeInstanceOf(
      BackendUnauthorizedError,
    );
  });
});

describe('flagReceiptAction', () => {
  it('PATCHes with action=flag and a normalised reason', async () => {
    secureActionMock.mockResolvedValueOnce({ success: true });

    const result = await flagReceiptAction('R-3', '  looks fake  ');

    expect(result).toEqual({ ok: true });
    expect(secureActionMock).toHaveBeenCalledWith('/api/receipts/R-3', {
      method: 'PATCH',
      body: { action: 'flag', reason: 'looks fake' },
    });
  });

  it('returns validation without a round-trip when reason is empty', async () => {
    const result = await flagReceiptAction('R-3', '');

    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.code).toBe('validation');
    }
    expect(secureActionMock).not.toHaveBeenCalled();
  });

  it('maps 5xx to service', async () => {
    secureActionMock.mockResolvedValueOnce({
      success: false,
      error: 'internal',
      status: 500,
    });

    const result = await flagReceiptAction('R-3', 'looks fake');

    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.code).toBe('service');
    }
  });

  it('rethrows BackendUnauthorizedError', async () => {
    secureActionMock.mockRejectedValueOnce(
      new BackendUnauthorizedError('no_session'),
    );

    await expect(flagReceiptAction('R-3', 'looks fake')).rejects.toBeInstanceOf(
      BackendUnauthorizedError,
    );
  });
});
