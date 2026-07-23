import { getStripeServer } from "@/lib/stripe";

export interface PublicSupporter {
  id: string;
  name: string;
  year: number;
  totalAmount: number;
}

export interface RollOfHonorData {
  year: number;
  supporters: PublicSupporter[];
  anonymousDonorCount: number;
}

/**
 * Fetches the current year's public Roll of Honor from Stripe.
 * Queries both invoices (recurring) and charges (one-time) this year,
 * aggregates by customer, sorted by total (descending).
 * Excludes anonymous donors.
 */
export async function getRollOfHonor(): Promise<RollOfHonorData> {
  const currentYear = new Date().getFullYear();
  const yearStart = Math.floor(new Date(currentYear, 0, 1).getTime() / 1000);

  try {
    const stripe = getStripeServer();
    const customerTotals = new Map<
      string,
      { name: string; customerId: string; totalAmount: number }
    >();

    // Fetch invoices (recurring donations)
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const invoices = await stripe.invoices.list({
        status: "paid",
        created: { gte: yearStart },
        limit: 100,
        starting_after: startingAfter,
      });

      for (const invoice of invoices.data) {
        if (!invoice.customer || typeof invoice.customer !== "string") {
          continue;
        }

        const existing = customerTotals.get(invoice.customer) || {
          name: "",
          customerId: invoice.customer,
          totalAmount: 0,
        };

        existing.totalAmount += invoice.total;
        customerTotals.set(invoice.customer, existing);
      }

      hasMore = invoices.has_more;
      if (invoices.data.length > 0) {
        startingAfter = invoices.data[invoices.data.length - 1].id;
      }
    }

    // Fetch charges (one-time donations)
    hasMore = true;
    startingAfter = undefined;

    while (hasMore) {
      const charges = await stripe.charges.list({
        created: { gte: yearStart },
        limit: 100,
        starting_after: startingAfter,
      });

      for (const charge of charges.data) {
        if (
          !charge.paid ||
          charge.customer === null ||
          typeof charge.customer !== "string"
        ) {
          continue;
        }

        const existing = customerTotals.get(charge.customer) || {
          name: "",
          customerId: charge.customer,
          totalAmount: 0,
        };

        existing.totalAmount += charge.amount;
        customerTotals.set(charge.customer, existing);
      }

      hasMore = charges.has_more;
      if (charges.data.length > 0) {
        startingAfter = charges.data[charges.data.length - 1].id;
      }
    }

    const publicSupporters: PublicSupporter[] = [];
    let anonymousDonorCount = 0;

    const customerIds = Array.from(customerTotals.keys());
    const batchSize = 10;

    for (let i = 0; i < customerIds.length; i += batchSize) {
      const batch = customerIds.slice(i, i + batchSize);
      const customerRetrievals = batch.map(async (customerId) => {
        try {
          const customer = await stripe.customers.retrieve(customerId);
          const totalAmount = customerTotals.get(customerId)?.totalAmount || 0;

          if (typeof customer === "object" && "metadata" in customer) {
            if (customer.metadata?.isAnonymous === "true") {
              return { type: "anonymous" as const };
            } else if (customer.metadata?.displayName) {
              return {
                type: "public" as const,
                supporter: {
                  id: customerId,
                  name: customer.metadata.displayName,
                  year: currentYear,
                  totalAmount: totalAmount / 100,
                },
              };
            }
          }
        } catch (error) {
          console.error(`Error retrieving customer ${customerId}:`, error);
        }
        return null;
      });

      const results = await Promise.all(customerRetrievals);
      for (const result of results) {
        if (result?.type === "anonymous") {
          anonymousDonorCount++;
        } else if (result?.type === "public") {
          publicSupporters.push(result.supporter);
        }
      }
    }

    publicSupporters.sort((a, b) => b.totalAmount - a.totalAmount);

    return {
      year: currentYear,
      supporters: publicSupporters,
      anonymousDonorCount,
    };
  } catch (error) {
    console.error("Error fetching Roll of Honor from Stripe:", error);
    return {
      year: currentYear,
      supporters: [],
      anonymousDonorCount: 0,
    };
  }
}
