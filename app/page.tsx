'use client';

import { useEffect, useMemo, useState } from 'react';
import { Trophy, Sparkles, Crown, Activity, Skull, TrendingDown, TrendingUp } from 'lucide-react';
import { buildLeaderboard } from '@/lib/scoring';

type Contestant = { id: string; name: string; handle: string; photo_url: string; bio: string; color: string };
type User = { id: string; name: string; email?: string; token: string };
type Pick = { user_id: string; order_ids: string[]; submitted_at: string };
type Elim = { contestant_id: string; position: number; eliminated_at?: string };
type State = { contestants: Contestant[]; users: User[]; picks: Pick[]; eliminations: Elim[] };

function Photo({ contestant, className }: { contestant: Contestant; className?: string }) {
  return <img src={contestant.photo_url} alt={contestant.name} className={className} loading="lazy" onError={(e) => { e.currentTarget.src = `https://placehold.co/600x750/15102f/f5c96d?text=${encodeURIComponent(contestant.name)}`; }} />;
}

function Metric({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof Trophy }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4 shadow-inner shadow-white/5">
    <div className="mb-4 grid h-9 w-9 place-items-center rounded-xl bg-yellow-300/15 text-yellow-200"><Icon className="h-4 w-4" /></div>
    <p className="truncate text-2xl font-black text-white">{value}</p>
    <p className="mt-1 text-[10px] font-bold uppercase tracking-[.22em] text-violet-100/45">{label}</p>
  </div>;
}

