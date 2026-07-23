import { describe, expect, test } from "vitest";
import { getRollOfHonor } from "../src/lib/roll-of-honor";

describe("getRollOfHonor", () => {
  test("returns the current year", () => {
    const { year } = getRollOfHonor();
    expect(year).toBe(new Date().getFullYear());
  });

  test("never exposes an isAnonymous field on public supporters", () => {
    // Privacy: the public roll of honor must never carry the isAnonymous
    // flag itself, only supporters who are not anonymous.
    const { supporters } = getRollOfHonor();
    for (const supporter of supporters) {
      expect(supporter).not.toHaveProperty("isAnonymous");
    }
  });

  test("only includes supporters from the current year", () => {
    const { year, supporters } = getRollOfHonor();
    for (const supporter of supporters) {
      expect(supporter.year).toBe(year);
    }
  });

  test("returns a well-formed result shape", () => {
    const data = getRollOfHonor();
    expect(data).toEqual({
      year: expect.any(Number),
      supporters: expect.any(Array),
    });
  });
});
