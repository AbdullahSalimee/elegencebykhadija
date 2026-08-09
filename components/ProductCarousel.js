"use client";
import { useRef } from "react";
import { PRODUCTS } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import ProductPhoto from "@/components/ProductPhoto";
import Reveal from "@/components/Reveal";
import { ChevronLeft, ChevronRight } from "lucide-react";

// String-keyed selection: the homepage is a Server Component, so a function
// prop cannot cross into a client one.
const SELECTORS = {
  all: (list) => list,
  new: (list) => [...list].sort((a, b) => b.arrivedAt.localeCompare(a.arrivedAt)),
  sale: (list) => list.filter((p) => p.compareAt && p.compareAt > p.price),
};

export default function ProductCarousel({ title, select = "all", limit = 8 }) {
  const { openProduct } = useCart();
  const trackRef = useRef(null);
  const items = (SELECTORS[select] ?? SELECTORS.all)(PRODUCTS).slice(0, limit);

  // Steps by one card, measured from the track itself, so it stays correct as
  // the visible-card count changes across breakpoints.
  const page = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 16;
    const step = card ? card.offsetWidth + gap : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  if (!items.length) return null;

  return (
    <section className="hr-block">
      <Reveal as="header" className="hr-head">
        <h2 className="hr-title">{title}</h2>
        <span className="hr-rule" />
      </Reveal>

      <Reveal className="hr-carousel" delay={110}>
        <button
          className="hr-arrow hr-arrow-prev"
          onClick={() => page(-1)}
          aria-label="Previous products"
        >
          <ChevronLeft size={20} strokeWidth={1.6} />
        </button>

        <div className="hr-track" ref={trackRef}>
          {items.map((p) => (
            <article key={p.id} className="hr-card">
              <button
                className="hr-card-photo"
                onClick={() => openProduct(p.id)}
                aria-label={`Quick view — ${p.name}`}
              >
                <ProductPhoto
                  product={p}
                  className="hr-card-plate"
                  sizes="(max-width: 900px) 46vw, 24vw"
                />
              </button>
              <h3 className="hr-card-name">{p.name}</h3>
              <div className="hr-card-price">
                Rs.{p.price.toLocaleString()}.00
              </div>
            </article>
          ))}
        </div>

        <button
          className="hr-arrow hr-arrow-next"
          onClick={() => page(1)}
          aria-label="Next products"
        >
          <ChevronRight size={20} strokeWidth={1.6} />
        </button>
      </Reveal>
    </section>
  );
}
