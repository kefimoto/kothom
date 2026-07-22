import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const mockCustomersList = vi.fn();
const mockBillingPortalSessionsCreate = vi.fn();

vi.mock("stripe", () => {
  return {
    default: class MockStripe {
      customers = { list: mockCustomersList };
      billingPortal = {
        sessions: { create: mockBillingPortalSessionsCreate },
      };
    },
  };
});

import { GET as verifyHandler } from "../src/app/api/portal/verify/route";
import { signPortalToken } from "../src/lib/portal-token";

describe("Donor Portal magic-link verification handler", () => {
  const originalStripeKey = process.env.STRIPE_SECRET_KEY;
  const originalTokenSecret = process.env.PORTAL_TOKEN_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_12345";
    process.env.PORTAL_TOKEN_SECRET = "test-secret";
  });

  afterEach(() => {
    process.env.STRIPE_SECRET_KEY = originalStripeKey;
    process.env.PORTAL_TOKEN_SECRET = originalTokenSecret;
    vi.restoreAllMocks();
  });

  test("redirects to an error state when no token is present", async () => {
    const req = new Request("https://kothoministries.org/api/portal/verify");
    const res = await verifyHandler(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "https://kothoministries.org/give?portal_error=missing_token",
    );
    expect(mockCustomersList).not.toHaveBeenCalled();
  });

  test("redirects to an error state when the token is invalid or tampered with", async () => {
    const req = new Request(
      "https://kothoministries.org/api/portal/verify?token=not-a-real-token",
    );
    const res = await verifyHandler(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "https://kothoministries.org/give?portal_error=invalid_or_expired",
    );
    expect(mockCustomersList).not.toHaveBeenCalled();
  });

  test("redirects to an error state when the token has expired", async () => {
    const staleToken = signPortalToken("donor@example.com");
    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 20 * 60 * 1000);

    const req = new Request(
      `https://kothoministries.org/api/portal/verify?token=${encodeURIComponent(staleToken)}`,
    );
    const res = await verifyHandler(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "https://kothoministries.org/give?portal_error=invalid_or_expired",
    );
  });

  test("redirects to an error state when no Stripe customer matches the verified email", async () => {
    mockCustomersList.mockResolvedValueOnce({ data: [] });
    const token = signPortalToken("donor@example.com");

    const req = new Request(
      `https://kothoministries.org/api/portal/verify?token=${encodeURIComponent(token)}`,
    );
    const res = await verifyHandler(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "https://kothoministries.org/give?portal_error=not_found",
    );
    expect(mockCustomersList).toHaveBeenCalledWith({
      email: "donor@example.com",
      limit: 1,
    });
    expect(mockBillingPortalSessionsCreate).not.toHaveBeenCalled();
  });

  test("redirects to the Stripe billing portal once the token and customer both check out", async () => {
    mockCustomersList.mockResolvedValueOnce({ data: [{ id: "cus_12345" }] });
    mockBillingPortalSessionsCreate.mockResolvedValueOnce({
      url: "https://billing.stripe.com/session/bps_12345",
    });
    const token = signPortalToken("donor@example.com");

    const req = new Request(
      `https://kothoministries.org/api/portal/verify?token=${encodeURIComponent(token)}`,
    );
    const res = await verifyHandler(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "https://billing.stripe.com/session/bps_12345",
    );
    expect(mockBillingPortalSessionsCreate).toHaveBeenCalledWith({
      customer: "cus_12345",
      return_url: "https://kothoministries.org/membership",
    });
  });

  test("redirects to an error state when Stripe throws", async () => {
    mockCustomersList.mockRejectedValueOnce(new Error("Stripe outage"));
    const token = signPortalToken("donor@example.com");

    const req = new Request(
      `https://kothoministries.org/api/portal/verify?token=${encodeURIComponent(token)}`,
    );
    const res = await verifyHandler(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "https://kothoministries.org/give?portal_error=server_error",
    );
  });
});
