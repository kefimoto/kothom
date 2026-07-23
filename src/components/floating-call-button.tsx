"use client";

import { MINISTRY } from "@/lib/ministry";

export function FloatingCallButton() {
  return (
    <a
      href={MINISTRY.phone.tel}
      className="fixed bottom-6 right-6 z-40 flex flex-col gap-0.5 max-w-40 bg-terracotta px-3 py-2 text-center font-body text-sm text-cream no-underline transition-colors hover:bg-terracotta-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tan-gold sm:bottom-8 sm:right-8"
      style={{
        boxShadow:
          "0 0 0 1px rgba(10, 10, 10, 0.1), 0 4px 12px rgba(118, 70, 52, 0.3)",
      }}
      title="Call us 24/7"
    >
      <span className="text-xs font-headline uppercase tracking-wider">
        Call Now
      </span>
      <span className="font-headline text-base">{MINISTRY.phone.display}</span>
    </a>
  );
}
