"use client";

import { useEffect, useRef, useState } from "react";

// Scroll-triggered entrance for a block of content. Starts visible in the DOM
// (opacity/clip-path only, no display:none) so anything that never fires the
// observer — reduced motion, a headless render, JS disabled — still shows the
// content; the observer only adds the "is-visible" class that plays the
// transition already declared in globals.css.
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

  const revealClass = variant === "image-wipe" ? "reveal-image" : "reveal";

  return (
    <div
      ref={ref}
      className={`${revealClass} ${visible ? "is-visible" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
