import { describe, expect, it } from 'vitest';
import { validatePickOrder } from '@/lib/pick-validation';
import {
  createLoginRateLimiter,
  isAllowedMutationOrigin,
  validateAdminConfig,
} from '@/lib/admin-security';
import { POST as submitPicks } from '@/app/api/picks/route';
import { POST as login } from '@/app/api/admin/login/route';
import { GET as getAdminState } from '@/app/api/admin/state/route';
import { getState } from '@/lib/store';

describe('integridad de picks', () => {
  const contestants = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

  it('acepta únicamente una permutación exacta del cast actual', () => {
    expect(validatePickOrder(['c', 'a', 'b'], contestants)).toBe(true);
    expect(validatePickOrder(['a', 'b'], contestants)).toBe(false);
    expect(validatePickOrder(['a', 'b', 'c', 'extra'], contestants)).toBe(false);
    expect(validatePickOrder(['a', 'a', 'c'], contestants)).toBe(false);
    expect(validatePickOrder(['a', 'b', 'extra'], contestants)).toBe(false);
  });

  it('responde 400 y no muta estado ni crea usuario/pick para una lista inválida', async () => {
    const before = JSON.stringify(await getState());
    const response = await submitPicks(new Request('http://localhost/api/picks', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Intruso', email: 'intruso@example.com', orderIds: ['duplicado', 'duplicado'] }),
    }));
    expect(response.status).toBe(400);
    expect(JSON.stringify(await getState())).toBe(before);
  });

  it('responde 400 a JSON inválido en picks', async () => {
    const response = await submitPicks(new Request('http://localhost/api/picks', { method: 'POST', body: '{' }));
    expect(response.status).toBe(400);
  });
});

describe('configuración admin', () => {
  const valid = {
    username: 'melissa',
    password: 'una-clave-unica-de-24!',
    secret: '0123456789abcdef0123456789abcdef',
  };

  it('exige usuario, password >=16 y secreto >=32 bytes', () => {
    expect(validateAdminConfig(valid)).toEqual({ success: true });
    expect(validateAdminConfig({ ...valid, username: '  ' }).success).toBe(false);
    expect(validateAdminConfig({ ...valid, password: 'demasiado-corta' }).success).toBe(false);
    expect(validateAdminConfig({ ...valid, secret: 'short' }).success).toBe(false);
    expect(validateAdminConfig({ ...valid, secret: 'á'.repeat(16) })).toEqual({ success: true });
  });

  it('rechaza placeholders de ejemplo', () => {
    expect(validateAdminConfig({ ...valid, password: 'change-me-use-a-strong-unique-password' }).success).toBe(false);
    expect(validateAdminConfig({ ...valid, secret: 'change-me-use-at-least-32-random-bytes' }).success).toBe(false);
  });
});

describe('defensa de Origin', () => {
  it('permite same-origin y rechaza cross-origin', () => {
    expect(isAllowedMutationOrigin(new Request('https://pool.test/api/admin', { headers: { origin: 'https://pool.test' } }), 'production')).toBe(true);
    expect(isAllowedMutationOrigin(new Request('https://pool.test/api/admin', { headers: { origin: 'https://evil.test' } }), 'production')).toBe(false);
  });

  it('falla cerrado sin Origin en producción y permite tests internos fuera de producción', () => {
    const request = new Request('https://pool.test/api/admin');
    expect(isAllowedMutationOrigin(request, 'production')).toBe(false);
    expect(isAllowedMutationOrigin(request, 'test')).toBe(true);
    expect(isAllowedMutationOrigin(request, 'development')).toBe(true);
  });
});

describe('rate limiting de login', () => {
  it('bloquea el bucket IP+usuario durante la ventana y permite otros buckets', () => {
    const limiter = createLoginRateLimiter({ maxFailures: 3, windowMs: 1_000, blockMs: 2_000 });
    const key = { ip: '203.0.113.1', username: 'Melissa' };
    expect(limiter.isBlocked(key, 0)).toBe(false);
    limiter.recordFailure(key, 0);
    limiter.recordFailure(key, 10);
    limiter.recordFailure(key, 20);
    expect(limiter.isBlocked(key, 21)).toBe(true);
    expect(limiter.isBlocked({ ip: '203.0.113.2', username: 'melissa' }, 21)).toBe(false);
    expect(limiter.isBlocked(key, 2_021)).toBe(false);
  });

  it('reinicia tras un login exitoso y descarta fallos fuera de ventana', () => {
    const limiter = createLoginRateLimiter({ maxFailures: 2, windowMs: 100, blockMs: 500 });
    const key = { ip: 'ip', username: 'user' };
    limiter.recordFailure(key, 0);
    limiter.reset(key);
    limiter.recordFailure(key, 1);
    expect(limiter.isBlocked(key, 2)).toBe(false);
    limiter.recordFailure(key, 200);
    expect(limiter.isBlocked(key, 201)).toBe(false);
  });
});

describe('respuestas privadas', () => {
  it('login con JSON inválido devuelve 400 genérico y no-store/private', async () => {
    const response = await login(new Request('http://localhost/api/admin/login', { method: 'POST', body: '{' }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Usuario o contraseña incorrectos.' });
    expect(response.headers.get('cache-control')).toBe('no-store, private');
  });

  it('incluye no-store/private y Vary Cookie también en 401 admin', async () => {
    const response = await getAdminState(new Request('http://localhost/api/admin/state'));
    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('no-store, private');
    expect(response.headers.get('vary')).toContain('Cookie');
  });
});
