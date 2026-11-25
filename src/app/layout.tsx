import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider } from "next-themes";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://belentani-cv-ai.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Belentani CV Studio | Tu trayectoria, bien contada",
    template: "%s | Belentani CV Studio",
  },
  description:
    "Crea, adapta por oferta y exporta tu currículum con 7 plantillas profesionales, diagnóstico local de legibilidad ATS y asistencia opcional de IA.",
  applicationName: "Belentani CV Studio",
  authors: [{ name: "Belentani" }],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Belentani CV Studio",
    title: "Belentani CV Studio | Tu trayectoria, bien contada",
    description: "Diseña tu currículum profesional, adáptalo a cada oferta y prepara tus candidaturas.",
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: "Belentani CV Studio",
    description: "Tu trayectoria, bien contada.",
  },
};

export const viewport: Viewport = { themeColor: "#05030a", viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={[GeistSans.variable, GeistMono.variable, "min-h-screen antialiased"].join(" ")}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "Belentani CV Studio",
                url: siteUrl,
                description:
                  "Estudio profesional de currículums, adaptación por oferta y cartas de presentación.",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web",
                publisher: { "@type": "Organization", name: "Belentani" },
              }),
            }}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
