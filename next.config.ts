import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El script de build copia .next/static dentro de .next/standalone/.next/,
  // lo que exige salida standalone.
  output: "standalone",
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
