import { NextResponse } from 'next/server';
import { MOCK_CYCLES } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json(MOCK_CYCLES);
}
