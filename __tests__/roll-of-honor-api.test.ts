import { describe, expect, test } from "vitest";
import { GET } from "../src/app/api/roll-of-honor/route";

describe("Roll of Honor API Route", () => {
  test("returns current year top supporters with privacy filtering", async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const data = await res.json();
    const currentYear = new Date().getFullYear();

    expect(data.year).toBe(currentYear);
    expect(Array.isArray(data.supporters)).toBe(true);
    expect(data.supporters.length).toBeGreaterThan(0);

    // Verify privacy filtering: no anonymous supporters should be present
    for (const supporter of data.supporters) {
      expect(supporter.name).toBeDefined();
      expect(supporter.tier).toBeDefined();
      expect(supporter.year).toBe(currentYear);
      expect(supporter.name.toLowerCase()).not.toContain("anonymous");
      expect(supporter.name.toLowerCase()).not.toContain("private");
    }
  });
});
