'use client';

import { useEffect, useMemo, useState } from 'react';
import { Copy, Plus, RefreshCw, ShieldCheck, Skull, Trophy, TrendingDown, TrendingUp } from 'lucide-react';
import { buildLeaderboard } from '@/lib/scoring';

type Contestant = { id: string; name: string; handle?: string; photo_url: string };
type User = { id: string; name: string; email?: string; token: string; created_at?: string };
type Pick = { user_id: string; order_ids: string[]; submitted_at?: string };
type Elim = { contestant_id: string; position: number; eliminated_at?: string };
type State = { contestants: Contestant[]; users: User[]; picks: Pick[]; eliminations: Elim[] };

function Stat({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof Trophy }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4">
    <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-yellow-300/15 text-yellow-200"><Icon className="h-4 w-4" /></div>
    <p className="text-2xl font-black text-white">{value}</p>
    <p className="text-xs font-bold uppercase tracking-[.18em] text-violet-100/45">{label}</p>
  </div>;
}

export default function AdminPage() {
 const [password,setPassword]=useState('');
 const [name,setName]=useState('');
 const [selected,setSelected]=useState('');
 const [state,setState]=useState<State|null>(null);
 const [msg,setMsg]=useState('');
 const load=()=>fetch('/api/state').then(r=>r.json()).then((next: State)=>{ setState(next); setSelected((prev)=> prev || next.contestants.find(c=>!next.eliminations.some(e=>e.contestant_id===c.id))?.id || ''); });
 useEffect(()=>{load()},[]);
 async function action(body: Record<string, unknown>) { setMsg(''); const res=await fetch('/api/admin',{method:'POST',headers:{'Content-Type':'application/json','x-admin-password':password},body:JSON.stringify(body)}); const data=await res.json(); setMsg(res.ok?'OK':data.error); await load(); return data; }
 const base= typeof window==='undefined'?'':window.location.origin;
 const dashboard = useMemo(()=> state ? buildLeaderboard(state) : null, [state]);
 const contestantById = useMemo(()=> new Map((state?.contestants || []).map(c=>[c.id,c])), [state]);
 const nextPosition = (state?.eliminations.length || 0) + 1;
 const available = state?.contestants.filter(c=>!state.eliminations.some(e=>e.contestant_id===c.id)) || [];

 return <main className="mobile-shell mx-auto max-w-7xl px-4 py-5 sm:px-5 sm:py-10">
  <a href="/" className="text-sm font-bold text-cyan-200">← Home</a>
  <div className="mt-5 spotlight rounded-[1.75rem] p-5 sm:mt-8 sm:p-6">
    <div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
      <div>
        <p className="show-kicker text-[10px] text-yellow-200 sm:text-sm">Admin panel</p>
        <h1 className="show-title mt-2 text-6xl gold-gradient sm:text-8xl">Control de quiniela</h1>
        <p className="mt-3 text-sm text-violet-100/70 sm:text-base">Registra al eliminado de cada domingo y el sistema recalcula automáticamente ganadores y perdedores.</p>
      </div>
      <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="ADMIN_PASSWORD" type="password" className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-4 outline-none focus:border-cyan-200" />
    </div>
  </div>

  <section className="mt-6 spotlight rounded-3xl p-4 sm:p-5">
    <div className="flex items-start justify-between gap-4">
      <div><p className="show-kicker text-[10px] text-pink-100">Domingo #{nextPosition}</p><h2 className="show-title text-4xl gold-gradient sm:text-5xl">Registrar eliminado</h2></div>
    </div>
    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
      <select value={selected} onChange={e=>setSelected(e.target.value)} className="min-w-0 rounded-2xl border border-white/15 bg-black/40 px-4 py-4 font-bold outline-none focus:border-yellow-200">
        {available.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <button disabled={!selected} onClick={()=>action({action:'recordSundayElimination', contestantId:selected})} className="rounded-2xl bg-yellow-300 px-5 py-4 font-black text-slate-950 disabled:opacity-50">Guardar domingo</button>
    </div>
  </section>

  {dashboard && <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <Stat icon={ShieldCheck} value={`${dashboard.totalPicks}/${dashboard.totalUsers}`} label="Picks registrados" />
    <Stat icon={Skull} value={dashboard.totalEliminations} label="Domingos jugados" />
    <Stat icon={TrendingUp} value={dashboard.winners[0]?.user.name || '—'} label="Va ganando" />
    <Stat icon={TrendingDown} value={dashboard.losers[0]?.user.name || '—'} label="Va perdiendo" />
  </section>}

  <section className="mt-6 grid gap-6 xl:grid-cols-[.95fr_1.05fr]">
    <div className="space-y-6">
      <div className="spotlight rounded-3xl p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div><p className="show-kicker text-[10px] text-pink-100">Domingo #{nextPosition}</p><h2 className="show-title text-4xl gold-gradient sm:text-5xl">Registrar eliminado</h2></div>
          <button className="rounded-xl border border-white/15 p-3" onClick={()=>action({action:'resetEliminations'})} title="Reset eliminaciones"><RefreshCw className="h-4 w-4"/></button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <select value={selected} onChange={e=>setSelected(e.target.value)} className="min-w-0 rounded-2xl border border-white/15 bg-black/40 px-4 py-4 font-bold outline-none focus:border-yellow-200">
            {available.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button disabled={!selected} onClick={()=>action({action:'recordSundayElimination', contestantId:selected})} className="rounded-2xl bg-yellow-300 px-5 py-4 font-black text-slate-950 disabled:opacity-50">Guardar domingo</button>
        </div>
        <button onClick={()=>action({action:'seedContestants'})} className="mt-3 rounded-xl border border-cyan-200/40 px-4 py-3 text-sm font-bold text-cyan-100">Seed/actualizar cast</button>
        <div className="mt-5 space-y-2">
          {state?.eliminations.sort((a,b)=>a.position-b.position).map(e=>{const c=contestantById.get(e.contestant_id); return <div key={`${e.contestant_id}-${e.position}`} className="flex items-center gap-3 rounded-2xl bg-white/6 p-2.5"><div className="grid h-9 w-9 rounded-xl bg-pink-400/15 place-items-center text-sm font-black text-pink-100">#{e.position}</div>{c && <img src={c.photo_url} alt={c.name} className="h-10 w-10 rounded-xl object-cover"/>}<div className="min-w-0 flex-1"><p className="truncate font-black">{c?.name || e.contestant_id}</p><p className="text-xs text-violet-100/50">{e.eliminated_at ? new Date(e.eliminated_at).toLocaleDateString('es-MX') : 'Registrado'}</p></div></div>})}
          {!state?.eliminations.length && <p className="rounded-2xl bg-white/6 p-4 text-sm text-violet-100/60">Aún no hay eliminados. El primer domingo será posición #1.</p>}
        </div>
      </div>

      <div className="spotlight rounded-3xl p-4 sm:p-5">
        <h2 className="show-title text-4xl gold-gradient sm:text-5xl">Usuarios</h2>
        <div className="mt-4 flex gap-2"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre del participante" className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/30 px-4 py-3"/><button onClick={()=> action({action:'createUser', name}).then(()=>setName(''))} className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-yellow-300 font-black text-slate-950"><Plus/></button></div>
        <div className="mt-4 space-y-3">{state?.users.map(u=> <div key={u.id} className="rounded-2xl bg-white/6 p-3"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate font-bold">{u.name}</p><p className="text-xs text-violet-100/50">{u.email || 'link único'} · {state.picks.some(p=>p.user_id===u.id)?'Enviado':'Pendiente'}</p></div><button onClick={()=>navigator.clipboard.writeText(`${base}/join/${u.token}`)} className="rounded-xl border border-white/15 p-3" aria-label="Copiar link"><Copy className="h-4 w-4"/></button></div><code className="mt-2 block overflow-x-auto rounded-xl bg-black/30 p-2 text-xs text-cyan-100">{base}/join/{u.token}</code></div>)}</div>
      </div>
    </div>

    <div className="spotlight rounded-3xl p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-3"><Trophy className="text-yellow-300"/><h2 className="show-title text-4xl gold-gradient sm:text-5xl">Dashboard vivo</h2></div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/8 p-4"><p className="show-kicker text-[10px] text-emerald-100">Ganando</p>{dashboard?.winners.length ? dashboard.winners.map((r,i)=><div key={r.user.id} className="mt-3 flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate font-black">#{i+1} {r.user.name}</p><p className="text-xs text-emerald-50/60">{r.exact} exactas · próximo riesgo: {r.nextRiskName}</p></div><p className="text-xl font-black text-yellow-200">{r.score}</p></div>) : <p className="mt-3 text-sm text-violet-100/60">Sin picks enviados.</p>}</div>
        <div className="rounded-2xl border border-pink-300/20 bg-pink-300/8 p-4"><p className="show-kicker text-[10px] text-pink-100">Perdiendo</p>{dashboard?.losers.length ? dashboard.losers.map((r,i)=><div key={r.user.id} className="mt-3 flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate font-black">#{dashboard.rows.findIndex(x=>x.user.id===r.user.id)+1} {r.user.name}</p><p className="text-xs text-pink-50/60">{r.exact} exactas · próximo riesgo: {r.nextRiskName}</p></div><p className="text-xl font-black text-yellow-200">{r.score}</p></div>) : <p className="mt-3 text-sm text-violet-100/60">Sin picks enviados.</p>}</div>
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
        {dashboard?.rows.map((row,i)=><div key={row.user.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-white/10 bg-white/[.035] px-3 py-3 last:border-0"><div className="grid h-8 w-8 place-items-center rounded-lg bg-white/8 text-xs font-black">#{i+1}</div><div className="min-w-0"><p className="truncate font-black">{row.user.name}</p><p className="truncate text-xs text-violet-100/50">{row.submitted ? `${row.exact} exactas · ${row.nextRiskName}` : 'Sin picks'}</p></div><div className="text-right"><p className="text-lg font-black text-yellow-300">{row.score}</p><p className="text-[10px] uppercase tracking-widest text-violet-100/45">pts</p></div></div>)}
        {!dashboard?.rows.length && <p className="p-6 text-violet-100/60">Aún no hay participantes.</p>}
      </div>
    </div>
  </section>
  {msg&&<p className="mt-5 text-center font-bold text-cyan-100">{msg}</p>}
 </main>;
}
