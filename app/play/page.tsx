'use client';

import { useEffect, useMemo, useState } from 'react';
import { GripVertical, Lock, Mail, UserRound } from 'lucide-react';

type Contestant = { id: string; name: string; handle: string; photo_url: string; bio: string };
type User = { id: string; name: string; email?: string; token: string };
type Pick = { user_id: string; order_ids: string[] };
type State = { contestants: Contestant[]; users: User[]; picks: Pick[] };

function Photo({ contestant, className }: { contestant: Contestant; className?: string }) {
  return <img src={contestant.photo_url} alt={contestant.name} className={className} loading="lazy" onError={(e) => { e.currentTarget.src = `https://placehold.co/300x300/15102f/f5c96d?text=${encodeURIComponent(contestant.name)}`; }} />;
}

const inputShell = 'flex min-h-12 items-center gap-2.5 rounded-2xl border border-white/15 bg-black/30 px-3 py-2.5 shadow-inner shadow-black/20 focus-within:border-yellow-200/70 sm:px-4';
const inputClass = 'min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-violet-100/35 sm:text-base';
const MONEY_POOL_URL = 'https://www.moneypool.mx/p/uL12NXA';

export default function PlayPage() {
  const [state, setState] = useState<State | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');

  const load = () => fetch('/api/state').then(r => r.json()).then((s) => {
    setState(s);
    setOrder((prev) => prev.length ? prev : s.contestants.map((c: Contestant) => c.id));
  });

  useEffect(() => { load(); }, []);

  const contestants = useMemo(() => state?.contestants ?? [], [state]);
  const normalizedEmail = email.trim().toLowerCase();
  const user = state?.users.find(u => u.email?.toLowerCase() === normalizedEmail);
  const existing = user ? state?.picks.find(p => p.user_id === user.id) : undefined;
  const displayOrder = existing?.order_ids || order;
  const ordered = displayOrder.map(id => contestants.find(c => c.id === id)).filter(Boolean) as Contestant[];

  function move(i: number, dir: -1 | 1) {
    if (existing) return;
    const next = [...order];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
  }

  async function submit() {
    setSaving(true); setMsg('');
    const res = await fetch('/api/picks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, orderIds: order }),
    });
    const data = await res.json();
    setSubmittedEmail(res.ok ? email.trim() : '');
    setMsg(res.ok ? 'Quiniela enviada. Ahora paga tu entrada en Money Pool para quedar confirmado.' : data.error);
    await load();
    setSaving(false);
  }

  const hasContactInfo = name.trim().length >= 2 && /\S+@\S+\.\S+/.test(email);
  const canSubmit = hasContactInfo && order.length === contestants.length && !existing;

  if (!state) return <main className="grid min-h-screen place-items-center px-5">Cargando...</main>;

  return <main className="mobile-shell safe-bottom mx-auto max-w-4xl px-4 py-4 sm:px-5 sm:py-8">
    <a href="/" className="text-sm font-bold text-cyan-200">← Ver dashboard</a>

    <section className="mt-4 spotlight rounded-[1.5rem] p-4 sm:mt-6 sm:rounded-[1.75rem] sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[.95fr_1.05fr] lg:items-end">
        <div>
          <p className="show-kicker text-[10px] text-yellow-200 sm:text-xs">Participa</p>
          <h1 className="show-title mt-1 text-5xl gold-gradient sm:text-7xl">Registra tus picks</h1>
          <p className="mt-2 text-xs leading-5 text-violet-100/75 sm:text-sm"><b>#1 es quien crees que sale primero.</b> El último número (#{contestants.length || 18}) es quien crees que gana la temporada. Se envía una sola vez por correo.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <label className={inputShell}><UserRound className="h-4 w-4 shrink-0 text-yellow-200 sm:h-5 sm:w-5"/><input value={name} onChange={e=>setName(e.target.value)} placeholder="Tu nombre" className={inputClass} /></label>
          <label className={inputShell}><Mail className="h-4 w-4 shrink-0 text-yellow-200 sm:h-5 sm:w-5"/><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@correo.com" type="email" className={inputClass} /></label>
        </div>
      </div>
      {existing && <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-400/10 p-3 text-xs font-bold text-emerald-100 sm:text-sm"><Lock className="h-4 w-4"/> Este correo ya envió picks. Abajo puedes verlos bloqueados.</div>}
      <div className="mt-4 rounded-2xl border border-yellow-300/25 bg-yellow-300/10 p-3 sm:p-4">
        <p className="text-xs font-black uppercase tracking-[.2em] text-yellow-100">Pago Money Pool</p>
        <p className="mt-2 text-xs leading-5 text-violet-100/75 sm:text-sm sm:leading-6">El link de pago queda siempre disponible para que puedas pagar tu entrada cuando quieras.</p>
        <a href={MONEY_POOL_URL} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex w-full justify-center rounded-2xl bg-yellow-300 px-5 py-3 text-sm font-black text-slate-950 sm:w-auto">
          Pagar en Money Pool
        </a>
      </div>
      {submittedEmail && !existing && <p className="mt-2 text-xs text-violet-100/60">Último correo usado: {submittedEmail}</p>}
    </section>

    <section className="mt-4 grid gap-2 sm:mt-6 sm:gap-2.5">
      <div className="rounded-2xl border border-white/10 bg-white/[.045] p-3 text-xs font-bold leading-5 text-violet-100/75 sm:text-sm">
        Ordena la lista así: <b>#1 = primer eliminado</b> · <b>#{contestants.length || 18} = ganador/a</b>.
      </div>
      {ordered.map((c, i) => <div key={c.id} className="spotlight flex items-center gap-2 rounded-2xl p-2 sm:gap-3 sm:p-2.5">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-yellow-300 text-xs font-black text-slate-950 sm:h-9 sm:w-9 sm:rounded-xl sm:text-sm">{i + 1}</div>
        <Photo contestant={c} className="h-10 w-10 shrink-0 rounded-lg object-cover sm:h-12 sm:w-12 sm:rounded-xl" />
        <div className="min-w-0 flex-1"><h2 className="truncate text-sm font-black sm:text-base">{c.name}</h2><p className="truncate text-[11px] text-violet-100/60 sm:text-xs">{c.handle}</p></div>
        {!existing && <div className="flex shrink-0 items-center gap-1">
          <button aria-label={`Subir a ${c.name}`} onClick={() => move(i,-1)} className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/5 text-sm font-black active:scale-95 disabled:opacity-30 sm:h-10 sm:w-10" disabled={i === 0}>↑</button>
          <button aria-label={`Bajar a ${c.name}`} onClick={() => move(i,1)} className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/5 text-sm font-black active:scale-95 disabled:opacity-30 sm:h-10 sm:w-10" disabled={i === ordered.length - 1}>↓</button>
          <GripVertical className="hidden text-white/30 sm:block"/>
        </div>}
      </div>)}
    </section>

    {!existing && <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-[#070613]/88 p-3 shadow-[0_-14px_40px_rgba(7,6,19,.5)] sm:bg-transparent sm:p-0 sm:shadow-none">
      <button disabled={saving || !canSubmit} onClick={submit} className="w-full rounded-2xl bg-yellow-300 px-6 py-3.5 font-black text-slate-950 shadow-[0_0_30px_rgba(245,201,109,.25)] disabled:opacity-50">{saving ? 'Guardando...' : 'Enviar quiniela y bloquear'}</button>
      {!canSubmit && <p className="mt-2 text-center text-xs text-violet-100/60">Completa nombre y correo válido para enviar.</p>}
    </div>}
    {msg && <div className="mt-4 rounded-3xl border border-emerald-300/25 bg-emerald-300/10 p-4 text-center">
      <p className="text-sm font-black text-emerald-100">{msg}</p>
      {submittedEmail && <>
        <p className="mt-2 text-xs leading-5 text-violet-100/75 sm:text-sm">Siguiente paso: abre Money Pool y paga tu entrada.</p>
        <a href={MONEY_POOL_URL} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex w-full justify-center rounded-2xl bg-yellow-300 px-5 py-3 text-sm font-black text-slate-950 sm:w-auto">
          Abrir Money Pool
        </a>
      </>}
    </div>}
  </main>;
}
