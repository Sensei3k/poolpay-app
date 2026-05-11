import { NextResponse } from 'next/server';

const BASE = process.env.BACKEND_URL ?? 'http://localhost:8080';

export async function GET() {
  const res = await fetch(`${BASE}/api/members`, { cache: 'no-store' });
  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: res.status });
  }
  return NextResponse.json(await res.json());
}
