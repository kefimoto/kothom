import crypto from "node:crypto";

const DEFAULT_MAX_AGE_MS = 15 * 60 * 1000;

function getPortalTokenSecret(): string {
  const secret = process.env.PORTAL_TOKEN_SECRET;
  if (!secret) {
    throw new Error(
      "PORTAL_TOKEN_SECRET is not defined in environment variables",
    );
  }
  return secret;
}

function sign(payloadB64: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payloadB64).digest("hex");
}

/**
 * Signs a short-lived token binding a donor portal request to the email that
 * requested it. The token is emailed to that address rather than returned
 * over HTTP, so producing a Stripe billing portal session requires proving
 * control of the inbox, not just knowledge of the address.
 */
export function signPortalToken(email: string): string {
  const secret = getPortalTokenSecret();
  const payloadB64 = Buffer.from(
    JSON.stringify({ email, iat: Date.now() }),
  ).toString("base64url");
  const signature = sign(payloadB64, secret);
  return `${payloadB64}.${signature}`;
}

/**
 * Verifies a token produced by signPortalToken and returns the email it was
 * issued for, or null if the token is malformed, tampered with, or expired.
 * Tokens are not single-use (there is no datastore to mark them redeemed) —
 * the short expiry window is the only replay protection.
 */
export function verifyPortalToken(
  token: string,
  maxAgeMs: number = DEFAULT_MAX_AGE_MS,
): string | null {
  const secret = getPortalTokenSecret();
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const expected = sign(payloadB64, secret);
  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(signature, "hex");
  if (
    expectedBuf.length !== actualBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, actualBuf)
  ) {
    return null;
  }

  try {
    const { email, iat } = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as { email?: unknown; iat?: unknown };

    if (typeof email !== "string" || typeof iat !== "number") return null;
    if (Date.now() - iat > maxAgeMs) return null;

    return email;
  } catch {
    return null;
  }
}
