// Regenerates public/kothom-mark.svg and full brand mark suites — static,
// print-ready vectors of the radiant cross mark, wordmarks, symbols, favicons,
// and social media avatars with text baked in as real glyph outlines.
//
// Font TTF files are vendored in scripts/fonts/ — committed to the repo, not
// fetched at any point, and not an npm dependency either. Three reasons:
//   - An earlier version auto-downloaded them on demand. CodeQL flagged
//     persisting fetched network content to disk, a pattern with no
//     code-level fix (it flags the fetch-then-write itself).
//   - @fontsource's published static Bold builds for Cinzel and Cinzel
//     Decorative were tried next, and turned out to be broken: the "700"
//     weight files carry correct Bold metadata (name table, usWeightClass)
//     but their actual glyph outlines are byte-for-byte identical to the
//     400/Regular file — the exact "bold in name only" bug this whole
//     rework exists to fix, just relocated into a dependency instead of a
//     bespoke downloader. Verified directly against @fontsource/cinzel and
//     @fontsource/cinzel-decorative 5.3.0.
//   - These outlines get baked into a print-ready asset (CROSS-MARK.md: "can
//     be handed to a print shop as-is"), so a floating font dependency is
//     its own risk even when it isn't outright broken: a routine version
//     bump could change glyph shapes with nothing in the diff calling that
//     out. Vendored bytes only change via an explicit commit that replaces
//     them.
//
// Cinzel-Bold-static.ttf is produced from the upstream variable font via
// `fonttools varLib.instancer` (see CROSS-MARK.md for the exact recipe) —
// verified to actually differ from the default/Regular weight, unlike the
// @fontsource file above.
//
// Also regenerates mark-preview.svg (repo root) afterward via
// generate-mark-preview.cjs's generatePreview(), so the two can never drift
// out of sync with each other.
//
// Full documentation is in CROSS-MARK.md.
//
// Usage:
//   node scripts/generate-kothom-mark.cjs            # Generates every brand asset into public/, then mark-preview.svg
//   WORDMARK_FONT=marcellus node scripts/generate-kothom-mark.cjs # Font preview mode (writes a standalone comparison file, doesn't touch public/ or mark-preview.svg)

const opentype = require("opentype.js");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { generatePreview } = require("./generate-mark-preview.cjs");

const FONT_DIR = path.join(__dirname, "fonts");

// A .ttf is binary, so a PR that changes one of these shows up as "binary
// file changed" with nothing a reviewer can actually read. These pins turn
// that invisible change into a loud warning at generation time instead —
// not a hard failure: a deliberate font swap is legitimate, it just
// shouldn't be able to silently change every generated mark unnoticed.
// Recompute with `sha256sum scripts/fonts/*.ttf` and update here once
// you've reviewed the resulting visual diff and confirmed it's intentional.
const EXPECTED_FONT_HASHES = {
  "CinzelDecorative-Bold.ttf":
    "e854e68a388aa50d742a4415c1ae5c17a617ef7956c95a70021d0a4a44f20518",
  "Marcellus-Regular.ttf":
    "1cf0cd10b17d35e852729962cc1ffaffed94514895972458345e2df34abb2f81",
  "Cinzel-Bold-static.ttf":
    "4c27e274a57ababc17b13ee4033cdc91599515da582a85a5bb3707ba537fdacf",
};

function warnIfFontsChanged() {
  for (const [file, expected] of Object.entries(EXPECTED_FONT_HASHES)) {
    const filePath = path.join(FONT_DIR, file);
    if (!fs.existsSync(filePath)) continue; // reported clearly later, when actually read
    const actual = crypto
      .createHash("sha256")
      .update(fs.readFileSync(filePath))
      .digest("hex");
    if (actual !== expected) {
      console.warn(
        `⚠ ${file} does not match the pinned checksum (expected ${expected}, got ${actual}).\n` +
          "  Every generated mark will reflect whatever this file now contains. If that's " +
          "intentional, review the visual diff of public/*.svg carefully, then update " +
          "EXPECTED_FONT_HASHES in this script to match.",
      );
    }
  }
}

// --- Same ellipse arc-length math as computeArcChars ---
function buildEllipseArcLengthTable(radiusX, radiusY, maxAngleRad, steps) {
  const angles = [];
  const cumulative = [0];
  const step = (2 * maxAngleRad) / steps;
  const speedAt = (theta) =>
    Math.sqrt(
      (radiusX * Math.cos(theta)) ** 2 + (radiusY * Math.sin(theta)) ** 2,
    );
  let prevSpeed = speedAt(-maxAngleRad);
  angles.push(-maxAngleRad);
  for (let i = 1; i <= steps; i++) {
    const theta = -maxAngleRad + i * step;
    const speed = speedAt(theta);
    cumulative.push(cumulative[i - 1] + ((prevSpeed + speed) / 2) * step);
    angles.push(theta);
    prevSpeed = speed;
  }
  return { angles, cumulative };
}

