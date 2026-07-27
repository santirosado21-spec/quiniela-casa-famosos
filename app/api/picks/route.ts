import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomBytes, randomUUID } from 'crypto';
import { updateState } from '@/lib/store';

const schema = z.object({
  token: z.string().min(6).optional(),
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  orderIds: z.array(z.string()).min(2),
}).refine((value) => value.token || (value.name && value.email), {
  message: 'Ingresa nombre y correo para guardar tu quiniela.',
});

const cleanEmail = (email: string) => email.trim().toLowerCase();

export async function POST(req: Request) {
  const body = schema.parse(await req.json());
  let result: { error?: string; user?: { id: string; name: string; email?: string; token: string } } = {};

  await updateState((state) => {
    let user = body.token
      ? state.users.find((u) => u.token === body.token)
      : state.users.find((u) => u.email && u.email === cleanEmail(body.email!));

    if (body.token && !user) {
      result = { error: 'Link inválido.' };
      return state;
    }

    if (!user && body.name && body.email) {
      user = {
        id: randomUUID(),
        name: body.name.trim(),
        email: cleanEmail(body.email),
        token: randomBytes(9).toString('base64url'),
        created_at: new Date().toISOString(),
      };
      state.users.push(user);
    }

    if (!user) {
      result = { error: 'No se pudo crear tu usuario.' };
      return state;
    }

    if (body.name && body.email) {
      user.name = body.name.trim();
      user.email = cleanEmail(body.email);
    }

    if (state.picks.some((p) => p.user_id === user!.id)) {
      result = { error: 'Esta quiniela ya fue enviada y está bloqueada.', user };
      return state;
    }

    state.picks.push({ user_id: user.id, order_ids: body.orderIds, submitted_at: new Date().toISOString() });
    result = { user };
    return state;
  }, 'data: submit picks');

  if (result.error) return NextResponse.json(result, { status: result.error.includes('bloqueada') ? 409 : 404 });
  return NextResponse.json({ ok: true, user: result.user });
}
