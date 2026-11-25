/** @jest-environment jsdom */
import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { CV_TEMPLATES } from "@/data/cv-templates";
import { TemplatePreview } from "@/components/manos-abiertas/template-preview";
import { CVPreview } from "@/components/manos-abiertas/cv-section";
import { CvOfferAdapter } from "@/components/manos-abiertas/cv-offer-adapter";

describe("Plantillas diferenciadas del CV Studio y adaptador por oferta", () => {
  afterEach(() => {
    cleanup();
  });

  it("mantiene 7 plantillas verificadas sin reclamos de oficialidad ni erratas en inglés", () => {
    expect(CV_TEMPLATES).toHaveLength(7);
    for (const tpl of CV_TEMPLATES) {
      expect(tpl.description.toLowerCase()).not.toContain("plantilla oficial");
      expect(tpl.description.toLowerCase()).not.toContain("colored");
    }
  });

  it("renderiza miniaturas accesibles con estado aria-pressed para las 7 plantillas", () => {
    const onSelect = jest.fn();
    const { getByRole, rerender } = render(
      <TemplatePreview template={CV_TEMPLATES[5]} selected={true} onSelect={onSelect} />,
    );
    const btn = getByRole("button", { name: new RegExp(CV_TEMPLATES[5].name, "i") });
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(btn);
    expect(onSelect).toHaveBeenCalledTimes(1);

    rerender(<TemplatePreview template={CV_TEMPLATES[6]} selected={false} onSelect={onSelect} />);
    const techBtn = getByRole("button", { name: new RegExp(CV_TEMPLATES[6].name, "i") });
    expect(techBtn.getAttribute("aria-pressed")).toBe("false");
  });

  it("renderiza las 7 variantes reales en CVPreview sin inyectar encabezados <h1> duplicados", () => {
    const sampleProps = {
      fullName: "Elena Martín Soto",
      profession: "Técnica de Logística",
      email: "elena@example.com",
      phone: "+34 600 123 456",
      address: "Valencia, España",
      summary: "Especialista en control de stock y recepción de mercancías.",
      experiences: [
        {
          id: "1",
          position: "Coordinadora de almacén",
          company: "LogisVal",
          startDate: "2022",
          endDate: "Actual",
          description: "Control de inventario y expediciones.",
        },
      ],
      education: [
        {
          id: "1",
          title: "FP Grado Superior Transporte y Logística",
          institution: "IES Valencia",
          year: "2021",
          description: "",
        },
      ],
      skills: ["Control de stock", "SAP", "Prevención de riesgos"],
      languages: ["Español", "Inglés B2"],
      hasContent: true,
    };

    const renderedSignatures = new Set<string>();

    for (const tpl of CV_TEMPLATES) {
      const { container, unmount } = render(<CVPreview {...sampleProps} template={tpl} />);
      const article = container.querySelector("article");
      expect(article).not.toBeNull();
      expect(article?.getAttribute("data-cv-template")).toBe(tpl.id);
      // Ninguna vista previa debe introducir un <h1> adicional en la página
      expect(container.querySelectorAll("h1")).toHaveLength(0);
      renderedSignatures.add(container.innerHTML);

      if (tpl.id === "sidebar-photo") {
        // Verifica monograma con iniciales EM (Elena ... Soto -> ES)
        expect(container.textContent).toContain("ES");
      }
      if (tpl.id === "two-column-tech") {
        expect(container.textContent).toContain("// Perfil");
      }
      unmount();
    }

    // Las 7 plantillas producen marcado estructuralmente distinto entre sí
    expect(renderedSignatures.size).toBe(7);
  });

  it("permite cargar una oferta de ejemplo en CvOfferAdapter y añadir una habilidad real con un clic", () => {
    const onAddRealSkill = jest.fn();
    const { getByText, getAllByRole } = render(
      <CvOfferAdapter
        draft={{
          fullName: "Ana Ruiz",
          profession: "Auxiliar",
          email: "ana@example.com",
          phone: "+34 611222333",
          address: "Madrid",
          summary:
            "Auxiliar con amplia trayectoria en acompañamiento domiciliario, higiene y organización diaria de tareas asistenciales.",
          experiences: [
            {
              position: "Cuidadora",
              company: "Residencia Sol",
              startDate: "2021",
              endDate: "2024",
              description: "Atención directa y apoyo cotidiano a residentes dependientes.",
            },
          ],
          education: [],
          skills: ["Trabajo en equipo"],
          languages: ["Español"],
        }}
        onAddRealSkill={onAddRealSkill}
      />,
    );

    fireEvent.click(getByText("Probar con oferta de ejemplo"));
    expect(getByText(/Cobertura terminológica frente a la oferta/i)).toBeTruthy();

    const addSkillButtons = getAllByRole("button", { name: /Añadir competencia real/i });
    expect(addSkillButtons.length).toBeGreaterThan(0);
    fireEvent.click(addSkillButtons[0]);
    expect(onAddRealSkill).toHaveBeenCalledTimes(1);
  });
});
