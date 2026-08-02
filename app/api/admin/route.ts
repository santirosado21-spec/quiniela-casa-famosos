import { randomBytes, randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdminRequest } from '@/lib/admin-session';
import { applyAdminResponseHeaders, isAllowedMutationOrigin } from '@/lib/admin-security';
import { contestants } from '@/lib/contestants';
import { updateState } from '@/lib/store';

function json(body: unknown, status = 200) {
  return applyAdminResponseHeaders(NextResponse.json(body, { status }));
}

export async function POST(req: Request) {
  if (!isAllowedMutationOrigin(req)) return json({ error: 'Solicitud no permitida.' }, 403);
  if (!isAdminRequest(req)) return json({ error: 'No autorizado.' }, 401);

  let body: Record<string, unknown>;
  try {
    const parsed = z.record(z.string(), z.unknown()).safeParse(await req.json());
    if (!parsed.success) return json({ error: 'Solicitud inválida.' }, 400);
    body = parsed.data;
  } catch {
    return json({ error: 'Solicitud inválida.' }, 400);
  }

  if (body.action === 'seedContestants') {
    await updateState((state) => { state.contestants = contestants; return state; }, 'data: seed contestants');
    return json({ ok: true });
  }
  if (body.action === 'createUser') {
    const parsed = z.object({ name: z.string().trim().min(2) }).safeParse(body);
    if (!parsed.success) return json({ error: 'Solicitud inválida.' }, 400);
    const { name } = parsed.data;
    const user = { id: randomUUID(), name, token: randomBytes(9).toString('base64url'), created_at: new Date().toISOString() };
    await updateState((state) => { state.users.push(user); return state; }, `data: create user ${name}`);
    return json({ user });
  }
  if (body.action === 'setElimination') {
    const parsed = z.object({ contestantId: z.string(), position: z.number().int().positive() }).safeParse(body);
    if (!parsed.success) return json({ error: 'Solicitud inválida.' }, 400);
    await updateState((state) => {
      state.eliminations = state.eliminations.filter((entry) => entry.contestant_id !== parsed.data.contestantId && entry.position !== parsed.data.position);
      state.eliminations.push({ contestant_id: parsed.data.contestantId, position: parsed.data.position, eliminated_at: new Date().toISOString() });
      state.eliminations.sort((a, b) => a.position - b.position);
      return state;
    }, `data: set elimination ${parsed.data.position}`);
    return json({ ok: true });
  }
  if (body.action === 'recordSundayElimination') {
    const parsed = z.object({ contestantId: z.string() }).safeParse(body);
    if (!parsed.success) return json({ error: 'Solicitud inválida.' }, 400);
    await updateState((state) => {
      if (!state.contestants.some((contestant) => contestant.id === parsed.data.contestantId)) return state;
      if (state.eliminations.some((entry) => entry.contestant_id === parsed.data.contestantId)) return state;
      const nextPosition = Math.max(0, ...state.eliminations.map((entry) => entry.position)) + 1;
      state.eliminations = state.eliminations.filter((entry) => entry.position !== nextPosition);
      state.eliminations.push({ contestant_id: parsed.data.contestantId, position: nextPosition, eliminated_at: new Date().toISOString() });
      state.eliminations.sort((a, b) => a.position - b.position);
      return state;
    }, 'data: record sunday elimination');
    return json({ ok: true });
  }
  if (body.action === 'resetEliminations') {
    await updateState((state) => { state.eliminations = []; return state; }, 'data: reset eliminations');
    return json({ ok: true });
  }
  return json({ error: 'Acción desconocida' }, 400);
}
