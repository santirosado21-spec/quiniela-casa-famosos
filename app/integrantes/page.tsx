import { ArrowRight, CheckCircle2, Mail, MousePointerClick, ShieldCheck, Trophy, UsersRound } from 'lucide-react';

const steps = [
  {
    title: '1. Entra a participar',
    body: 'Abre el link de la quiniela y toca “Participar”. Si te mandaron un link privado, entra desde ese link.',
    icon: MousePointerClick,
  },
  {
    title: '2. Registra tus datos',
    body: 'Escribe tu nombre y correo. El correo sirve para bloquear una sola quiniela por persona.',
    icon: Mail,
  },
  {
    title: '3. Ordena a los habitantes',
    body: 'Acomoda la lista así: #1 es quien crees que sale primero y el último número (#18) es quien crees que gana la temporada.',
    icon: UsersRound,
  },
  {
    title: '4. Envía y bloquea',
    body: 'Cuando mandes tus picks ya no se podrán editar. Cada domingo se actualiza el ranking automáticamente.',
    icon: ShieldCheck,
  },
];

const rules = [
  'Una quiniela por correo.',
  'Orden: #1 = primer eliminado; #18/último = ganador/a.',
  'Entrada: $500 pesos; envía tu comprobante a melissamolch@gmail.com.',
  'Premio: 1er lugar se lleva todo; si hay empate, se divide.',
  '2º y 3º lugar recuperan su entrada.',
  'No hay ganancia para organizadores; solo es para divertirnos.',
  '125 puntos por posición exacta.',
  '-12 puntos por cada lugar de diferencia.',
  'El admin registra eliminaciones cada domingo.',
];

export default function IntegrantesOnboardingPage() {
  return <main className="mobile-shell mx-auto max-w-6xl px-4 py-5 sm:px-5 sm:py-10">
    <nav className="mb-6 flex items-center justify-between gap-3">
      <a href="/" className="text-sm font-bold">← Home</a>
      <a href="/play" className="rounded-full border border-white/15 bg-white/[.06] px-4 py-3 text-sm font-black">Participar</a>
    </nav>

    <section className="spotlight rounded-[1.75rem] p-5 sm:p-8">
      <p className="show-kicker text-[10px] sm:text-sm">Onboarding integrantes</p>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
        <div>
          <h1 className="show-title text-6xl gold-gradient sm:text-8xl">Cómo entrar a la quiniela</h1>
          <p className="mt-4 max-w-2xl text-sm font-medium leading-6 sm:text-base sm:leading-8">
            Guía rápida para que cada integrante registre su predicción, entienda las reglas y sepa cómo se calcula el ranking de La quiniela de La Casa de los Famosos.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/[.08]"><Trophy className="h-5 w-5" /></div>
          <p className="text-2xl font-black">Objetivo</p>
          <p className="mt-2 text-sm leading-6">Predecir el orden completo de eliminación y acumular la mayor cantidad de puntos conforme avanza la temporada.</p>
        </div>
      </div>
    </section>

    <section className="mt-6 grid gap-4 md:grid-cols-2">
      {steps.map((step) => {
        const Icon = step.icon;
        return <article key={step.title} className="spotlight rounded-3xl p-5">
          <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-white/[.08]"><Icon className="h-5 w-5" /></div>
          <h2 className="text-xl font-black">{step.title}</h2>
          <p className="mt-2 text-sm leading-6">{step.body}</p>
        </article>;
      })}
    </section>

    <section className="mt-6 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
      <div className="spotlight rounded-3xl p-5">
        <h2 className="show-title text-4xl gold-gradient sm:text-5xl">Reglas rápidas</h2>
        <div className="mt-5 space-y-3">
          {rules.map((rule) => <div key={rule} className="flex items-start gap-3 rounded-2xl bg-white/[.045] p-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-sm font-semibold leading-5">{rule}</p>
          </div>)}
        </div>
      </div>

      <div className="spotlight rounded-3xl p-5">
        <h2 className="show-title text-4xl gold-gradient sm:text-5xl">Link para mandar</h2>
        <p className="mt-3 text-sm leading-6">Comparte este link con los integrantes para que vean el onboarding antes de hacer su quiniela:</p>
        <code className="mt-4 block overflow-x-auto rounded-2xl bg-black/30 p-4 text-sm">https://quiniela-casa-famosos.vercel.app/integrantes</code>
        <a href="/play" className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[.08] px-5 py-4 text-sm font-black">
          Ir a participar <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  </main>;
}
