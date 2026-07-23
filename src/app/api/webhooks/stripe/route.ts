import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { MINISTRY } from "@/lib/ministry";
import { getResendClient } from "@/lib/resend";
import { getStripeServer } from "@/lib/stripe";

async function sendConfirmationEmail(
  customerEmail: string,
  displayName: string,
  amount: number,
  frequency: string,
) {
  try {
    const resend = getResendClient();
    const frequencyLabel =
      frequency === "monthly"
        ? "monthly"
        : frequency === "annual"
          ? "annual"
          : "one-time";

    await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "Knights of the Higher Order Ministries <onboarding@resend.dev>",
      to: customerEmail,
      subject: "Donation Confirmation",
      html: `
        <p>Thank you for your generous ${frequencyLabel} gift of $${amount} to Knights of the Higher Order Ministries!</p>
        <p>Your donation has been received and will make a real difference in the lives of single-parent families in Central Florida.</p>
        <h3>Donation Details</h3>
        <ul>
          <li><strong>Amount:</strong> $${amount}</li>
          <li><strong>Frequency:</strong> ${frequencyLabel}</li>
          ${displayName ? `<li><strong>Name:</strong> ${displayName}</li>` : ""}
        </ul>
        ${
          frequency !== "one-time"
            ? `<p><strong>Manage Your Giving:</strong> You can update, pause, or cancel your recurring gift anytime by visiting <a href="https://kothoministries.org/manage">our donations page</a>.</p>`
            : ""
        }
        <p>Questions? Contact us at ${MINISTRY.phone.display} or ${MINISTRY.email}.</p>
        <p>In service,<br/>Knights of the Higher Order Ministries</p>
      `,
    });
  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret is missing from environment variables." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    const stripe = getStripeServer();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      let customerId = session.customer;
      if (!customerId && session.customer_email) {
        try {
          const stripe = getStripeServer();
          const customers = await stripe.customers.list({
            email: session.customer_email,
            limit: 1,
          });
          if (customers.data.length > 0) {
            customerId = customers.data[0].id;
          }
        } catch (error) {
          console.error("Error looking up customer by email:", error);
        }
      }

      if (customerId && typeof customerId === "string") {
        try {
          const stripe = getStripeServer();
          const displayName = session.metadata?.displayName || "";
          const isAnonymous = session.metadata?.isAnonymous || "false";

          await stripe.customers.update(customerId, {
            metadata: {
              displayName,
              isAnonymous,
            },
          });

          // Send confirmation email to all donors
          if (session.customer_email) {
            const lineItems = await stripe.checkout.sessions.listLineItems(
              session.id,
              { limit: 1 },
            );
            const lineItem = lineItems.data[0];
            if (lineItem?.price) {
              const amount = (lineItem.price.unit_amount || 0) / 100;
              const frequency =
                lineItem.price.recurring?.interval === "month"
                  ? "monthly"
                  : lineItem.price.recurring?.interval === "year"
                    ? "annual"
                    : "one-time";
              const emailDisplayName =
                isAnonymous === "true" ? "Anonymous Donor" : displayName;
              await sendConfirmationEmail(
                session.customer_email,
                emailDisplayName,
                amount,
                frequency,
              );
            }
          }

          revalidatePath("/give");
        } catch (error) {
          console.error(
            "Error updating customer metadata or sending email:",
            error,
          );
        }
      }
      break;
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.customer) {
        try {
          revalidatePath("/give");
        } catch (error) {
          console.error("Error revalidating on invoice payment:", error);
        }
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
