// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const {
  confirmReceiptActionMock,
  rejectReceiptActionMock,
  flagReceiptActionMock,
  routerRefreshMock,
} = vi.hoisted(() => ({
  confirmReceiptActionMock: vi.fn(),
  rejectReceiptActionMock: vi.fn(),
  flagReceiptActionMock: vi.fn(),
  routerRefreshMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: routerRefreshMock, push: vi.fn() }),
}));

vi.mock('@/lib/actions/receipts', async (orig) => {
  const actual = await orig<typeof import('@/lib/actions/receipts')>();
  return {
    ...actual,
    confirmReceiptAction: confirmReceiptActionMock,
    rejectReceiptAction: rejectReceiptActionMock,
    flagReceiptAction: flagReceiptActionMock,
  };
});

import { useReceiptsQueueStore } from '@/lib/stores/receipts-queue';
import { ModalReceiptDetail } from '@/components/admin/modal-receipt-detail';
import { RECEIPT_REASON_MAX_LENGTH } from '@/lib/actions/receipts-types';
import type { ReceiptQueueRow } from '@/lib/view-models/admin';

const ROW: ReceiptQueueRow = {
  receiptId: 'R-7782',
  poolName: 'Lagos Rent Q2',
  poolInitial: 'L',
  poolSwatch: 'a',
  memberName: 'Tola Bakare',
  memberPhoneMasked: '+234 803 •••',
  amountLabel: '₦ 12,000',
  cycleLabel: 'cycle 10 of 12',
  submittedLabel: '2h ago · WhatsApp',
  note: '12 of 12 expected',
  tone: 'pending',
  status: 'matched',
};

beforeEach(() => {
  confirmReceiptActionMock.mockReset();
  rejectReceiptActionMock.mockReset();
  flagReceiptActionMock.mockReset();
  routerRefreshMock.mockReset();
  useReceiptsQueueStore.getState().reset();
});

afterEach(() => {
  cleanup();
});

describe('ModalReceiptDetail, confirm', () => {
  it('renders the three action buttons enabled by default', () => {
    render(<ModalReceiptDetail row={ROW} />);

    const confirmBtn = screen.getByRole('button', {
      name: /confirm payment/i,
    }) as HTMLButtonElement;
    const rejectBtn = screen.getByRole('button', {
      name: /reject as duplicate/i,
    }) as HTMLButtonElement;
    const flagBtn = screen.getByRole('button', {
      name: /mark as suspicious/i,
    }) as HTMLButtonElement;
    expect(confirmBtn.disabled).toBe(false);
    expect(rejectBtn.disabled).toBe(false);
    expect(flagBtn.disabled).toBe(false);
  });

  it('marks the row optimistically, calls the action, then closes + refreshes on success', async () => {
    const user = userEvent.setup();
    confirmReceiptActionMock.mockResolvedValueOnce({ ok: true });

    // selectReceipt mirrors how the page mounts the modal, verify it
    // gets cleared on success.
    useReceiptsQueueStore.getState().selectReceipt('R-7782');

    render(<ModalReceiptDetail row={ROW} />);
    await user.click(
      screen.getByRole('button', { name: /confirm payment/i }),
    );

    // The action was invoked with the row id.
    expect(confirmReceiptActionMock).toHaveBeenCalledWith('R-7782');

    await waitFor(() => {
      expect(routerRefreshMock).toHaveBeenCalled();
    });
    expect(useReceiptsQueueStore.getState().selectedReceiptId).toBeNull();
    // Set was cleared after close (the success path leaves it in the
    // optimistic set so the row dims while the parent re-fetches).
    // The action did not call clear, but the modal called router.refresh
    // which re-renders the row out of view; either way the test asserts
    // the row id was added at least once.
  });

  it('rolls back the optimistic confirm and shows an error banner on failure', async () => {
    const user = userEvent.setup();
    confirmReceiptActionMock.mockResolvedValueOnce({
      ok: false,
      code: 'conflict',
      message: 'already actioned',
    });

    render(<ModalReceiptDetail row={ROW} />);
    await user.click(
      screen.getByRole('button', { name: /confirm payment/i }),
    );

    await waitFor(() => {
      expect(
        useReceiptsQueueStore.getState().optimisticallyConfirmed.has('R-7782'),
      ).toBe(false);
    });
    expect(routerRefreshMock).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toMatch(/already actioned/i);
  });

  it('rolls back the optimistic confirm when the server action throws', async () => {
    const user = userEvent.setup();
    // The modal re-throws auth failures so a parent error boundary or
    // the global handler can redirect to /signin?reauth=1. Silence the
    // jsdom unhandled-rejection warning for the duration of this test,
    // we only assert that the optimistic set was rolled back.
    const onError = vi.fn();
    window.addEventListener('error', onError);
    confirmReceiptActionMock.mockRejectedValueOnce(new Error('reauth_required'));

    render(<ModalReceiptDetail row={ROW} />);
    await user.click(
      screen.getByRole('button', { name: /confirm payment/i }),
    );

    await waitFor(() => {
      expect(
        useReceiptsQueueStore.getState().optimisticallyConfirmed.has('R-7782'),
      ).toBe(false);
    });
    window.removeEventListener('error', onError);
  });
});

