// Regenerates public/kothom-mark.svg — a static, print-ready vector of the
// radiant cross mark with the wordmark baked in as real glyph outlines
// (not live <text>), so it has no runtime font/JS dependency and can be
// handed to a print shop as-is.
//
// One-time setup to run this:
//   npm install --no-save opentype.js   (or: bun add opentype.js, then remove from package.json)
//   curl -o CinzelDecorative-Bold.ttf https://raw.githubusercontent.com/google/fonts/main/ofl/cinzeldecorative/CinzelDecorative-Bold.ttf
//   curl -o Cinzel-Variable.ttf "https://raw.githubusercontent.com/google/fonts/main/ofl/cinzel/Cinzel%5Bwght%5D.ttf"
//   python3 -m pip install --user fonttools
//   python3 -m fontTools.varLib.instancer Cinzel-Variable.ttf wght=700 -o Cinzel-Bold-static.ttf
//   node scripts/generate-kothom-mark.cjs   (run from the repo root, with the 3 .ttf files alongside this script)
//
// If the arc geometry in the CrossMark component (src/app/page.tsx) ever
// changes, update the constants below to match and rerun.

const opentype = require("opentype.js");
const fs = require("fs");

const decorativeFont = opentype.parse(
  fs.readFileSync("./CinzelDecorative-Bold.ttf").buffer,
);
const cinzelFont = opentype.parse(
  fs.readFileSync("./Cinzel-Bold-static.ttf").buffer,
);

// --- Same ellipse arc-length math as computeArcChars in page.tsx ---
function buildEllipseArcLengthTable(radiusX, radiusY, maxAngleRad, steps) {
  const angles = [];
  const cumulative = [0];
  const step = (2 * maxAngleRad) / steps;
  const speedAt = (theta) =>
    Math.sqrt((radiusX * Math.cos(theta)) ** 2 + (radiusY * Math.sin(theta)) ** 2);
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

function computeArcChars(text, font, fontSize, { centerX, centerY, radiusX, radiusY }) {
  const chars = text.split("");
  const widths = chars.map((c) => font.getAdvanceWidth(c, fontSize));
  const total = widths.reduce((s, w) => s + w, 0);
  const table = buildEllipseArcLengthTable(radiusX, radiusY, Math.PI * 0.98, 4000);
  const halfTableLength = table.cumulative[table.cumulative.length >> 1];

  let cumulative = 0;
  return chars.map((char, i) => {
    const centerCumulative = cumulative + widths[i] / 2;
    cumulative += widths[i];
    const distanceFromCenter = centerCumulative - total / 2;
    const angleRad = angleForArcLength(table, halfTableLength + distanceFromCenter);
    return {
      char,
      width: widths[i],
      x: centerX + radiusX * Math.sin(angleRad),
      y: centerY - radiusY * Math.cos(angleRad),
      rotation:
        (Math.atan2(radiusX * Math.sin(angleRad), radiusY * Math.cos(angleRad)) * 180) /
        Math.PI,
    };
  });
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
// To add padding — instead of touching, clear the cross by the same gap
// "Ministries" has below it — both the radius is expanded *and* the center
// is shifted up. Expanding the radius alone pushes the peak up correctly
// but relocates the endpoints far past the crossbar tips (a bigger circle
// spreads the same fixed arc length over a smaller angle); translating
// alone keeps the endpoints x-aligned with the tips but is really just the
// same circle sliding, not padding. Solving for both together (radius
// 65.42->66.73, center 73.42->54.39) gives the peak and both endpoints the
// same ~20-unit gap from where they used to touch.
const WORDMARK_TEXT = "KNIGHTS OF THE HIGHER ORDER";
const WORDMARK_FONT_SIZE = 10.5;
const WORDMARK_RADIUS = 66.73;
const WORDMARK_CENTER_Y = 54.39;
const wordmarkChars = computeArcChars(WORDMARK_TEXT, decorativeFont, WORDMARK_FONT_SIZE, {
  centerX: 100,
  centerY: WORDMARK_CENTER_Y,
  radiusX: WORDMARK_RADIUS,
  radiusY: WORDMARK_RADIUS,
});
const wordmarkPaths = wordmarkChars
  .map((p) =>
    charPathElement(
      decorativeFont,
      p.char,
      WORDMARK_FONT_SIZE,
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
  (c) => cinzelFont.getAdvanceWidth(c, MINISTRIES_FONT_SIZE) + MINISTRIES_LETTER_SPACING,
);
const ministriesTotal =
  ministriesWidths.reduce((s, w) => s + w, 0) - MINISTRIES_LETTER_SPACING; // no trailing gap
let ministriesCumulative = -ministriesTotal / 2;
const ministriesPaths = ministriesChars
  .map((char, i) => {
    const advance = cinzelFont.getAdvanceWidth(char, MINISTRIES_FONT_SIZE);
    const x = 100 + ministriesCumulative + advance / 2;
    ministriesCumulative += ministriesWidths[i];
    return charPathElement(cinzelFont, char, MINISTRIES_FONT_SIZE, x, 228, 0, "#c9a876");
  })
  .join("\n      ");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="20 -25 165 280">
  <defs>
    <radialGradient id="hotspot" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
    <filter id="soften" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3.2" />
    </filter>
  </defs>

  <!-- Soft glow hugging the edges of the cross -->
  <g filter="url(#soften)">
    <rect x="86" y="6" width="28" height="190" fill="#f4efe6" />
    <rect x="30" y="50" width="140" height="32" fill="#f4efe6" />
  </g>

  <!-- Crisp cross body -->
  <polygon fill="#f4efe6" points="87,8 113,8 111,53 111,79 113,194 87,194 89,79 89,53" />
  <polygon fill="#f4efe6" points="35,51 35,81 89,79 111,79 165,81 165,51 111,53 89,53" />

  <!-- Bright hotspot at the intersection -->
  <circle cx="100" cy="66" r="34" fill="url(#hotspot)" />

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

fs.writeFileSync("public/kothom-mark.svg", svg);
console.log("wrote public/kothom-mark.svg,", svg.length, "bytes");
