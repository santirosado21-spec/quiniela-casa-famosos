'use client';
import { useEffect, useMemo, useState } from 'react';
import { Lock, GripVertical } from 'lucide-react';

type Contestant = { id: string; name: string; handle: string; photo_url: string; bio: string };
type Pick = { user_id: string; order_ids: string[] };
type State = { contestants: Contestant[]; user: { id: string; name: string }; pick: Pick | null };

const MONEY_POOL_URL = 'https://www.moneypool.mx/p/uL12NXA';

function Photo({ contestant, className }: { contestant: Contestant; className?: string }) {
  return <img src={contestant.photo_url} alt={contestant.name} className={className} loading="lazy" onError={(e) => { e.currentTarget.src = `https://placehold.co/300x300/15102f/f5c96d?text=${encodeURIComponent(contestant.name)}`; }} />;
}

export default function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState('');
  const [state, setState] = useState<State | null>(null);
  const [order, setOrder] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [paymentReady, setPaymentReady] = useState(false);

  useEffect(() => { params.then(p => setToken(p.token)); }, [params]);
  useEffect(() => {
    if (!token) return;
    fetch(`/api/join/${encodeURIComponent(token)}`).then(async r => {
      if (!r.ok) { setState(null); setMsg('Link inválido.'); return; }
      const next: State = await r.json();
      setState(next);
      setOrder(next.contestants.map((c) => c.id));
    });
  }, [token]);

  const user = state?.user;
  const existing = state?.pick || undefined;
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
    setSaving(true);
    setMsg('');
    setPaymentReady(false);

    try {
      const res = await fetch('/api/picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, orderIds: order }),
      });
      const data: { error?: string } = await res.json();

      if (!res.ok) {
        setMsg(data.error || 'No se pudo enviar la quiniela. Inténtalo de nuevo.');
        return;
      }

      setPaymentReady(true);
      setMsg('Quiniela enviada. Tus picks quedaron bloqueados. Ahora paga tu entrada en Money Pool para quedar confirmado.');
    } catch {
      setMsg('No se pudo completar el envío. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  if (!state) return <main className="grid min-h-screen place-items-center px-5">{msg || 'Cargando...'}</main>;

  const lockedOrder = existing?.order_ids ? existing.order_ids.map(id => contestants.find(c => c.id === id)).filter(Boolean) as Contestant[] : [];
  const list = existing ? lockedOrder : ordered;

  return <main className="mobile-shell safe-bottom mx-auto max-w-5xl px-4 py-5 sm:px-5 sm:py-10">
    <a href="/" className="text-sm font-bold text-cyan-200">← Ver leaderboard</a>
    <div className="mt-5 spotlight rounded-[1.75rem] p-5 sm:mt-8 sm:p-8">
      <p className="show-kicker text-[10px] text-yellow-200 sm:text-sm">Link privado</p>
      <h1 className="show-title mt-2 text-6xl gold-gradient sm:text-8xl">Hola, {state.user.name}</h1>
      <p className="mt-4 text-sm leading-6 text-violet-100/78 sm:text-base"><b>#1 es quien crees que sale primero.</b> El último número (#{contestants.length || 18}) es quien crees que gana la temporada. En móvil usa los botones ↑ ↓. Solo puedes enviar una vez.</p>
      <div className="mt-5 rounded-2xl border border-yellow-300/25 bg-yellow-300/10 p-4">
        <p className="text-xs font-black uppercase tracking-[.2em] text-yellow-100">Pago Money Pool</p>
        <p className="mt-2 text-sm leading-6 text-violet-100/80">La entrada es de <b>$500 pesos</b>. Paga en Money Pool y manda tu comprobante a <b>melissamolch@gmail.com</b>.</p>
        <a href={MONEY_POOL_URL} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex rounded-2xl bg-yellow-300 px-5 py-3 text-sm font-black text-slate-950">
          Pagar en Money Pool
        </a>
      </div>
      {existing && <div className="mt-5 flex items-center gap-2 rounded-2xl bg-emerald-400/10 p-4 text-sm font-bold text-emerald-100"><Lock className="size-5"/> Tus picks ya están bloqueados.</div>}
    </div>

    <div className="mt-5 grid gap-3 sm:mt-8">
      <div className="rounded-2xl border border-white/10 bg-white/[.045] p-3 text-xs font-bold leading-5 text-violet-100/75 sm:text-sm">
        Ordena la lista así: <b>#1 = primer eliminado</b> · <b>#{contestants.length || 18} = ganador/a</b>.
      </div>
      <div className="rounded-2xl border border-yellow-300/20 bg-yellow-300/[.08] p-3 text-xs font-bold leading-5 text-violet-100/75 sm:text-sm">
        Premio: <b>1er lugar se lleva todo</b>. Si hay empate, se divide. <b>2º y 3º lugar recuperan su entrada</b>. No hay ganancia para organizadores; solo es para divertirnos.
      </div>
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
    {msg && <div className="mt-4 rounded-3xl border border-emerald-300/25 bg-emerald-300/10 p-4 text-center">
      <p className="text-sm font-bold text-emerald-100">{msg}</p>
      {paymentReady && <a href={MONEY_POOL_URL} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex rounded-2xl bg-yellow-300 px-5 py-3 text-sm font-black text-slate-950">
        Abrir Money Pool
      </a>}
    </div>}
  </main>;
}
