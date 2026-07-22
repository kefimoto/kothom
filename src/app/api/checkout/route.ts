import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { CAN_ACCEPT_ONLINE_DONATIONS } from "@/lib/ministry";
import { getStripeServer } from "@/lib/stripe";

export async function POST(request: Request) {
  if (!CAN_ACCEPT_ONLINE_DONATIONS) {
    return NextResponse.json(
      { error: "Online donations are currently disabled." },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { amount, frequency, tShirtSize, displayName, isAnonymous } =
      body || {};

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid donation amount." },
        { status: 400 },
      );
    }

    if (!["monthly", "annual", "one-time"].includes(frequency)) {
      return NextResponse.json(
        { error: "Invalid frequency specified." },
        { status: 400 },
      );
    }

    // Amount received in dollars (e.g. 25 -> 2500 cents)
    const amountInCents = Math.round(amount * 100);

    const stripe = getStripeServer();
    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

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
      mode,
      payment_method_types: ["card"],
      line_items: [lineItem],
      metadata: {
        tShirtSize: tShirtSize ? String(tShirtSize) : "",
        displayName: displayName ? String(displayName) : "",
        isAnonymous: String(Boolean(isAnonymous)),
      },
      success_url: `${origin}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/donate`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: unknown) {
    console.error("Error creating checkout session:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create checkout session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
