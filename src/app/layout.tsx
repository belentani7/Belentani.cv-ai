import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const canonicalSite = "https://belentani-cv-ai-belentani7pedro-6758s-projects.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(canonicalSite),
  title: {
    default: "Belentani | CV Studio",
    template: "%s | Belentani",
  },
  description: "Crea, personaliza y exporta tu currículum en un estudio profesional de documentación.",
  keywords: ["currículum profesional", "CV Studio", "Belentani", "editor de CV", "currículum"],
  authors: [{ name: "Belentani" }],
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
  openGraph: {
    title: "Belentani | CV Studio",
    description: "Un espacio de trabajo para crear y adaptar tu currículum.",
    url: canonicalSite,
    siteName: "Belentani CV Studio",
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Belentani | CV Studio",
    description: "Diseña tu próximo currículum con Belentani.",
  },
};

export const viewport = {
  themeColor: "#08090b",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Belentani CV Studio",
                url: canonicalSite,
                description: "Estudio de currículums y documentos profesionales.",
              }),
            }}
          />
          {children}
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
