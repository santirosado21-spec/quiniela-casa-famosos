import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateState } from '@/lib/store';

const schema = z.object({ token: z.string().min(6), orderIds: z.array(z.string()).min(2) });

export async function POST(req: Request) {
  const body = schema.parse(await req.json());
  let result: { error?: string } = {};
  await updateState((state) => {
    const user = state.users.find((u) => u.token === body.token);
    if (!user) { result = { error: 'Link inválido.' }; return state; }
    if (state.picks.some((p) => p.user_id === user.id)) { result = { error: 'Esta quiniela ya fue enviada y está bloqueada.' }; return state; }
    state.picks.push({ user_id: user.id, order_ids: body.orderIds, submitted_at: new Date().toISOString() });
    return state;
  }, 'data: submit picks');
  if (result.error) return NextResponse.json(result, { status: result.error.includes('bloqueada') ? 409 : 404 });
  return NextResponse.json({ ok: true });
}
