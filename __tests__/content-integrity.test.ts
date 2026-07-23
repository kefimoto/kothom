import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { announcement, legal, news, pages } from "#site/content";
import { MINISTRY } from "../src/lib/ministry";

const CONTENT_DIR = join(import.meta.dirname, "..", "content");

function readAllContentFiles(): { path: string; text: string }[] {
  const out: { path: string; text: string }[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".md"))
        out.push({ path: full, text: readFileSync(full, "utf8") });
    }
  };
  walk(CONTENT_DIR);
  return out;
}

const files = readAllContentFiles();

describe("content integrity", () => {
  test("there is content to check", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  /**
   * The single most likely thing to rot.
   *
   * src/lib/ministry.ts centralises the phone number for TSX, but markdown
   * can't import from it — the legal pages and content pages spell the number
   * out in prose. So when the real number finally replaces the placeholder,
   * ministry.ts gets updated and the markdown quietly keeps the old one,
   * leaving a dead number on the pages a person in crisis is most likely to
   * read. This fails the build if any content file names a phone number that
   * disagrees with the constant.
   */
  test("no content file contains a phone number other than the current one", () => {
    const phonePattern = /\b\d{3}-\d{3}-\d{4}\b/g;
    const offenders: string[] = [];

    for (const file of files) {
      for (const match of file.text.matchAll(phonePattern)) {
        if (match[0] !== MINISTRY.phone.display) {
          offenders.push(`${file.path}: found ${match[0]}`);
        }
      }
    }

    expect(
      offenders,
      `Content files name a phone number that disagrees with MINISTRY.phone.display ` +
        `(${MINISTRY.phone.display}) in src/lib/ministry.ts. Update the markdown too.`,
    ).toEqual([]);
  });

  test("no content file references the vercel.app deployment alias", () => {
    const offenders = files
      .filter((file) => file.text.includes("vercel.app"))
      .map((file) => file.path);
    expect(
      offenders,
      "Customer-facing URLs must use kothoministries.org (CLAUDE.md).",
    ).toEqual([]);
  });

  /**
   * Curly quotes and em dashes pasted from Word render fine, but a curly quote
   * inside a YAML frontmatter value that also needs quoting is a classic way
   * for a non-technical editor to break a build in a way that's hard to see.
   * Catching it in the body is unnecessary; catching it in frontmatter is not.
   */
  test("frontmatter contains no smart quotes", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const frontmatter = file.text.split("---")[1] ?? "";
      if (/[‘’“”]/.test(frontmatter)) {
        offenders.push(file.path);
      }
    }
    expect(
      offenders,
      "Curly quotes in frontmatter — retype them as plain ' and \".",
    ).toEqual([]);
  });
});

describe("compiled collections", () => {
  test("every collection produced entries", () => {
    expect(legal.length).toBeGreaterThan(0);
    expect(pages.length).toBeGreaterThan(0);
    expect(news.length).toBeGreaterThan(0);
  });

  test("slugs are unique within each collection", () => {
    for (const [name, collection] of [
      ["legal", legal],
      ["pages", pages],
      ["news", news],
    ] as const) {
      const slugs = collection.map((entry) => entry.slug);
      expect(new Set(slugs).size, `duplicate slug in ${name}`).toBe(
        slugs.length,
      );
    }
  });

  test("every body compiled to HTML rather than raw markdown", () => {
    for (const entry of [...legal, ...pages, ...news]) {
      expect(entry.body, `${entry.slug} produced an empty body`).not.toBe("");
      expect(entry.body).toContain("<");
    }
  });

  // Velite's `single: true` collection returns an object, not an array. If the
  // file were ever deleted the build fails outright, so this asserts the shape
  // the homepage relies on.
  test("the announcement is a single object with a boolean switch", () => {
    expect(Array.isArray(announcement)).toBe(false);
    expect(typeof announcement.active).toBe("boolean");
    expect(announcement.title.length).toBeGreaterThan(0);
  });
});
