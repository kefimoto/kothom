import type { NextConfig } from "next";

// Static CSP (no nonces): the site is fully statically generated with no
// login or payment form yet, and nonces force dynamic rendering on every
// page — a real cost against this site's "runs untouched for years" goal.
// Revisit if/when a real form (Stripe, auth) needs stricter script-src.
//
// `upgrade-insecure-requests` is dropped outside production: it tells the
// browser to rewrite every subresource request on the page (script/link/img)
// from http to https, regardless of what scheme the page itself loaded over.
// The dev server has no TLS listener, so over a plain-HTTP origin (Tailscale,
// ngrok, a LAN IP — anything that isn't the special-cased `localhost`) this
// silently breaks every asset request with ERR_SSL_PROTOCOL_ERROR: the page
// loads, but every script, stylesheet, and image request gets rewritten to a
// https:// URL that nothing answers. `curl` never surfaces this since CSP is
// a browser-enforced behavior, not a server one — verify in a real browser.
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://www.google-analytics.com",
  "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
];

function securityHeadersFor(isProduction: boolean) {
  const csp = isProduction
    ? [...cspDirectives, "upgrade-insecure-requests"]
    : cspDirectives;
  return [
    { key: "Content-Security-Policy", value: `${csp.join("; ")};` },
    // HSTS is also production-only: a browser that ever sees this header over
    // HTTPS for a given host caches "always upgrade to HTTPS" for up to 2
    // years (`includeSubDomains`, `preload`), which breaks the same way as
    // upgrade-insecure-requests above the moment that host is ever touched
    // over HTTPS, but persists across restarts since it's cached client-side.
    ...(isProduction
      ? [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ]
      : []),
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    },
    { key: "X-DNS-Prefetch-Control", value: "on" },
  ];
}

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeadersFor(process.env.NODE_ENV === "production"),
      },
    ];
  },
};

export default nextConfig;
