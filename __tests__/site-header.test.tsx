import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { SiteHeader } from "@/components/site-header";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

test("renders site header wordmark centered on mobile and left-aligned on desktop", () => {
  const { container } = render(<SiteHeader />);

  const link = screen.getByRole("link", {
    name: /knights of the higher order/i,
  });
  expect(link).toBeDefined();

  const span = container.querySelector("span[aria-hidden='true']");
  expect(span).not.toBeNull();
  expect(span?.className).toContain("text-center");
  expect(span?.className).toContain("sm:text-left");
});
