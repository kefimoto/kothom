# The radiant cross mark

The site's signature mark — cream cross, "Knights of the Higher Order" arced
above it, "Ministries" below — lives at `public/kothom-mark.svg`. It's a
**fully static vector file**: every letter is a real glyph outline `<path>`
(extracted from actual font files), not live `<text>`. There is no runtime
layout code — `CrossMark` in `src/components/cross-mark.tsx` just renders this
file via `next/image`. This was a deliberate requirement: the mark needs to be
print-ready (business cards, letterhead, etc.), and a font-dependent or
JS-computed version isn't portable to a print shop.

## Where it appears — and where it deliberately doesn't

Two placements, both at a size where the arced wordmark stays readable: the
homepage hero (`size="large"`) and the footer of every page (`size="small"`,
in `src/components/site-footer.tsx`).

**It is deliberately absent from the site header.** A nav bar can only give it
around 44px of height, and at that size the arced lettering and the starburst
collapse into a grey smudge that reads as a broken image — which is exactly the
"simplified into a flat icon" outcome `DESIGN.md` §5 forbids. The header uses a
Cinzel text wordmark instead. If you're tempted to add the mark back to the
header, the constraint to solve isn't the CSS, it's that this mark has too much
detail to survive below roughly 100px.

`scripts/generate-kothom-mark.cjs` regenerates the full suite of static vector brand marks from a set of geometry constants. This doc explains the setup, the geometry, and how to change things (including swapping fonts or generating new mark variants) without having to re-derive it all from scratch.

## Brand Mark Suite Variants Generated

Running `node scripts/generate-kothom-mark.cjs` outputs the following production vectors into `public/`:

| File | Layout | Theme / Colors | Target Use Case |
|---|---|---|---|
| `public/kothom-mark.svg` | **Full** | Light (Cream `#f4efe6` on Ink) | **Primary default mark**: Hero section, footer, dark backgrounds. |
| `public/kothom-mark-dark.svg` | **Full** | Dark (Ink `#0a0a0a` & Terracotta `#764634`) | Print documents, letterheads, light/cream backgrounds. |
| `public/kothom-mark-symbol.svg` | **Symbol** | Light (Radiant cross & starburst, no text) | Standalone emblem, watermarks, decorative badges. |
| `public/kothom-mark-symbol-dark.svg` | **Symbol** | Dark (Ink cross, Terracotta glow) | Standalone dark emblem for light cards. |
| `public/kothom-mark-simple.svg` | **Simple** | Light (Vector cross only, no text/glow) | Minimal UI icon, clean vector cross. |
| `public/kothom-mark-simple-dark.svg` | **Simple** | Dark (Vector cross only) | Minimal UI icon for light backgrounds. |
| `public/kothom-mark-wordmark.svg` | **Wordmark** | Light (Arced text + "MINISTRIES") | Header banner typography, standalone text mark. |
| `public/kothom-mark-wordmark-dark.svg` | **Wordmark** | Dark (Ink text + Terracotta "MINISTRIES") | Light background header typography. |
| `public/kothom-mark-monochrome-light.svg` | **Full** | Solid White (`#ffffff`) | 1-color white printing, stencils, foil stamping. |
| `public/kothom-mark-monochrome-dark.svg` | **Full** | Solid Black (`#000000`) | 1-color black printing, rubber stamps, faxes. |
| `public/favicon.svg` | **Favicon** | Square `512x512` Ink card with centered emblem | Browser tab icon, PWA icon. |
| `public/kothom-social-avatar.svg` | **Avatar** | Square `1080x1080` Ink card with centered mark | Social media profile picture (Instagram, X, Facebook). |

## One-time setup

The generator needs `opentype.js` (to read font files and extract glyph
outlines) and three `.ttf` font files. None of these are committed to the
repo or added as project dependencies — they're design-time tooling only,
fetched on demand into the OS tmp dir (`os.tmpdir()/kothom-mark-fonts`), so
they live outside the repo tree entirely and there's nothing to gitignore
or risk committing:

