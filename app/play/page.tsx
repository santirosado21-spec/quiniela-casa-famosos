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
    setSubmittedEmail(email.trim());
    setMsg(res.ok ? 'Quiniela enviada. Tus picks quedaron bloqueados con este correo.' : data.error);
    await load();
    setSaving(false);
  }

  const canSubmit = name.trim().length >= 2 && /\S+@\S+\.\S+/.test(email) && order.length === contestants.length && !existing;

  if (!state) return <main className="grid min-h-screen place-items-center px-5">Cargando...</main>;

  return <main className="mobile-shell safe-bottom mx-auto max-w-5xl px-4 py-5 sm:px-5 sm:py-10">
    <a href="/" className="text-sm font-bold text-cyan-200">← Ver leaderboard</a>

    <section className="mt-5 spotlight rounded-[1.75rem] p-5 sm:mt-8 sm:p-8">
      <p className="show-kicker text-[10px] text-yellow-200 sm:text-sm">Participa</p>
      <h1 className="show-title mt-2 text-6xl gold-gradient sm:text-8xl">Registra tus picks</h1>
      <p className="mt-4 text-sm leading-6 text-violet-100/78 sm:text-base">Entra con tu nombre y correo, ordena a los habitantes de <b>primer eliminado</b> a <b>ganador/a</b> y envía una sola vez.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-3 rounded-2xl border border-white/15 bg-black/30 px-4 py-3"><UserRound className="size-5 text-yellow-200"/><input value={name} onChange={e=>setName(e.target.value)} placeholder="Tu nombre" className="min-w-0 flex-1 bg-transparent outline-none" /></label>
        <label className="flex items-center gap-3 rounded-2xl border border-white/15 bg-black/30 px-4 py-3"><Mail className="size-5 text-yellow-200"/><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@correo.com" type="email" className="min-w-0 flex-1 bg-transparent outline-none" /></label>
      </div>
      {existing && <div className="mt-5 flex items-center gap-2 rounded-2xl bg-emerald-400/10 p-4 text-sm font-bold text-emerald-100"><Lock className="size-5"/> Este correo ya envió picks. Abajo puedes verlos bloqueados.</div>}
      {submittedEmail && !existing && <p className="mt-3 text-xs text-violet-100/60">Último correo usado: {submittedEmail}</p>}
    </section>

    <section className="mt-5 grid gap-3 sm:mt-8">
      {ordered.map((c, i) => <div key={c.id} className="spotlight flex items-center gap-3 rounded-2xl p-2.5 sm:gap-4 sm:p-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-yellow-300 text-sm font-black text-slate-950 sm:size-10">{i + 1}</div>
        <Photo contestant={c} className="size-14 shrink-0 rounded-xl object-cover sm:size-16" />
        <div className="min-w-0 flex-1"><h2 className="truncate text-sm font-black sm:text-base">{c.name}</h2><p className="truncate text-xs text-violet-100/60 sm:text-sm">{c.handle}</p></div>
        {!existing && <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button aria-label={`Subir a ${c.name}`} onClick={() => move(i,-1)} className="grid size-10 place-items-center rounded-xl border border-white/15 bg-white/5 font-black active:scale-95 disabled:opacity-30" disabled={i === 0}>↑</button>
          <button aria-label={`Bajar a ${c.name}`} onClick={() => move(i,1)} className="grid size-10 place-items-center rounded-xl border border-white/15 bg-white/5 font-black active:scale-95 disabled:opacity-30" disabled={i === ordered.length - 1}>↓</button>
          <GripVertical className="hidden text-white/30 sm:block"/>
        </div>}
      </div>)}
    </section>

    {!existing && <div className="sticky bottom-0 -mx-4 mt-4 bg-gradient-to-t from-[#070613] via-[#070613]/95 to-transparent px-4 pb-3 pt-5 sm:static sm:mx-0 sm:bg-none sm:p-0">
      <button disabled={saving || !canSubmit} onClick={submit} className="w-full rounded-2xl bg-yellow-300 px-6 py-4 font-black text-slate-950 shadow-[0_0_30px_rgba(245,201,109,.25)] disabled:opacity-50">{saving ? 'Guardando...' : 'Enviar quiniela y bloquear'}</button>
      {!canSubmit && <p className="mt-2 text-center text-xs text-violet-100/60">Completa nombre y correo válido para enviar.</p>}
    </div>}
    {msg && <p className="mt-4 text-center text-sm font-bold text-cyan-100">{msg}</p>}
  </main>;
}
