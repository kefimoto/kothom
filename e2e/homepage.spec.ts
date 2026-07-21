import { expect, test } from "@playwright/test";

test("homepage renders the hero and primary CTAs with no console errors", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: /spreading his word/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "See How to Give" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Join the Ranks" }),
  ).toBeVisible();

  expect(consoleErrors).toEqual([]);
});
