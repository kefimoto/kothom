import { readFileSync } from "node:fs";
import { join } from "node:path";
import picomatch from "picomatch";
import { describe, expect, test } from "vitest";
import { parse } from "yaml";

/**
 * Regression test for the CI content-only fast path.
 *
 * The original filter was written as `['**', '!content/**', '!**\/*.md']`,
 * which reads like "everything except content and markdown" but is not what
 * dorny/paths-filter does: by default it ORs a filter's patterns together, so
 * `'**'` alone matched every file and the negations were evaluated as
 * alternatives rather than exclusions. The filter was therefore always true and
 * the fast path never engaged — on a documentation-only PR, every step still
 * ran, behind a green check. Nothing failed; it just silently did nothing.
 *
 * That is precisely the kind of bug a test has to catch, because CI staying
 * green is exactly what it looks like when it breaks. This reproduces the
 * action's matching semantics against the real workflow file, so editing the
 * filter without understanding the quantifier fails here instead of quietly
 * costing 25 seconds a run — or, far worse, quietly skipping real checks.
 */

const workflow = parse(
  readFileSync(
    join(import.meta.dirname, "..", ".github", "workflows", "ci.yml"),
    "utf8",
  ),
);

const filterStep = workflow.jobs["quality-gate"].steps.find(
  (step: { uses?: string }) => step.uses?.startsWith("dorny/paths-filter"),
);

const patterns: string[] = parse(filterStep.with.filters).code;
const quantifier: string = filterStep.with["predicate-quantifier"] ?? "some";

/** How dorny evaluates one file against one filter's pattern list. */
function fileMatches(file: string): boolean {
  const results = patterns.map((pattern) =>
    picomatch(pattern, { dot: true })(file),
  );
  return quantifier === "every"
    ? results.every(Boolean)
    : results.some(Boolean);
}

/** The filter's output: true when at least one changed file matches. */
const codeChanged = (files: string[]) => files.some(fileMatches);

describe("CI content-only fast path", () => {
  test("the workflow still declares the quantifier the patterns rely on", () => {
    // Under the default `some`, a pure-negation list matches almost everything
    // and the fast path inverts into skipping real checks. The two must change
    // together or not at all.
    expect(quantifier).toBe("every");
    expect(patterns.every((pattern) => pattern.startsWith("!"))).toBe(true);
  });

  test.each([
    ["a documentation-only change", ["README.md", "CONTRIBUTING.md"], false],
    ["a news post", ["content/news/christmas-drive.md"], false],
    ["toggling the announcement", ["content/announcement.md"], false],
    ["a legal page edit", ["content/legal/privacy.md"], false],
    ["an image dropped next to a post", ["content/news/photo.jpg"], false],
    ["content plus a root doc", ["content/news/a.md", "README.md"], false],
  ])("skips the code gate for %s", (_label, files, expected) => {
    expect(codeChanged(files)).toBe(expected);
  });

  // The failure direction that actually matters. A false positive costs ~25
  // seconds; a false negative skips lint, typecheck, tests, and e2e on real
  // code. Every one of these must run the full gate.
  test.each([
    ["a page change", ["src/app/page.tsx"]],
    ["a component", ["src/components/site-header.tsx"]],
    ["styles", ["src/app/globals.css"]],
    ["the velite config", ["velite.config.ts"]],
    ["a dependency bump", ["package.json", "bun.lock"]],
    ["the workflow itself", [".github/workflows/ci.yml"]],
    ["a test", ["__tests__/sitemap.test.ts"]],
    ["code alongside markdown", ["src/app/page.tsx", "README.md"]],
    ["a public asset", ["public/kothom-mark.svg"]],
  ])("runs the full gate for %s", (_label, files) => {
    expect(codeChanged(files)).toBe(true);
  });

  test("the old always-true pattern list would fail these expectations", () => {
    // Pins the actual defect so nobody reintroduces the shape by "simplifying".
    const old = ["**", "!content/**", "!**/*.md"];
    const oldMatches = (files: string[]) =>
      files.some((file) =>
        old.some((pattern) => picomatch(pattern, { dot: true })(file)),
      );

    expect(oldMatches(["README.md"])).toBe(true);
    expect(oldMatches(["content/news/a.md"])).toBe(true);
    expect(codeChanged(["README.md"])).toBe(false);
  });
});
