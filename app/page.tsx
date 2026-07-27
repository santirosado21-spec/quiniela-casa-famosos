'use client';

import { useEffect, useMemo, useState } from 'react';
import { Trophy, Lock, Sparkles, Crown, Copy } from 'lucide-react';

type Contestant = { id: string; name: string; handle: string; photo_url: string; bio: string; color: string };
type User = { id: string; name: string; token: string };
type Pick = { user_id: string; order_ids: string[]; submitted_at: string };
type Elim = { contestant_id: string; position: number };

type State = { contestants: Contestant[]; users: User[]; picks: Pick[]; eliminations: Elim[] };

function scorePick(order: string[], actual: Elim[]) {
  const byId = new Map(order.map((id, i) => [id, i + 1]));
  return actual.reduce((total, e) => {
    const predicted = byId.get(e.contestant_id);
    if (!predicted) return total;
    const diff = Math.abs(predicted - e.position);
    return total + Math.max(0, 100 - diff * 12) + (diff === 0 ? 25 : 0);
  }, 0);
}

export default function Home() {
  const [state, setState] = useState<State | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch('/api/state').then(r => r.json()).then(setState).finally(() => setLoading(false)); }, []);
  const leaderboard = useMemo(() => {
    if (!state) return [];
    return state.users.map(u => ({ user: u, pick: state.picks.find(p => p.user_id === u.id), score: scorePick(state.picks.find(p => p.user_id === u.id)?.order_ids || [], state.eliminations) }))
      .sort((a,b) => b.score - a.score || a.user.name.localeCompare(b.user.name));
  }, [state]);
  if (loading) return <main className="min-h-screen grid place-items-center"><div className="spotlight rounded-3xl p-8">Cargando quiniela...</div></main>;
  if (!state) return null;
  return <main>
    <section className="mx-auto max-w-7xl px-5 py-10 md:py-16">
      <nav className="mb-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-yellow-300 text-slate-950"><Crown /></div><div><p className="text-xs uppercase tracking-[.32em] text-cyan-200">Fantasy pool</p><h1 className="text-xl font-black">La Casa de los Famosos</h1></div></div>
        <div className="flex gap-3"><a className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10" href="/admin">Admin</a><a className="rounded-full bg-yellow-300 px-4 py-2 text-sm font-bold text-slate-950" href="#leaderboard">Leaderboard</a></div>
      </nav>
      <div className="grid gap-8 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
        <div><p className="mb-4 inline-flex rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-sm text-pink-100"><Sparkles className="mr-2 size-4"/> Quiniela privada con links únicos</p><h2 className="max-w-4xl text-5xl font-black tracking-tight md:text-7xl">Predice el orden completo de eliminación.</h2><p className="mt-6 max-w-2xl text-lg leading-8 text-violet-100/80">Cada participante entra con su link, acomoda a todos los habitantes una sola vez y queda bloqueado. El admin actualiza eliminaciones reales manualmente y el ranking se recalcula en vivo.</p></div>
        <div className="spotlight rounded-[2rem] p-5 neon-ring"><div className="grid grid-cols-3 gap-3">{state.contestants.slice(0,9).map(c => <div key={c.id} className="overflow-hidden rounded-2xl bg-white/8"><img src={c.photo_url} alt={c.name} className="aspect-[4/5] w-full object-cover"/><p className="truncate px-2 py-2 text-center text-xs font-bold">{c.name}</p></div>)}</div></div>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-8"><h2 className="mb-6 text-3xl font-black">Habitantes investigados</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{state.contestants.map(c => <article key={c.id} className="spotlight overflow-hidden rounded-3xl"><img src={c.photo_url} alt={c.name} className="aspect-[4/5] w-full object-cover"/><div className="p-4"><h3 className="font-black">{c.name}</h3><p className="text-sm text-cyan-100/70">{c.handle}</p><p className="mt-3 text-sm text-violet-100/70">{c.bio}</p></div></article>)}</div></section>
    <section id="leaderboard" className="mx-auto max-w-5xl px-5 py-16"><div className="mb-6 flex items-center gap-3"><Trophy className="text-yellow-300"/><h2 className="text-4xl font-black">Leaderboard en vivo</h2></div><div className="spotlight overflow-hidden rounded-[2rem]">{leaderboard.length ? leaderboard.map((row,i) => <div key={row.user.id} className="flex items-center justify-between border-b border-white/10 px-5 py-4 last:border-0"><div><p className="font-black">#{i+1} {row.user.name}</p><p className="text-sm text-violet-100/60">{row.pick ? 'Picks enviados y bloqueados' : 'Sin picks todavía'}</p></div><div className="text-right"><p className="text-2xl font-black text-yellow-300">{row.score}</p><p className="text-xs uppercase tracking-widest text-violet-100/50">pts</p></div></div>) : <p className="p-8 text-violet-100/70">Crea usuarios en el admin para empezar.</p>}</div></section>
    <footer className="mx-auto max-w-7xl px-5 py-10 text-sm text-violet-100/50">Sin API oficial del show. Eliminaciones actualizadas manualmente por admin. Scoring: 125 pts por posición exacta; -12 pts por cada lugar de diferencia.</footer>
  </main>;
}
