// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalDestructiveConfirm } from '@/components/admin/modal-destructive-confirm';

afterEach(() => {
  cleanup();
});

function renderModal(overrides: Partial<
  React.ComponentProps<typeof ModalDestructiveConfirm>
> = {}) {
  return render(
    <ModalDestructiveConfirm
      open
      onClose={overrides.onClose ?? (() => undefined)}
      onConfirm={overrides.onConfirm ?? (() => undefined)}
      title={overrides.title ?? 'Remove Tola from Lagos Rent Q2?'}
      sub={overrides.sub ?? 'They have outstanding contributions.'}
      confirmPhrase={overrides.confirmPhrase}
      cta={overrides.cta}
      pending={overrides.pending}
    />,
  );
}

describe('ModalDestructiveConfirm', () => {
  it('keeps the destructive CTA disabled until the phrase matches', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderModal({ onConfirm });
    const cta = screen.getByRole('button', { name: 'Remove member' });
    expect(cta.hasAttribute('disabled')).toBe(true);

    const input = screen.getByLabelText('Type REMOVE to confirm');
    await user.type(input, 'remove');
    expect(cta.hasAttribute('disabled')).toBe(true);

    await user.clear(input);
    await user.type(input, 'REMOVE');
    expect(cta.hasAttribute('disabled')).toBe(false);

    await user.click(cta);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('honors a custom confirm phrase and CTA label', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderModal({
      confirmPhrase: 'DELETE-POOL',
      cta: 'Archive pool',
      onConfirm,
    });
    const cta = screen.getByRole('button', { name: 'Archive pool' });
    expect(cta.hasAttribute('disabled')).toBe(true);
    await user.type(screen.getByLabelText('Type DELETE-POOL to confirm'), 'DELETE-POOL');
    expect(cta.hasAttribute('disabled')).toBe(false);
  });

  it('clears the typed phrase when cancelled', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({ onClose });
    const input = screen.getByLabelText('Type REMOVE to confirm');
    await user.type(input, 'REMOVE');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('keeps the CTA disabled while pending even when phrase matches', async () => {
    const user = userEvent.setup();
    renderModal({ pending: true });
    const cta = screen.getByRole('button', { name: 'Working…' });
    expect(cta.hasAttribute('disabled')).toBe(true);
    await user.type(screen.getByLabelText('Type REMOVE to confirm'), 'REMOVE');
    expect(cta.hasAttribute('disabled')).toBe(true);
  });
});
