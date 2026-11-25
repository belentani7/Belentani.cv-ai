import { analyzeCvForOffer, extractOfferKeywords, normalizeForMatch } from "@/lib/cv-ats-adapter";
import type { CvDraft } from "@/lib/cv-draft-privacy";

const baseDraft: CvDraft = {
  fullName: "María González Pérez",
  profession: "Cuidadora sociosanitaria",
  email: "maria.gonzalez@example.com",
  phone: "+34 612 345 678",
  address: "Barcelona, España",
  summary:
    "Profesional sociosanitaria con cinco años de experiencia en atención domiciliaria, administración de medicación, apoyo en movilidad reducida y coordinación con familias y equipos médicos.",
  experiences: [
    {
      position: "Auxiliar de ayuda a domicilio",
      company: "Servicio Municipal",
      startDate: "Ene 2022",
      endDate: "Actual",
      description:
        "Atención directa a personas mayores, control de constantes, primeros auxilios y acompañamiento hospitalario.",
    },
  ],
  education: [
    {
      title: "Certificado de Atención Sociosanitaria",
      institution: "Centro FP Barcelona",
      year: "2021",
      description: "Formación acreditada",
    },
  ],
  skills: [
    "Primeros auxilios",
    "Administración de medicación",
    "Movilidad reducida",
    "Trabajo en equipo",
  ],
  languages: ["Español (nativo)", "Catalán (intermedio)"],
};

describe("cv-ats-adapter", () => {
  it("normaliza acentos, mayúsculas y signos de puntuación de forma determinista", () => {
    expect(normalizeForMatch("¡Atención Sociosanitaria & Prevención de Riesgos!")).toBe(
      "atencion sociosanitaria prevencion de riesgos",
    );
  });

  it("extrae términos compuestos y técnicos filtrando palabras vacías de portales de empleo", () => {
    const offer = `
      Empresa líder buscamos perfil para incorporación inmediata a jornada completa.
      Requisitos imprescindibles: atención al cliente, primeros auxilios, microsoft excel y catalán.
    `;
    const keywords = extractOfferKeywords(offer);
    expect(keywords).toContain("atencion al cliente");
    expect(keywords).toContain("primeros auxilios");
    expect(keywords).toContain("microsoft excel");
    expect(keywords).toContain("catalan");
    expect(keywords).not.toContain("empresa");
    expect(keywords).not.toContain("buscamos");
    expect(keywords).not.toContain("incorporacion");
  });

  it("devuelve 0% y diagnóstico estructural completo cuando no se introduce oferta", () => {
    const result = analyzeCvForOffer(baseDraft, "   ");
    expect(result.offerProvided).toBe(false);
    expect(result.totalOfferKeywords).toBe(0);
    expect(result.matchPercentage).toBe(0);
    expect(result.passedChecksCount).toBe(6);
    expect(result.atsChecks.every((c) => c.passed)).toBe(true);
  });

  it("distingue términos presentes y ausentes sin mutar el borrador del candidato", () => {
    const snapshot = JSON.stringify(baseDraft);
    const offer =
      "Precisamos auxiliar con primeros auxilios, movilidad reducida, trabajo en equipo y microsoft excel.";
    const result = analyzeCvForOffer(baseDraft, offer);

    expect(result.offerProvided).toBe(true);
    expect(result.matchedKeywords).toEqual(
      expect.arrayContaining(["primeros auxilios", "movilidad reducida", "trabajo en equipo"]),
    );
    expect(result.missingKeywords).toContain("microsoft excel");
    expect(result.matchPercentage).toBeGreaterThan(50);
    expect(result.matchPercentage).toBeLessThan(100);
    expect(JSON.stringify(baseDraft)).toBe(snapshot);
  });

  it("detecta DNI/NIE innecesario, falta de contacto y fechas incompletas en la auditoría ATS", () => {
    const incompleteDraft: CvDraft = {
      ...baseDraft,
      email: "correo-invalido",
      summary: "Resumen demasiado corto con DNI 12345678Z incluido.",
      experiences: [
        {
          position: "Dependienta",
          company: "Comercio Local",
          startDate: "",
          endDate: "",
          description: "Ventas.",
        },
      ],
      skills: ["Caja"],
    };

    const result = analyzeCvForOffer(incompleteDraft, "");
    const byId = Object.fromEntries(result.atsChecks.map((c) => [c.id, c.passed]));

    expect(byId["contact-complete"]).toBe(false);
    expect(byId["dni-privacy"]).toBe(false);
    expect(byId["summary-length"]).toBe(false);
    expect(byId["experience-evidence"]).toBe(false);
    expect(byId["dates-present"]).toBe(false);
    expect(byId["skills-populated"]).toBe(false);
    expect(result.passedChecksCount).toBe(0);
  });
});
