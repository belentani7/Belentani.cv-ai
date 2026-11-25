import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://belentani-cv-ai.vercel.app";

/** Keep private workflows and machine endpoints out of search indexes. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/cv/editor/", "/cv/drafts/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
