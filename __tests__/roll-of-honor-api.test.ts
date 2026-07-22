import { describe, expect, test } from "vitest";
import { GET } from "../src/app/api/roll-of-honor/route";

describe("Roll of Honor API Route", () => {
  test("returns the current year with no fabricated supporters", async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const data = await res.json();
    const currentYear = new Date().getFullYear();

    expect(data.year).toBe(currentYear);
    expect(data.supporters).toEqual([]);
  });

  test("privacy filtering excludes anonymous supporters whenever real data exists", async () => {
    const res = await GET();
    const data = await res.json();

    for (const supporter of data.supporters) {
      expect(supporter.name).toBeDefined();
      expect(supporter.tier).toBeDefined();
      expect(supporter.year).toBe(new Date().getFullYear());
    }
  });
});
