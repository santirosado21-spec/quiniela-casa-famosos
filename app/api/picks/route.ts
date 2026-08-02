import { randomBytes, randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validatePickOrder } from '@/lib/pick-validation';
import { updateState } from '@/lib/store';

const schema = z.object({
  token: z.string().min(6).optional(),
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().email().optional(),
  orderIds: z.array(z.string()),
}).refine((value) => value.token || (value.name && value.email), {
  message: 'Ingresa nombre y correo para guardar tu quiniela.',
});

const cleanEmail = (email: string) => email.trim().toLowerCase();

class PickRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

function json(body: unknown, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set('Cache-Control', 'no-store, private');
  return response;
}

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: 'Solicitud inválida.' }, 400);
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return json({ error: 'Solicitud inválida.' }, 400);
  const body = parsed.data;

  try {
    await updateState((state) => {
      // This check runs on the same cloned snapshot that would be persisted. Throwing
      // aborts updateState before any write, user creation, or pick mutation.
      if (!validatePickOrder(body.orderIds, state.contestants)) {
        throw new PickRequestError('La quiniela debe incluir exactamente una vez a cada integrante.', 400);
      }

      let user = body.token
        ? state.users.find((candidate) => candidate.token === body.token)
        : state.users.find((candidate) => candidate.email && cleanEmail(candidate.email) === cleanEmail(body.email!));

      if (body.token && !user) throw new PickRequestError('Link inválido.', 404);
      if (user && state.picks.some((pick) => pick.user_id === user!.id)) {
        throw new PickRequestError(
          body.token ? 'Esta quiniela ya fue enviada y está bloqueada.' : 'No se pudo guardar la quiniela.',
          409,
        );
      }

      if (!user && body.name && body.email) {
        user = {
          id: randomUUID(),
          name: body.name,
          email: cleanEmail(body.email),
          token: randomBytes(9).toString('base64url'),
          created_at: new Date().toISOString(),
        };
        state.users.push(user);
      }
      if (!user) throw new PickRequestError('No se pudo guardar la quiniela.', 400);

      if (body.name && body.email) {
        user.name = body.name;
        user.email = cleanEmail(body.email);
      }
      state.picks.push({ user_id: user.id, order_ids: [...body.orderIds], submitted_at: new Date().toISOString() });
      return state;
    }, 'data: submit picks');
  } catch (error) {
    if (error instanceof PickRequestError) return json({ error: error.message }, error.status);
    throw error;
  }

  return json({ ok: true });
}
