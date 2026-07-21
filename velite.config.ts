import rehypeSlug from "rehype-slug";
import { defineConfig, s } from "velite";

// Velite turns the markdown in `content/` into typed JSON at build time, which
// the app imports from `#site/content`. It runs as its own step *before*
// `next build` (see package.json) rather than from a next.config hook: Velite's
// own docs warn the webpack hook breaks on Vercel, and the alternative
// `import('velite').then(...)` trick is a floating promise that lets the Next
// build start reading `.velite/` before Velite has finished writing it.

// Shared markdown body treatment. `rehype-slug` gives every heading an `id` so
// a legal clause or a section of a long page can be linked to directly.
const body = () => s.markdown({ rehypePlugins: [rehypeSlug] });

// The filename is the URL: content/news/thanksgiving-drive.md becomes
// /news/thanksgiving-drive. `s.path()` yields the path relative to `root`
// (e.g. "news/thanksgiving-drive"), so drop the directory to get the slug.
// This is a schema *field*, not a transform on the parsed object — only
// `s.path()` has access to the file being compiled.
const slug = () =>
  s.path().transform((filePath) => filePath.split("/").pop() as string);

// Deliberately not Velite's `s.isodate()`. That helper calls `.toISOString()`
// on whatever it is given, so a typo like `date: last tuesday` escapes Zod as a
// raw `RangeError: Invalid time value` — no filename, no field name, nothing an
// editor could act on. Coercing through a Zod date keeps the failure inside
// Zod, so it gets reported as `content/news/foo.md → error … date`, with a
// message written for someone who has never seen a stack trace.
// Accepts both a quoted string and YAML's native timestamp type.
const isodate = () =>
  s.coerce
    .date({
      errorMap: () => ({
        message: "must be a date written as YYYY-MM-DD, for example 2026-07-21",
      }),
    })
    .transform((date) => date.toISOString());

export default defineConfig({
  root: "content",

  // Belt and braces for anyone calling Velite's programmatic API. NOTE: this
  // has NO effect when running through the `velite` CLI, which is how every
  // script in package.json invokes it. Velite resolves the flag as
  // `options.strict ?? loadedConfig.strict ?? false`, and its CLI declares
  // `strict` with `default: false` — so `options.strict` is always the boolean
  // `false`, `??` never falls through, and this line loses.
  //
  // That is why every velite invocation in package.json passes `--strict`
  // explicitly. Without it a file with a bad frontmatter field is silently
  // *dropped* from the output, the build prints "build finished", and the
  // process exits 0 — a green CI run with a missing page. Do not remove the
  // `--strict` flags.
  strict: true,

  collections: {
    // A single file the editor toggles on and off to put a band on the
    // homepage. `active` is a manual boolean rather than an expiry date on
    // purpose: a statically-generated page cannot un-render itself when a date
    // passes, so an `expires` field would keep showing a stale announcement
    // until the next unrelated deploy.
    announcement: {
      name: "Announcement",
      pattern: "announcement.md",
      single: true,
      schema: s.object({
        active: s.boolean(),
        title: s.string().max(120),
        body: body(),
        cta: s
          .object({
            label: s.string().max(40),
            href: s.string(),
          })
          .optional(),
      }),
    },

    news: {
      name: "NewsPost",
      pattern: "news/*.md",
      schema: s.object({
        title: s.string().max(120),
        date: isodate(),
        summary: s.string().max(300),
        author: s.string().optional(),
        cover: s.image().optional(),
        draft: s.boolean().default(false),
        slug: slug(),
        body: body(),
      }),
    },

    // Prose for the hand-built pages (/about, /get-help, ...). The page's
    // chrome — CTAs, image panels, layout — stays in TSX; only the words live
    // here, so content edits can't break a layout.
    pages: {
      name: "ContentPage",
      pattern: "pages/*.md",
      schema: s.object({
        title: s.string().max(120),
        description: s.string().max(300),
        slug: slug(),
        body: body(),
      }),
    },

    legal: {
      name: "LegalPage",
      pattern: "legal/*.md",
      schema: s.object({
        title: s.string().max(120),
        description: s.string().max(300),
        lastUpdated: isodate(),
        slug: slug(),
        body: body(),
      }),
    },
  },
});
