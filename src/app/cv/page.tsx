import type { Metadata } from 'next';
import { CVSection } from '@/components/manos-abiertas/cv-section';

export const metadata: Metadata = {
  title: 'CV Studio | Belentani',
  description: 'Crea, adapta y exporta tu currículum con herramientas de edición y plantillas profesionales.',
};

export default function CVStudioPage() {
  return (
    <main className="min-h-screen bg-[#08090b] text-white">
      <header className="border-b border-white/10 px-6 py-5 sm:px-10">
        <nav aria-label="Navegación del estudio" className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <a href="/" className="text-sm font-semibold uppercase tracking-[0.24em] text-white">BELENTANI<span className="text-white/50"> / CV</span></a>
          <div className="flex flex-wrap items-center gap-3"><a href="/cv/preparar" className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-white transition hover:border-white/60 hover:bg-white/10">Revisión antes de enviar</a><a href="#editor" className="inline-flex min-h-11 items-center rounded-full border border-white/30 px-4 py-2 text-xs font-medium text-white transition hover:bg-white hover:text-black">Abrir editor</a></div>
        </nav>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-24">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/60">Document Studio · CV</p>
        <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl">Tu experiencia merece una presentación extraordinaria.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
          Diseña y personaliza tu currículum, organiza tu trayectoria y prepara tus candidaturas en un espacio de trabajo dedicado.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-5"><a href="#editor" className="inline-flex min-h-12 items-center rounded-full bg-white px-7 py-3 font-semibold text-black transition hover:bg-white/85">Empezar mi CV →</a><a href="/cv/preparar" className="inline-flex min-h-12 items-center text-sm text-zinc-300 underline-offset-4 hover:underline">Revisar una candidatura ya preparada ↗</a></div>
      </section>
      <section id="editor" aria-label="Editor de currículum" className="bg-white px-3 py-12 text-neutral-950 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-6 px-3 text-2xl font-semibold tracking-tight">Estudio de currículum</h2>
          <CVSection />
        </div>
      </section>
      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-white/50">BELENTANI · Herramientas profesionales de documentación</footer>
    </main>
  );
}
