import { describe, expect, it } from 'vitest';
import { generateTempPassword } from '@/lib/super-admin/generate-temp-password';

/** Deterministic byte source, fills the buffer with a fixed pattern. */
function makeDeterministicSource(seed: number) {
  return {
    getRandomValues<T extends ArrayBufferView | null>(buffer: T): T {
      if (!buffer) return buffer;
      const bytes = new Uint8Array(
        buffer.buffer,
        buffer.byteOffset,
        buffer.byteLength,
      );
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = (seed + i) & 0xff;
      }
      return buffer;
    },
  };
}

describe('generateTempPassword', () => {
  it('produces a 16-character password by default', () => {
    const pw = generateTempPassword();
    expect(pw).toHaveLength(16);
  });

  it('honors an explicit length when provided', () => {
    const pw = generateTempPassword({ length: 24 });
    expect(pw).toHaveLength(24);
  });

  it('enforces a 12-character floor', () => {
    const pw = generateTempPassword({ length: 4 });
    expect(pw.length).toBeGreaterThanOrEqual(12);
  });

  it('throws when no random source is available', () => {
    expect(() =>
      generateTempPassword({
        // @ts-expect-error testing the runtime guard
        randomSource: null,
      }),
    ).toThrow(/no Web Crypto/);
  });

  it('throws rather than silently using Math.random when getRandomValues is missing', () => {
    expect(() =>
      generateTempPassword({
        // @ts-expect-error intentionally passing a broken source
        randomSource: { foo: 'bar' },
      }),
    ).toThrow(/no Web Crypto/);
  });

  it('is deterministic given a deterministic random source', () => {
    const pw1 = generateTempPassword({ randomSource: makeDeterministicSource(7) });
    const pw2 = generateTempPassword({ randomSource: makeDeterministicSource(7) });
    expect(pw1).toBe(pw2);
  });

  it('avoids ambiguous characters (l, I, O, 0, 1)', () => {
    // Run 100 trials so we're not relying on the deterministic
    // source's particular alphabet slot, the alphabet itself excludes
    // these characters, so no draw can produce them.
    for (let i = 0; i < 100; i++) {
      const pw = generateTempPassword();
      expect(pw).not.toMatch(/[lIO01]/);
    }
  });

  it('emits only characters from the documented alphabet', () => {
    const allowed = /^[a-zA-Z0-9!*\-+]+$/;
    const pw = generateTempPassword();
    expect(pw).toMatch(allowed);
  });
});
