import type { Metadata } from "next";
import Link from "next/link";
import { CVSection } from "@/components/manos-abiertas/cv-section";
import { HeroShaderLazy } from "@/components/hero-shader-lazy";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "CV Studio",
  description:
    "Crea, adapta frente a ofertas reales y exporta tu currículum con 7 plantillas diferenciadas y privacidad local.",
  alternates: { canonical: "/cv" },
};

export default function CVStudioPage() {
  return (
    <main className="min-h-screen bg-[#05030a] text-white">
      <a
        href="#editor"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-medium focus:text-black"
      >
        Saltar al editor de currículum
      </a>

      <div className="relative overflow-hidden border-b border-white/10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <HeroShaderLazy
            colorVoid="#05030a"
            colorGold="#d4af37"
            colorCyan="#4de8e0"
            colorEmber="#ff073a"
            intensity={0.65}
          />
        </div>

        <header className="relative z-10 border-b border-white/10 px-6 py-5 sm:px-10 print:hidden">
          <nav
            aria-label="Navegación del estudio"
            className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4"
          >
            <Link
              href="/"
              className="inline-flex min-h-11 items-center text-sm font-semibold uppercase tracking-[0.22em] text-white"
            >
              BELENTANI<span className="ml-1 text-zinc-300">/ CV STUDIO</span>
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/cv/preparar"
                className="inline-flex min-h-11 items-center rounded-full border border-white/25 px-4 py-2 text-xs font-medium text-zinc-100 transition hover:border-white/60 hover:bg-white/10"
              >
                Revisión antes de enviar
              </Link>
              <a
                href="#editor"
                className="inline-flex min-h-11 items-center rounded-full border border-[#d4af37]/50 bg-[#05030a]/60 px-4 py-2 text-xs font-medium text-white transition hover:bg-white hover:text-black"
              >
                Ir al editor ↓
              </a>
            </div>
          </nav>
        </header>

        <section className="relative z-10 mx-auto max-w-7xl px-6 py-14 sm:px-10 sm:py-20 print:hidden">
          <p className="text-xs font-medium uppercase tracking-[0.26em] text-zinc-300">
            Document Studio · Editor, Oferta &amp; Carta
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">
            Tu experiencia merece una presentación extraordinaria.
          </h1>
          <p className="mt-5 max-w-[65ch] text-base leading-relaxed text-zinc-300 sm:text-lg">
            Edita tu trayectoria, compara tus competencias con la vacante real sin salir del navegador y exporta en A4 o formato JSON editable.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#editor"
              className="inline-flex min-h-12 items-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Empezar mi CV ↓
            </a>
            <Link
              href="/cv/preparar"
              className="inline-flex min-h-12 items-center px-3 text-sm text-zinc-200 underline-offset-4 hover:text-white hover:underline"
            >
              Revisar una candidatura ya preparada ↗
            </Link>
          </div>
        </section>
      </div>

      <section
        id="editor"
        aria-label="Editor de currículum"
        className="bg-[#08090d] px-2 py-10 text-white sm:px-6 print:bg-white print:p-0 print:text-black"
      >
        <div className="mx-auto max-w-7xl">
          <CVSection headingAs="h2" />
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-zinc-300 print:hidden">
        BELENTANI CV STUDIO · Edición privada en tu navegador · Sin promesas de contratación ni plantillas oficiales.
      </footer>
      <SonnerToaster position="top-center" richColors />
    </main>
  );
}
