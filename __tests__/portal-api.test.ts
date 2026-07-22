import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const mockSend = vi.fn();

vi.mock("resend", () => {
  return {
    Resend: class MockResend {
      emails = { send: mockSend };
    },
  };
});

import { POST as portalHandler } from "../src/app/api/portal/route";

const GENERIC_MESSAGE =
  "If an active donor subscription is associated with this email address, we've sent access instructions to it.";

describe("Donor Portal magic-link request handler", () => {
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

  test("returns 400 when email is missing", async () => {
    const req = new Request("http://localhost:3000/api/portal", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });

    const res = await portalHandler(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe("Please enter a valid email address.");
    expect(mockSend).not.toHaveBeenCalled();
  });

  test("returns 400 when email format is invalid", async () => {
    const req = new Request("http://localhost:3000/api/portal", {
      method: "POST",
      body: JSON.stringify({ email: "invalid-email-string" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await portalHandler(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe("Please enter a valid email address.");
    expect(mockSend).not.toHaveBeenCalled();
  });

  test("sends a magic-link email and never returns a portal URL directly", async () => {
    const req = new Request("http://localhost:3000/api/portal", {
      method: "POST",
      body: JSON.stringify({ email: "donor@example.com" }),
      headers: {
        "Content-Type": "application/json",
        origin: "https://kothoministries.org",
      },
    });

    const res = await portalHandler(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.url).toBeUndefined();
    expect(data.message).toBe(GENERIC_MESSAGE);

    expect(mockSend).toHaveBeenCalledTimes(1);
    const sentEmail = mockSend.mock.calls[0][0];
    expect(sentEmail.to).toBe("donor@example.com");
    expect(sentEmail.html).toContain(
      "https://kothoministries.org/api/portal/verify?token=",
    );
  });

  test("returns the same generic message regardless of whether the email exists", async () => {
    // The handler never queries Stripe — existence is only checked at
    // /api/portal/verify, after the requester proves control of the inbox.
    const req1 = new Request("http://localhost:3000/api/portal", {
      method: "POST",
      body: JSON.stringify({ email: "unknown@example.com" }),
      headers: { "Content-Type": "application/json" },
    });
    const req2 = new Request("http://localhost:3000/api/portal", {
      method: "POST",
      body: JSON.stringify({ email: "donor@example.com" }),
      headers: { "Content-Type": "application/json" },
    });

    const [data1, data2] = await Promise.all([
      portalHandler(req1).then((r) => r.json()),
      portalHandler(req2).then((r) => r.json()),
    ]);

    expect(data1.message).toBe(GENERIC_MESSAGE);
    expect(data2.message).toBe(GENERIC_MESSAGE);
  });

  test("returns 500 when sending the email fails", async () => {
    mockSend.mockRejectedValueOnce(new Error("Resend network timeout"));

    const req = new Request("http://localhost:3000/api/portal", {
      method: "POST",
      body: JSON.stringify({ email: "donor@example.com" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await portalHandler(req);
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.error).toBe("Resend network timeout");
  });
});
