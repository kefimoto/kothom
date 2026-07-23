"use server";

import { headers } from "next/headers";
import type Stripe from "stripe";
import { CAN_ACCEPT_ONLINE_DONATIONS } from "@/lib/ministry";
import { signPortalToken } from "@/lib/portal-token";
import { getResendClient } from "@/lib/resend";
import { getStripeServer } from "@/lib/stripe";
import { EMAIL_REGEX } from "@/lib/validation";

/**
 * Resolves the request origin the same way the previous Route Handlers did:
 * prefer the browser's Origin header, then NEXT_PUBLIC_SITE_URL, then
 * localhost. `headers()` requires an active Next.js request scope, which
 * every real invocation of a Server Action has — but direct unit tests that
 * import and call these functions as plain async functions do not, so the
 * lookup is wrapped defensively rather than letting it throw.
 */
async function resolveOrigin(): Promise<string> {
  try {
    const headersList = await headers();
    const origin = headersList.get("origin");
    if (origin) return origin;
  } catch {
    // No request scope available (e.g. called outside Next.js's server
    // runtime). Fall through to the same defaults the header lookup would
    // have used if the header were simply absent.
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

// --- Checkout (donation) ---------------------------------------------------

export type CheckoutInput = {
  amount: number;
  frequency: string;
  email: string;
  tShirtSize?: string;
  displayName?: string;
  isAnonymous?: boolean;
};

export type CheckoutResult =
  | { ok: true; sessionId: string; url: string | null }
  | { ok: false; error: string };

/**
 * Creates a Stripe Checkout Session for a donation. Mirrors the previous
 * POST /api/checkout Route Handler's validation and behavior exactly; the
 * only change is the transport (Server Action instead of fetch + JSON).
 */
export async function createCheckoutSession(
  input: CheckoutInput,
): Promise<CheckoutResult> {
  if (!CAN_ACCEPT_ONLINE_DONATIONS) {
    return { ok: false, error: "Online donations are currently disabled." };
  }

  try {
    const { amount, frequency, email, tShirtSize, displayName, isAnonymous } =
      input || ({} as CheckoutInput);

    if (typeof amount !== "number" || amount <= 0) {
      return { ok: false, error: "Invalid donation amount." };
    }

    if (!["monthly", "annual", "one-time"].includes(frequency)) {
      return { ok: false, error: "Invalid frequency specified." };
    }

    if (
      typeof email !== "string" ||
      !email.trim() ||
      !EMAIL_REGEX.test(email.trim())
    ) {
      return { ok: false, error: "Invalid email address." };
    }

    // Amount received in dollars (e.g. 25 -> 2500 cents)
    const amountInCents = Math.round(amount * 100);

    const stripe = getStripeServer();
    const origin = await resolveOrigin();
    const cleanEmail = email.trim().toLowerCase();

    const isSubscription = frequency === "monthly" || frequency === "annual";
    const mode: Stripe.Checkout.SessionCreateParams.Mode = isSubscription
      ? "subscription"
      : "payment";

    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: "usd",
        product_data: {
          name:
            frequency === "one-time"
              ? "One-Time Donation"
              : `${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Membership Donation`,
          description: "Knights of the Higher Order Ministries Donation",
        },
        unit_amount: amountInCents,
      },
      quantity: 1,
    };

    if (isSubscription && lineItem.price_data) {
      lineItem.price_data.recurring = {
        interval: frequency === "monthly" ? "month" : "year",
      };
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: cleanEmail,
      mode,
      payment_method_types: ["card"],
      line_items: [lineItem],
      metadata: {
        tShirtSize: tShirtSize ? String(tShirtSize) : "",
        displayName: displayName ? String(displayName) : "",
        isAnonymous: String(Boolean(isAnonymous)),
      },
      success_url: `${origin}/give/success`,
      cancel_url: `${origin}/give/cancel`,
    });

    return { ok: true, sessionId: session.id, url: session.url };
  } catch (error: unknown) {
    console.error("Error creating checkout session:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create checkout session.";
    return { ok: false, error: message };
  }
}

// --- Donor portal magic-link request ---------------------------------------

const GENERIC_PORTAL_MESSAGE =
  "If an active donor subscription is associated with this email address, we've sent access instructions to it.";

export type PortalInput = { email: string };

export type PortalResult =
  | { ok: true; url?: string; message: string }
  | { ok: false; error: string };

// Whether a Stripe customer exists for this email is intentionally never
// checked here — only at /api/portal/verify, once the requester has proven
// control of the inbox by clicking the emailed link. Checking (or not) here
// would let the response itself leak which emails have donor subscriptions.
export async function requestDonorPortalAccess(
  input: PortalInput,
): Promise<PortalResult> {
  try {
    const { email } = input || ({} as PortalInput);

    if (
      typeof email !== "string" ||
      !email.trim() ||
      !EMAIL_REGEX.test(email.trim())
    ) {
      return { ok: false, error: "Please enter a valid email address." };
    }

    const cleanEmail = email.trim().toLowerCase();
    const origin = await resolveOrigin();

    const token = signPortalToken(cleanEmail);
    const verifyUrl = `${origin}/api/portal/verify?token=${encodeURIComponent(token)}`;

    const resend = getResendClient();
    await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "Knights of the Higher Order Ministries <onboarding@resend.dev>",
      to: cleanEmail,
      subject: "Access your donor portal",
      html: `<p>Use the link below to access your donor portal, where you can update your payment method, pause giving, or cancel your subscription.</p><p><a href="${verifyUrl}">Access donor portal</a></p><p>This link expires in 15 minutes. If you didn't request it, you can safely ignore this email.</p>`,
    });

    return { ok: true, message: GENERIC_PORTAL_MESSAGE };
  } catch (error: unknown) {
    console.error("Error processing donor portal request:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to process portal request.";
    return { ok: false, error: message };
  }
}
