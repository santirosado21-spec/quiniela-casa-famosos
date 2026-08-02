'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Copy, LogOut, Plus, ShieldCheck } from 'lucide-react';
import { buildLeaderboard } from '@/lib/scoring';

type Contestant = { id: string; name: string; handle?: string; photo_url: string };
type User = { id: string; name: string; email?: string; token: string; created_at?: string };
type Pick = { user_id: string; order_ids: string[]; submitted_at?: string };
type Elimination = { contestant_id: string; position: number; eliminated_at?: string };
type State = { contestants: Contestant[]; users: User[]; picks: Pick[]; eliminations: Elimination[] };

export default function AdminPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState<State | null>(null);
  const [checking, setChecking] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [restoreError, setRestoreError] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [newName, setNewName] = useState('');
  const [selected, setSelected] = useState('');

  async function loadAdminState() {
    const response = await fetch('/api/admin/state', { cache: 'no-store' });
    if (!response.ok) {
      if (response.status === 401) setState(null);
      throw new Error(response.status === 401 ? 'unauthorized' : 'No se pudo consultar la sesión.');
    }
    const next: State = await response.json();
    setState(next);
    const nextAvailable = next.contestants.filter((contestant) => !next.eliminations.some((entry) => entry.contestant_id === contestant.id));
    setSelected((current) => nextAvailable.some((contestant) => contestant.id === current) ? current : nextAvailable[0]?.id || '');
    return true;
  }

  useEffect(() => {
    void (async () => {
      try {
        await loadAdminState();
      } catch (error) {
        if (error instanceof Error && error.message !== 'unauthorized') setRestoreError(error.message);
      } finally {
        setRestoring(false);
      }
    })();
  }, []);

  async function login(event: FormEvent) {
    event.preventDefault();
    setChecking(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo iniciar sesión.');
      setPassword('');
      await loadAdminState();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo iniciar sesión.');
    } finally {
      setChecking(false);
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setState(null);
    setUsername('');
    setPassword('');
    setMessage('Sesión cerrada.');
  }

  async function action(body: Record<string, unknown>) {
    setMessage('');
    setSaving(true);
    try {
      const response = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json();
      if (response.status === 401) { setState(null); setMessage('Tu sesión expiró. Inicia sesión de nuevo.'); return false; }
      if (!response.ok) throw new Error(data.error || 'No se pudo guardar.');
      await loadAdminState();
      setMessage('Cambios guardados.');
      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function createUser() {
    if (await action({ action: 'createUser', name: newName })) setNewName('');
  }

  const contestantById = useMemo(() => new Map((state?.contestants || []).map((c) => [c.id, c])), [state]);
  const dashboard = useMemo(() => state ? buildLeaderboard(state) : null, [state]);
  const available = state?.contestants.filter((c) => !state.eliminations.some((e) => e.contestant_id === c.id)) || [];
  const nextPosition = Math.max(0, ...(state?.eliminations.map((entry) => entry.position) || [])) + 1;
  const base = typeof window === 'undefined' ? '' : window.location.origin;

  if (restoring) return <main className="grid min-h-screen place-items-center px-5"><p className="font-bold text-violet-100">Restaurando sesión…</p></main>;
  if (restoreError && !state) return <main className="grid min-h-screen place-items-center px-5"><div className="spotlight rounded-3xl p-6 text-center"><p className="font-bold text-pink-100">{restoreError}</p><button onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-yellow-300 px-4 py-3 font-black text-slate-950">Reintentar</button></div></main>;

  if (!state) return <main className="mx-auto grid min-h-screen max-w-lg place-items-center px-5">
    <form onSubmit={login} className="spotlight w-full rounded-3xl p-6 sm:p-8">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-yellow-300 text-slate-950"><ShieldCheck /></div>
      <h1 className="show-title mt-5 text-center text-6xl gold-gradient">Administración</h1>
      <p className="mt-3 text-center text-sm text-violet-100/70">Inicia sesión para consultar los picks privados.</p>
      <label className="mt-6 block text-sm font-bold">Usuario<input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" className="mt-2 w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 outline-none" /></label>
      <label className="mt-4 block text-sm font-bold">Contraseña<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" className="mt-2 w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 outline-none" /></label>
      <button disabled={checking} className="mt-6 w-full rounded-2xl bg-yellow-300 px-5 py-4 font-black text-slate-950 disabled:opacity-60">{checking ? 'Verificando…' : 'Iniciar sesión'}</button>
      {message && <p className="mt-4 text-center text-sm font-bold text-pink-100">{message}</p>}
      <a href="/" className="mt-5 block text-center text-sm font-bold text-cyan-200">← Volver al inicio</a>
    </form>
  </main>;

  return <main className="mobile-shell mx-auto max-w-7xl px-4 py-6 sm:px-5 sm:py-10">
    <header className="spotlight flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
      <div><p className="show-kicker text-xs text-yellow-200">Sesión privada</p><h1 className="show-title text-6xl gold-gradient">Panel de Melissa</h1><p className="mt-2 text-sm text-violet-100/70">Picks completos y controles de la quiniela.</p></div>
      <button onClick={logout} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-3 font-bold"><LogOut className="h-4 w-4" /> Cerrar sesión</button>
    </header>

    <section className="mt-6 grid gap-3 sm:grid-cols-3">
      <div className="spotlight rounded-2xl p-4"><p className="text-2xl font-black">{state.users.length}</p><p className="text-xs text-violet-100/60">Participantes</p></div>
      <div className="spotlight rounded-2xl p-4"><p className="text-2xl font-black">{state.picks.length}</p><p className="text-xs text-violet-100/60">Picks enviados</p></div>
      <div className="spotlight rounded-2xl p-4"><p className="text-2xl font-black">{dashboard?.winners[0]?.user.name || '—'}</p><p className="text-xs text-violet-100/60">Va ganando</p></div>
    </section>

    <section className="mt-6 grid gap-4 lg:grid-cols-2">
      <div className="spotlight rounded-3xl p-5"><h2 className="show-title text-4xl gold-gradient">Registrar eliminación</h2><div className="mt-4 flex gap-2"><select value={selected} onChange={(e) => setSelected(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/40 px-4 py-3">{available.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><button disabled={!selected || saving} onClick={() => { const contestant = available.find((candidate) => candidate.id === selected); if (contestant && window.confirm(`¿Confirmas registrar a ${contestant.name} en la posición #${nextPosition}?`)) void action({ action: 'recordSundayElimination', contestantId: selected }); }} className="rounded-xl bg-yellow-300 px-4 font-black text-slate-950 disabled:opacity-50">Guardar #{nextPosition}</button></div></div>
      <div className="spotlight rounded-3xl p-5"><h2 className="show-title text-4xl gold-gradient">Crear participante</h2><div className="mt-4 flex gap-2"><input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre" className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/30 px-4 py-3"/><button disabled={saving} onClick={() => void createUser()} className="grid h-12 w-12 place-items-center rounded-xl bg-yellow-300 text-slate-950 disabled:opacity-50"><Plus /></button></div></div>
    </section>

    <section className="mt-6"><h2 className="show-title text-5xl gold-gradient">Picks por participante</h2><p className="mt-2 text-sm text-violet-100/65">La posición #1 es el primer eliminado; la última es el ganador.</p>
      <div className="mt-4 grid gap-5 xl:grid-cols-2">{state.users.map((user) => {
        const pick = state.picks.find((candidate) => candidate.user_id === user.id);
        return <article key={user.id} className="spotlight rounded-3xl p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3"><div><h3 className="text-xl font-black">{user.name}</h3><p className="text-xs text-violet-100/60">{user.email || 'Sin correo'} · {pick ? 'Enviado' : 'Pendiente'}</p></div><button onClick={() => navigator.clipboard.writeText(`${base}/join/${user.token}`)} className="rounded-xl border border-white/15 p-3" aria-label={`Copiar link de ${user.name}`}><Copy className="h-4 w-4"/></button></div>
          {pick ? <ol className="mt-4 grid gap-2">{pick.order_ids.map((id, index) => { const contestant = contestantById.get(id); return <li key={`${id}-${index}`} className="flex items-center gap-3 rounded-2xl bg-white/[.055] p-2"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-yellow-300 font-black text-slate-950">{index + 1}</span>{contestant && <img src={contestant.photo_url} alt={contestant.name} className="h-11 w-11 rounded-xl object-cover"/>}<div><p className="font-black">{contestant?.name || id}</p><p className="text-xs text-violet-100/50">{contestant?.handle}</p></div></li>; })}</ol> : <p className="mt-4 rounded-2xl bg-white/[.055] p-4 text-sm text-violet-100/60">Todavía no envía sus picks.</p>}
        </article>;
      })}</div>
    </section>
    {message && <p className="mt-6 text-center font-bold text-cyan-100">{message}</p>}
  </main>;
}
