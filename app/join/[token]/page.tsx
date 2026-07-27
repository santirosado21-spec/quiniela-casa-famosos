'use client';
import { useEffect, useMemo, useState } from 'react';
import { Lock, GripVertical } from 'lucide-react';

type Contestant = { id: string; name: string; handle: string; photo_url: string; bio: string };
type User = { id: string; name: string; token: string };
type Pick = { user_id: string; order_ids: string[] };
type State = { contestants: Contestant[]; users: User[]; picks: Pick[] };

export default function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState('');
  const [state, setState] = useState<State | null>(null);
  const [order, setOrder] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  useEffect(() => { params.then(p => setToken(p.token)); }, [params]);
  useEffect(() => { fetch('/api/state').then(r => r.json()).then((s) => { setState(s); setOrder(s.contestants.map((c: Contestant) => c.id)); }); }, []);
  const user = state?.users.find(u => u.token === token);
  const existing = user ? state?.picks.find(p => p.user_id === user.id) : undefined;
  const contestants = useMemo(() => state?.contestants ?? [], [state]);
  const ordered = order.map(id => contestants.find(c => c.id === id)).filter(Boolean) as Contestant[];
  function move(i: number, dir: -1 | 1) { const next = [...order]; const j = i + dir; if (j < 0 || j >= next.length) return; [next[i], next[j]] = [next[j], next[i]]; setOrder(next); }
  async function submit() { setSaving(true); setMsg(''); const res = await fetch('/api/picks', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ token, orderIds: order })}); const data = await res.json(); setMsg(res.ok ? 'Quiniela enviada. Tus picks quedaron bloqueados.' : data.error); setSaving(false); }
  if (!state) return <main className="grid min-h-screen place-items-center">Cargando...</main>;
  if (!user) return <main className="grid min-h-screen place-items-center px-5"><div className="spotlight max-w-lg rounded-3xl p-8 text-center"><h1 className="text-3xl font-black">Link inválido</h1><p className="mt-3 text-violet-100/70">Pide al admin que te genere un link único.</p></div></main>;
  const lockedOrder = existing?.order_ids ? existing.order_ids.map(id => contestants.find(c => c.id === id)).filter(Boolean) as Contestant[] : [];
  return <main className="mx-auto max-w-5xl px-5 py-10"><a href="/" className="text-sm text-cyan-200">← Ver leaderboard</a><div className="mt-8 spotlight rounded-[2rem] p-6 md:p-8"><p className="text-sm uppercase tracking-[.28em] text-yellow-200">Link privado</p><h1 className="mt-2 text-4xl font-black md:text-6xl">Hola, {user.name}</h1><p className="mt-4 text-violet-100/70">Ordena de <b>primer eliminado</b> a <b>ganador/a</b>. Solo puedes enviar una vez.</p>{existing && <div className="mt-5 flex items-center gap-2 rounded-2xl bg-emerald-400/10 p-4 text-emerald-100"><Lock className="size-5"/> Tus picks ya están bloqueados.</div>}</div>
  <div className="mt-8 grid gap-3">{(existing ? lockedOrder : ordered).map((c,i) => <div key={c.id} className="spotlight flex items-center gap-4 rounded-2xl p-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-yellow-300 font-black text-slate-950">{i+1}</div><img src={c.photo_url} alt={c.name} className="size-16 rounded-xl object-cover"/><div className="min-w-0 flex-1"><h2 className="font-black">{c.name}</h2><p className="truncate text-sm text-violet-100/60">{c.handle}</p></div>{!existing && <div className="flex gap-2"><button aria-label={`Subir a ${c.name}`} onClick={() => move(i,-1)} className="rounded-xl border border-white/15 px-3 py-2">↑</button><button aria-label={`Bajar a ${c.name}`} onClick={() => move(i,1)} className="rounded-xl border border-white/15 px-3 py-2">↓</button><GripVertical className="mt-2 text-white/30"/></div>}</div>)}</div>
  {!existing && <button disabled={saving} onClick={submit} className="mt-6 w-full rounded-2xl bg-yellow-300 px-6 py-4 font-black text-slate-950 disabled:opacity-60">{saving ? 'Enviando...' : 'Enviar quiniela y bloquear'}</button>}{msg && <p className="mt-4 text-center text-cyan-100">{msg}</p>}</main>;
}
