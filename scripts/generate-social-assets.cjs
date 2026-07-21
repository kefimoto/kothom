// Rasterizes public/kothom-mark.svg (the static, print-ready cross mark —
// see CROSS-MARK.md) into the PNG/ICO derivatives the site needs for
// browser/OS chrome and social link previews. This script only *reads* the
// mark's SVG as input; it never edits it or touches
// scripts/generate-kothom-mark.cjs (its generator).
//
// Produces:
//   src/app/icon.png        — Next.js App Router icon convention
//   src/app/apple-icon.png  — Next.js App Router apple-icon convention
//   src/app/favicon.ico     — classic multi-size favicon fallback
//   public/og-image.png     — 1200x630 Open Graph / Twitter share image
//
// Every output composites the mark (cream ink, transparent background) onto
// the brand's ink-black (#0a0a0a, see DESIGN.md) background — the same
// surface the mark sits on in the hero and footer — rather than leaving it
// on a plain white square.
//
// Re-run after regenerating kothom-mark.svg:
//   node scripts/generate-social-assets.cjs

const sharp = require("sharp");
const fs = require("node:fs");
const path = require("node:path");

const REPO_ROOT = path.join(__dirname, "..");
const MARK_PATH = path.join(REPO_ROOT, "public/kothom-mark.svg");
const INK_BLACK = "#0a0a0a";

// The mark's viewBox is "17 -15 166 260" (no width/height attrs), so sharp
// rasterizes it at 166x260px by default (72dpi). Render at a high fixed
// density so every downstream resize — down to a 512px icon or a 520px-tall
// slice of the OG image — starts from a crisp, oversized source instead of
// upscaling a blocky 166px-wide raster.
const RENDER_DENSITY = 1200;
const MARK_ASPECT = 166 / 260; // width / height, from the viewBox

const markSvgBuffer = fs.readFileSync(MARK_PATH);

/**
 * Rasterizes the mark to fit within `boxWidth`x`boxHeight` (preserving
 * aspect ratio, transparent padding) and returns a PNG buffer.
 */
async function renderMark(boxWidth, boxHeight) {
  return sharp(markSvgBuffer, { density: RENDER_DENSITY })
    .resize(boxWidth, boxHeight, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

/**
 * Composites the mark, scaled to fill `fillFrac` of a square `size`x`size`
 * canvas, onto an opaque ink-black background. Used for the larger app
 * icons (icon.png, apple-icon.png), where the full mark — including the
 * arced "Knights of the Higher Order" / "Ministries" wordmark — is still
 * legible enough to read as a seal.
 */
async function renderSquareIcon(size, fillFrac = 0.82) {
  const innerHeight = Math.round(size * fillFrac);
  const innerWidth = Math.round(innerHeight * MARK_ASPECT);
  const markPng = await renderMark(innerWidth, innerHeight);

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: INK_BLACK,
    },
  })
    .composite([{ input: markPng, gravity: "center" }])
    .png()
    .toBuffer();
}

// Below ~48px the full mark's wordmark text collapses into an illegible
// noise band (checked empirically by rendering it — see the session that
// produced this script). The cross + starburst + glow alone still reads
// cleanly at 16px, so tiny favicon sizes crop to just that region instead
// of shrinking the whole seal. This crops the *rasterized output*, not
// the SVG source file — the geometry constants below are read from
// scripts/generate-kothom-mark.cjs's own VERTICAL_ARM_POINTS /
// HORIZONTAL_ARM_POINTS / starburst outer-radius, with a small margin for
// blur bleed: x:[27,173], y:[-6,202] in the mark's user-unit space
// (viewBox origin 17,-15).
const CROP_USER_UNITS = { left: 27, top: -6, right: 173, bottom: 202 };

