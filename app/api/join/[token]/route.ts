import { NextResponse } from 'next/server';
import { getState } from '@/lib/store';
import { getTokenSpecificState } from '@/lib/token-state';

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const state = getTokenSpecificState(await getState(), token);
  if (!state) {
    const response = NextResponse.json({ error: 'Link inválido.' }, { status: 404 });
    response.headers.set('Cache-Control', 'no-store, private');
    return response;
  }
  const response = NextResponse.json(state);
  response.headers.set('Cache-Control', 'no-store, private');
  return response;
}