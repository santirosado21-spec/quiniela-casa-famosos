import type { AdminConfig } from './admin-session';

const PLACEHOLDER = /(change[-_ ]?me|replace[-_ ]?me|your[-_ ]|example|placeholder)/i;

export type AdminConfigValidation = { success: true } | { success: false; error: string };

export function validateAdminConfig(config: AdminConfig): AdminConfigValidation {
  if (!config.username.trim()) return { success: false, error: 'ADMIN_USERNAME no puede estar vacío.' };
  if (config.password.length < 16) return { success: false, error: 'ADMIN_PASSWORD debe tener al menos 16 caracteres.' };
  if (Buffer.byteLength(config.secret, 'utf8') < 32) return { success: false, error: 'ADMIN_SESSION_SECRET debe tener al menos 32 bytes.' };
  if (PLACEHOLDER.test(config.password) || PLACEHOLDER.test(config.secret)) {
    return { success: false, error: 'La configuración admin contiene placeholders inseguros.' };
  }
  return { success: true };
}

export function isAllowedMutationOrigin(request: Request, environment = process.env.NODE_ENV) {
  const origin = request.headers.get('origin');
  if (!origin) return environment !== 'production';
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function applyAdminResponseHeaders<T extends Response>(response: T, varyCookie = true): T {
  response.headers.set('Cache-Control', 'no-store, private');
  if (varyCookie) response.headers.append('Vary', 'Cookie');
  return response;
}

export function getRequestIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || 'unknown';
}

type LoginKey = { ip: string; username: string };
type RateOptions = { maxFailures: number; windowMs: number; blockMs: number };
type Bucket = { failures: number[]; blockedUntil: number };

export function createLoginRateLimiter(options: RateOptions) {
  const buckets = new Map<string, Bucket>();
  const bucketKey = ({ ip, username }: LoginKey) => `${ip}\n${username.trim().toLowerCase()}`;

  function current(key: LoginKey, now: number) {
    const id = bucketKey(key);
    const bucket = buckets.get(id) || { failures: [], blockedUntil: 0 };
    bucket.failures = bucket.failures.filter((timestamp) => timestamp > now - options.windowMs);
    if (bucket.blockedUntil <= now) bucket.blockedUntil = 0;
    if (!bucket.failures.length && !bucket.blockedUntil) buckets.delete(id);
    else buckets.set(id, bucket);
    return { id, bucket };
  }

  return {
    isBlocked(key: LoginKey, now = Date.now()) {
      return current(key, now).bucket.blockedUntil > now;
    },
    recordFailure(key: LoginKey, now = Date.now()) {
      const { id, bucket } = current(key, now);
      bucket.failures.push(now);
      if (bucket.failures.length >= options.maxFailures) bucket.blockedUntil = now + options.blockMs;
      buckets.set(id, bucket);
    },
    reset(key: LoginKey) {
      buckets.delete(bucketKey(key));
    },
  };
}

// Best-effort additional defense for a warm serverless instance; not a distributed guarantee.
export const adminLoginLimiter = createLoginRateLimiter({
  maxFailures: 5,
  windowMs: 15 * 60 * 1_000,
  blockMs: 15 * 60 * 1_000,
});
