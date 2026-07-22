import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const mockCustomersList = vi.fn();
const mockBillingPortalSessionsCreate = vi.fn();

vi.mock("stripe", () => {
  return {
    default: class MockStripe {
      customers = {
        list: mockCustomersList,
      };
      billingPortal = {
        sessions: {
          create: mockBillingPortalSessionsCreate,
        },
      };
    },
  };
});

import { POST as portalHandler } from "../src/app/api/portal/route";

describe("Donor Billing Portal API Handler", () => {
  const originalEnv = process.env.STRIPE_SECRET_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_12345";
  });

  afterEach(() => {
    process.env.STRIPE_SECRET_KEY = originalEnv;
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
  });

  test("returns graceful message without leaking sensitive account info when customer is not found", async () => {
    mockCustomersList.mockResolvedValueOnce({ data: [] });

    const req = new Request("http://localhost:3000/api/portal", {
      method: "POST",
      body: JSON.stringify({ email: "nonexistent@example.com" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await portalHandler(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.url).toBeUndefined();
    expect(data.message).toBe(
      "If an active donor subscription is associated with this email address, access instructions have been processed.",
    );

    expect(mockCustomersList).toHaveBeenCalledWith({
      email: "nonexistent@example.com",
      limit: 1,
    });
    expect(mockBillingPortalSessionsCreate).not.toHaveBeenCalled();
  });

  test("creates billing portal session and returns url when customer is found", async () => {
    mockCustomersList.mockResolvedValueOnce({
      data: [{ id: "cus_12345" }],
    });
    mockBillingPortalSessionsCreate.mockResolvedValueOnce({
      url: "https://billing.stripe.com/session/bps_12345",
    });

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
    expect(data.url).toBe("https://billing.stripe.com/session/bps_12345");

    expect(mockCustomersList).toHaveBeenCalledWith({
      email: "donor@example.com",
      limit: 1,
    });
    expect(mockBillingPortalSessionsCreate).toHaveBeenCalledWith({
      customer: "cus_12345",
      return_url: "https://kothoministries.org/membership",
    });
  });

  test("returns 500 when Stripe API throws an error", async () => {
    mockCustomersList.mockRejectedValueOnce(
      new Error("Stripe network timeout"),
    );

    const req = new Request("http://localhost:3000/api/portal", {
      method: "POST",
      body: JSON.stringify({ email: "donor@example.com" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await portalHandler(req);
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.error).toBe("Stripe network timeout");
  });
});
