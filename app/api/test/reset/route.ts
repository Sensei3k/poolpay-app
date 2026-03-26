import { NextResponse } from 'next/server';
import { MOCK_PAYMENTS } from '@/lib/mock-data';

const g = globalThis as typeof globalThis & { __circlePayments?: unknown[] };

// Dev-only endpoint — resets in-memory payment store to fixture data.
// Used by E2E tests to guarantee a clean, deterministic starting state.
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }
  g.__circlePayments = [...MOCK_PAYMENTS];
  return NextResponse.json({ ok: true, count: MOCK_PAYMENTS.length });
}
