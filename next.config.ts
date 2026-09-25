import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NO usar output: "standalone".
  // El modo standalone mueve los trazados .nft.json dentro de .next/standalone/,
  // y el paso onBuildComplete de Vercel busca .next/next-server.js.nft.json en la
  // raiz de .next. Resultado: ENOENT y fallo de TODOS los deploys (preview y prod).
  // Vercel construye Next.js de forma nativa y no necesita standalone.
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
