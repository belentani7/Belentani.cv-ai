import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://belentani-cv-ai.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Belentani CV Studio | Tu trayectoria, bien contada", template: "%s | Belentani CV Studio" },
  description: "Crea y personaliza tu currículum con plantillas profesionales, editor de experiencia y asistencia opcional de IA.",
  applicationName: "Belentani CV Studio",
  authors: [{ name: "Belentani" }],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  manifest: "/manifest.json",
  icons: { icon: "/logo.svg" },
  openGraph: {
    type: "website", locale: "es_ES", siteName: "Belentani CV Studio",
    title: "Belentani CV Studio | Tu trayectoria, bien contada",
    description: "Diseña tu currículum profesional y prepara tus candidaturas.",
    url: siteUrl,
  },
  twitter: { card: "summary", title: "Belentani CV Studio", description: "Tu trayectoria, bien contada." },
};
export const viewport: Viewport = { themeColor: "#090a0d", viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={[geistSans.variable, geistMono.variable, "min-h-screen antialiased"].join(" ")}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org", "@type": "SoftwareApplication",
            name: "Belentani CV Studio", url: siteUrl,
            description: "Editor profesional de currículums y cartas de presentación.",
            applicationCategory: "BusinessApplication", operatingSystem: "Web",
            publisher: { "@type": "Organization", name: "Belentani" },
          }) }} />
          {children}
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