function angleForArcLength(table, targetLength) {
  const { angles, cumulative } = table;
  const last = cumulative.length - 1;
  if (targetLength <= cumulative[0]) return angles[0];
  if (targetLength >= cumulative[last]) return angles[last];
  let lo = 0;
  let hi = last;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cumulative[mid] < targetLength) lo = mid;
    else hi = mid;
  }
  const t = (targetLength - cumulative[lo]) / (cumulative[hi] - cumulative[lo]);
  return angles[lo] + t * (angles[hi] - angles[lo]);
}

function computeArcChars(
  text,
  font,
  fontSize,
  { centerX, centerY, radiusX, radiusY },
) {
  const chars = text.split("");
  const widths = chars.map((c) => font.getAdvanceWidth(c, fontSize));
  const total = widths.reduce((s, w) => s + w, 0);
  const table = buildEllipseArcLengthTable(
    radiusX,
    radiusY,
    Math.PI * 0.98,
    4000,
  );
  const halfTableLength = table.cumulative[table.cumulative.length >> 1];

  let cumulative = 0;
  return chars.map((char, i) => {
    const centerCumulative = cumulative + widths[i] / 2;
    cumulative += widths[i];
    const distanceFromCenter = centerCumulative - total / 2;
    const angleRad = angleForArcLength(
      table,
      halfTableLength + distanceFromCenter,
    );
    return {
      char,
      width: widths[i],
      x: centerX + radiusX * Math.sin(angleRad),
      y: centerY - radiusY * Math.cos(angleRad),
      rotation:
        (Math.atan2(
          radiusX * Math.sin(angleRad),
          radiusY * Math.cos(angleRad),
        ) *
          180) /
        Math.PI,
    };
  });
}

function roundedPolygonPath(points, radius) {
  const n = points.length;
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const cuts = points.map((p, i) => {
    const prev = points[(i - 1 + n) % n];
    const next = points[(i + 1) % n];
    const rPrev = Math.min(radius, dist(p, prev) / 2);
    const rNext = Math.min(radius, dist(p, next) / 2);
    const dPrev = dist(p, prev);
    const dNext = dist(p, next);
    const before = [
      p[0] + ((prev[0] - p[0]) / dPrev) * rPrev,
      p[1] + ((prev[1] - p[1]) / dPrev) * rPrev,
    ];
    const after = [
      p[0] + ((next[0] - p[0]) / dNext) * rNext,
      p[1] + ((next[1] - p[1]) / dNext) * rNext,
    ];
    return { vertex: p, before, after };
  });
  const fmt = (pt) => `${pt[0].toFixed(2)} ${pt[1].toFixed(2)}`;
  let d = `M ${fmt(cuts[0].after)} `;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    d += `L ${fmt(cuts[j].before)} Q ${fmt(cuts[j].vertex)} ${fmt(cuts[j].after)} `;
  }
  return `${d}Z`;
}

function glyphPathD(font, char, fontSize) {
  if (char === " ") return null;
  return font.getPath(char, 0, 0, fontSize).toPathData(2);
}

function charPathElement(font, char, fontSize, x, y, rotation, fill) {
  const d = glyphPathD(font, char, fontSize);
  if (!d) return "";
  const advance = font.getAdvanceWidth(char, fontSize);
  const dx = -advance / 2;
  return `<path d="${d}" fill="${fill}" transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rotation.toFixed(3)}) translate(${dx.toFixed(2)} 0)" />`;
}

// --- Geometry Definitions ---
const WORDMARK_TEXT = "KNIGHTS OF THE HIGHER ORDER";
const WORDMARK_GEOMETRY = {
  decorative: { fontSize: 10.5, radius: 71.68, centerY: 69.51 },
  cinzel: { fontSize: 10.5, radius: 71.68, centerY: 69.51 },
  marcellus: { fontSize: 12.65, radius: 71.66, centerY: 69.49 },
};

const MINISTRIES_TEXT = "MINISTRIES";
const MINISTRIES_FONT_SIZE = 19;
const MINISTRIES_LETTER_SPACING = 3;

