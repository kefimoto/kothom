import { NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body || {};

    if (
      typeof email !== "string" ||
      !email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const stripe = getStripeServer();

    const customers = await stripe.customers.list({
      email: cleanEmail,
      limit: 1,
    });

    if (!customers.data || customers.data.length === 0) {
      return NextResponse.json({
        message:
          "If an active donor subscription is associated with this email address, access instructions have been processed.",
      });
    }

    const customer = customers.data[0];
    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";
    const return_url = `${origin}/membership`;

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Error creating billing portal session:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to process portal request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
