import { createHmac, timingSafeEqual } from 'crypto';
import { validateAdminConfig } from './admin-security';

export const ADMIN_SESSION_COOKIE = 'quiniela_admin_session';
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

export type AdminConfig = { username: string; password: string; secret: string };

type SessionPayload = { username: string; expiresAt: number };

export function getAdminConfig(): AdminConfig {
  return {
    username: process.env.ADMIN_USERNAME || '',
    password: process.env.ADMIN_PASSWORD || '',
    secret: process.env.ADMIN_SESSION_SECRET || '',
  };
}

function safeEqual(left: string, right: string) {
  const leftDigest = createHmac('sha256', 'credential-comparison').update(left).digest();
  const rightDigest = createHmac('sha256', 'credential-comparison').update(right).digest();
  return timingSafeEqual(leftDigest, rightDigest);
}

function sign(encodedPayload: string, secret: string) {
  return createHmac('sha256', secret).update(encodedPayload).digest('base64url');
}

export function createAdminSession(
  username: string,
  password: string,
  config = getAdminConfig(),
  now = new Date(),
) {
  if (!validateAdminConfig(config).success) return null;
  if (!safeEqual(username, config.username) || !safeEqual(password, config.password)) return null;
  const payload: SessionPayload = {
    username: config.username,
    expiresAt: Math.floor(now.getTime() / 1000) + ADMIN_SESSION_MAX_AGE_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded, config.secret)}`;
}

export function verifyAdminSession(
  token: string | null | undefined,
  config = getAdminConfig(),
  now = new Date(),
) {
  if (!token || !validateAdminConfig(config).success) return false;
  const [encoded, signature, extra] = token.split('.');
  if (!encoded || !signature || extra) return false;
  const expected = sign(encoded, config.secret);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    return payload.username === config.username && Number.isInteger(payload.expiresAt) && payload.expiresAt > Math.floor(now.getTime() / 1000);
  } catch {
    return false;
  }
}

export function getSessionFromRequest(req: Request) {
  const cookie = req.headers.get('cookie') || '';
  const value = cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  return value ? decodeURIComponent(value.slice(ADMIN_SESSION_COOKIE.length + 1)) : null;
}

export function isAdminRequest(req: Request) {
  return verifyAdminSession(getSessionFromRequest(req));
}
