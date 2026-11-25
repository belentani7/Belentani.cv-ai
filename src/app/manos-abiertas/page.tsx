import type { Metadata } from "next";
import { ManosAbiertasApp } from "@/components/manos-abiertas/manos-abiertas-app";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Manos Abiertas — experiencia conservada",
  robots: { index: false, follow: false },
};

export default function PreservedManosAbiertas() {
  return (
    <>
      <ManosAbiertasApp />
      <SonnerToaster position="top-center" richColors />
    </>
  );
}
