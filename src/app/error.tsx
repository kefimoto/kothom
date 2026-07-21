"use client";

import { useEffect } from "react";
import { CrossMark } from "@/components/cross-mark";
import { ctaClassName } from "@/components/cta";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-ink px-6 py-24 text-center">
      <CrossMark size="small" />
      <div className="flex max-w-lg flex-col items-center gap-5">
        <h1 className="font-headline text-3xl text-cream sm:text-4xl">
          Something Went Wrong
        </h1>
        <p className="text-pretty font-body text-lg leading-relaxed text-cream/90">
          Our apologies — something didn&apos;t load the way it should have.
          Nothing on your end caused this. Give it another try.
        </p>
        <button type="button" onClick={() => reset()} className={ctaClassName}>
          Try Again
        </button>
      </div>
    </main>
  );
}
