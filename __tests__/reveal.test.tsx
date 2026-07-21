import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { Reveal } from "../src/components/reveal";

// jsdom has no IntersectionObserver implementation at all, so Reveal's own
// "no IntersectionObserver" fallback (see reveal.tsx) would mask every test
// below by making everything visible immediately. Stub one that captures its
// callback so tests can fire intersection changes on demand, the same way we
// diagnosed the real bug live in a browser console during development.
let observeCallback:
  | ((entries: Pick<IntersectionObserverEntry, "isIntersecting">[]) => void)
  | undefined;
const unobserve = vi.fn();

class FakeIntersectionObserver {
  constructor(callback: typeof observeCallback) {
    observeCallback = callback;
  }
  observe = vi.fn();
  unobserve = unobserve;
  disconnect = vi.fn();
}

beforeEach(() => {
  observeCallback = undefined;
  unobserve.mockClear();
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function intersect(isIntersecting: boolean) {
  act(() => {
    observeCallback?.([{ isIntersecting }]);
  });
}

function dispatchLoad(img: HTMLImageElement) {
  act(() => {
    img.dispatchEvent(new Event("load"));
  });
}

test("rise variant starts hidden and reveals once intersected", () => {
  const { container } = render(
    <Reveal>
      <p>Hello</p>
    </Reveal>,
  );
  const node = container.firstElementChild as HTMLElement;

  expect(node.className).not.toMatch(/is-visible/);

  intersect(true);

  expect(node.className).toMatch(/is-visible/);
});

test("image-pop variant waits for both intersection and image load, regardless of order", () => {
  const { container } = render(
    <Reveal variant="image-pop">
      {/* Plain <img>, not next/image: enough to drive Reveal's load-event
          listener, and next/image isn't under test here. A real src is
          required — jsdom never fetches it, so `complete` naturally stays
          false until the load event fires, unlike an src-less img which
          jsdom marks complete immediately. */}
      <img src="/test.jpg" alt="" />
    </Reveal>,
  );
  const node = container.firstElementChild as HTMLElement;
  const img = node.querySelector("img") as HTMLImageElement;

  // Neither signal alone should reveal the image — this is exactly the bug
  // fixed in reveal.tsx: a photo popping in before its bytes actually arrived,
  // or a loaded photo staying invisible because intersection never re-fired.
  intersect(true);
  expect(node.className).not.toMatch(/is-visible/);

  dispatchLoad(img);
  expect(node.className).toMatch(/is-visible/);
});

test("image-pop variant reveals when the image loads before it scrolls into view", () => {
  const { container } = render(
    <Reveal variant="image-pop">
      <img src="/test.jpg" alt="" />
    </Reveal>,
  );
  const node = container.firstElementChild as HTMLElement;
  const img = node.querySelector("img") as HTMLImageElement;

  dispatchLoad(img);
  expect(node.className).not.toMatch(/is-visible/);

  intersect(true);
  expect(node.className).toMatch(/is-visible/);
});

test("image-pop variant treats an already-loaded (cached) image as loaded immediately", () => {
  const { container } = render(
    <Reveal variant="image-pop">
      {/* src-less <img> is jsdom's one case where `complete` defaults to
          true, standing in for an already-cached image. */}
      <img alt="" />
    </Reveal>,
  );
  const node = container.firstElementChild as HTMLElement;

  intersect(true);
  expect(node.className).toMatch(/is-visible/);
});

test("unobserves after the first intersection so it never re-fires", () => {
  render(
    <Reveal>
      <p>Hello</p>
    </Reveal>,
  );

  intersect(true);

  expect(unobserve).toHaveBeenCalledTimes(1);
});