// Cross geometry
const CROSS_CORNER_RADIUS = 2.5;
const VERTICAL_ARM_POINTS = [
  [100 - 16, 8],
  [100 + 16, 8],
  [100 + 9, 53],
  [100 + 9, 79],
  [100 + 16, 194],
  [100 - 16, 194],
  [100 - 9, 79],
  [100 - 9, 53],
];
const HORIZONTAL_ARM_POINTS = [
  [35, 66 - 18],
  [35, 66 + 18],
  [91, 66 + 10],
  [109, 66 + 10],
  [165, 66 + 18],
  [165, 66 - 18],
  [109, 66 - 10],
  [91, 66 - 10],
];
const verticalArmPath = roundedPolygonPath(
  VERTICAL_ARM_POINTS,
  CROSS_CORNER_RADIUS,
);
const horizontalArmPath = roundedPolygonPath(
  HORIZONTAL_ARM_POINTS,
  CROSS_CORNER_RADIUS,
);

function starPolygonPoints(
  cx,
  cy,
  spikeCount,
  outerRadius,
  innerRadius,
  rotationDeg,
) {
  const points = [];
  const vertexCount = spikeCount * 2;
  for (let i = 0; i < vertexCount; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI * i) / spikeCount + (rotationDeg * Math.PI) / 180;
    points.push(
      `${(cx + r * Math.sin(angle)).toFixed(2)},${(cy - r * Math.cos(angle)).toFixed(2)}`,
    );
  }
  return points.join(" ");
}

// --- Theme Color Palette Lookup ---
function getThemeColors(theme) {
  switch (theme) {
    case "dark":
      return {
        crossFill: "#0a0a0a",
        starburstFill: "#764634",
        starburstOpacity1: 0.15,
        starburstOpacity2: 0.22,
        hotspotStop0: "#764634",
        hotspotStop15: "rgba(118,70,52,0.85)",
        hotspotStop35: "rgba(118,70,52,0.55)",
        hotspotStop65: "rgba(118,70,52,0.18)",
        hotspotStop100: "rgba(118,70,52,0)",
        wordmarkFill: "#0a0a0a",
        ministriesFill: "#764634",
      };
    case "monochrome-light":
      return {
        crossFill: "#ffffff",
        starburstFill: "#ffffff",
        starburstOpacity1: 0.2,
        starburstOpacity2: 0.3,
        hotspotStop0: "#ffffff",
        hotspotStop15: "rgba(255,255,255,0.85)",
        hotspotStop35: "rgba(255,255,255,0.55)",
        hotspotStop65: "rgba(255,255,255,0.18)",
        hotspotStop100: "rgba(255,255,255,0)",
        wordmarkFill: "#ffffff",
        ministriesFill: "#ffffff",
      };
    case "monochrome-dark":
      return {
        crossFill: "#000000",
        starburstFill: "#000000",
        starburstOpacity1: 0.2,
        starburstOpacity2: 0.3,
        hotspotStop0: "#000000",
        hotspotStop15: "rgba(0,0,0,0.85)",
        hotspotStop35: "rgba(0,0,0,0.55)",
        hotspotStop65: "rgba(0,0,0,0.18)",
        hotspotStop100: "rgba(0,0,0,0)",
        wordmarkFill: "#000000",
        ministriesFill: "#000000",
      };
    case "light":
    default:
      return {
        crossFill: "#f4efe6",
        starburstFill: "#f4efe6",
        starburstOpacity1: 0.09,
        starburstOpacity2: 0.13,
        hotspotStop0: "#ffffff",
        hotspotStop15: "rgba(255,255,255,0.85)",
        hotspotStop35: "rgba(255,255,255,0.55)",
        hotspotStop65: "rgba(255,255,255,0.18)",
        hotspotStop100: "rgba(255,255,255,0)",
        wordmarkFill: "#f4efe6",
        ministriesFill: "#c9a876",
      };
  }
}

