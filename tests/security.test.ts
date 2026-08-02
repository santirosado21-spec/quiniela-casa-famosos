import { describe, expect, it } from 'vitest';
import { createAdminSession, verifyAdminSession } from '@/lib/admin-session';
import { sanitizePublicState } from '@/lib/public-state';
import { getTokenSpecificState } from '@/lib/token-state';
import type { PoolState } from '@/lib/store';

const state: PoolState = {
  contestants: [
    { id: 'a', name: 'Ana', handle: '@ana', photo_url: '/a.jpg', bio: 'A', color: '#fff' },
    { id: 'b', name: 'Beto', handle: '@beto', photo_url: '/b.jpg', bio: 'B', color: '#000' },
  ],
  users: [
    { id: 'u1', name: 'Uno', email: 'uno@example.com', token: 'token-uno', created_at: '2026-01-01' },
    { id: 'u2', name: 'Dos', email: 'dos@example.com', token: 'token-dos', created_at: '2026-01-02' },
  ],
  picks: [
    { user_id: 'u1', order_ids: ['b', 'a'], submitted_at: '2026-01-03' },
    { user_id: 'u2', order_ids: ['a', 'b'], submitted_at: '2026-01-04' },
  ],
  eliminations: [{ contestant_id: 'a', position: 1, eliminated_at: '2026-01-05' }],
};

describe('estado público', () => {
  it('no expone order_ids, correos, tokens ni señales del orden futuro', () => {
    const publicState = sanitizePublicState(state);
    const json = JSON.stringify(publicState);
    expect(json).not.toContain('order_ids');
    expect(json).not.toContain('example.com');
    expect(json).not.toContain('token-');
    expect(json).not.toContain('nextRiskName');
    expect(JSON.stringify(publicState.leaderboard)).not.toContain('Beto');
  });

  it('conserva un leaderboard útil, calculado y sanitizado', () => {
    const publicState = sanitizePublicState(state);
    expect(publicState.leaderboard.rows).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'u1', name: 'Uno', score: 88, exact: 0, submitted: true }),
      expect.objectContaining({ id: 'u2', name: 'Dos', score: 125, exact: 1, submitted: true }),
    ]));
    expect(publicState.leaderboard.totalUsers).toBe(2);
    expect(publicState.leaderboard.totalPicks).toBe(2);
  });

  it('no muta el estado original', () => {
    const before = JSON.stringify(state);
    sanitizePublicState(state);
    getTokenSpecificState(state, 'token-uno');
    expect(JSON.stringify(state)).toBe(before);
  });
});

describe('sesión admin firmada', () => {
  const config = { username: 'melissa', password: 'correcta-y-muy-segura', secret: 'un-secreto-de-sesion-muy-largo-y-seguro' };
  const now = new Date('2026-01-01T00:00:00Z');

  it('acepta credenciales correctas y una sesión vigente', () => {
    const token = createAdminSession('melissa', 'correcta-y-muy-segura', config, now);
    expect(token).toBeTruthy();
    expect(verifyAdminSession(token!, config, new Date('2026-01-01T01:00:00Z'))).toBe(true);
  });

  it('rechaza credenciales inválidas, firmas alteradas y secretos ausentes', () => {
    expect(createAdminSession('melissa', 'incorrecta', config, now)).toBeNull();
    const token = createAdminSession('melissa', 'correcta-y-muy-segura', config, now)!;
    expect(verifyAdminSession(`${token}x`, config, now)).toBe(false);
    expect(verifyAdminSession(token, { ...config, secret: '' }, now)).toBe(false);
  });

  it('rechaza una sesión expirada', () => {
    const token = createAdminSession('melissa', 'correcta-y-muy-segura', config, now)!;
    expect(verifyAdminSession(token, config, new Date('2026-01-02T00:00:01Z'))).toBe(false);
  });
});

describe('acceso por token', () => {
  it('devuelve solo el usuario y picks correspondientes al token', () => {
    const own = getTokenSpecificState(state, 'token-uno');
    expect(own?.user).toMatchObject({ id: 'u1', name: 'Uno' });
    expect(own?.pick?.order_ids).toEqual(['b', 'a']);
    expect(JSON.stringify(own)).not.toContain('u2');
    expect(JSON.stringify(own)).not.toContain('dos@example.com');
    expect(JSON.stringify(own)).not.toContain('token-dos');
  });

  it('no entrega estado para un token desconocido', () => {
    expect(getTokenSpecificState(state, 'desconocido')).toBeNull();
  });
});