```bash
npm install --no-save opentype.js   # or: bun add opentype.js, then remove it from package.json after

FONT_DIR="$(node -e 'console.log(require("os").tmpdir())')/kothom-mark-fonts"
mkdir -p "$FONT_DIR"
curl -o "$FONT_DIR/CinzelDecorative-Bold.ttf" "https://raw.githubusercontent.com/google/fonts/main/ofl/cinzeldecorative/CinzelDecorative-Bold.ttf"
curl -o "$FONT_DIR/Cinzel-Variable.ttf" "https://raw.githubusercontent.com/google/fonts/main/ofl/cinzel/Cinzel%5Bwght%5D.ttf"
curl -o "$FONT_DIR/Marcellus-Regular.ttf" "https://raw.githubusercontent.com/google/fonts/main/ofl/marcellus/Marcellus-Regular.ttf"

python3 -m pip install --user fonttools
python3 -m fontTools.varLib.instancer "$FONT_DIR/Cinzel-Variable.ttf" wght=700 -o "$FONT_DIR/Cinzel-Bold-static.ttf"
```

("Ministries" and the crossbar/etc. use Cinzel; the wordmark's font is
swappable — see below. Cinzel ships as a variable font, so `fonttools`
instances it down to a static Bold weight, which `opentype.js` can read
more simply than the variable original.)

Then, from the repo root:

```bash
node scripts/generate-kothom-mark.cjs
```

This overwrites `public/kothom-mark.svg`.

## The geometry, and why it's shaped like this

Everything is authored in one flat coordinate space (`cx = 100` is the
cross's horizontal centerline, `cy = 66` is the crossbar's vertical
centerline), independent of the final `viewBox`.

**The cross** is two flared, rounded-corner octagons (`VERTICAL_ARM_POINTS`,
`HORIZONTAL_ARM_POINTS`), each passed through `roundedPolygonPath()` — a
small generic helper that rounds every corner of any closed polygon by a
fixed radius. The taper (wide at the tips, narrower at the crossbar) is
just the octagon's point coordinates; adjust those directly to change it.
The soft glow behind the cross reuses the *exact same* tapered paths
through a blur filter, rather than a plain rectangle — a rectangle's blur
halo is uniform-width and hides the taper instead of echoing it.

**The wordmark arc** is a true circle (not an ellipse — an ellipse made the
letter rotation look uneven and gave the arc an "egg" shape). Its radius
and center were derived in stages, each solving a concrete geometric
question rather than being nudged by eye:

1. **The exact-touch circle.** Solve for the one circle that passes
   through the cross's top tip `(100, 8)` and both crossbar tips
   `(35, 66)` / `(165, 66)`. This has a fixed answer: center `(100, 73.42)`,
   radius `65.42`. (Any 3 non-collinear points determine exactly one
   circle — see the `roundedPolygonPath`-adjacent comments in the script,
   or just re-derive: the center lies on `x = 100` by symmetry, then solve
   `(Yc - 8)² = (100-35)² + (Yc - 66)²` for `Yc`.)
2. **Font size to match.** Pick a font size so the wordmark's actual
   measured length (via `font.getAdvanceWidth` summed over every
   character) almost exactly fills that circle's available arc — this is
   what makes the letters span corner-to-corner without visibly
   overlapping or leaving a gap.
