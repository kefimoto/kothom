import type { Metadata } from "next";
import Image from "next/image";
import { ctaClassName } from "@/components/cta";
import { PageHeader } from "@/components/page-header";
import { MINISTRY } from "@/lib/ministry";

export const metadata: Metadata = {
  title: "Logos & Media",
  description:
    "Official Knights of the Higher Order Ministries logo files for press, print, and partners.",
  alternates: { canonical: "/media" },
};

type Asset = {
  file: string;
  label: string;
  description: string;
  background: "ink" | "cream";
  width: number;
  height: number;
};

// Mirrors CROSS-MARK.md's own variant table — kept in plain language here
// for a non-technical visitor rather than a developer. Regenerating the
// files themselves is scripts/generate-kothom-mark.cjs's job, not this
// page's; this just lists whatever's already committed in public/.
const ASSETS: Asset[] = [
  {
    file: "kothom-mark",
    label: "Full mark — for dark backgrounds",
    description:
      'The complete mark with the wordmark and "Ministries" text, for placing on dark or black backgrounds.',
    background: "ink",
    width: 166,
    height: 260,
  },
  {
    file: "kothom-mark-dark",
    label: "Full mark — for light backgrounds & print",
    description:
      "Same mark, inverted for cream, white, or other light backgrounds — letterhead, printed materials.",
    background: "cream",
    width: 166,
    height: 260,
  },
  {
    file: "kothom-mark-symbol",
    label: "Symbol only — for dark backgrounds",
    description:
      "The cross emblem alone, no text. For watermarks, badges, and small decorative use.",
    background: "ink",
    width: 166,
    height: 200,
  },
  {
    file: "kothom-mark-symbol-dark",
    label: "Symbol only — for light backgrounds",
    description:
      "The cross emblem alone, no text, inverted for light backgrounds.",
    background: "cream",
    width: 166,
    height: 200,
  },
  {
    file: "kothom-mark-simple",
    label: "Simple cross — for dark backgrounds",
    description:
      "A minimal, flat vector cross with no glow or text. For small icons and UI use.",
    background: "ink",
    width: 130,
    height: 186,
  },
  {
    file: "kothom-mark-simple-dark",
    label: "Simple cross — for light backgrounds",
    description: "The same minimal cross, inverted for light backgrounds.",
    background: "cream",
    width: 130,
    height: 186,
  },
  {
    file: "kothom-mark-monochrome-light",
    label: "Monochrome white",
    description:
      "Solid white, single color — for one-color printing, stencils, and foil stamping on dark materials.",
    background: "ink",
    width: 166,
    height: 260,
  },
  {
    file: "kothom-mark-monochrome-dark",
    label: "Monochrome black",
    description:
      "Solid black, single color — for one-color printing on light materials.",
    background: "cream",
    width: 166,
    height: 260,
  },
  {
    file: "favicon",
    label: "App icon",
    description:
      "Square icon for browser tabs and app shortcuts. Already framed on its own card — use as-is.",
    background: "cream",
    width: 512,
    height: 512,
  },
  {
    file: "kothom-social-avatar",
    label: "Social media profile picture",
    description:
      "Square profile photo for Instagram, X, Facebook, and similar. Already framed on its own card — use as-is.",
    background: "cream",
    width: 1080,
    height: 1080,
  },
];

const tileClassName: Record<Asset["background"], string> = {
  ink: "bg-ink",
  cream: "bg-cream border border-charcoal/10",
};

function AssetCard({ asset }: { asset: Asset }) {
  return (
    <div className="flex flex-col border border-charcoal/10">
      <div
        className={`flex items-center justify-center px-6 py-10 ${tileClassName[asset.background]}`}
      >
        <Image
          src={`/${asset.file}.svg`}
          alt={asset.label}
          width={asset.width}
          height={asset.height}
          className="h-40 w-auto"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 bg-cream p-5">
        <div>
          <h3 className="font-headline text-lg text-charcoal">{asset.label}</h3>
          <p className="mt-1 font-body text-sm leading-relaxed text-charcoal/80">
            {asset.description}
          </p>
        </div>
        <div className="mt-auto flex flex-wrap gap-3 pt-2">
          <a
            href={`/${asset.file}.svg`}
            download
            className="rounded-none bg-terracotta px-4 py-2 font-headline text-sm font-semibold tracking-wide text-cream transition-colors hover:bg-terracotta-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tan-gold"
          >
            Download SVG
          </a>
          <a
            href={`/${asset.file}.png`}
            download
            className="rounded-none border border-charcoal/30 px-4 py-2 font-headline text-sm font-semibold tracking-wide text-charcoal transition-colors hover:border-charcoal/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tan-gold"
          >
            Download PNG
          </a>
        </div>
      </div>
    </div>
  );
}

export default function MediaPage() {
  return (
    <main id="main">
      <PageHeader
        title="Logos & Media"
        description="Official logo files for press, print shops, and partners. Download whichever fits — everything here is the real, current mark."
      />
      <div className="bg-cream px-6 py-16 sm:py-20">
        <div className="mx-auto flex max-w-5xl flex-col gap-12">
          <p className="max-w-[70ch] text-pretty font-body text-lg leading-relaxed text-charcoal">
            <strong>Use the SVG where you can.</strong> It's a vector file, so
            it stays sharp at any size — this matters most for printing
            (business cards, letterhead, banners), where a fixed-resolution PNG
            can come out blurry or pixelated. The PNG is there only for tools
            that can't accept an SVG, like pasting into a Word document or an
            email signature.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {ASSETS.map((asset) => (
              <AssetCard key={asset.file} asset={asset} />
            ))}
          </div>

          <div className="border-t border-charcoal/15 pt-10">
            <h2 className="font-headline text-2xl text-charcoal sm:text-3xl">
              Questions about usage
            </h2>
            <p className="mt-4 max-w-[70ch] text-pretty font-body text-lg leading-relaxed text-charcoal">
              If you need a different size, format, or color, or aren't sure
              which file fits your use, contact us and we'll help directly.
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              <a href={MINISTRY.phone.tel} className={ctaClassName}>
                Call {MINISTRY.phone.display}
              </a>
              <a
                href={`mailto:${MINISTRY.email}?subject=${encodeURIComponent("Logo & Media Question")}`}
                className={ctaClassName}
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
