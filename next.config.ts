import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.fr-par.scw.cloud",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.s3.fr-par.scw.cloud",
        pathname: "/**",
      },
    ],
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=(self), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.axept.io https://*.axept.io",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://s3.fr-par.scw.cloud https://*.s3.fr-par.scw.cloud https://*.axept.io",
              "font-src 'self' data:",
              "connect-src 'self' https://api-adresse.data.gouv.fr https://s3.fr-par.scw.cloud https://*.axept.io",
              "frame-src 'self' https://*.axept.io",
              "frame-ancestors 'none'",
              "form-action 'self'",
              "base-uri 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
