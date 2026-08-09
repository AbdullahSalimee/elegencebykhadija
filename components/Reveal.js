"use client";
import { useEffect, useRef, useState } from "react";

// Reveals its children the first time they scroll into view, then stops
// observing — this is a first-sight effect, not something that replays every
// time you scroll back past it. Under prefers-reduced-motion the content is
// shown immediately instead of animating.
export default function Reveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        io.disconnect();
      },
      // Fires slightly before the element is fully on screen, so the motion
      // reads as the page arriving rather than as a late pop.
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal${shown ? " reveal-in" : ""}${className ? ` ${className}` : ""}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
