import { expect, test } from "@playwright/test";

// CI builds and serves this app once, with online donations disabled
// (CAN_ACCEPT_ONLINE_DONATIONS is false unless NEXT_PUBLIC_STAGING=true or
// NEXT_PUBLIC_VERCEL_ENV=preview at build time — see src/lib/ministry.ts).
// That's also real production's state today, so this test asserts the
// honest, giving-not-live-yet page rather than the live GivingForm — the
// live form only exists in a build made with the flag on, which this
// pipeline doesn't produce.
test.describe("Giving Page & Supporter Roll of Honor UX", () => {
  test("renders the honest fallback state when online giving is disabled", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    await page.goto("/give");

    // Heading verification
    await expect(
      page.getByRole("heading", { level: 1, name: /^give$/i }),
    ).toBeVisible();

    // The live giving form and donor portal management form are gated on
    // CAN_ACCEPT_ONLINE_DONATIONS and must not render in this build.
    await expect(
      page.getByRole("heading", { name: "Select Your Giving Options" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Manage Existing Subscription" }),
    ).toHaveCount(0);

    // The honest, always-available mailto giving paths remain.
    await expect(
      page.getByRole("heading", { name: "Become a Knight" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Legacy Donations" }),
    ).toBeVisible();

    // Roll of Honor: no fabricated supporters, just the honest empty state.
    const rollOfHonorSection = page.locator("#roll-of-honor");
    await expect(rollOfHonorSection).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Supporter Roll of Honor" }),
    ).toBeVisible();
    await expect(
      rollOfHonorSection.getByText(/no public supporters listed/i),
    ).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});
