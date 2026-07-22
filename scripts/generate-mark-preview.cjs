// Composites every generated brand mark variant (public/kothom-mark*.svg,
// favicon.svg, kothom-social-avatar.svg) into a single labeled grid — each
// variant on the background it's actually designed to sit on (light-colored
// marks on ink, dark-colored marks on cream), so you can compare every
// option at a glance instead of opening files one at a time.
//
// Output is SVG, not a rasterized PNG: each variant is nested in as its own
// <svg> with its original viewBox, so the whole grid stays crisp at any
// zoom and stays in the low hundreds of KB (roughly the sum of the 12
// embedded marks) rather than the multi-MB a screenshot-based PNG would be.
//
// This is a design-review tool, not a site asset — it reads already
// generated public/*.svg files and never ships to the actual website. Its
// output (mark-preview.svg, repo root) is committed anyway, so anyone can open
// it on GitHub without running the generator locally — re-run this after
// regenerating the marks and commit the result together, or it goes stale.
//
// Usage:
//   node scripts/generate-kothom-mark.cjs   # generate/refresh public/*.svg first
//   node scripts/generate-mark-preview.cjs  # then build the preview grid

const fs = require("node:fs");
const path = require("node:path");

const PUBLIC_DIR = path.join(__dirname, "..", "public");
// Repo root, next to CROSS-MARK.md — a viewable reference doc, not source
// code, so it doesn't belong under scripts/.
const OUTPUT_PATH = path.join(__dirname, "..", "mark-preview.svg");

const INK = "#0a0a0a";
const CREAM = "#f4efe6";

// [file, label, background tile color]. Grouped so each variant's light and
// dark version sit side by side for comparison.
const ROWS = [
  [
    ["kothom-mark.svg", "full — light", INK],
    ["kothom-mark-dark.svg", "full — dark", CREAM],
  ],
  [
    ["kothom-mark-symbol.svg", "symbol — light", INK],
    ["kothom-mark-symbol-dark.svg", "symbol — dark", CREAM],
  ],
  [
    ["kothom-mark-simple.svg", "simple — light", INK],
    ["kothom-mark-simple-dark.svg", "simple — dark", CREAM],
  ],
  [
    ["kothom-mark-wordmark.svg", "wordmark — light", INK],
    ["kothom-mark-wordmark-dark.svg", "wordmark — dark", CREAM],
  ],
  [
    ["kothom-mark-monochrome-light.svg", "monochrome — white", INK],
    ["kothom-mark-monochrome-dark.svg", "monochrome — black", CREAM],
  ],
  [
    ["favicon.svg", "favicon (self-contained)", null],
    ["kothom-social-avatar.svg", "social avatar (self-contained)", null],
  ],
];

const CELL_W = 260;
const CELL_H = 340;
const GAP = 24;
const LABEL_H = 28;
const PADDING = 32;

function readMark(file) {
  const svg = fs.readFileSync(path.join(PUBLIC_DIR, file), "utf8");
  const viewBoxMatch = svg.match(/viewBox="([^"]*)"/);
  if (!viewBoxMatch) {
    throw new Error(
      `${file}: no viewBox found — run generate-kothom-mark.cjs first?`,
    );
  }
  const inner = svg
    .replace(/<\?xml[^>]*\?>/, "")
    .replace(/^<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "");
  return { viewBox: viewBoxMatch[1], inner };
}

function cellSvg(file, label, bg) {
  const { viewBox, inner } = readMark(file);
  const innerSize = Math.min(CELL_W, CELL_H) - PADDING;
  const artX = (CELL_W - innerSize) / 2;
  const artY = (CELL_H - LABEL_H - innerSize) / 2;
  // Some marks (favicon.svg's glow filter in particular) paint slightly
  // outside their own viewBox — clip to the tile so that doesn't bleed
  // into the neighboring cell or its label.
  const clipId = `clip-${file.replace(/[^a-z0-9]/gi, "-")}`;

  const bgRect = bg
    ? `<rect width="${CELL_W}" height="${CELL_H - LABEL_H}" fill="${bg}" />`
    : "";
  const border =
    bg === null
      ? `<rect x="0.5" y="0.5" width="${CELL_W - 1}" height="${CELL_H - LABEL_H - 1}" fill="none" stroke="#c9a876" stroke-opacity="0.3" />`
      : "";

  return `<g>
  ${bgRect}
  ${border}
  <clipPath id="${clipId}"><rect width="${CELL_W}" height="${CELL_H - LABEL_H}" /></clipPath>
  <g clip-path="url(#${clipId})">
    <svg x="${artX}" y="${artY}" width="${innerSize}" height="${innerSize}" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">${inner}</svg>
  </g>
  <text x="${CELL_W / 2}" y="${CELL_H - LABEL_H / 2 + 4}" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" font-size="11" fill="#2a2a28">${label}</text>
</g>`;
}

function main() {
  const cols = 2;
  const totalW = cols * CELL_W + (cols - 1) * GAP;
  const totalH = ROWS.length * CELL_H + (ROWS.length - 1) * GAP;

  const cells = [];
  ROWS.forEach((row, r) => {
    row.forEach(([file, label, bg], c) => {
      const x = c * (CELL_W + GAP);
      const y = r * (CELL_H + GAP);
      cells.push(
        `<g transform="translate(${x} ${y})">${cellSvg(file, label, bg)}</g>`,
      );
    });
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" font-family="ui-monospace, Menlo, monospace">
<rect width="${totalW}" height="${totalH}" fill="#ffffff" />
${cells.join("\n")}
</svg>
`;

  fs.writeFileSync(OUTPUT_PATH, svg);
  console.log(
    `✓ Wrote ${path.relative(process.cwd(), OUTPUT_PATH)} (${svg.length} bytes)`,
  );
}

main();
