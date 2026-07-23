import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// Mock stripe SDK
const mockCheckoutSessionsCreate = vi.fn();
const mockConstructEvent = vi.fn();

vi.mock("stripe", () => {
  return {
    default: class MockStripe {
      checkout = {
        sessions: {
          create: mockCheckoutSessionsCreate,
        },
      };
      webhooks = {
        constructEvent: mockConstructEvent,
      };
    },
  };
});

// Mock ministry module to control CAN_ACCEPT_ONLINE_DONATIONS
vi.mock("../src/lib/ministry", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/lib/ministry")>();
  return {
    ...actual,
    CAN_ACCEPT_ONLINE_DONATIONS: true,
  };
});

import { POST as webhookHandler } from "../src/app/api/webhooks/stripe/route";
import { createCheckoutSession } from "../src/lib/actions";
import { getStripeServer } from "../src/lib/stripe";

describe("Stripe Server SDK", () => {
  const originalEnv = process.env.STRIPE_SECRET_KEY;

  afterEach(() => {
    process.env.STRIPE_SECRET_KEY = originalEnv;
  });

  test("throws an error when STRIPE_SECRET_KEY is missing", () => {
    delete process.env.STRIPE_SECRET_KEY;
    expect(() => getStripeServer()).toThrow("STRIPE_SECRET_KEY is not defined");
  });

  test("returns Stripe instance when STRIPE_SECRET_KEY is present", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_12345";
    const client = getStripeServer();
    expect(client).toBeDefined();
  });
});

describe("Checkout Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_12345";
  });

  test("validates donation amount", async () => {
    const result = await createCheckoutSession({
      amount: -10,
      frequency: "monthly",
      email: "donor@example.com",
    });
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toBe("Invalid donation amount.");
  });

  test("validates donation frequency", async () => {
    const result = await createCheckoutSession({
      amount: 50,
      frequency: "weekly",
      email: "donor@example.com",
    });
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toBe("Invalid frequency specified.");
  });

  test("creates recurring monthly checkout session with metadata", async () => {
    mockCheckoutSessionsCreate.mockResolvedValueOnce({
      id: "cs_test_monthly",
      url: "https://checkout.stripe.com/pay/cs_test_monthly",
    });

    const result = await createCheckoutSession({
      amount: 25,
      frequency: "monthly",
      email: "john@example.com",
      tShirtSize: "L",
      displayName: "John Doe",
      isAnonymous: false,
    });

    expect(result.ok).toBe(true);
    expect(result).toEqual({
      ok: true,
      sessionId: "cs_test_monthly",
      url: "https://checkout.stripe.com/pay/cs_test_monthly",
    });

    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        line_items: [
          expect.objectContaining({
            price_data: expect.objectContaining({
              currency: "usd",
              unit_amount: 2500,
              recurring: { interval: "month" },
            }),
          }),
        ],
        metadata: {
          tShirtSize: "L",
          displayName: "John Doe",
          isAnonymous: "false",
        },
      }),
    );
  });

  test("creates recurring annual checkout session", async () => {
    mockCheckoutSessionsCreate.mockResolvedValueOnce({
      id: "cs_test_annual",
      url: "https://checkout.stripe.com/pay/cs_test_annual",
    });

    const result = await createCheckoutSession({
      amount: 100,
      frequency: "annual",
      email: "donor@example.com",
      isAnonymous: true,
    });

    expect(result.ok).toBe(true);

    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        line_items: [
          expect.objectContaining({
            price_data: expect.objectContaining({
              unit_amount: 10000,
              recurring: { interval: "year" },
            }),
          }),
        ],
        metadata: expect.objectContaining({
          isAnonymous: "true",
        }),
      }),
    );
  });

  test("creates one-time payment checkout session", async () => {
    mockCheckoutSessionsCreate.mockResolvedValueOnce({
      id: "cs_test_onetime",
      url: "https://checkout.stripe.com/pay/cs_test_onetime",
    });

    const result = await createCheckoutSession({
      amount: 50,
      frequency: "one-time",
      email: "donor@example.com",
    });

    expect(result.ok).toBe(true);

    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        line_items: [
          expect.objectContaining({
            price_data: expect.objectContaining({
              unit_amount: 5000,
            }),
          }),
        ],
      }),
    );
  });
});

describe("Stripe Webhook Handler", () => {
  const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_12345";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
  });

  afterEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
  });

  test("returns 500 when STRIPE_WEBHOOK_SECRET is not configured", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const req = new Request("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
    });
    const res = await webhookHandler(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("Webhook secret is missing");
  });

  test("returns 400 when stripe-signature header is missing", async () => {
    const req = new Request("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
    });
    const res = await webhookHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Missing stripe-signature header.");
  });

  test("returns 400 on signature verification error", async () => {
    mockConstructEvent.mockImplementationOnce(() => {
      throw new Error("Invalid signature");
    });

    const req = new Request("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: '{"type":"checkout.session.completed"}',
      headers: { "stripe-signature": "t=123,v1=bad_sig" },
    });

    const res = await webhookHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Webhook Error: Invalid signature");
  });

  test("handles checkout.session.completed event successfully", async () => {
    mockConstructEvent.mockReturnValueOnce({
      type: "checkout.session.completed",
      data: { object: { id: "cs_123" } },
    });

    const req = new Request("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: '{"type":"checkout.session.completed"}',
      headers: { "stripe-signature": "t=123,v1=valid_sig" },
    });

    const res = await webhookHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ received: true });
  });

  test("handles invoice.payment_succeeded event successfully", async () => {
    mockConstructEvent.mockReturnValueOnce({
      type: "invoice.payment_succeeded",
      data: { object: { id: "in_123" } },
    });

    const req = new Request("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: '{"type":"invoice.payment_succeeded"}',
      headers: { "stripe-signature": "t=123,v1=valid_sig" },
    });

    const res = await webhookHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ received: true });
  });
});
