import Link from "next/link";
import { ArrowUpRight, FileText, LayoutTemplate, PenLine, ShieldCheck, Sparkles } from "lucide-react";

const features = [
  { Icon: LayoutTemplate, title: "Plantillas profesionales", detail: "Elige diseños clásicos, minimalistas y creativos para distintas candidaturas." },
  { Icon: PenLine, title: "Editor completo", detail: "Organiza trayectoria, formación, idiomas y competencias. Guarda avances en este dispositivo." },
  { Icon: Sparkles, title: "Asistencia opcional", detail: "Mejora el perfil y la experiencia con IA cuando el servicio esté disponible." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#090a0d] text-[#f5f5f5] selection:bg-[#e4e4e7] selection:text-black">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-black">Saltar al contenido</a>
      <div className="relative overflow-hidden border-b border-white/10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-44 top-20 h-[38rem] w-[38rem] rounded-full bg-white/[0.045] blur-[100px]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.14]" style={{ backgroundImage: "linear-gradient(to right, #ffffff12 1px, transparent 1px), linear-gradient(to bottom, #ffffff12 1px, transparent 1px)", backgroundSize: "72px 72px" }} />
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-6 sm:px-10">
          <Link href="/" aria-label="Belentani CV Studio, inicio" className="flex items-center gap-3">
            <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-xl border border-white/25 bg-white/[0.08] font-black text-xl tracking-tighter">B</span>
            <span className="text-xs font-semibold tracking-[0.25em]">BELENTANI <span className="font-normal text-zinc-500">/ CV STUDIO</span></span>
          </Link>
          <nav aria-label="Navegación principal" className="flex items-center gap-5">
            <a href="#funciones" className="hidden text-sm text-zinc-400 transition-colors hover:text-white sm:inline">Funciones</a>
            <Link href="/cv" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-sm font-medium transition hover:bg-white hover:text-black">Abrir estudio <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </nav>
        </header>
        <section id="contenido" className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-20 sm:px-10 lg:grid-cols-[1.2fr_0.8fr] lg:pb-32 lg:pt-28">
          <div>
            <p className="mb-8 inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.32em] text-zinc-400"><span aria-hidden="true" className="size-2 rounded-full bg-zinc-100 shadow-[0_0_18px_#fff7]" />Tu próxima oportunidad empieza aquí</p>
            <h1 className="max-w-4xl text-5xl font-medium leading-[1.06] tracking-[-0.065em] sm:text-7xl xl:text-8xl">Tu trayectoria. <span className="text-zinc-500">Bien contada.</span></h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-zinc-400 sm:text-lg">Un estudio profesional para crear tu currículum, presentar tu experiencia y preparar candidaturas con claridad y personalidad.</p>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Link href="/cv" className="inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200">Crear mi CV <ArrowUpRight size={18} aria-hidden="true" /></Link>
              <a href="#funciones" className="text-sm text-zinc-300 underline-offset-4 transition hover:underline">Explorar herramientas ↓</a>
            </div>
            <p className="mt-7 flex items-center gap-2 text-xs text-zinc-500"><ShieldCheck size={14} aria-hidden="true" /> Puedes empezar sin cuenta. Guarda una copia de tu documento antes de borrar datos del navegador.</p>
          </div>
          <div className="relative mx-auto w-full max-w-[430px] lg:ml-auto">
            <div aria-hidden="true" className="absolute -inset-5 rounded-[40px] border border-white/10 bg-white/[0.025]" />
            <div className="relative rotate-[1.5deg] rounded-2xl border border-zinc-500/20 bg-zinc-100 p-7 text-zinc-900 shadow-[0_45px_120px_#000a] transition-transform duration-500 hover:rotate-0 sm:p-10">
              <div className="mb-12 flex items-center justify-between border-b border-zinc-300 pb-7">
                <div><p className="text-xl font-semibold tracking-tight">María García</p><p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-zinc-500">Perfil profesional · Ejemplo</p></div>
                <FileText size={28} strokeWidth={1} aria-hidden="true" />
              </div>
              <div className="space-y-8">
                <div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]">Sobre mí</p><div className="h-2 w-full rounded bg-zinc-300" /><div className="mt-2 h-2 w-4/5 rounded bg-zinc-300" /><div className="mt-2 h-2 w-3/5 rounded bg-zinc-300" /></div>
                <div><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]">Experiencia</p><div className="mb-2 h-2.5 w-2/3 rounded bg-zinc-500" /><div className="h-2 w-full rounded bg-zinc-300" /><div className="mt-2 h-2 w-4/5 rounded bg-zinc-300" /></div>
                <div><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]">Formación</p><div className="h-2 w-1/2 rounded bg-zinc-500" /><div className="mt-2 h-2 w-4/5 rounded bg-zinc-300" /></div>
                <div><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]">Competencias</p><div className="flex flex-wrap gap-2"><span className="rounded-full bg-zinc-200 px-3 py-1 text-[10px]">Comunicación</span><span className="rounded-full bg-zinc-200 px-3 py-1 text-[10px]">Organización</span><span className="rounded-full bg-zinc-200 px-3 py-1 text-[10px]">Idiomas</span></div></div>
              </div>
            </div>
            <span className="absolute -bottom-7 right-1 rounded-full border border-white/15 bg-[#17181c] px-4 py-3 text-xs text-zinc-300 shadow-xl">Tu historia, tu diseño.</span>
          </div>
        </section>
      </div>
      <section id="funciones" className="mx-auto max-w-7xl px-6 py-24 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div><p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Herramientas reales</p><h2 className="mt-4 max-w-2xl text-3xl font-medium tracking-tight sm:text-5xl">Todo lo necesario para construir una primera versión sólida de tu CV.</h2></div>
          <Link href="/cv" className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white">Ir al editor <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {features.map(({ Icon, title, detail }) => <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-8"><Icon size={26} strokeWidth={1.3} className="mb-12 text-zinc-300" aria-hidden="true" /><h3 className="text-xl font-medium">{title}</h3><p className="mt-3 text-sm leading-7 text-zinc-400">{detail}</p></article>)}
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-between gap-7 rounded-3xl border border-white/10 bg-gradient-to-r from-zinc-900 to-[#111216] p-8 sm:p-12"><div><h2 className="text-2xl font-medium tracking-tight sm:text-3xl">El siguiente paso es tuyo.</h2><p className="mt-3 text-sm text-zinc-400">Entra al estudio, elige tu plantilla y empieza a editar.</p></div><Link href="/cv" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200">Entrar al CV Studio ↗</Link></div>
      </section>
      <footer className="border-t border-white/10 px-6 py-8 sm:px-10"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4"><span className="text-xs tracking-[0.2em] text-zinc-400">BELENTANI · CV STUDIO</span><p className="text-xs text-zinc-500">Herramientas para presentar tu experiencia con rigor. No se venden CV completos ni se garantizan ofertas de empleo.</p></div></footer>
    </main>
  );
}
