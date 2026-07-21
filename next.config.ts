import type { NextConfig } from "next";

// Static CSP (no nonces): the site is fully statically generated with no
// login or payment form yet, and nonces force dynamic rendering on every
// page — a real cost against this site's "runs untouched for years" goal.
// Revisit if/when a real form (Stripe, auth) needs stricter script-src.
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://www.google-analytics.com;
  connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspHeader.replace(/\n/g, "") },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async headers() {
    // HSTS is actively dangerous over the plain-HTTP dev server: a browser
    // that ever sees this header over HTTPS for a given host caches "always
    // upgrade to HTTPS" for up to 2 years (`includeSubDomains`, `preload`).
    // Reaching the dev server through a tunnel (Tailscale, ngrok, etc.) over
    // plain HTTP then silently breaks with no visible error the moment that
    // host is ever touched over HTTPS — the dev server has no TLS listener
    // to upgrade to. CSP and the rest stay on in dev; they're useful for
    // catching real violations early and don't have this one-way failure mode.
    const devHeaders = securityHeaders.filter(
      (header) => header.key !== "Strict-Transport-Security",
    );
    return [
      {
        source: "/(.*)",
        headers:
          process.env.NODE_ENV === "production" ? securityHeaders : devHeaders,
      },
    ];
  },
};

export default nextConfig;
