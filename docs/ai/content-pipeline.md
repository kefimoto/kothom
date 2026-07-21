# Content pipeline (added 2026-07-21)

Markdown in `content/` is compiled to typed JSON at build time by **Velite** (`velite.config.ts`), and the app imports it from `#site/content`. A non-technical contributor edits those markdown files through GitHub's web UI; `CONTENT-GUIDE.md` is the document written for them.

**Velite runs as its own sequential script, not from a `next.config.ts` hook.** `"build": "velite --clean --strict && next build"`. Velite's own docs warn its webpack hook breaks on Vercel, and the alternative `import('velite').then(...)` trick in `next.config.ts` is a floating promise that lets `next build` start reading `.velite/` before Velite finishes writing it. Don't "simplify" this into the config.

**⚠️ Never remove `--strict` from a velite invocation.** Velite resolves the flag as `options.strict ?? loadedConfig.strict ?? false`, and its CLI declares `strict` with `default: false` — so the CLI's `false` *always* overrides `strict: true` in `velite.config.ts`. Without the flag, a markdown file with a bad or missing frontmatter field is silently **dropped from the output** while the build prints "build finished" and exits 0. That's a green CI run with a missing page. Verified 2026-07-21 against velite 0.4.0.

Also deliberate:
- **`isodate()` in `velite.config.ts` is hand-rolled, not Velite's `s.isodate()`.** The built-in calls `.toISOString()` on whatever it's given, so a typo escapes Zod as a raw `RangeError: Invalid time value` with no filename and no field name. The replacement coerces through a Zod date so the failure is reported as `content/news/foo.md → error … date` with a message written for a non-developer.
- **The homepage announcement uses a manual `active` boolean, not an expiry date.** A statically-generated page can't un-render itself when a date passes, so an `expires` field would keep showing a finished event until the next unrelated deploy.
- **The filename is the URL.** `content/news/foo.md` → `/news/foo`. Don't add date prefixes to filenames.
- Content pages are a **hybrid**: page chrome (CTAs, image panels, layout) stays in TSX, prose comes from markdown. The contributor controls the words and can't break a layout.
