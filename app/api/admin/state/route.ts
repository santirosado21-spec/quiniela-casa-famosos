import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-session';
import { getState } from '@/lib/store';
import { applyAdminResponseHeaders } from '@/lib/admin-security';

export async function GET(req: Request) {
  if (!isAdminRequest(req)) return applyAdminResponseHeaders(NextResponse.json({ error: 'No autorizado.' }, { status: 401 }));
  return applyAdminResponseHeaders(NextResponse.json(await getState()));
}