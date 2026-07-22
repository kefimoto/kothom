import { NextResponse } from "next/server";

export interface Supporter {
  id: string;
  name: string;
  tier: string;
  year: number;
  isAnonymous?: boolean;
}

const ROLL_OF_HONOR_SUPPORTERS: Supporter[] = [
  {
    id: "roh-1",
    name: "Altamonte Springs Community Care",
    tier: "Legacy Benefactor",
    year: new Date().getFullYear(),
    isAnonymous: false,
  },
  {
    id: "roh-2",
    name: "Pastor T's Guardians",
    tier: "Crisis Aid Partner",
    year: new Date().getFullYear(),
    isAnonymous: false,
  },
  {
    id: "roh-3",
    name: "Anonymous Patron",
    tier: "Crisis Aid Partner",
    year: new Date().getFullYear(),
    isAnonymous: true,
  },
  {
    id: "roh-4",
    name: "Central Florida Family Support Network",
    tier: "Family Guardian",
    year: new Date().getFullYear(),
    isAnonymous: false,
  },
  {
    id: "roh-5",
    name: "Knight Order Guild",
    tier: "Knights Circle",
    year: new Date().getFullYear(),
    isAnonymous: false,
  },
  {
    id: "roh-6",
    name: "Grace & Hope Fellowship",
    tier: "Knights Circle",
    year: new Date().getFullYear(),
    isAnonymous: false,
  },
  {
    id: "roh-7",
    name: "Anonymous Supporter",
    tier: "Knights Circle",
    year: new Date().getFullYear(),
    isAnonymous: true,
  },
];

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
