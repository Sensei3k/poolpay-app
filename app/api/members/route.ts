import { NextResponse } from 'next/server';
import { MOCK_MEMBERS } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json(MOCK_MEMBERS);
}
