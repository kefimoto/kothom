// Regenerates public/kothom-mark.svg — a static, print-ready vector of the
// radiant cross mark with the wordmark baked in as real glyph outlines
// (not live <text>), so it has no runtime font/JS dependency and can be
// handed to a print shop as-is.
//
// Full instructions (one-time setup, how the geometry was derived, how to
// change the font or re-tune anything) are in CROSS-MARK.md — read
// that before editing this file. Quick start, once the 3 .ttf files this
// needs are sitting in the OS tmp cache dir below (see the doc for how to
// fetch them — they live outside the repo tree on purpose, so there's
// nothing to gitignore and no risk of committing them):
//   node scripts/generate-kothom-mark.cjs
//   WORDMARK_FONT=decorative node scripts/generate-kothom-mark.cjs   (preview a different font — writes to a separate file, not the real one)
//
// Always run this from the repo root — it writes to public/kothom-mark.svg
// relative to cwd, while fonts resolve from an absolute tmpdir path.

const opentype = require("opentype.js");
const fs = require("fs");
const os = require("os");
const path = require("path");

const FONT_CACHE_DIR = path.join(os.tmpdir(), "kothom-mark-fonts");

const WORDMARK_FONT_CHOICE = process.env.WORDMARK_FONT || "marcellus";
const WORDMARK_FONT_FILES = {
  decorative: "CinzelDecorative-Bold.ttf",
  cinzel: "Cinzel-Bold-static.ttf",
  marcellus: "Marcellus-Regular.ttf",
};
const decorativeFont = opentype.parse(
  fs.readFileSync(
    path.join(FONT_CACHE_DIR, WORDMARK_FONT_FILES[WORDMARK_FONT_CHOICE]),
  ).buffer,
);
const cinzelFont = opentype.parse(
  fs.readFileSync(path.join(FONT_CACHE_DIR, "Cinzel-Bold-static.ttf")).buffer,
);

// --- Same ellipse arc-length math as computeArcChars in page.tsx ---
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

// Rounds every corner of a closed polygon by a fixed radius: each vertex is
// replaced with a short straight cut-back along both adjacent edges (capped
// at half that edge's length, so short edges can't overlap), joined by a
// quadratic curve through the original vertex. Kept deliberately simple —
// a fixed small radius, not a full arc-based rounding — since the ask is
// just to soften the cross's corners "ever so slightly", not rebuild it.
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

// A single <path> per character: draw the glyph at its own origin, then
// rotate about that origin and translate into place — equivalent to how
// `<text x y transform="rotate(deg x y)">` positions+rotates a glyph, but
// baked into fixed path data with no live text/font dependency.
function charPathElement(font, char, fontSize, x, y, rotation, fill) {
  const d = glyphPathD(font, char, fontSize);
  if (!d) return "";
  const advance = font.getAdvanceWidth(char, fontSize);
  // textAnchor="middle" equivalent: center the glyph's advance box on x.
  const dx = -advance / 2;
  return `<path d="${d}" fill="${fill}" transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rotation.toFixed(3)}) translate(${dx.toFixed(2)} 0)" />`;
}

// --- Wordmark: arced above the cross ---
// The exact circle that touches the cross's top tip (100,8) and both
// crossbar tips (35,66)/(165,66) has center (100, 73.42) and radius 65.42.
// To add padding — instead of touching, clear the cross by a gap — both
// the radius is expanded *and* the center is shifted up. Expanding the
// radius alone pushes the peak up correctly but relocates the endpoints
// far past the crossbar tips (a bigger circle spreads the same fixed arc
// length over a smaller angle); translating alone keeps the endpoints
// x-aligned with the tips but is really just the same circle sliding, not
// padding. Solving for both together gives the peak and both endpoints
// the same ~10-unit gap from where they'd otherwise touch, then the
// radius is nudged out a little further (see CROSS-MARK.md) so the
// endpoint letters clear the crossbar's flared tips instead of clipping
// into them.
//
// Font size and radius/center are specific to each font's own letter
// widths (a wider or narrower typeface needs different numbers to land in
// the same place), so they're looked up per WORDMARK_FONT_CHOICE rather
// than being one shared constant. See CROSS-MARK.md for how these
// were derived and how to redo it for a new font.
const WORDMARK_TEXT = "KNIGHTS OF THE HIGHER ORDER";
const WORDMARK_GEOMETRY = {
  decorative: { fontSize: 10.5, radius: 71.68, centerY: 69.51 },
  cinzel: { fontSize: 10.5, radius: 71.68, centerY: 69.51 }, // approximate; not tuned for Cinzel's own widths
  marcellus: { fontSize: 12.65, radius: 71.66, centerY: 69.49 },
};
const wordmarkGeometry =
  WORDMARK_GEOMETRY[WORDMARK_FONT_CHOICE] || WORDMARK_GEOMETRY.decorative;
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
      "#f4efe6",
    ),
  )
  .join("\n      ");

