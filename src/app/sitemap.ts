import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://belentani-cv-ai.vercel.app";
const LAST_VERIFIED = "2026-11-25";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: LAST_VERIFIED,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/cv`,
      lastModified: LAST_VERIFIED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/cv/preparar`,
      lastModified: LAST_VERIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
