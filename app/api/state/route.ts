import { NextResponse } from 'next/server';
import { getState } from '@/lib/store';
import { sanitizePublicState } from '@/lib/public-state';

export async function GET() {
  const response = NextResponse.json(sanitizePublicState(await getState()));
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
