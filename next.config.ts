import { execSync } from "node:child_process";
import type { NextConfig } from "next";

// Best-effort: read this machine's own Tailscale hostname/IPv4 so the dev
// server can be reached from a phone over the tailnet without hardcoding any
// one contributor's device info into a file every contributor shares. Silent
// no-op (empty list) if Tailscale isn't installed/running — most contributors
// won't have it, and this must never break `next build` or plain `next dev`
// for them. Only attempted outside production; nothing here affects the
// production server, which doesn't read allowedDevOrigins at all.
function getTailscaleDevOrigins(): string[] {
  if (process.env.NODE_ENV === "production") return [];
  try {
    const raw = execSync("tailscale status --json", {
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 2000,
    }).toString();
    const status = JSON.parse(raw);
    const origins: string[] = [];
    const dnsName: unknown = status?.Self?.DNSName;
    if (typeof dnsName === "string" && dnsName.length > 0) {
      origins.push(dnsName.replace(/\.$/, ""));
    }
    const ips: unknown[] = status?.Self?.TailscaleIPs ?? [];
    for (const ip of ips) {
      // IPv6 literals need brackets to be valid host entries here, and the
      // DNS name above already covers the common case — skip them.
      if (typeof ip === "string" && !ip.includes(":")) origins.push(ip);
    }
    return origins;
  } catch {
    return [];
  }
}

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
//
// `'unsafe-eval'` (script-src) and `ws: wss:` (connect-src) are dev-only too:
// Turbopack's dev client uses eval() to parse RSC/HMR payloads and opens a
// plain WebSocket for live-reload (`/_next/webpack-hmr`). Without these,
// hydration fails outright — not a degraded/no-live-reload experience, a
// completely blank page, since the RSC client throws before React ever
// mounts. React never uses eval() in a production build, so this can't leak
// into prod by accident even if someone forgets the isProduction check.
function cspDirectivesFor(isProduction: boolean) {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"} https://www.googletagmanager.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://www.google-analytics.com",
    `connect-src 'self'${isProduction ? "" : " ws: wss:"} https://www.google-analytics.com https://region1.google-analytics.com`,
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isProduction ? ["upgrade-insecure-requests"] : []),
  ];
}

function securityHeadersFor(isProduction: boolean) {
  const csp = cspDirectivesFor(isProduction);
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
  // Lets the dev server be reached from a phone over Tailscale for on-device
  // checks. Next.js's dev server independently rejects cross-origin requests
  // to dev-only endpoints (this is a server-side Origin-header check, not a
  // CSP/browser thing) unless the origin is allowlisted here — confirmed
  // directly: a raw WebSocket handshake to /_next/webpack-hmr with an Origin
  // header set succeeds with no allowlist entry, fails with one. Without
  // this, the HMR socket connection fails, and Turbopack's dev bootstrap
  // stalls waiting on it — not a degraded no-live-reload experience, a
  // completely unhydrated page, since React never gets to mount at all.
  // Dev-only — has no effect on `next build` or the production server.
  allowedDevOrigins: getTailscaleDevOrigins(),
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
