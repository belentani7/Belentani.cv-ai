import type { NextConfig } from "next";

// Do not use "standalone": Vercel needs the standard Next.js build output.
const frameHeaders =
  process.env.ARENA_PREVIEW === "1"
    ? []
    : [{ key: "X-Frame-Options", value: "DENY" }];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "@radix-ui/react-tabs",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-dialog",
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          ...frameHeaders,
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          // Do not opt into preload/includeSubDomains without auditing every subdomain.
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
        ],
      },
      {
        // Personal CV data and responses from authenticated API routes must never
        // be retained by intermediary or browser caches.
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
    ];
  },
};

export default nextConfig;
