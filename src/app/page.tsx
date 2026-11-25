import Link from "next/link";
import { ArrowUpRight, CheckCircle2, FileText, LayoutTemplate, PenLine, ShieldCheck, Sparkles, Target } from "lucide-react";
import { HeroShaderCanvas } from "@/components/hero-shader-canvas";

const pillars = [
  {
    Icon: LayoutTemplate,
    title: "7 plantillas editoriales reales",
    detail: "Diseños de una columna, barra lateral, minimalista, ejecutivo y técnico con vista previa instantánea e impresión A4 limpia.",
    span: "md:col-span-7",
  },
  {
    Icon: Target,
    title: "Adaptación por oferta y lectura ATS",
    detail: "Compara tu borrador frente al texto de una vacante de forma 100 % local, sin subir archivos ni inventar experiencia.",
    span: "md:col-span-5",
  },
  {
    Icon: PenLine,
    title: "Editor y carta sin conexión",
    detail: "Organiza experiencia, formación, habilidades e idiomas con autoguardado local, exportación JSON portable y borrador de carta en 5 idiomas.",
    span: "md:col-span-5",
  },
  {
    Icon: Sparkles,
    title: "Asistencia IA bajo consentimiento",
    detail: "Cuando el servidor de IA está activo, redacta o pule textos excluyendo nombre y contacto directo, con límite de tasa estricto.",
    span: "md:col-span-7",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#05030a] text-[#f5f5f5] selection:bg-[#d4af37] selection:text-[#05030a]">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-medium focus:text-black"
      >
        Saltar al contenido
      </a>

      <div className="relative overflow-hidden border-b border-white/10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <HeroShaderCanvas
            colorVoid="#05030a"
            colorGold="#d4af37"
            colorCyan="#4de8e0"
            colorEmber="#ff073a"
            intensity={0.85}
          />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.11]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff14 1px, transparent 1px), linear-gradient(to bottom, #ffffff14 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5 sm:px-10">
          <Link
            href="/"
            aria-label="Belentani CV Studio, inicio"
            className="inline-flex min-h-11 items-center gap-3"
          >
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-xl border border-[#d4af37]/40 bg-white/[0.08] font-black text-xl tracking-tight text-[#f5f5f5]"
            >
              B
            </span>
            <span className="text-xs font-semibold tracking-[0.22em] text-zinc-100">
              BELENTANI <span className="font-normal text-zinc-300">/ CV STUDIO</span>
            </span>
          </Link>
          <nav aria-label="Navegación principal" className="flex items-center gap-3 sm:gap-5">
            <a
              href="#funciones"
              className="hidden min-h-11 items-center px-2 text-sm text-zinc-300 transition-colors hover:text-white sm:inline-flex"
            >
              Funciones
            </a>
            <Link
              href="/cv/preparar"
              className="hidden min-h-11 items-center px-2 text-sm text-zinc-300 transition-colors hover:text-white md:inline-flex"
            >
              Revisión final
            </Link>
            <Link
              href="/cv"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white hover:text-black"
            >
              Abrir estudio <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </nav>
        </header>

        <section
          id="contenido"
          className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-16 sm:px-10 lg:grid-cols-[1.18fr_0.82fr] lg:pb-32 lg:pt-24"
        >
          <div>
            <p className="mb-7 inline-flex items-center gap-3 rounded-full border border-[#d4af37]/30 bg-[#05030a]/70 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-200">
              <span aria-hidden="true" className="size-2 rounded-full bg-[#4de8e0]" />
              Estudio documental privado
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.06] tracking-[-0.035em] sm:text-6xl xl:text-7xl">
              Tu trayectoria.{" "}
              <span className="text-[#d4af37]">Bien contada.</span>
            </h1>
            <p className="mt-7 max-w-[65ch] text-base leading-8 text-zinc-300 sm:text-lg">
              Un espacio editorial para construir tu currículum, adaptar términos clave frente a cada oferta de empleo y preparar cartas de presentación con rigor, privacidad local y control absoluto sobre tus datos.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/cv"
                className="inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                Crear mi CV <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <Link
                href="/cv/preparar"
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 bg-[#05030a]/60 px-6 py-3.5 text-sm font-medium text-zinc-200 transition hover:border-white/60 hover:bg-white/10"
              >
                Revisar antes de enviar ↗
              </Link>
              <a
                href="#funciones"
                className="inline-flex min-h-11 items-center px-3 text-sm text-zinc-300 underline-offset-4 transition hover:text-white hover:underline"
              >
                Explorar herramientas ↓
              </a>
            </div>
            <p className="mt-7 flex max-w-[65ch] items-center gap-2 text-xs leading-6 text-zinc-300">
              <ShieldCheck size={15} className="shrink-0 text-[#4de8e0]" aria-hidden="true" />
              Sin registro obligatorio. Tu borrador se guarda únicamente en este navegador; exporta tu copia JSON o PDF cuando termines.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[430px] lg:ml-auto">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-[36px] border border-white/10 bg-white/[0.03]"
            />
            <div className="relative rounded-2xl border border-zinc-400/30 bg-zinc-50 p-7 text-zinc-900 shadow-[0_40px_110px_#000c] sm:p-9">
              <div className="mb-8 flex items-center justify-between border-b border-zinc-300 pb-6">
                <div>
                  <p className="text-xl font-semibold tracking-tight text-zinc-950">María García</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-zinc-700">
                    Coordinación &amp; Atención · Ejemplo
                  </p>
                </div>
                <FileText size={26} strokeWidth={1.25} className="text-zinc-700" aria-hidden="true" />
              </div>
              <div className="space-y-6">
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-700">
                    Perfil profesional
                  </p>
                  <p className="text-xs leading-relaxed text-zinc-700">
                    5 años gestionando atención directa, planificación de turnos y seguimiento documental con enfoque humano y resolutivo.
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-700">
                    Alineación con la vacante
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-900">
                      <CheckCircle2 size={12} aria-hidden="true" /> Atención al cliente
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-900">
                      <CheckCircle2 size={12} aria-hidden="true" /> Gestión de turnos
                    </span>
                    <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-[11px] font-medium text-zinc-800">
                      Español · Inglés
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <span className="absolute -bottom-5 right-3 rounded-full border border-[#d4af37]/35 bg-[#100e17] px-4 py-2 text-xs font-medium text-zinc-200 shadow-xl">
              7 plantillas · A4 + JSON
            </span>
          </div>
        </section>
      </div>

      <section id="funciones" className="mx-auto max-w-7xl px-6 py-24 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.025em] sm:text-5xl">
              Cuatro módulos reales para defender tu candidatura con hechos.
            </h2>
            <p className="mt-4 max-w-[65ch] text-base leading-7 text-zinc-300">
              Diseñado para que todo lo esencial funcione incluso sin conexión ni cuentas externas, respetando tu autoría de principio a fin.
            </p>
          </div>
          <Link
            href="/cv"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/50 hover:text-white"
          >
            Ir al editor <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-12">
          {pillars.map(({ Icon, title, detail, span }) => (
            <article
              key={title}
              className={[
                span,
                "rounded-2xl border border-white/12 bg-white/[0.035] p-8 transition-colors hover:border-white/25",
              ].join(" ")}
            >
              <Icon size={26} strokeWidth={1.4} className="mb-8 text-[#d4af37]" aria-hidden="true" />
              <h3 className="text-xl font-semibold tracking-tight text-white">{title}</h3>
              <p className="mt-3 max-w-[62ch] text-sm leading-7 text-zinc-300">{detail}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-lime-200/25 bg-lime-200/[0.06] p-7 sm:p-9">
          <div>
            <h3 className="text-xl font-semibold text-white">¿Tu CV está realmente listo para enviarse?</h3>
            <p className="mt-2 max-w-[65ch] text-sm leading-7 text-zinc-300">
              Repasa doce comprobaciones críticas —desde datos sensibles hasta enlaces y nombre del archivo— con una lista privada que puedes descargar en `.txt`.
            </p>
          </div>
          <Link
            href="/cv/preparar"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-lime-200/70 px-5 py-3 text-sm font-semibold text-lime-200 transition hover:bg-lime-200 hover:text-zinc-950"
          >
            Abrir revisión <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-7 rounded-3xl border border-white/12 bg-[#0d0c14] p-8 sm:p-12">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              El siguiente paso es tuyo.
            </h2>
            <p className="mt-2 max-w-[60ch] text-sm leading-7 text-zinc-300">
              Entra al estudio, elige una plantilla, contrasta tu borrador con la vacante y exporta tu documento.
            </p>
          </div>
          <Link
            href="/cv"
            className="inline-flex min-h-12 items-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Entrar al CV Studio ↗
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 sm:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <span className="text-xs font-medium tracking-[0.2em] text-zinc-300">
            BELENTANI · CV STUDIO
          </span>
          <p className="max-w-[68ch] text-xs leading-6 text-zinc-300">
            Herramientas para presentar tu experiencia con rigor. No se inventa experiencia, no se venden CV cerrados ni se garantizan ofertas de empleo.
          </p>
        </div>
      </footer>
    </main>
  );
}
