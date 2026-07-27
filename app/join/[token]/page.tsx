'use client';
import { useEffect, useMemo, useState } from 'react';
import { Lock, GripVertical } from 'lucide-react';

type Contestant = { id: string; name: string; handle: string; photo_url: string; bio: string };
type User = { id: string; name: string; token: string };
type Pick = { user_id: string; order_ids: string[] };
type State = { contestants: Contestant[]; users: User[]; picks: Pick[] };

function Photo({ contestant, className }: { contestant: Contestant; className?: string }) {
  return <img src={contestant.photo_url} alt={contestant.name} className={className} loading="lazy" onError={(e) => { e.currentTarget.src = `https://placehold.co/300x300/15102f/f5c96d?text=${encodeURIComponent(contestant.name)}`; }} />;
}

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

  function move(i: number, dir: -1 | 1) {
    const next = [...order];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
  }

  async function submit() {
    setSaving(true); setMsg('');
    const res = await fetch('/api/picks', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ token, orderIds: order })});
    const data = await res.json();
    setMsg(res.ok ? 'Quiniela enviada. Tus picks quedaron bloqueados.' : data.error);
    setSaving(false);
  }

  if (!state) return <main className="grid min-h-screen place-items-center px-5">Cargando...</main>;
  if (!user) return <main className="grid min-h-screen place-items-center px-5"><div className="spotlight max-w-lg rounded-3xl p-8 text-center"><h1 className="show-title text-5xl gold-gradient">Link inválido</h1><p className="mt-3 text-violet-100/70">Pide al admin que te genere un link único.</p></div></main>;

  const lockedOrder = existing?.order_ids ? existing.order_ids.map(id => contestants.find(c => c.id === id)).filter(Boolean) as Contestant[] : [];
  const list = existing ? lockedOrder : ordered;

  return <main className="mobile-shell safe-bottom mx-auto max-w-5xl px-4 py-5 sm:px-5 sm:py-10">
    <a href="/" className="text-sm font-bold text-cyan-200">← Ver leaderboard</a>
    <div className="mt-5 spotlight rounded-[1.75rem] p-5 sm:mt-8 sm:p-8">
      <p className="show-kicker text-[10px] text-yellow-200 sm:text-sm">Link privado</p>
      <h1 className="show-title mt-2 text-6xl gold-gradient sm:text-8xl">Hola, {user.name}</h1>
      <p className="mt-4 text-sm leading-6 text-violet-100/78 sm:text-base">Ordena de <b>primer eliminado</b> a <b>ganador/a</b>. En móvil usa los botones ↑ ↓. Solo puedes enviar una vez.</p>
      {existing && <div className="mt-5 flex items-center gap-2 rounded-2xl bg-emerald-400/10 p-4 text-sm font-bold text-emerald-100"><Lock className="size-5"/> Tus picks ya están bloqueados.</div>}
    </div>

    <div className="mt-5 grid gap-3 sm:mt-8">
      {list.map((c, i) => <div key={c.id} className="spotlight flex items-center gap-3 rounded-2xl p-2.5 sm:gap-4 sm:p-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-yellow-300 text-sm font-black text-slate-950 sm:size-10">{i + 1}</div>
        <Photo contestant={c} className="size-14 shrink-0 rounded-xl object-cover sm:size-16" />
        <div className="min-w-0 flex-1"><h2 className="truncate text-sm font-black sm:text-base">{c.name}</h2><p className="truncate text-xs text-violet-100/60 sm:text-sm">{c.handle}</p></div>
        {!existing && <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button aria-label={`Subir a ${c.name}`} onClick={() => move(i,-1)} className="grid size-10 place-items-center rounded-xl border border-white/15 bg-white/5 font-black active:scale-95 disabled:opacity-30" disabled={i === 0}>↑</button>
          <button aria-label={`Bajar a ${c.name}`} onClick={() => move(i,1)} className="grid size-10 place-items-center rounded-xl border border-white/15 bg-white/5 font-black active:scale-95 disabled:opacity-30" disabled={i === list.length - 1}>↓</button>
          <GripVertical className="hidden text-white/30 sm:block"/>
        </div>}
      </div>)}
    </div>

    {!existing && <div className="sticky bottom-0 -mx-4 mt-4 bg-gradient-to-t from-[#070613] via-[#070613]/95 to-transparent px-4 pb-3 pt-5 sm:static sm:mx-0 sm:bg-none sm:p-0">
      <button disabled={saving} onClick={submit} className="w-full rounded-2xl bg-yellow-300 px-6 py-4 font-black text-slate-950 shadow-[0_0_30px_rgba(245,201,109,.25)] disabled:opacity-60">{saving ? 'Enviando...' : 'Enviar quiniela y bloquear'}</button>
    </div>}
    {msg && <p className="mt-4 text-center text-sm font-bold text-cyan-100">{msg}</p>}
  </main>;
}
