import { expect, test } from "vitest";
import robots from "../src/app/robots";

test("allows all crawlers and points at the production sitemap", () => {
  const result = robots();

  expect(result.rules).toEqual({ userAgent: "*", allow: "/" });
  expect(result.sitemap).toBe("https://kothoministries.org/sitemap.xml");
});
