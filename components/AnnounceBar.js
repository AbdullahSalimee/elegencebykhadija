"use client";
import { useEffect, useState } from "react";

// Both messages matter, but side by side they wrap to three lines on a phone.
// So the bar cycles instead — one message, always full width, no reflow.
//
// Rows come from the database via components/Nav.js, so the shop owner can
// change the messages in the admin without a redeploy.
export default function AnnounceBar({ announcements = [] }) {
  const [index, setIndex] = useState(0);
  const count = announcements.length;

  useEffect(() => {
    if (count < 2) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(id);
  }, [count]);

  // An empty bar would still take its height and leave a gap above the header.
  if (!count) return null;

  // Guards against the index outrunning a shortened list — the admin can
  // delete a message while the interval is mid-cycle.
  const current = announcements[index % count];

  return (
    <div className="eth-announce">
      {/* aria-live off: this is decorative marketing, not a status update. */}
      <span key={index} className="eth-announce-msg">
        {current.message}
      </span>
    </div>
  );
}