export default function Home() {
  const [state, setState] = useState<State | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/state').then(r => r.json()).then(setState).finally(() => setLoading(false));
  }, []);

  const dashboard = useMemo(() => state ? buildLeaderboard(state) : null, [state]);
  const contestantById = useMemo(() => new Map((state?.contestants || []).map(c => [c.id, c])), [state]);

  if (loading) return <main className="grid min-h-screen place-items-center px-5"><div className="spotlight rounded-3xl p-8 text-center font-bold">Cargando quiniela...</div></main>;
  if (!state || !dashboard) return null;

  const latest = dashboard.latestElimination ? contestantById.get(dashboard.latestElimination.contestant_id) : null;

  return <main>
    <section className="mobile-shell mx-auto max-w-7xl px-5 pb-8 pt-5 sm:pt-8 md:py-14">
      <nav className="mb-7 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-yellow-300 text-slate-950 shadow-[0_0_28px_rgba(245,201,109,.42)]"><Crown /></div>
          <div>
            <p className="show-kicker text-[10px] text-cyan-200 sm:text-xs">Quiniela privada</p>
            <h1 className="show-title text-2xl gold-gradient sm:text-3xl">La Casa de los Famosos</h1>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
          <a className="rounded-full bg-yellow-300 px-4 py-3 text-center text-sm font-black text-slate-950" href="/play">Participar</a>
          <a className="rounded-full border border-white/20 px-4 py-3 text-center text-sm font-bold hover:bg-white/10" href="/admin">Admin</a>
          <a className="rounded-full border border-yellow-300/50 px-4 py-3 text-center text-sm font-black text-yellow-100" href="#dashboard">Dashboard</a>
        </div>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
        <div>
          <p className="mb-4 inline-flex items-center rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-bold text-pink-100 sm:text-sm"><Sparkles className="mr-2 h-4 w-4"/> Login con nombre y correo · dashboard automático</p>
          <h2 className="show-title max-w-4xl text-[3.35rem] gold-gradient sm:text-8xl md:text-9xl">Predice la eliminación completa</h2>
          <p className="mt-5 max-w-2xl text-sm font-medium leading-6 text-violet-100/82 sm:text-lg sm:leading-8">Cada domingo el admin registra quién salió y la quiniela recalcula en vivo quién va ganando, quién va perdiendo y qué picks se están acercando.</p>
          <a href="/play" className="mt-6 inline-flex rounded-2xl bg-yellow-300 px-6 py-4 text-sm font-black text-slate-950 shadow-[0_0_30px_rgba(245,201,109,.25)]">Hacer mi quiniela</a>
        </div>
        <div className="spotlight rounded-[1.75rem] p-4 neon-ring sm:p-5">
          <div className="mb-4 grid grid-cols-2 gap-3">
            <Metric icon={TrendingUp} value={dashboard.winners[0]?.user.name || '—'} label="Va ganando" />
            <Metric icon={TrendingDown} value={dashboard.losers[0]?.user.name || '—'} label="Va perdiendo" />
            <Metric icon={Activity} value={`${dashboard.totalPicks}/${dashboard.totalUsers}`} label="Picks enviados" />
            <Metric icon={Skull} value={dashboard.totalEliminations} label="Eliminados" />
          </div>
          {latest ? <div className="flex items-center gap-3 rounded-2xl border border-pink-300/20 bg-pink-300/10 p-3"><Photo contestant={latest} className="h-12 w-12 rounded-xl object-cover"/><div><p className="show-kicker text-[10px] text-pink-100">Última eliminación</p><p className="font-black">#{dashboard.latestElimination?.position} {latest.name}</p></div></div> : <div className="rounded-2xl border border-white/10 bg-white/[.045] p-4 text-sm text-violet-100/65">Aún no hay eliminados. El ranking empezará a moverse el primer domingo.</div>}
        </div>
      </div>
    </section>

    <section id="dashboard" className="mobile-shell mx-auto max-w-7xl px-5 py-8">
      <div className="mb-5 flex items-center gap-3"><Trophy className="text-yellow-300"/><h2 className="show-title text-5xl gold-gradient sm:text-6xl">Dashboard de ranking</h2></div>
      <div className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
        <div className="spotlight overflow-hidden rounded-[1.75rem]">
          {dashboard.rows.length ? dashboard.rows.map((row, i) => <div key={row.user.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-white/10 px-4 py-4 last:border-0 sm:px-5">
            <div className={`grid h-10 w-10 place-items-center rounded-xl text-sm font-black ${i === 0 ? 'bg-yellow-300 text-slate-950' : i < 3 ? 'bg-emerald-300/15 text-emerald-100' : 'bg-white/8 text-white'}`}>#{i + 1}</div>
            <div className="min-w-0"><p className="truncate font-black">{row.user.name}</p><p className="truncate text-xs text-violet-100/60 sm:text-sm">{row.submitted ? `${row.exact} exactas · próximo en su lista: ${row.nextRiskName}` : 'Sin picks todavía'}</p></div>
            <div className="shrink-0 text-right"><p className="text-2xl font-black text-yellow-300">{row.score}</p><p className="text-[10px] uppercase tracking-widest text-violet-100/50">pts</p></div>
          </div>) : <p className="p-8 text-violet-100/70">Cuando entren participantes aparecerá aquí el ranking.</p>}
        </div>
        <div className="grid gap-4">
          <div className="spotlight rounded-[1.75rem] p-5"><p className="show-kicker text-[10px] text-emerald-100">Top ganadores</p>{dashboard.winners.length ? dashboard.winners.map((r,i)=><div key={r.user.id} className="mt-4 flex items-center justify-between gap-3"><div><p className="font-black">#{i+1} {r.user.name}</p><p className="text-xs text-emerald-50/60">{r.exact} exactas</p></div><p className="text-xl font-black text-yellow-200">{r.score}</p></div>) : <p className="mt-3 text-sm text-violet-100/60">Sin picks enviados.</p>}</div>
          <div className="spotlight rounded-[1.75rem] p-5"><p className="show-kicker text-[10px] text-pink-100">Zona de riesgo</p>{dashboard.losers.length ? dashboard.losers.map((r)=><div key={r.user.id} className="mt-4 flex items-center justify-between gap-3"><div><p className="font-black">#{dashboard.rows.findIndex(x=>x.user.id===r.user.id)+1} {r.user.name}</p><p className="text-xs text-pink-50/60">Necesita remontar</p></div><p className="text-xl font-black text-yellow-200">{r.score}</p></div>) : <p className="mt-3 text-sm text-violet-100/60">Sin picks enviados.</p>}</div>
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

    <footer className="mobile-shell mx-auto max-w-7xl px-5 py-10 text-xs leading-6 text-violet-100/50 sm:text-sm">Quiniela privada no oficial. Eliminaciones actualizadas manualmente por admin cada domingo. Scoring: 125 pts por posición exacta; -12 pts por cada lugar de diferencia.</footer>
  </main>;
}
