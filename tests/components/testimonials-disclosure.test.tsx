import { renderToStaticMarkup } from "react-dom/server";
import { TestimonialsSection } from "@/components/manos-abiertas/faq-testimonials";

describe("Manos Abiertas testimonial disclosure", () => {
  it("clearly identifies examples as fictional and avoids implying verified outcomes", () => {
    const markup = renderToStaticMarkup(<TestimonialsSection />);

    expect(markup).toContain("Historias ilustrativas");
    expect(markup).toContain("Ejemplos de posibles trayectorias");
    expect(markup).toContain(
      "Casos ficticios para ilustrar usos posibles de la plataforma. No representan testimonios verificados ni garantizan resultados."
    );
    expect(markup).not.toContain("Historias reales");
    expect(markup).not.toContain("Personas que cambiaron su vida");
  });
});
