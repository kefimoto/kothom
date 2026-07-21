"use client";

import { useEffect, useRef, useState } from "react";

// Scroll-triggered entrance for a block of content. Starts visible in the DOM
// (opacity/clip-path only, never display:none) so anything that never fires
// the observer — reduced motion, a headless render, JS disabled — still shows
// the content; the observer only adds the "is-visible" class that plays the
// transition already declared in globals.css. See the image-wipe branch below
// for why clip-path can't live on the observed node itself.
export function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "rise",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: "rise" | "image-wipe";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // Environments with no IntersectionObserver at all (old browsers, and
    // Vitest's jsdom test environment, which doesn't implement it) skip
    // straight to visible rather than staying permanently at opacity: 0.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const visClass = visible ? "is-visible" : "";
  const delayStyle = delay ? { transitionDelay: `${delay}ms` } : undefined;

  if (variant === "image-wipe") {
    // The observed node must stay clip-path-free: clip-path zeroes an
    // element's effective intersection area, and once an element's ratio is
    // pinned at 0 the browser has no threshold crossing left to fire on, so
    // isIntersecting never becomes true again — a permanent deadlock between
    // "clipped until revealed" and "revealed once intersecting". Confirmed
    // directly: every .reveal-image observer logged exactly one
    // isIntersecting=false then went silent, while .reveal (opacity-based,
    // which doesn't affect intersection geometry) kept firing normally. The
    // clip-path transition now lives on a nested child instead, so the ref'd
    // wrapper keeps its normal full-size box for IntersectionObserver.
    return (
      <div ref={ref} className={className}>
        <div className={`reveal-image ${visClass}`} style={delayStyle}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`reveal ${visClass} ${className}`}
      style={delayStyle}
    >
      {children}
    </div>
  );
}