async function renderCroppedMarkBuffer() {
  const rendered = sharp(markSvgBuffer, { density: RENDER_DENSITY });
  const meta = await rendered.metadata();
  const scale = meta.width / 166; // native viewBox width is 166 user units
  const viewBoxOriginX = 17;
  const viewBoxOriginY = -15;

  const left = Math.round((CROP_USER_UNITS.left - viewBoxOriginX) * scale);
  const top = Math.round((CROP_USER_UNITS.top - viewBoxOriginY) * scale);
  const width = Math.round(
    (CROP_USER_UNITS.right - CROP_USER_UNITS.left) * scale,
  );
  const height = Math.round(
    (CROP_USER_UNITS.bottom - CROP_USER_UNITS.top) * scale,
  );

  const cropped = await sharp(markSvgBuffer, { density: RENDER_DENSITY })
    .extract({ left, top, width, height })
    .png()
    .toBuffer();
  const croppedMeta = await sharp(cropped).metadata();
  return { buffer: cropped, aspect: croppedMeta.width / croppedMeta.height };
}

/**
 * Composites the cross-only crop (no wordmark text), scaled to fill
 * `fillFrac` of a square `size`x`size` canvas, onto ink-black. Used for
 * small favicon sizes where the full mark's text would be illegible.
 */
async function renderSquareCrossIcon(croppedMark, size, fillFrac = 0.86) {
  const innerHeight = Math.round(size * fillFrac);
  const innerWidth = Math.round(innerHeight * croppedMark.aspect);
  const markPng = await sharp(croppedMark.buffer)
    .resize(innerWidth, innerHeight, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: INK_BLACK,
    },
  })
    .composite([{ input: markPng, gravity: "center" }])
    .png()
    .toBuffer();
}

/** Minimal ICO container: header + directory entries + raw PNG payloads. */
function buildIco(pngBuffersBySize) {
  const count = pngBuffersBySize.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * count;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(count, 4);

  const dirEntries = [];
  const imageBuffers = [];
  let offset = headerSize + dirSize;

  for (const { size, buffer } of pngBuffersBySize) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height (0 = 256)
    entry.writeUInt8(0, 2); // color count (0 = no palette, true color)
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buffer.length, 8); // image data size
    entry.writeUInt32LE(offset, 12); // image data offset
    dirEntries.push(entry);
    imageBuffers.push(buffer);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...imageBuffers]);
}

async function main() {
  // --- App Router icon conventions (src/app/ is the app dir here) ---
  const iconPng = await renderSquareIcon(512);
  fs.writeFileSync(path.join(REPO_ROOT, "src/app/icon.png"), iconPng);
  console.log("wrote src/app/icon.png (512x512)");

  const appleIconPng = await renderSquareIcon(180);
  fs.writeFileSync(
    path.join(REPO_ROOT, "src/app/apple-icon.png"),
    appleIconPng,
  );
  console.log("wrote src/app/apple-icon.png (180x180)");

  // --- favicon.ico: classic multi-size fallback some browsers/OSes still
  // request directly regardless of the <link> tags Next generates from
  // icon.png. Uses the cross-only crop (see renderSquareCrossIcon) since
  // the full mark's wordmark text is illegible at these sizes. ---
  const croppedMark = await renderCroppedMarkBuffer();
  const icoSizes = [16, 32, 48];
  const icoPngs = [];
  for (const size of icoSizes) {
    icoPngs.push({
      size,
      buffer: await renderSquareCrossIcon(croppedMark, size),
    });
  }
  fs.writeFileSync(
    path.join(REPO_ROOT, "src/app/favicon.ico"),
    buildIco(icoPngs),
  );
  console.log("wrote src/app/favicon.ico (16/32/48)");

  // --- Open Graph / Twitter share image: mark centered on ink-black,
  // sized to read well as a small social thumbnail. ---
  const OG_WIDTH = 1200;
  const OG_HEIGHT = 630;
  const markHeight = 520; // ~55px top/bottom margin
  const markWidth = Math.round(markHeight * MARK_ASPECT);
  const ogMarkPng = await renderMark(markWidth, markHeight);

  await sharp({
    create: {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      channels: 4,
      background: INK_BLACK,
    },
  })
    .composite([{ input: ogMarkPng, gravity: "center" }])
    .png()
    .toFile(path.join(REPO_ROOT, "public/og-image.png"));
  console.log("wrote public/og-image.png (1200x630)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
