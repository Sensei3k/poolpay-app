import { NextResponse } from 'next/server';
import { getPayments } from '@/lib/store';

export async function GET() {
  return NextResponse.json(getPayments());
}
