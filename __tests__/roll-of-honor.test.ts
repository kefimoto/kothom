import { describe, expect, test } from "vitest";
import { getRollOfHonor } from "../src/lib/roll-of-honor";

describe("getRollOfHonor", () => {
  test("returns the current year", async () => {
    const { year } = await getRollOfHonor();
    expect(year).toBe(new Date().getFullYear());
  });

  test("never exposes an isAnonymous field on public supporters", async () => {
    // Privacy: the public roll of honor must never carry the isAnonymous
    // flag itself, only supporters who are not anonymous.
    const { supporters } = await getRollOfHonor();
    for (const supporter of supporters) {
      expect(supporter).not.toHaveProperty("isAnonymous");
    }
  });

  test("only includes supporters from the current year", async () => {
    const { year, supporters } = await getRollOfHonor();
    for (const supporter of supporters) {
      expect(supporter.year).toBe(year);
    }
  });

  test("returns a well-formed result shape", async () => {
    const data = await getRollOfHonor();
    expect(data).toEqual({
      year: expect.any(Number),
      supporters: expect.any(Array),
      anonymousDonorCount: expect.any(Number),
    });
  });
});
