import type { MetadataRoute } from "next";

/** Únicamente páginas de presentación públicas; nunca CV ni datos personales. */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://belentani-cv-ai.vercel.app";
  return ["/", "/cv"].map((path) => ({
    url: new URL(path, siteUrl).toString(),
  }));
}
