import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-session';
import { applyAdminResponseHeaders, isAllowedMutationOrigin } from '@/lib/admin-security';

export async function POST(req: Request) {
  if (!isAllowedMutationOrigin(req)) {
    return applyAdminResponseHeaders(NextResponse.json({ error: 'Solicitud no permitida.' }, { status: 403 }));
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  return applyAdminResponseHeaders(response);
}