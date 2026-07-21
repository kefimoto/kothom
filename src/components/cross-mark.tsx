import Image from "next/image";

// The radiant cross mark is a static, pre-rendered vector asset
// (public/kothom-mark.svg) rather than something laid out at runtime: the
// wordmark's arced letters are baked in as real glyph outline paths, so the
// exact same file is both what the site displays and what can be handed to
// a print shop for business cards, etc., with no font or JS dependency.
// Regenerate it with `node scripts/generate-kothom-mark.cjs` if the design
// changes — see that script for the one-time font setup it needs.
export function CrossMark({ size = "large" }: { size?: "large" | "small" }) {
  return (
    <Image
      src="/kothom-mark.svg"
      alt="Knights of the Higher Order Ministries"
      width={250}
      height={292}
      priority={size === "large"}
      className={`h-auto shrink-0 ${size === "large" ? "w-[240px] sm:w-[300px]" : "w-[135px] sm:w-[165px]"}`}
    />
  );
}
