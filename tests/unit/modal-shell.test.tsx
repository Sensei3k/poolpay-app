// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalShell } from '@/components/feedback/modal-shell';

afterEach(() => {
  cleanup();
});

describe('ModalShell', () => {
  it('renders nothing when open is false', () => {
    const { container } = render(
      <ModalShell open={false} onClose={() => undefined} title="Hidden">
        <p>Body</p>
      </ModalShell>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders title and dialog role when open', () => {
    render(
      <ModalShell open onClose={() => undefined} title="Confirm something">
        <p>Body</p>
      </ModalShell>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(
      screen.getByRole('heading', { name: 'Confirm something' }),
    ).toBeTruthy();
  });

  it('fires onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <ModalShell open onClose={onClose} title="x">
        <p>Body</p>
      </ModalShell>,
    );
    await user.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('fires onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(
      <ModalShell open onClose={onClose} title="x">
        <p>Body</p>
      </ModalShell>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not attach the escape listener when closed', () => {
    const onClose = vi.fn();
    render(
      <ModalShell open={false} onClose={onClose} title="x">
        <p>Body</p>
      </ModalShell>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders the footer slots when supplied', () => {
    render(
      <ModalShell
        open
        onClose={() => undefined}
        title="x"
        footerLeft={<span>left-slot</span>}
        footerRight={<button type="button">Confirm</button>}
      >
        <p>Body</p>
      </ModalShell>,
    );
    expect(screen.getByText('left-slot')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeTruthy();
  });
});