// --- "Ministries": straight, centered, tracked, below the cross ---
const MINISTRIES_TEXT = "MINISTRIES"; // rendered uppercase via CSS on the site; baked in here since there's no CSS in a static file
const MINISTRIES_FONT_SIZE = 19;
const MINISTRIES_LETTER_SPACING = 3; // matches letterSpacing="3" in page.tsx
const ministriesChars = MINISTRIES_TEXT.split("");
const ministriesWidths = ministriesChars.map(
  (c) =>
    cinzelFont.getAdvanceWidth(c, MINISTRIES_FONT_SIZE) +
    MINISTRIES_LETTER_SPACING,
);
const ministriesTotal =
  ministriesWidths.reduce((s, w) => s + w, 0) - MINISTRIES_LETTER_SPACING; // no trailing gap
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
      "#c9a876",
    );
  })
  .join("\n      ");

// --- Cross body ---
// Each arm is a flared octagon — wide at the tip, narrowing toward the
// crossbar — with corners rounded ever so slightly. The taper is more
// pronounced than earlier passes: tip half-width/height roughly 1.8x the
// width at the crossbar, instead of the previous ~1.2x.
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

// --- Starburst: a filled, jagged sunburst silhouette behind the cross ---
// A handful of thin separated ray lines reads as scattered streaks rather
// than a burst that fills the space — there's too much bare background
// between them. Instead this is one continuous star-shaped polygon per
// layer: vertices alternate between an outer (spike tip) and inner
// (valley) radius all the way around, so there are no gaps for the
// background to show through between rays. Two layers at different sizes
// and a slight rotation offset (plus a soft blur) give it some depth
// without needing more than 2 shapes total — nowhere near "a thousand
// lines". Both stay well inside the viewBox's tightest clearance from the
// center (100,66) in any direction, so nothing gets clipped.
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
const starburstLayers = [
  { spikes: 22, outer: 64, inner: 30, rotation: 0, opacity: 0.09 },
  { spikes: 22, outer: 46, inner: 16, rotation: 360 / 44, opacity: 0.13 },
]
  .map(
    (s) =>
      `<polygon points="${starPolygonPoints(100, 66, s.spikes, s.outer, s.inner, s.rotation)}" fill="#f4efe6" fill-opacity="${s.opacity}" />`,
  )
  .join("\n    ");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="17 -15 166 260">
  <title>Knights of the Higher Order Ministries radiant cross mark</title>
  <defs>
    <radialGradient id="hotspot" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
      <stop offset="15%" stop-color="#ffffff" stop-opacity="0.85" />
      <stop offset="35%" stop-color="#ffffff" stop-opacity="0.55" />
      <stop offset="65%" stop-color="#ffffff" stop-opacity="0.18" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
    <filter id="soften" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3.2" />
    </filter>
    <filter id="starburstBlur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="1.6" />
    </filter>
  </defs>

  <!-- Subtle starburst behind the cross -->
  <g filter="url(#starburstBlur)">
    ${starburstLayers}
  </g>

  <!-- Soft glow hugging the edges of the cross -->
  <g filter="url(#soften)">
    <path fill="#f4efe6" d="${verticalArmPath}" />
    <path fill="#f4efe6" d="${horizontalArmPath}" />
  </g>

  <!-- Crisp cross body -->
  <path fill="#f4efe6" d="${verticalArmPath}" />
  <path fill="#f4efe6" d="${horizontalArmPath}" />

  <!-- Bright hotspot at the intersection -->
  <circle cx="100" cy="66" r="58" fill="url(#hotspot)" />

  <!-- Wordmark arced above the cross -->
  <g>
    ${wordmarkPaths}
  </g>

  <!-- "Ministries" below the cross -->
  <g>
    ${ministriesPaths}
  </g>
</svg>
`;

// Only the default font choice writes over the real production file;
// previewing a different font (WORDMARK_FONT=... set explicitly) writes to
// a separate file instead so a preview run can't clobber it by accident.
const isDefaultFont = !process.env.WORDMARK_FONT;
const outPath = isDefaultFont
  ? "public/kothom-mark.svg"
  : `kothom-mark-preview-${WORDMARK_FONT_CHOICE}.svg`;
fs.writeFileSync(outPath, svg);
console.log("wrote", outPath + ",", svg.length, "bytes");
