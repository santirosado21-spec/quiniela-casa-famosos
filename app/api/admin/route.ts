import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomBytes, randomUUID } from 'crypto';
import { updateState } from '@/lib/store';
import { contestants } from '@/lib/contestants';

function isAdmin(req: Request) {
  return Boolean(process.env.ADMIN_PASSWORD && req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD);
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const body = await req.json();
  if (body.action === 'seedContestants') {
    await updateState((state) => { state.contestants = contestants; return state; }, 'data: seed contestants');
    return NextResponse.json({ ok: true });
  }
  if (body.action === 'createUser') {
    const { name } = z.object({ name: z.string().min(2) }).parse(body);
    const user = { id: randomUUID(), name, token: randomBytes(9).toString('base64url'), created_at: new Date().toISOString() };
    await updateState((state) => { state.users.push(user); return state; }, `data: create user ${name}`);
    return NextResponse.json({ user });
  }
  if (body.action === 'setElimination') {
    const parsed = z.object({ contestantId: z.string(), position: z.number().int().positive() }).parse(body);
    await updateState((state) => {
      state.eliminations = state.eliminations.filter((e) => e.contestant_id !== parsed.contestantId && e.position !== parsed.position);
      state.eliminations.push({ contestant_id: parsed.contestantId, position: parsed.position, eliminated_at: new Date().toISOString() });
      state.eliminations.sort((a, b) => a.position - b.position);
      return state;
    }, `data: set elimination ${parsed.position}`);
    return NextResponse.json({ ok: true });
  }
  if (body.action === 'resetEliminations') {
    await updateState((state) => { state.eliminations = []; return state; }, 'data: reset eliminations');
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Acción desconocida' }, { status: 400 });
}
