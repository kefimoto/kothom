"use client";

import { useEffect, useRef, useState } from "react";

// Scroll-triggered entrance for a block of content. Starts visible in the DOM
// (opacity only, never display:none) so anything that never fires the
// observer — reduced motion, a headless render, JS disabled — still shows the
// content; the observer only adds the "is-visible" class that plays the
// transition already declared in globals.css.
//
// image-pop (photos) also waits on the wrapped image's own load event before
// revealing, not just intersection — otherwise a slow-loading photo fades in
// on an empty frame and pops in on its own once it actually arrives, with the
// transition doing nothing useful. Queries the rendered <img> directly rather
// than composing props onto the child element; next/image's own ref/onLoad
// forwarding isn't something to fight with when the plain DOM event does the
// same job. (Previously this used a clip-path wipe: dropped after two real
// problems in a row — clip-path zeroes an element's own intersection area,
// which silently deadlocks IntersectionObserver, and separately still blocks
// native loading="lazy" on any descendant image since a zero-area ancestor
// reads to the browser as "not worth fetching". Opacity has neither problem,
// so this is simpler as well as more reliable.)
export function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "rise",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: "rise" | "image-pop";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [intersected, setIntersected] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let removeImgListener: (() => void) | undefined;
    if (variant === "image-pop") {
      const img = node.querySelector("img");
      if (img && !img.complete) {
        const onLoad = () => setImageLoaded(true);
        img.addEventListener("load", onLoad);
        removeImgListener = () => img.removeEventListener("load", onLoad);
      } else {
        setImageLoaded(true);
      }
    }

    // Environments with no IntersectionObserver at all (old browsers, and
    // Vitest's jsdom test environment, which doesn't implement it) skip
    // straight to visible rather than staying permanently at opacity: 0.
    if (typeof IntersectionObserver === "undefined") {
      setIntersected(true);
      return removeImgListener;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersected(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      removeImgListener?.();
    };
  }, [variant]);

  const delayStyle = delay ? { transitionDelay: `${delay}ms` } : undefined;
  const visible =
    variant === "image-pop" ? intersected && imageLoaded : intersected;
  const revealClass = variant === "image-pop" ? "reveal-image" : "reveal";

  return (
    <div
      ref={ref}
      className={`${revealClass} ${visible ? "is-visible" : ""} ${className}`}
      style={delayStyle}
    >
      {children}
    </div>
  );
}
