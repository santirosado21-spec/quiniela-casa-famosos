import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE_SECONDS, createAdminSession } from '@/lib/admin-session';
import {
  adminLoginLimiter,
  applyAdminResponseHeaders,
  getRequestIp,
  isAllowedMutationOrigin,
} from '@/lib/admin-security';

const credentialsSchema = z.object({ username: z.string(), password: z.string() });
const INVALID_CREDENTIALS = 'Usuario o contraseña incorrectos.';

function json(body: unknown, status = 200) {
  return applyAdminResponseHeaders(NextResponse.json(body, { status }));
}

export async function POST(req: Request) {
  if (!isAllowedMutationOrigin(req)) return json({ error: 'Solicitud no permitida.' }, 403);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: INVALID_CREDENTIALS }, 400);
  }
  const parsed = credentialsSchema.safeParse(raw);
  if (!parsed.success) return json({ error: INVALID_CREDENTIALS }, 400);

  const key = { ip: getRequestIp(req), username: parsed.data.username };
  if (adminLoginLimiter.isBlocked(key)) return json({ error: INVALID_CREDENTIALS }, 429);

  const session = createAdminSession(parsed.data.username, parsed.data.password);
  if (!session) {
    adminLoginLimiter.recordFailure(key);
    return json({ error: INVALID_CREDENTIALS }, 401);
  }
  adminLoginLimiter.reset(key);

  const response = json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
