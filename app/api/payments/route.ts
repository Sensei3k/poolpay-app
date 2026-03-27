import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BASE = process.env.BACKEND_URL ?? 'http://localhost:8080';

export async function GET(request: NextRequest) {
  const cycleId = request.nextUrl.searchParams.get('cycleId');
  const url = cycleId
    ? `${BASE}/api/payments?cycleId=${cycleId}`
    : `${BASE}/api/payments`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: res.status });
  }
  return NextResponse.json(await res.json());
}
