import Stripe from "stripe";

export const getStripeServer = (): Stripe => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not defined in environment variables",
    );
  }
  return new Stripe(secretKey);
};
