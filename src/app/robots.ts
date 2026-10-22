import type { MetadataRoute } from "next";

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
  };
}
