import { NextResponse } from 'next/server';

const BASE = process.env.BACKEND_URL ?? 'http://localhost:8080';

// Dev-only endpoint — proxies to the Rust backend's reset handler,
// which clears and reseeds the SurrealDB payment table to fixture state.
// Used by E2E tests to guarantee a clean, deterministic starting state.
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const res = await fetch(`${BASE}/api/test/reset`, { method: 'POST' });
  if (!res.ok) {
    return NextResponse.json({ error: 'Backend reset failed' }, { status: res.status });
  }

  return NextResponse.json({ ok: true });
}
