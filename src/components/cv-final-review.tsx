"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, Download, RotateCcw, ShieldCheck } from "lucide-react";
import { cvReviewChecks, cvReviewGroups, cvReviewProgress, type CvReviewId } from "@/data/cv-release-checklist";

export function CvFinalReview() {
  const [completed, setCompleted] = useState<CvReviewId[]>([]);
  const done = cvReviewProgress(completed);
  const total = cvReviewChecks.length;
  const percentage = Math.round((done / total) * 100);

  function toggle(id: CvReviewId, checked: boolean) {
    setCompleted((current) => checked
      ? current.includes(id) ? current : [...current, id]
      : current.filter((value) => value !== id));
  }

  function downloadReview() {
    const completedIds = new Set(completed);
    const lines = [
      "BELENTANI CV STUDIO | REVISIÓN PREVIA AL ENVÍO",
      "Fecha: " + new Date().toLocaleDateString("es-ES"),
      "Revisadas: " + done + "/" + total,
      "",
      ...cvReviewChecks.map((item) =>
        (completedIds.has(item.id) ? "[x] " : "[ ] ") + item.title + "\n    " + item.detail
      ),
      "",
      "Esta revisión es manual: no certifica compatibilidad ATS, contratación ni exactitud de la información.",
      "No se ha enviado ninguna información personal al servidor para realizarla.",
    ];
    const file = new Blob([lines.join("\n") + "\n"], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "revision-cv-belentani.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#0b0c10] text-zinc-100 selection:bg-lime-200 selection:text-zinc-950">
      <a href="#revisiones" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-black">Saltar a la lista de revisión</a>
      <header className="border-b border-white/10 bg-[#0b0c10]/95">
        <nav aria-label="Navegación de revisión" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-9">
          <Link href="/" className="inline-flex items-center gap-3 text-sm font-semibold tracking-[0.14em]"><span className="flex size-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-xl font-black" aria-hidden="true">B</span> BELENTANI <span className="font-normal text-zinc-400">/ CV STUDIO</span></Link>
          <Link href="/cv" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-sm transition hover:border-white/60 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><ArrowLeft size={16} aria-hidden="true" /> Volver al editor</Link>
        </nav>
      </header>

      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-52 size-[36rem] rounded-full bg-lime-200/[0.08] blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-full w-full opacity-[0.07]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
        <div className="relative mx-auto grid max-w-6xl items-end gap-10 px-5 pb-16 pt-16 sm:px-9 sm:pb-20 sm:pt-24 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-lime-200/25 bg-lime-200/[0.06] px-4 py-2 text-xs font-medium tracking-[0.18em] text-lime-200 uppercase"><ShieldCheck size={16} aria-hidden="true" /> Lista de control · Local y gratuita</p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.06] tracking-[-0.055em] sm:text-7xl">Un CV listo para <span className="text-lime-200">ser leído.</span></h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">Antes de enviar tu candidatura, revisa el contenido, la accesibilidad y los últimos detalles. Marca solo los puntos que has comprobado de verdad.</p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400">No subimos tu CV ni analizamos tus datos. Esta es una guía de revisión personal, no una puntuación de ATS ni una promesa de selección.</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/15 bg-white/[0.04] p-7 shadow-[0_25px_90px_#0006] backdrop-blur-xl sm:p-9">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-400">Progreso de revisión</p>
            <div className="mt-5 flex items-end gap-3"><span className="text-6xl font-semibold tracking-tighter text-lime-200 tabular-nums">{done}</span><span className="pb-2 text-xl text-zinc-400">/ {total}</span></div>
            <label htmlFor="cv-review-progress" className="mt-5 block text-sm text-zinc-300">{percentage}% de comprobaciones marcadas</label>
            <progress id="cv-review-progress" className="mt-3 h-3 w-full overflow-hidden rounded-full accent-lime-200" max={total} value={done}>{percentage}%</progress>
            <p className="mt-3 min-h-12 text-sm leading-6 text-zinc-400" aria-live="polite">{done === total ? "Has marcado todos los puntos. Confirma el archivo y el destinatario antes del envío." : done === 0 ? "Empieza por comprobar tus datos de contacto." : "Continúa con los puntos pendientes, a tu ritmo."}</p>
          </div>
        </div>
      </section>

      <section id="revisiones" aria-labelledby="review-heading" className="mx-auto max-w-6xl px-5 py-14 sm:px-9 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div><p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Revisión guiada</p><h2 id="review-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Doce comprobaciones, una candidatura cuidada.</h2></div>
          <button type="button" onClick={() => setCompleted([])} disabled={done === 0} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 px-5 py-2 text-sm text-zinc-200 transition enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200"><RotateCcw size={15} aria-hidden="true" /> Reiniciar revisión</button>
        </div>

        <div className="mt-10 space-y-10">
          {cvReviewGroups.map((group, index) => (
            <section key={group} aria-labelledby={"group-" + index}>
              <h3 id={"group-" + index} className="mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.17em] text-zinc-300"><span className="flex size-8 items-center justify-center rounded-full border border-white/20 text-xs tabular-nums">{String(index + 1).padStart(2, "0")}</span>{group}</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {cvReviewChecks.filter((item) => item.group === group).map((item) => {
                  const checked = completed.includes(item.id);
                  return (
                    <label key={item.id} className={"group flex min-h-36 cursor-pointer items-start gap-4 rounded-2xl border p-6 transition-colors focus-within:border-lime-200 " + (checked ? "border-lime-200/40 bg-lime-200/[0.08]" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]")}>
                      <input type="checkbox" checked={checked} onChange={(event) => toggle(item.id, event.target.checked)} className="mt-1 size-5 shrink-0 accent-lime-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200" />
                      <span className="block"><span className="flex items-start gap-2 text-base font-semibold leading-6">{item.title}{checked ? <Check size={17} aria-hidden="true" className="mt-1 shrink-0 text-lime-200" /> : null}</span><span className="mt-2 block text-sm leading-6 text-zinc-400">{item.detail}</span></span>
                    </label>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-white/15 bg-gradient-to-r from-white/[0.08] to-lime-200/[0.05] p-7 sm:p-10">
          <div><h2 className="text-2xl font-semibold tracking-tight">Tu próxima candidatura, mejor preparada.</h2><p className="mt-2 max-w-xl text-sm leading-7 text-zinc-300">Descarga tu lista para llevarla contigo o regresa al editor. Las marcas se mantienen solo mientras esta página está abierta; el fichero se guarda en tu dispositivo.</p></div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={downloadReview} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/35 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><Download size={17} aria-hidden="true" /> Descargar revisión .txt</button>
            <Link href="/cv" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-lime-200 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-lime-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Editar mi CV <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
      <footer className="border-t border-white/10 px-5 py-8 text-center text-xs leading-6 text-zinc-500">BELENTANI CV STUDIO · Guía manual, privada y sin validación automática de candidaturas.</footer>
    </main>
  );
}
