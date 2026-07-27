'use client';

import { useEffect, useMemo, useState } from 'react';
import { Trophy, Sparkles, Crown } from 'lucide-react';

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

function Photo({ contestant, className }: { contestant: Contestant; className?: string }) {
  return <img src={contestant.photo_url} alt={contestant.name} className={className} loading="lazy" onError={(e) => { e.currentTarget.src = `https://placehold.co/600x750/15102f/f5c96d?text=${encodeURIComponent(contestant.name)}`; }} />;
}

export default function Home() {
  const [state, setState] = useState<State | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/state').then(r => r.json()).then(setState).finally(() => setLoading(false));
  }, []);

  const leaderboard = useMemo(() => {
    if (!state) return [];
    return state.users
      .map(u => {
        const pick = state.picks.find(p => p.user_id === u.id);
        return { user: u, pick, score: scorePick(pick?.order_ids || [], state.eliminations) };
      })
      .sort((a, b) => b.score - a.score || a.user.name.localeCompare(b.user.name));
  }, [state]);

  if (loading) return <main className="grid min-h-screen place-items-center px-5"><div className="spotlight rounded-3xl p-8 text-center font-bold">Cargando quiniela...</div></main>;
  if (!state) return null;

  return <main>
    <section className="mobile-shell mx-auto max-w-7xl px-5 pb-8 pt-5 sm:pt-8 md:py-14">
      <nav className="mb-7 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-yellow-300 text-slate-950 shadow-[0_0_28px_rgba(245,201,109,.42)]"><Crown /></div>
          <div>
            <p className="show-kicker text-[10px] text-cyan-200 sm:text-xs">Quiniela privada</p>
            <h1 className="show-title text-2xl gold-gradient sm:text-3xl">La Casa de los Famosos</h1>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
          <a className="rounded-full border border-white/20 px-4 py-3 text-center text-sm font-bold hover:bg-white/10" href="/admin">Admin</a>
          <a className="rounded-full bg-yellow-300 px-4 py-3 text-center text-sm font-black text-slate-950" href="#leaderboard">Ranking</a>
        </div>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1.02fr_.98fr] lg:items-center">
        <div>
          <p className="mb-4 inline-flex items-center rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-bold text-pink-100 sm:text-sm"><Sparkles className="mr-2 size-4"/> Links únicos · picks bloqueados</p>
          <h2 className="show-title max-w-4xl text-[3.35rem] gold-gradient sm:text-8xl md:text-9xl">Predice la eliminación completa</h2>
          <p className="mt-5 max-w-2xl text-sm font-medium leading-6 text-violet-100/82 sm:text-lg sm:leading-8">Acomoda a todos los habitantes una sola vez. El admin actualiza las eliminaciones reales y el ranking se recalcula en vivo.</p>
        </div>
        <div className="spotlight hidden rounded-[1.75rem] p-3 neon-ring sm:block sm:p-5">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {state.contestants.slice(0, 9).map(c => <div key={c.id} className="contestant-card overflow-hidden rounded-2xl bg-white/8">
              <Photo contestant={c} className="aspect-[4/5] w-full object-cover" />
              <p className="relative z-10 -mt-8 truncate px-2 pb-2 pt-3 text-center text-[10px] font-black text-white drop-shadow sm:text-xs">{c.name}</p>
            </div>)}
          </div>
        </div>
      </div>
    </section>

    <section className="mobile-shell mx-auto max-w-7xl px-5 py-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="show-title text-5xl gold-gradient sm:text-6xl">Habitantes</h2>
        <p className="hidden text-sm text-violet-100/60 sm:block">Fotos públicas del sitio oficial</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        {state.contestants.map(c => <article key={c.id} className="spotlight overflow-hidden rounded-3xl">
          <Photo contestant={c} className="aspect-[3/4] w-full object-cover" />
          <div className="p-3 sm:p-4">
            <h3 className="text-sm font-black leading-tight text-white sm:text-base">{c.name}</h3>
            <p className="mt-1 text-[11px] font-semibold text-cyan-100 sm:text-xs">{c.handle}</p>
            <p className="mt-2 hidden text-sm text-violet-100/70 sm:block">{c.bio}</p>
          </div>
        </article>)}
      </div>
    </section>

    <section id="leaderboard" className="mobile-shell mx-auto max-w-5xl px-5 py-12 sm:py-16">
      <div className="mb-5 flex items-center gap-3"><Trophy className="text-yellow-300"/><h2 className="show-title text-5xl gold-gradient sm:text-6xl">Leaderboard</h2></div>
      <div className="spotlight overflow-hidden rounded-[1.75rem]">
        {leaderboard.length ? leaderboard.map((row, i) => <div key={row.user.id} className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4 last:border-0 sm:px-5">
          <div className="min-w-0"><p className="truncate font-black">#{i + 1} {row.user.name}</p><p className="text-xs text-violet-100/60 sm:text-sm">{row.pick ? 'Picks enviados y bloqueados' : 'Sin picks todavía'}</p></div>
          <div className="shrink-0 text-right"><p className="text-2xl font-black text-yellow-300">{row.score}</p><p className="text-[10px] uppercase tracking-widest text-violet-100/50">pts</p></div>
        </div>) : <p className="p-8 text-violet-100/70">Crea usuarios en el admin para empezar.</p>}
      </div>
    </section>

    <footer className="mobile-shell mx-auto max-w-7xl px-5 py-10 text-xs leading-6 text-violet-100/50 sm:text-sm">Quiniela privada no oficial. Eliminaciones actualizadas manualmente por admin. Scoring: 125 pts por posición exacta; -12 pts por cada lugar de diferencia.</footer>
  </main>;
}
