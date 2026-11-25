"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, AlertCircle, Plus, ShieldCheck, Target, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { analyzeCvForOffer } from "@/lib/cv-ats-adapter";
import type { CvDraft } from "@/lib/cv-draft-privacy";

export interface CvOfferAdapterProps {
  draft: CvDraft;
  onAddRealSkill: (skill: string) => void;
}

const SAMPLE_OFFER = `Buscamos profesional de atención sociosanitaria / cuidados de personas mayores para centro residencial en Barcelona.
Requisitos reales valorados:
- Atención al cliente y trato empático con familias.
- Administración de medicación, control de constantes y apoyo en movilidad reducida.
- Formación o curso de primeros auxilios.
- Trabajo en equipo, resolución de problemas y organización diaria.
- Idiomas: español fluido; se valorará catalán o inglés básico.`;

export function CvOfferAdapter({ draft, onAddRealSkill }: CvOfferAdapterProps) {
  const [offerText, setOfferText] = useState("");

  const analysis = useMemo(() => analyzeCvForOffer(draft, offerText), [draft, offerText]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" aria-hidden="true" />
              Adaptación por oferta y lectura ATS
            </CardTitle>
            <Badge variant="secondary" className="gap-1 text-[11px]">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              100 % local · sin envío de datos
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Pega el texto de la vacante para comparar qué términos clave ya figuran en tu borrador de CV y comprobar la estructura del documento. Nunca inventa experiencia ni garantiza selección.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="job-offer-input" className="text-xs font-medium">
                Texto de la oferta de empleo
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOfferText(SAMPLE_OFFER)}
                  className="min-h-9 text-xs"
                >
                  Probar con oferta de ejemplo
                </Button>
                {offerText && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setOfferText("")}
                    aria-label="Limpiar texto de la oferta"
                    className="min-h-9 text-xs gap-1"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Limpiar
                  </Button>
                )}
              </div>
            </div>
            <Textarea
              id="job-offer-input"
              value={offerText}
              onChange={(e) => setOfferText(e.target.value)}
              placeholder="Pega aquí la descripción del puesto, requisitos y competencias publicadas en la oferta..."
              className="min-h-[120px] text-sm"
            />
          </div>

          {analysis.offerProvided ? (
            <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Cobertura terminológica frente a la oferta
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">
                    {analysis.matchPercentage}%{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({analysis.matchedKeywords.length} de {analysis.totalOfferKeywords} términos detectados)
                    </span>
                  </p>
                </div>
              </div>

              {analysis.matchedKeywords.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-emerald-400 mb-1.5">
                    Presentes en tu CV ({analysis.matchedKeywords.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.matchedKeywords.map((kw) => (
                      <Badge
                        key={kw}
                        variant="secondary"
                        className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-xs"
                      >
                        ✓ {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {analysis.missingKeywords.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-amber-300 mb-1">
                    No detectados en tu CV ({analysis.missingKeywords.length})
                  </p>
                  <p className="text-[11px] text-muted-foreground mb-2">
                    Pulsa para añadir a tus habilidades <strong>únicamente</strong> si posees esa experiencia o competencia real:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.missingKeywords.map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => onAddRealSkill(kw)}
                        aria-label={`Añadir competencia real ${kw} al CV`}
                        className="inline-flex min-h-9 items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground transition-colors hover:border-primary hover:bg-primary/10"
                      >
                        <Plus className="h-3 w-3 text-primary" aria-hidden="true" />
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
              Aún no has pegado ninguna oferta. Mientras tanto, revisa debajo las 6 comprobaciones estructurales de tu borrador actual.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm font-semibold">
              Diagnóstico estructural de legibilidad ATS ({analysis.passedChecksCount}/{analysis.atsChecks.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-2.5 sm:grid-cols-2">
          {analysis.atsChecks.map((check) => (
            <div
              key={check.id}
              className="flex items-start gap-2.5 rounded-lg border border-border bg-secondary/30 p-3"
            >
              {check.passed ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium leading-snug">{check.label}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                  {check.advice}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
