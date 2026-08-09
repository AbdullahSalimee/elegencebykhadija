"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HERO_SLIDES } from "@/lib/site-config";

// How long each slide holds. Also drives the push-in animation via a custom
// property, so the zoom finishes exactly as the slide changes — tune this
// one number and the motion stays in step.
const SLIDE_MS = 3000;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = HERO_SLIDES.length;

  const go = (next) => setIndex(((next % count) + count) % count);

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => clearInterval(id);
  }, [count, paused, index]);

  return (
    <section
      className="eth-hero"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      style={{ "--eth-slide-ms": `${SLIDE_MS}ms` }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {HERO_SLIDES.map((slide, i) => (
        <div
          key={slide.id}
          className={`eth-hero-slide${i === index ? " eth-hero-slide-on" : ""}`}
          aria-hidden={i !== index}
        >
          {/* A native <picture> rather than next/image: the browser picks one
              source and downloads only that, so the first slide can be
              eager + high priority without risking the desktop file being
              pulled onto a phone. These are already right-sized webp
              (~190-320KB), so the optimizer round-trip bought little. */}
          <picture>
            <source
              media="(max-width: 900px)"
              srcSet={slide.mobileImage ?? slide.image}
            />
            <img
              className="eth-hero-img"
              src={slide.image}
              alt=""
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
              decoding="async"
            />
          </picture>
          <div className="eth-hero-scrim" />
          <div className="eth-hero-copy">
            <span className="eth-eyebrow">{slide.eyebrow}</span>
            <h1 className="eth-hero-title">{slide.title}</h1>
            <p className="eth-hero-body">{slide.body}</p>
            <a
              className="eth-btn eth-btn-light"
              href={slide.cta.href}
              tabIndex={i === index ? 0 : -1}
            >
              {slide.cta.label}
            </a>
          </div>
        </div>
      ))}

      {count > 1 && (
        <>
          <button
            className="eth-hero-arrow eth-hero-prev"
            aria-label="Previous slide"
            onClick={() => go(index - 1)}
          >
            <ChevronLeft size={22} strokeWidth={1.6} />
          </button>
          <button
            className="eth-hero-arrow eth-hero-next"
            aria-label="Next slide"
            onClick={() => go(index + 1)}
          >
            <ChevronRight size={22} strokeWidth={1.6} />
          </button>
          <div className="eth-hero-dots">
            {HERO_SLIDES.map((slide, i) => (
              <button
                key={slide.id}
                className={`eth-hero-dot${i === index ? " eth-hero-dot-on" : ""}`}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
