"use client";
import { useRef } from "react";
import { useCart } from "@/lib/cart-context";
import ProductPhoto from "@/components/ProductPhoto";
import Reveal from "@/components/Reveal";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Products are fetched by the Server Component that renders this (app/page.js)
// and passed in, rather than fetched here: the homepage carousel is the first
// thing above the fold, so it ships with the HTML instead of popping in after
// a client round trip. Selection and limit are applied server-side by the
// caller's getProducts() query.
export default function ProductCarousel({ title, products = [] }) {
  const { openProduct } = useCart();
  const trackRef = useRef(null);
  const items = products;

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
