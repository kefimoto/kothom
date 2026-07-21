import { expect, test } from "@playwright/test";

test("text and image reveals start hidden and fade in on scroll", async ({
  page,
}) => {
  await page.goto("/");

  const textReveal = page.locator(".reveal").first();
  const imageReveal = page.locator(".reveal-image").first();

  // Below-the-fold content must render at opacity 0 up front (not
  // display:none — see reveal.tsx's own reasoning), so it's present for
  // anything that never fires an intersection callback.
  await expect(textReveal).toHaveCSS("opacity", "0");
  await expect(imageReveal).toHaveCSS("opacity", "0");

  await textReveal.scrollIntoViewIfNeeded();
  await expect(textReveal).toHaveClass(/is-visible/);
  await expect(textReveal).toHaveCSS("opacity", "1");

  await imageReveal.scrollIntoViewIfNeeded();
  await expect(imageReveal).toHaveClass(/is-visible/);
  await expect(imageReveal).toHaveCSS("opacity", "1");
});

test("reduced motion reveals content immediately without waiting on the transition", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const imageReveal = page.locator(".reveal-image").first();
  await imageReveal.scrollIntoViewIfNeeded();

  // globals.css collapses transition-duration to 0.01ms under
  // prefers-reduced-motion, so the fade should already be done well within
  // the ~500-700ms a full transition would otherwise take.
  await expect(imageReveal).toHaveCSS("opacity", "1", { timeout: 200 });
});
