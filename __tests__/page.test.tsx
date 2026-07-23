import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Home from "../src/app/page";
import { MINISTRY } from "../src/lib/ministry";

test("renders the hero heading and primary CTAs", () => {
  render(<Home />);

  expect(
    screen.getByRole("heading", { level: 1, name: /spreading his word/i }),
  ).toBeDefined();

  expect(
    screen.getAllByRole("link", {
      name: "Get Help",
    }),
  ).toHaveLength(2);
  expect(screen.getByRole("link", { name: "See How to Give" })).toHaveProperty(
    "href",
    expect.stringContaining("#give"),
  );
});
