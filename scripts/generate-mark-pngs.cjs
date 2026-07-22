// Rasterizes every generated brand mark variant (public/kothom-mark*.svg,
// favicon.svg, kothom-social-avatar.svg) into a matching PNG, for anyone who
// needs a raster file where SVG isn't an option — pasting into a Word doc,
// an email signature, most social media upload fields, etc.
//
// The SVG stays the source of truth: prefer it over the PNG anywhere a
// vector actually works, especially printing (see CROSS-MARK.md). These
// PNGs exist for tools that can't take an SVG, not as a replacement for one.
//
// Each PNG is flattened onto the solid background that variant is actually
// designed for (FILE_BACKGROUNDS, shared with generate-mark-preview.cjs) —
// not transparent. The glow/gradient content fades toward that specific
// backdrop color, not toward nothing, so a transparent render looks washed
// out and shows visible blur artifacts rather than a clean logo cutout.
//
// Uses Playwright (already a devDependency for e2e tests, so this adds no
// new dependency) to render each SVG in a real browser engine at an exact
// target pixel size, screenshotting the result — the same rendering path
// already verified elsewhere in this project to handle the marks' gradients
// and blur filters correctly, unlike some lighter-weight SVG-to-PNG
// libraries.
//
// generate-kothom-mark.cjs calls generatePngs() (exported below)
// automatically after writing public/*.svg, so these can't go stale
// relative to the marks they depict. Run this file directly only if you've
// hand-edited an SVG in public/ without regenerating it.
//
// Usage:
//   node scripts/generate-kothom-mark.cjs  # regenerates public/*.svg, mark-preview.svg, AND these PNGs
//   node scripts/generate-mark-pngs.cjs    # rebuilds just the PNGs, from whatever's in public/ right now

const fs = require("node:fs");
const path = require("node:path");
const { FILE_BACKGROUNDS } = require("./generate-mark-preview.cjs");

const PUBLIC_DIR = path.join(__dirname, "..", "public");

// [svg filename, output PNG width, output PNG height]. Favicon and the
// social avatar already define an exact target pixel size for their
// platform (browser tab icon, profile photo) — rendered 1:1, no extra
// scaling. Everything else is scaled up from its viewBox units (a uniform
// x8) to a size generous enough for on-screen and most print use without
// producing an unreasonably large file.
const SCALE = 8;
const TARGETS = [
  ["kothom-mark.svg", 166 * SCALE, 260 * SCALE],
  ["kothom-mark-dark.svg", 166 * SCALE, 260 * SCALE],
  ["kothom-mark-symbol.svg", 166 * SCALE, 200 * SCALE],
  ["kothom-mark-symbol-dark.svg", 166 * SCALE, 200 * SCALE],
  ["kothom-mark-simple.svg", 70 * SCALE, 186 * SCALE],
  ["kothom-mark-simple-dark.svg", 70 * SCALE, 186 * SCALE],
  ["kothom-mark-monochrome-light.svg", 166 * SCALE, 260 * SCALE],
  ["kothom-mark-monochrome-dark.svg", 166 * SCALE, 260 * SCALE],
  ["favicon.svg", 512, 512],
  ["kothom-social-avatar.svg", 1080, 1080],
];

async function generatePngs() {
  const { chromium } = require("@playwright/test");
  const browser = await chromium.launch();
  try {
    for (const [file, width, height] of TARGETS) {
      const svgPath = path.join(PUBLIC_DIR, file);
      const svg = fs
        .readFileSync(svgPath, "utf8")
        .replace("<svg ", `<svg width="${width}" height="${height}" `);
      const page = await browser.newPage({ viewport: { width, height } });
      // NOT a transparent PNG: the glow/gradient content is designed to
      // fade into a solid backdrop, not into nothing. Rendering it against
      // a transparent page background was tried first and looked
      // genuinely broken — washed-out, with visible edge artifacts on the
      // blur — because that's not the surface this artwork was drawn for.
      await page.setContent(
        `<html><body style="margin:0;background:${FILE_BACKGROUNDS[file]}">${svg}</body></html>`,
      );
      const outputPath = path.join(PUBLIC_DIR, file.replace(/\.svg$/, ".png"));
      await page.screenshot({ path: outputPath });
      await page.close();
      const { size } = fs.statSync(outputPath);
      console.log(
        `  ✓ Wrote ${path.relative(process.cwd(), outputPath)} (${width}x${height}, ${size} bytes)`,
      );
    }
  } finally {
    await browser.close();
  }
}

module.exports = { generatePngs };

if (require.main === module) {
  generatePngs().catch((err) => {
    console.error("Error generating mark PNGs:", err);
    process.exit(1);
  });
}
