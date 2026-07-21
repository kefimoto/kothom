import { expect, test } from "@playwright/test";
import { FOOTER_NAV, PRIMARY_NAV, STATIC_ROUTES } from "../src/lib/routes";

// Every route the site links to, visited for real. The unit tests assert the
// route table matches the files on disk; this asserts the pages actually render
// once built, which is the thing a visitor experiences.

const allLinkedPaths = Array.from(
  new Set([
    ...STATIC_ROUTES,
    ...PRIMARY_NAV.map((route) => route.href),
    ...FOOTER_NAV.flatMap((column) => column.links.map((link) => link.href)),
  ]),
);

for (const path of allLinkedPaths) {
  test(`${path} renders with a heading and no console errors`, async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    const response = await page.goto(path);
    expect(response?.status(), `${path} returned a non-200`).toBe(200);

    // Exactly one h1 per page — the outline is the primary way a screen-reader
    // user orients, and this audience skews toward assistive tech.
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toBeVisible();

    // Anchor links in the footer (e.g. /get-help#pastoral) are only useful if
    // the target actually exists on the page.
    const hash = path.split("#")[1];
    if (hash) {
      await expect(page.locator(`#${hash}`)).toHaveCount(1);
    }

    expect(consoleErrors).toEqual([]);
  });
}

test("the header reaches every primary page and marks the current one", async ({
  page,
}) => {
  await page.goto("/");

  for (const route of PRIMARY_NAV) {
    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: route.label, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`${route.href}/?$`));
    await expect(
      page.getByRole("link", { name: route.label, exact: true }).first(),
    ).toHaveAttribute("aria-current", "page");
  }
});

test("the skip link is the first thing a keyboard user reaches", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
  await skipLink.click();
  await expect(page.locator("#main")).toBeVisible();
});

test("the FDACS disclosure stays hidden while registration is pending", async ({
  page,
}) => {
  await page.goto("/");
  // Guards the compliance rule from the other direction: the statement must not
  // appear until LEGAL_STATUS.fdacsRegistration is set. See COMPLIANCE.md.
  await expect(
    page.getByText("A COPY OF THE OFFICIAL REGISTRATION", { exact: false }),
  ).toHaveCount(0);
});
