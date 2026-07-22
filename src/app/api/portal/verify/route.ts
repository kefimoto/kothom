import { NextResponse } from "next/server";
import { verifyPortalToken } from "@/lib/portal-token";
import { getStripeServer } from "@/lib/stripe";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const origin = url.origin;

  if (!token) {
    return NextResponse.redirect(`${origin}/give?portal_error=missing_token`);
  }

  const email = verifyPortalToken(token);
  if (!email) {
    return NextResponse.redirect(
      `${origin}/give?portal_error=invalid_or_expired`,
    );
  }

  try {
    const stripe = getStripeServer();
    const customers = await stripe.customers.list({ email, limit: 1 });

    if (!customers.data || customers.data.length === 0) {
      return NextResponse.redirect(`${origin}/give?portal_error=not_found`);
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${origin}/membership`,
    });

    return NextResponse.redirect(session.url);
  } catch (error: unknown) {
    console.error("Error creating billing portal session:", error);
    return NextResponse.redirect(`${origin}/give?portal_error=server_error`);
  }
}
