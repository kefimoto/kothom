import { expect, test } from "@playwright/test";

test.describe("Giving Page & Supporter Roll of Honor UX", () => {
  test("renders giving options, frequency switcher, amount presets, and roll of honor", async ({
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

    // Section headings
    await expect(
      page.getByRole("heading", { name: "Select Your Giving Options" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Supporter Roll of Honor" }),
    ).toBeVisible();

    // Frequency Switcher testing
    const monthlyBtn = page.getByRole("button", {
      name: "Monthly",
      exact: true,
    });
    const annualBtn = page.getByRole("button", {
      name: "Annual",
      exact: true,
    });
    const oneTimeBtn = page.getByRole("button", {
      name: "One-Time",
      exact: true,
    });

    await expect(monthlyBtn).toBeVisible();
    await expect(annualBtn).toBeVisible();
    await expect(oneTimeBtn).toBeVisible();

    // Switch frequency to Annual
    await annualBtn.click();
    await expect(annualBtn).toHaveClass(/bg-terracotta/);

    // Switch frequency to One-Time
    await oneTimeBtn.click();
    await expect(oneTimeBtn).toHaveClass(/bg-terracotta/);

    // Switch back to Monthly
    await monthlyBtn.click();
    await expect(monthlyBtn).toHaveClass(/bg-terracotta/);

    // Amount Presets testing
    const btn25 = page.getByRole("button", { name: "$25 Knights" });
    const btn50 = page.getByRole("button", { name: "$50 Family Support" });
    const btn100 = page.getByRole("button", { name: "$100 Crisis Aid" });
    const customBtn = page.getByRole("button", { name: "Custom Amount" });

    await expect(btn25).toBeVisible();
    await expect(btn50).toBeVisible();
    await expect(btn100).toBeVisible();
    await expect(customBtn).toBeVisible();

    // Select preset $50
    await btn50.click();
    await expect(btn50).toHaveClass(/border-terracotta/);

    // Select custom amount
    await customBtn.click();
    const customInput = page.getByLabel("Enter Custom Amount ($)");
    await expect(customInput).toBeVisible();
    await customInput.fill("150");
    await expect(customInput).toHaveValue("150");

    // Select $25 Knights to verify T-Shirt card is visible
    await btn25.click();

    // Knights T-Shirt visual mockup card
    await expect(
      page.getByRole("heading", {
        name: "Knights of the Higher Order T-Shirt",
      }),
    ).toBeVisible();

    // Size selector testing
    const sizeL = page.getByRole("button", { name: "L", exact: true });
    const sizeXL = page.getByRole("button", { name: "XL", exact: true });
    await expect(sizeL).toBeVisible();
    await expect(sizeXL).toBeVisible();

    await sizeXL.click();
    await expect(sizeXL).toHaveClass(/bg-terracotta/);

    // Display Name and Anonymous Fields
    const displayNameInput = page.getByLabel("Display Name / Business Name");
    const anonymousCheckbox = page.getByLabel(
      "Keep gift anonymous on the Roll of Honor",
    );

    await expect(displayNameInput).toBeVisible();
    await expect(anonymousCheckbox).toBeVisible();

    await displayNameInput.fill("John & Mary Smith");
    await expect(displayNameInput).toHaveValue("John & Mary Smith");

    // Check anonymous box -> input gets disabled
    await anonymousCheckbox.check();
    await expect(displayNameInput).toBeDisabled();

    // Uncheck anonymous box -> input gets enabled again
    await anonymousCheckbox.uncheck();
    await expect(displayNameInput).toBeEnabled();

    // Roll of Honor section verification
    const rollOfHonorSection = page.locator("#roll-of-honor");
    await expect(rollOfHonorSection).toBeVisible();
    await expect(
      rollOfHonorSection.getByText("Altamonte Springs Community Care"),
    ).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});
