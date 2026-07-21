import Link from "next/link";
import { CrossMark } from "@/components/cross-mark";
import { ctaClassName } from "@/components/cta";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-ink px-6 py-24 text-center">
      <CrossMark size="small" />
      <div className="flex max-w-lg flex-col items-center gap-5">
        <h1 className="font-headline text-3xl text-cream sm:text-4xl">
          This Page Isn&apos;t Here
        </h1>
        <p className="text-pretty font-body text-lg leading-relaxed text-cream/90">
          Whatever you were looking for, we couldn&apos;t find it at this
          address. Let&apos;s get you back to solid ground.
        </p>
        <Link href="/" className={ctaClassName}>
          Return Home
        </Link>
      </div>
    </main>
  );
}