// --- Main SVG Mark Generator ---
function generateMarkSvg(
  { theme = "light", layout = "full" },
  { decorativeFont, cinzelFont, wordmarkGeometry },
) {
  const colors = getThemeColors(theme);

  // Compute Wordmark Paths
  const wordmarkChars = computeArcChars(
    WORDMARK_TEXT,
    decorativeFont,
    wordmarkGeometry.fontSize,
    {
      centerX: 100,
      centerY: wordmarkGeometry.centerY,
      radiusX: wordmarkGeometry.radius,
      radiusY: wordmarkGeometry.radius,
    },
  );
  const wordmarkPaths = wordmarkChars
    .map((p) =>
      charPathElement(
        decorativeFont,
        p.char,
        wordmarkGeometry.fontSize,
        p.x,
        p.y,
        p.rotation,
        colors.wordmarkFill,
      ),
    )
    .join("\n      ");

  // Compute Ministries Paths
  const ministriesChars = MINISTRIES_TEXT.split("");
  const ministriesWidths = ministriesChars.map(
    (c) =>
      cinzelFont.getAdvanceWidth(c, MINISTRIES_FONT_SIZE) +
      MINISTRIES_LETTER_SPACING,
  );
  const ministriesTotal =
    ministriesWidths.reduce((s, w) => s + w, 0) - MINISTRIES_LETTER_SPACING;
  let ministriesCumulative = -ministriesTotal / 2;
  const ministriesPaths = ministriesChars
    .map((char, i) => {
      const advance = cinzelFont.getAdvanceWidth(char, MINISTRIES_FONT_SIZE);
      const x = 100 + ministriesCumulative + advance / 2;
      ministriesCumulative += ministriesWidths[i];
      return charPathElement(
        cinzelFont,
        char,
        MINISTRIES_FONT_SIZE,
        x,
        217.83,
        0,
        colors.ministriesFill,
      );
    })
    .join("\n      ");

  const starburstLayers = [
    {
      spikes: 22,
      outer: 64,
      inner: 30,
      rotation: 0,
      opacity: colors.starburstOpacity1,
    },
    {
      spikes: 22,
      outer: 46,
      inner: 16,
      rotation: 360 / 44,
      opacity: colors.starburstOpacity2,
    },
  ]
    .map(
      (s) =>
        `<polygon points="${starPolygonPoints(100, 66, s.spikes, s.outer, s.inner, s.rotation)}" fill="${colors.starburstFill}" fill-opacity="${s.opacity}" />`,
    )
    .join("\n    ");

  let viewBox = "17 -15 166 260";
  let contentMarkup = "";

  const renderCrossGlowAndStarburst = `
  <!-- Subtle starburst behind the cross -->
  <g filter="url(#starburstBlur)">
    ${starburstLayers}
  </g>

  <!-- Soft glow hugging the edges of the cross -->
  <g filter="url(#soften)">
    <path fill="${colors.crossFill}" d="${verticalArmPath}" />
    <path fill="${colors.crossFill}" d="${horizontalArmPath}" />
  </g>
`;

  const renderCrossBody = `
  <!-- Crisp cross body -->
  <path fill="${colors.crossFill}" d="${verticalArmPath}" />
  <path fill="${colors.crossFill}" d="${horizontalArmPath}" />

  <!-- Bright hotspot at the intersection -->
  <circle cx="100" cy="66" r="58" fill="url(#hotspot)" />
`;

  const renderWordmark = `
  <!-- Wordmark arced above the cross -->
  <g>
    ${wordmarkPaths}
  </g>
`;

  const renderMinistries = `
  <!-- "Ministries" below the cross -->
  <g>
    ${ministriesPaths}
  </g>
`;

  if (layout === "full") {
    viewBox = "17 -15 166 260";
    contentMarkup = `${renderCrossGlowAndStarburst}${renderCrossBody}${renderWordmark}${renderMinistries}`;
  } else if (layout === "symbol") {
    viewBox = "17 2 166 200";
    contentMarkup = `${renderCrossGlowAndStarburst}${renderCrossBody}`;
  } else if (layout === "simple") {
    viewBox = "65 8 70 186";
    contentMarkup = `
  <!-- Clean flat cross body -->
  <path fill="${colors.crossFill}" d="${verticalArmPath}" />
  <path fill="${colors.crossFill}" d="${horizontalArmPath}" />
`;
  } else if (layout === "favicon") {
    viewBox = "0 0 512 512";
    contentMarkup = `
  <!-- Dark background container for crisp favicon contrast -->
  <rect width="512" height="512" fill="#0a0a0a" rx="64" />
  <g transform="translate(256 256) scale(2.2) translate(-100 -100.5)">
    ${renderCrossGlowAndStarburst}
    ${renderCrossBody}
  </g>
`;
  } else if (layout === "social-avatar") {
    viewBox = "0 0 1080 1080";
    contentMarkup = `
  <!-- Ink background container for social profile avatars -->
  <rect width="1080" height="1080" fill="#0a0a0a" />
  <g transform="translate(540 540) scale(4.2) translate(-100 -103.45)">
    ${renderCrossGlowAndStarburst}
    ${renderCrossBody}
    ${renderWordmark}
    ${renderMinistries}
  </g>
`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
  <title>Knights of the Higher Order Ministries brand mark (${layout} - ${theme})</title>
  <defs>
    <radialGradient id="hotspot" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${colors.hotspotStop0}" stop-opacity="1" />
      <stop offset="15%" stop-color="${colors.hotspotStop15}" />
      <stop offset="35%" stop-color="${colors.hotspotStop35}" />
      <stop offset="65%" stop-color="${colors.hotspotStop65}" />
      <stop offset="100%" stop-color="${colors.hotspotStop100}" />
    </radialGradient>
    <filter id="soften" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3.2" />
    </filter>
    <filter id="starburstBlur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="1.6" />
    </filter>
  </defs>
${contentMarkup}
</svg>
`;
}

// --- Brand Asset Definition Table ---
const BRAND_ASSET_MANIFEST = [
  {
    filename: "public/kothom-mark.svg",
    layout: "full",
    theme: "light",
    isDefault: true,
  },
  { filename: "public/kothom-mark-dark.svg", layout: "full", theme: "dark" },
  {
    filename: "public/kothom-mark-symbol.svg",
    layout: "symbol",
    theme: "light",
  },
  {
    filename: "public/kothom-mark-symbol-dark.svg",
    layout: "symbol",
    theme: "dark",
  },
  {
    filename: "public/kothom-mark-simple.svg",
    layout: "simple",
    theme: "light",
  },
  {
    filename: "public/kothom-mark-simple-dark.svg",
    layout: "simple",
    theme: "dark",
  },
  {
    filename: "public/kothom-mark-monochrome-light.svg",
    layout: "full",
    theme: "monochrome-light",
  },
  {
    filename: "public/kothom-mark-monochrome-dark.svg",
    layout: "full",
    theme: "monochrome-dark",
  },
  { filename: "public/favicon.svg", layout: "favicon", theme: "light" },
  {
    filename: "public/kothom-social-avatar.svg",
    layout: "social-avatar",
    theme: "light",
  },
];

// --- Main Execution Flow ---
function main() {
  warnIfFontsChanged();

  const WORDMARK_FONT_CHOICE = process.env.WORDMARK_FONT || "marcellus";
  const WORDMARK_FONT_FILES = {
    decorative: "CinzelDecorative-Bold.ttf",
    cinzel: "Cinzel-Bold-static.ttf",
    marcellus: "Marcellus-Regular.ttf",
  };

  const decorativeFontPath = path.join(
    FONT_DIR,
    WORDMARK_FONT_FILES[WORDMARK_FONT_CHOICE] || "Marcellus-Regular.ttf",
  );
  const cinzelFontPath = path.join(FONT_DIR, "Cinzel-Bold-static.ttf");

  const decorativeFont = opentype.parse(
    fs.readFileSync(decorativeFontPath).buffer,
  );
  const cinzelFont = opentype.parse(fs.readFileSync(cinzelFontPath).buffer);
  const wordmarkGeometry =
    WORDMARK_GEOMETRY[WORDMARK_FONT_CHOICE] || WORDMARK_GEOMETRY.marcellus;

  const fontCtx = { decorativeFont, cinzelFont, wordmarkGeometry };

  const isPreviewFont = !!process.env.WORDMARK_FONT;
  if (isPreviewFont) {
    const svg = generateMarkSvg({ theme: "light", layout: "full" }, fontCtx);
    const outPath = `kothom-mark-preview-${WORDMARK_FONT_CHOICE}.svg`;
    fs.writeFileSync(outPath, svg);
    console.log(
      `[Preview Mode] Wrote ${outPath} (${svg.length} bytes) using font ${WORDMARK_FONT_CHOICE}`,
    );
  } else {
    console.log(
      "Generating complete Knights of the Higher Order Ministries brand mark suite...",
    );
    for (const asset of BRAND_ASSET_MANIFEST) {
      const svg = generateMarkSvg(
        { theme: asset.theme, layout: asset.layout },
        fontCtx,
      );
      fs.writeFileSync(asset.filename, svg);
      console.log(
        `  ✓ Wrote ${asset.filename} (${asset.layout}, ${asset.theme}) - ${svg.length} bytes`,
      );
    }
    console.log("All brand mark variants generated successfully in public/");

    // Keeps mark-preview.svg from ever going stale relative to the files it
    // depicts — it's regenerated every time these are, not on a separate
    // manual step someone can forget.
    generatePreview();
  }
}

try {
  main();
} catch (err) {
  console.error("Error generating brand mark suite:", err);
  process.exit(1);
}
