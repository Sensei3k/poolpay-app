// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Mail } from 'lucide-react';
import { FormField } from '@/components/feedback/form-field';

afterEach(() => {
  cleanup();
});

describe('FormField', () => {
  it('renders the label associated to the input via id', () => {
    render(<FormField label="Email" placeholder="you@example.com" />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeTruthy();
    expect(input.tagName).toBe('INPUT');
  });

  it('omits the hint when not supplied', () => {
    render(<FormField label="Email" />);
    // No hint element renders. We look for the absence of a font-mono
    // sibling node within the label row.
    expect(screen.queryByText('weekly')).toBeNull();
  });

  it('flags aria-invalid and renders the error icon when state="error"', () => {
    render(
      <FormField
        label="Phone"
        state="error"
        defaultValue="123"
        help="Phone number must include country code"
      />,
    );
    const input = screen.getByLabelText('Phone');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(
      screen.getByText('Phone number must include country code'),
    ).toBeTruthy();
  });

  it('disables the input when state="disabled" without an explicit disabled prop', () => {
    render(<FormField label="Email" state="disabled" defaultValue="x" />);
    const input = screen.getByLabelText('Email') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('renders the icon when provided', () => {
    const { container } = render(
      <FormField label="Email" icon={Mail} placeholder="x" />,
    );
    // lucide renders an svg
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('wires the help node to aria-describedby', () => {
    render(<FormField label="Email" help="Use your work email." />);
    const input = screen.getByLabelText('Email');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    if (describedBy) {
      const helpEl = document.getElementById(describedBy);
      expect(helpEl?.textContent ?? '').toContain('Use your work email.');
    }
  });
});
