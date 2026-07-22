import { NextResponse } from "next/server";

export interface Supporter {
  id: string;
  name: string;
  tier: string;
  year: number;
  isAnonymous?: boolean;
}

// No supporters yet — online giving isn't live (see CAN_ACCEPT_ONLINE_DONATIONS
// in src/lib/ministry.ts), so there is no real data to list here. Populate this
// from actual completed gifts once that exists; never fill it with placeholder
// names to "see how it looks."
const ROLL_OF_HONOR_SUPPORTERS: Supporter[] = [];

export async function GET() {
  const currentYear = new Date().getFullYear();

  // Privacy filtering: exclude anonymous supporters from the public roll of honor
  const publicSupporters = ROLL_OF_HONOR_SUPPORTERS.filter(
    (supporter) => supporter.year === currentYear && !supporter.isAnonymous,
  ).map(({ id, name, tier, year }) => ({
    id,
    name,
    tier,
    year,
  }));

  return NextResponse.json({
    year: currentYear,
    supporters: publicSupporters,
  });
}
