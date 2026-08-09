"use client";
import { useEffect, useState } from "react";
import { ANNOUNCEMENTS } from "@/lib/site-config";

// Both messages matter, but side by side they wrap to three lines on a phone.
// So the bar cycles instead — one message, always full width, no reflow.
export default function AnnounceBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (ANNOUNCEMENTS.length < 2) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % ANNOUNCEMENTS.length),
      5000,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="eth-announce">
      {/* aria-live off: this is decorative marketing, not a status update. */}
      <span key={index} className="eth-announce-msg">
        {ANNOUNCEMENTS[index]}
      </span>
    </div>
  );
}
