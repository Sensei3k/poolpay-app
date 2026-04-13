import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BASE = process.env.BACKEND_URL ?? 'http://localhost:8080';

export async function GET(request: NextRequest) {
  const params = new URLSearchParams();
  const groupId = request.nextUrl.searchParams.get('groupId');
  const cycleId = request.nextUrl.searchParams.get('cycleId');
  if (groupId) params.set('groupId', groupId);
  if (cycleId) params.set('cycleId', cycleId);
  const query = params.toString();
  const url = query ? `${BASE}/api/payments?${query}` : `${BASE}/api/payments`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: res.status });
  }
  return NextResponse.json(await res.json());
}