3. **Padding.** To clear the cross by a gap instead of touching it,
   *both* the radius is expanded *and* the center is shifted up together
   (solved so the peak and both endpoints move the same distance from
   where they used to touch). Expanding the radius alone pushes the peak
   up but relocates the endpoints far past the crossbar tips (a bigger
   circle spreads the same arc length over a smaller angle); shifting the
   center alone is just the same circle sliding, not padding — it doesn't
   add clearance evenly. The current padding (~10 units) matches half the
   gap "Ministries" has below the cross (that gap was deliberately halved
   at one point — "cut the padding in half, bring things closer
   together").
4. **Widen for clearance.** After the taper was made more pronounced, the
   crossbar's flared tips got tall enough that the endpoint letters
   started clipping into them. Nudging the radius out a bit further (and
   the center up by the same amount, to hold the padding from step 3)
   gives clearance without changing the shape's character.

If you need to redo this (new text, much different font, or a design
change to the cross itself that moves the tip/crossbar anchor points),
redo it in that order — there's a working Python/Node sketch of each step
in the session history that produced this file, but the steps above are
enough to reconstruct it from scratch with a numeric root-find (bisection
on radius is what was used throughout, since none of these have a closed
form once you add the padding/widening steps).

**Per-character placement** (`computeArcChars`) doesn't use SVG's
`<textPath>` at all. iOS Safari's support for `textPath` combined with
`textLength`/`lengthAdjust` is unreliable — it was both truncating the
wordmark and shifting it off-center in testing. Instead each character
gets its own `x`/`y`/rotation computed directly: arc length along an
ellipse (a circle is just the special case `radiusX === radiusY`) has no
closed form, so the script numerically integrates length-vs-angle once
into a lookup table, then inverts that table to find the angle for each
character's target distance along the arc. This is the same math the
`CrossMark` component itself used before it was replaced with the static
file — see git history on `src/app/page.tsx` (the component lived there
before it moved to `src/components/cross-mark.tsx`) if you want the React
version of this for reference.

**The starburst** behind the cross is deliberately *not* a bunch of
individual ray lines — that read as scattered streaks with too much bare
background between them. It's one or two continuous star-shaped polygons
(`starPolygonPoints`): vertices alternate between an outer (spike) and
inner (valley) radius all the way around 360°, so there's no gap for the
background to show through. A slight blur softens the jagged silhouette.
Whatever radius you use, keep it comfortably inside the `viewBox`'s
tightest clearance from the center in any direction (see below) or it'll
clip.

**The hotspot glow** at the intersection is a multi-stop radial gradient
(not just a 2-stop fade) — a plain linear fade from opaque to transparent
reads as "a thick circle that tapers off quickly" rather than a soft glow;
more stops (high opacity held longer near the center, then a longer, more
gradual tail) reads as more naturally glowy.

## viewBox and containment

The `viewBox` has to comfortably contain, in every direction from
whatever's centered at `(100, 66)`: the starburst's outer radius, the
glow's blur bleed, and the wordmark's ink (glyphs extend a bit beyond
their baseline position — check `font.getPath(...).getBoundingBox()`
rather than assuming the baseline position is the visual edge). When you
change any radius (starburst, hotspot, wordmark arc), recheck the
clearance from `(100, 66)` to each `viewBox` edge and leave a few units of
margin — several rounds of this mark's development produced starburst
rays or wordmark endpoints clipped at the edge from skipping this check.

## Changing the wordmark's font

The top arc and "Ministries" can use different fonts. To preview a
different font for the arc without touching the real file:

```bash
WORDMARK_FONT=marcellus node scripts/generate-kothom-mark.cjs
```

Valid values are the keys of `WORDMARK_FONT_FILES` in the script
(currently `decorative`, `cinzel`, `marcellus`). Setting `WORDMARK_FONT`
explicitly writes to `kothom-mark-preview-<name>.svg` instead of
`public/kothom-mark.svg`, so a preview run can't accidentally clobber the
production file — only a plain `node scripts/generate-kothom-mark.cjs` (no
env var) writes the real one, using whatever `WORDMARK_FONT_CHOICE`'s
default is.

**Important:** each font has different letter widths, so the font
size/radius/center tuned for one font will not fit another correctly —
reusing Cinzel Decorative's numbers with a narrower font will
under-fill the circle (gap at the ends) or overshoot it, depending on the
difference. `WORDMARK_GEOMETRY` in the script maps each font name to its
own tuned `{ fontSize, radius, centerY }`. To add a new font:

1. Add its file to `WORDMARK_FONT_FILES`.
2. Measure its total advance width for the wordmark text at some
   reference size (e.g. `font.getAdvanceWidth(char, 20)` summed over every
   character) — a one-line Node snippet, not a whole script.
3. Redo the "font size to match" → "padding" → "widen for clearance"
   derivation above (steps 2–4; the exact-touch circle in step 1 doesn't
   change, it's about the cross, not the font) using that font's measured
   widths, and add the resulting `{ fontSize, radius, centerY }` to
   `WORDMARK_GEOMETRY` under the new name.
4. Regenerate and check visually for endpoint clipping into the crossbar
   and for the peak/"Ministries" gaps still roughly matching (see the
   containment section above too).

To fully switch the *production* mark to a different font, change
`WORDMARK_FONT_CHOICE`'s default (`process.env.WORDMARK_FONT || "..."`)
near the top of the script, then run the generator with no env var set.

Only Google Fonts (or otherwise freely-licensable) fonts can be fetched
and embedded this way — e.g. Trajan was considered at one point but is an
Adobe commercial font, not available from Google Fonts or freely
downloadable, so it was ruled out rather than sourced from somewhere
questionable.
