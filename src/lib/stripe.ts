import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export const getStripeServer = (): Stripe => {
  if (stripeInstance) {
    return stripeInstance;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not defined in environment variables",
    );
  }

  stripeInstance = new Stripe(secretKey);
  return stripeInstance;
};
