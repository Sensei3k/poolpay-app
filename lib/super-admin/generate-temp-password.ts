/**
 * Cryptographically-strong temp-password generator for the
 * super-admin → admin create-then-grant flow.
 *
 * Runs in the browser (the add-admin modal is a client component). We
 * use `crypto.getRandomValues` rather than `Math.random` because the
 * generated password is sent verbatim to the new admin via the
 * one-time reveal panel, anything biased or predictable here means
 * the operator hands over a guessable initial credential.
 *
 * Alphabet design:
 *  - 25 lowercase (no l) + 24 uppercase (no I, O) + 8 digits (no 0, 1)
 *    + 4 symbols (! * - +) = 61 symbols total.
 *  - Excludes characters that look alike in monospace (l/1/I, 0/O).
 *  - Excludes symbols that get URL-encoded or quoted oddly in WhatsApp /
 *    SMS / Signal (% @ # & ?). Operators dictate these over voice in a
 *    pinch, so clarity beats entropy density.
 *
 * 16 characters from a 61-symbol alphabet gives log2(61^16) ≈ 94.94 bits.
 * Well past the 80-bit floor we want for an initial-rotation credential
 * that lives for at most a few minutes before the new admin must rotate
 * it on first sign-in (BE-8 PR 2 enforces `must_reset_password = true`).
 */

const LOWER = 'abcdefghijkmnopqrstuvwxyz'; // no l
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I, O
const DIGITS = '23456789'; // no 0, 1
const SYMBOLS = '!*-+';
const ALPHABET = LOWER + UPPER + DIGITS + SYMBOLS;

const DEFAULT_LENGTH = 16;

interface GenerateOptions {
  /** Override the password length. Floor of 12 enforced. */
  length?: number;
  /**
   * Injected source of randomness, production passes `globalThis.crypto`,
   * tests pass a stub. Kept narrow (just `getRandomValues`) so we don't
   * leak the broader `SubtleCrypto` surface into callers.
   */
  randomSource?: Pick<Crypto, 'getRandomValues'>;
}

/**
 * Generate a temporary password.
 *
 * Throws when no random source is available, a fallback to
 * `Math.random` would be catastrophic for credential issuance and
 * silently shipping it via the new admin would be worse than the
 * caller seeing a thrown error and degrading the UI.
 */
export function generateTempPassword(options: GenerateOptions = {}): string {
  const length = Math.max(options.length ?? DEFAULT_LENGTH, 12);
  // When `randomSource` is explicitly present in options we honor what
  // the caller passed (even if it's `null` or a busted stub) so tests
  // can drive the "no Web Crypto" guard. The fall-through to
  // `globalThis.crypto` only kicks in when the key was not provided.
  const source =
    'randomSource' in options ? options.randomSource : globalThis.crypto;
  if (!source || typeof source.getRandomValues !== 'function') {
    throw new Error(
      'generateTempPassword: no Web Crypto available; refusing to fall back to Math.random',
    );
  }

  // Read more bytes than we need so we can reject biased values by
  // rejection sampling, the alphabet length (62) does not evenly
  // divide 256, so a naive `byte % 62` would over-represent the first
  // few characters. The threshold is the largest multiple of
  // `ALPHABET.length` that fits in a byte; any draw above it is
  // discarded and re-rolled.
  const threshold = 256 - (256 % ALPHABET.length);
  const out: string[] = [];
  // Worst-case extra reads are rare; size the buffer at 2× length to
  // amortise the rejection-sample loop into a single round-trip the
  // vast majority of the time.
  const buffer = new Uint8Array(length * 2);

  while (out.length < length) {
    source.getRandomValues(buffer);
    for (let i = 0; i < buffer.length && out.length < length; i++) {
      const byte = buffer[i];
      if (byte < threshold) {
        out.push(ALPHABET[byte % ALPHABET.length]);
      }
    }
  }

  return out.join('');
}
