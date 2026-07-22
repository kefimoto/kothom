import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { signPortalToken, verifyPortalToken } from "../src/lib/portal-token";

describe("portal magic-link token", () => {
  const originalSecret = process.env.PORTAL_TOKEN_SECRET;

  beforeEach(() => {
    process.env.PORTAL_TOKEN_SECRET = "test-secret";
  });

  afterEach(() => {
    process.env.PORTAL_TOKEN_SECRET = originalSecret;
    vi.restoreAllMocks();
  });

  test("round-trips the email that was signed", () => {
    const token = signPortalToken("donor@example.com");
    expect(verifyPortalToken(token)).toBe("donor@example.com");
  });

  test("rejects a token signed with a different secret", () => {
    const token = signPortalToken("donor@example.com");
    process.env.PORTAL_TOKEN_SECRET = "a-different-secret";
    expect(verifyPortalToken(token)).toBeNull();
  });

  test("rejects a token whose payload has been tampered with", () => {
    const token = signPortalToken("donor@example.com");
    const [payloadB64, signature] = token.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify({ email: "attacker@example.com", iat: Date.now() }),
    ).toString("base64url");

    expect(verifyPortalToken(`${tamperedPayload}.${signature}`)).toBeNull();
    expect(payloadB64).not.toBe(tamperedPayload);
  });

  test("rejects a malformed token", () => {
    expect(verifyPortalToken("not-a-token")).toBeNull();
    expect(verifyPortalToken("")).toBeNull();
  });

  test("rejects a token older than the max age", () => {
    const token = signPortalToken("donor@example.com");
    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 16 * 60 * 1000);
    expect(verifyPortalToken(token)).toBeNull();
  });

  test("accepts a token within a custom max age", () => {
    const token = signPortalToken("donor@example.com");
    expect(verifyPortalToken(token, 60 * 60 * 1000)).toBe("donor@example.com");
  });
});
