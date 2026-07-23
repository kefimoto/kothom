import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const mockSend = vi.fn();

vi.mock("resend", () => {
  return {
    Resend: class MockResend {
      emails = { send: mockSend };
    },
  };
});

import { requestDonorPortalAccess } from "../src/lib/actions";

const GENERIC_MESSAGE =
  "If an active donor subscription is associated with this email address, we've sent access instructions to it.";

describe("Donor Portal magic-link request action", () => {
  const originalResendKey = process.env.RESEND_API_KEY;
  const originalTokenSecret = process.env.PORTAL_TOKEN_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "re_test_12345";
    process.env.PORTAL_TOKEN_SECRET = "test-secret";
    mockSend.mockResolvedValue({ data: { id: "email_12345" }, error: null });
  });

  afterEach(() => {
    process.env.RESEND_API_KEY = originalResendKey;
    process.env.PORTAL_TOKEN_SECRET = originalTokenSecret;
  });

  test("returns an error when email is missing", async () => {
    const result = await requestDonorPortalAccess(
      {} as unknown as { email: string },
    );

    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toBe(
      "Please enter a valid email address.",
    );
    expect(mockSend).not.toHaveBeenCalled();
  });

  test("returns an error when email format is invalid", async () => {
    const result = await requestDonorPortalAccess({
      email: "invalid-email-string",
    });

    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toBe(
      "Please enter a valid email address.",
    );
    expect(mockSend).not.toHaveBeenCalled();
  });

  test("sends a magic-link email and never returns a portal URL directly", async () => {
    const result = await requestDonorPortalAccess({
      email: "donor@example.com",
    });

    expect(result.ok).toBe(true);
    expect(result.ok && "url" in result && result.url).toBeFalsy();
    expect(result.ok && result.message).toBe(GENERIC_MESSAGE);

    expect(mockSend).toHaveBeenCalledTimes(1);
    const sentEmail = mockSend.mock.calls[0][0];
    expect(sentEmail.to).toBe("donor@example.com");
    expect(sentEmail.html).toContain("/api/portal/verify?token=");
  });

  test("returns the same generic message regardless of whether the email exists", async () => {
    // The action never queries Stripe — existence is only checked at
    // /api/portal/verify, after the requester proves control of the inbox.
    const [result1, result2] = await Promise.all([
      requestDonorPortalAccess({ email: "unknown@example.com" }),
      requestDonorPortalAccess({ email: "donor@example.com" }),
    ]);

    expect(result1.ok && result1.message).toBe(GENERIC_MESSAGE);
    expect(result2.ok && result2.message).toBe(GENERIC_MESSAGE);
  });

  test("returns an error when sending the email fails", async () => {
    mockSend.mockRejectedValueOnce(new Error("Resend network timeout"));

    const result = await requestDonorPortalAccess({
      email: "donor@example.com",
    });

    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toBe("Resend network timeout");
  });
});
