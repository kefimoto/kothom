import { expect, test } from "vitest";
import sitemap from "../src/app/sitemap";

test("lists the production homepage with a valid priority", () => {
  const entries = sitemap();

  expect(entries).toHaveLength(1);
  expect(entries[0]).toMatchObject({
    url: "https://kothoministries.org",
    changeFrequency: "monthly",
    priority: 1,
  });
  expect(entries[0].lastModified).toBeInstanceOf(Date);
});
