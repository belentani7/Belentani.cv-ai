import type { Metadata } from "next";
import { CvFinalReview } from "@/components/cv-final-review";

export const metadata: Metadata = {
  title: "Revisar antes de enviar",
  description: "Lista interactiva de 12 comprobaciones para revisar tu CV: contenido, enlaces, privacidad, accesibilidad y entrega. Sin subir tu documento.",
  alternates: { canonical: "/cv/preparar" },
};

export default function CvReviewPage() {
  return <CvFinalReview />;
}
