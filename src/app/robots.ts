import type { MetadataRoute } from "next";

/** Las páginas privadas deben requerir autorización: robots.txt no protege datos. */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://belentani-cv-ai.vercel.app";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/cv/editor/", "/cv/drafts/"],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