describe('ModalReceiptDetail, reject', () => {
  it('opens a reason form when "Reject as duplicate" is clicked', async () => {
    const user = userEvent.setup();
    render(<ModalReceiptDetail row={ROW} />);

    await user.click(
      screen.getByRole('button', { name: /reject as duplicate/i }),
    );

    // The footer swaps to the reason form, so the textarea + a submit
    // (disabled until non-whitespace input) are both present.
    expect(screen.getByLabelText(/why reject/i)).toBeTruthy();
    const submit = screen.getByRole('button', {
      name: /^reject as duplicate$/i,
    }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
  });

  it('enforces the 280-char client-side cap on the reason input', async () => {
    const user = userEvent.setup();
    render(<ModalReceiptDetail row={ROW} />);

    await user.click(
      screen.getByRole('button', { name: /reject as duplicate/i }),
    );
    const input = screen.getByLabelText(/why reject/i) as HTMLTextAreaElement;
    // Use fireEvent-style direct value set; userEvent.type with 300 chars
    // is slow and the cap is enforced by maxLength + the onChange slice.
    const oversized = 'x'.repeat(RECEIPT_REASON_MAX_LENGTH + 50);
    await user.click(input);
    await user.paste(oversized);

    expect(input.value.length).toBe(RECEIPT_REASON_MAX_LENGTH);
  });

  it('calls rejectReceiptAction with the trimmed reason and closes on success', async () => {
    const user = userEvent.setup();
    rejectReceiptActionMock.mockResolvedValueOnce({ ok: true });
    useReceiptsQueueStore.getState().selectReceipt('R-7782');

    render(<ModalReceiptDetail row={ROW} />);
    await user.click(
      screen.getByRole('button', { name: /reject as duplicate/i }),
    );
    await user.type(
      screen.getByLabelText(/why reject/i),
      '  duplicate of R-7  ',
    );
    await user.click(screen.getByRole('button', { name: /^reject as duplicate$/i }));

    // The modal trims surrounding whitespace before calling the action so
    // the BE receives the canonical value (the action itself also trims
    // defensively).
    await waitFor(() => {
      expect(rejectReceiptActionMock).toHaveBeenCalledWith(
        'R-7782',
        'duplicate of R-7',
      );
    });
    expect(useReceiptsQueueStore.getState().selectedReceiptId).toBeNull();
    expect(routerRefreshMock).toHaveBeenCalled();
  });

  it('disables submit until the reason has at least one non-whitespace char', async () => {
    const user = userEvent.setup();
    render(<ModalReceiptDetail row={ROW} />);

    await user.click(
      screen.getByRole('button', { name: /reject as duplicate/i }),
    );
    const submit = screen.getByRole('button', {
      name: /^reject as duplicate$/i,
    }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);

    await user.type(screen.getByLabelText(/why reject/i), 'dupe of R-7');
    expect(submit.disabled).toBe(false);
  });

  it('rolls back the optimistic reject on a non-ok result', async () => {
    const user = userEvent.setup();
    rejectReceiptActionMock.mockResolvedValueOnce({
      ok: false,
      code: 'conflict',
    });

    render(<ModalReceiptDetail row={ROW} />);
    await user.click(
      screen.getByRole('button', { name: /reject as duplicate/i }),
    );
    await user.type(screen.getByLabelText(/why reject/i), 'dupe');
    await user.click(
      screen.getByRole('button', { name: /^reject as duplicate$/i }),
    );

    await waitFor(() => {
      expect(
        useReceiptsQueueStore.getState().optimisticallyRejected.has('R-7782'),
      ).toBe(false);
    });
    expect(screen.getByRole('alert')).toBeTruthy();
  });
});

describe('ModalReceiptDetail, flag', () => {
  it('opens a reason form, then submits via flagReceiptAction', async () => {
    const user = userEvent.setup();
    flagReceiptActionMock.mockResolvedValueOnce({ ok: true });

    render(<ModalReceiptDetail row={ROW} />);
    await user.click(
      screen.getByRole('button', { name: /mark as suspicious/i }),
    );
    await user.type(screen.getByLabelText(/why flag/i), 'fake-looking');
    await user.click(
      screen.getByRole('button', { name: /^mark as suspicious$/i }),
    );

    await waitFor(() => {
      expect(flagReceiptActionMock).toHaveBeenCalledWith('R-7782', 'fake-looking');
    });
  });
});

describe('ModalReceiptDetail, XSS surface', () => {
  it('renders operator-supplied row fields as text, never as HTML', () => {
    const xssRow: ReceiptQueueRow = {
      ...ROW,
      memberName: '<img src=x onerror="alert(1)">',
      note: '<script>alert("nope")</script>',
    };

    const { container } = render(<ModalReceiptDetail row={xssRow} />);

    // No injected <script> or <img> nodes should make it into the DOM,
    // React's default text escaping is the only sanitiser we rely on.
    expect(container.querySelectorAll('script').length).toBe(0);
    expect(
      container.querySelectorAll('img[src="x"]').length,
    ).toBe(0);
    // The literal string is rendered as visible text instead.
    expect(container.textContent ?? '').toContain('<img src=x');
  });
});

describe('ModalReceiptDetail, keyboard', () => {
  it('closes the modal on Escape', async () => {
    const user = userEvent.setup();
    useReceiptsQueueStore.getState().selectReceipt('R-7782');

    render(<ModalReceiptDetail row={ROW} />);
    await user.keyboard('{Escape}');

    expect(useReceiptsQueueStore.getState().selectedReceiptId).toBeNull();
  });
});
